import { strict as assert } from "node:assert";
import { test, run } from "node:test";

const ops = await import("../src/lib/dorm-ops.ts");
const photos = await import("../src/lib/photo-upload.ts");

test("tiered electricity math: 170 kWh", () => {
  // 50*1800 + 50*2200 + 70*2600 = 90000+110000+182000 = 382000
  assert.equal(ops.calculateTieredElectricity(170), 382000);
  assert.equal(ops.calculateTieredElectricity(0), 0);
  assert.equal(ops.calculateTieredElectricity(50), 90000);
});

test("monthly invoice builds tiered split + combined total", () => {
  const inv = ops.buildMonthlyInvoice({
    room: "A205",
    month: "2026-09",
    elecOld: 12450,
    elecNew: 12620,
    waterOld: 840,
    waterNew: 854,
    roomFeePerStudent: 950000,
    wifiFeeTotal: 120000,
    cleaningFeeTotal: 60000,
    numStudents: 6,
  });
  assert.equal(inv.deltaElec, 170);
  assert.equal(inv.deltaWater, 14);
  assert.equal(inv.elecCost, 382000);
  assert.equal(inv.waterCost, 252000);
  assert.equal(inv.perStudentUtility, Math.round((382000 + 252000 + 180000) / 6));
  assert.equal(inv.perStudentTotal, inv.perStudentUtility + 950000);
  assert.equal(inv.grandTotal, 382000 + 252000 + 180000 + 950000 * 6);
});

test("ticket transitions follow Received->InProgress->Done(RESOLVED)->CLOSED", () => {
  assert.equal(ops.canTransitionTicket("PENDING", "IN_PROGRESS"), true);
  assert.equal(ops.canTransitionTicket("PENDING", "RESOLVED"), false);
  assert.equal(ops.transitionTicketStatus("IN_PROGRESS", "RESOLVED"), "RESOLVED");
  assert.equal(ops.transitionTicketStatus("RESOLVED", "CLOSED"), "CLOSED");
  assert.throws(() => ops.transitionTicketStatus("PENDING", "CLOSED"), /Illegal/);
  assert.equal(ops.validateRating(5), true);
  assert.equal(ops.validateRating(0), false);
});

test("checkout settlement deducts damage from deposit", () => {
  const s = ops.computeCheckoutSettlement(1000000, [{ name: "Vòi sen", cost: 250000 }], 100000);
  assert.equal(s.damageTotal, 250000);
  assert.equal(s.deduction, 350000);
  assert.equal(s.refund, 650000);
  const over = ops.computeCheckoutSettlement(500000, [{ name: "X", cost: 900000 }], 0);
  assert.equal(over.refund, 0);
  assert.equal(over.deduction, 500000);
});

test("room switch request lifecycle", () => {
  const r = ops.createRoomSwitchRequest("SE1", "A201", "A205", "Gan lop");
  assert.equal(r.status, "SUBMITTED");
  assert.equal(ops.reviewRoomSwitchRequest(r, true).status, "APPROVED");
  assert.throws(() => ops.createRoomSwitchRequest("SE1", "A201", "A201", "x"), /differ/);
});

test("QR gate scan + overdue absentees", () => {
  assert.equal(ops.evaluateGateScan(22, false), "ON_TIME");
  assert.equal(ops.evaluateGateScan(23, true), "APPROVED_LATE");
  assert.equal(ops.evaluateGateScan(23, false), "UNAUTHORIZED_LATE");
  const payload = ops.buildGateQrPayload("se182049", "2026-10-13T22:00");
  const parsed = ops.parseGateQrPayload(payload);
  assert.equal(parsed?.studentId, "SE182049");
  assert.equal(ops.parseGateQrPayload("bogus"), null);
  const missing = ops.findOverdueAbsentees([{ studentId: "SE1", scanHour: 22 }], ["SE1", "SE2"], 23);
  assert.deepEqual(missing, ["SE2"]);
  assert.deepEqual(ops.findOverdueAbsentees([], ["SE1"], 22), []);
});

test("visitor register/checkin/checkout/overstay", () => {
  // Khách thăm: CCCD đúng 12 số, không có thời lượng, rời trước 21:00, không qua đêm.
  const v = ops.registerVisitor("QE200001", "Nguyen Van A", "079204018293", "2026-10-14");
  assert.equal(v.status, "PRE_REGISTERED");
  assert.equal(v.expectedMinutes, 0);
  const inV = ops.checkInVisitor(v, "2026-10-14T10:00");
  assert.equal(inV.status, "CHECKED_IN");
  // Quá 21:00 -> OVERSTAY; trước 21:00 giữ nguyên.
  assert.equal(ops.detectVisitorOverstay(inV, 21).status, "OVERSTAY");
  assert.equal(ops.detectVisitorOverstay(inV, 20).status, "CHECKED_IN");
  assert.equal(ops.checkOutVisitor(ops.detectVisitorOverstay(inV, 21), "2026-10-14T22:00").status, "CHECKED_OUT");
  // CCCD 9 số (chuẩn CMND cũ) bị từ chối.
  assert.throws(() => ops.registerVisitor("QE200001", "A", "079204018", "2026-10-14"), /12/);
  assert.throws(() => ops.registerVisitor("QE200001", "A", "abc", "2026-10-14"), /12/);
  assert.equal(ops.VISITOR_LATEST_HOUR, 21);
});

test("VietQR content + auto-reconcile", () => {
  const content = ops.buildVietQrContent("A205", "SE182049", 420000, "DIENNUOC");
  assert.ok(content.includes("A205") && content.includes("SE182049") && content.includes("420000"));
  assert.deepEqual(
    ops.reconcilePayment({ expectedAmount: 420000, expectedContent: content, actualAmount: 420000, actualContent: content }),
    { matched: true, reason: "MATCHED" }
  );
  assert.equal(ops.reconcilePayment({ expectedAmount: 420000, expectedContent: content, actualAmount: 419000, actualContent: content }).matched, false);
  assert.equal(ops.applyDepositTransaction(1000000, { id: "t1", studentId: "SE1", kind: "DEDUCT", amount: 200000, note: "hong quat" }), 800000);
});

test("notices active-window filter", () => {
  const n = ops.createNotice("Cat dien", "Bao tri", "ALL", "2026-10-01", "2026-10-31");
  assert.equal(ops.filterActiveNotices([n], "2026-10-13").length, 1);
  assert.equal(ops.filterActiveNotices([n], "2026-11-01").length, 0);
  assert.throws(() => ops.createNotice("", "x", "ALL", "2026-10-01", "2026-10-02"), /title/);
});

test("marketplace + lost-found with uploaded photo ids", () => {
  const photo = photos.createPhotoRecord("quat.jpg", "image/jpeg", 1024, "data:image/jpeg;base64,AAA");
  assert.ok(photo.id.startsWith("PHO-"));
  const listing = ops.createMarketplaceListing("SE1", "Quat cu gia re", 150000, "DO_CU", [photo.id]);
  assert.equal(listing.status, "ACTIVE");
  assert.deepEqual(listing.photoIds, [photo.id]);
  const post = ops.createLostFoundPost("SE2", "LOST", "Vi da mau den", "San A", [photo.id]);
  assert.equal(post.status, "OPEN");
  assert.equal(post.kind, "LOST");
});

test("photo upload validation: type/size/count", () => {
  assert.deepEqual(photos.validatePhotoFile({ type: "image/png", size: 100, name: "a.png" }, 0), { ok: true, reason: "OK" });
  assert.equal(photos.validatePhotoFile({ type: "application/pdf", size: 100, name: "a.pdf" }, 0).ok, false);
  assert.equal(photos.validatePhotoFile({ type: "image/png", size: 9 * 1024 * 1024, name: "big.png" }, 0).ok, false);
  assert.equal(photos.validatePhotoFile({ type: "image/png", size: 100, name: "a.png" }, 5).ok, false);
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k), clear: () => mem.clear(), get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null };
  const rec = photos.createPhotoRecord("m.jpg", "image/jpeg", 10, "data:image/jpeg;base64,AAA");
  photos.savePhotoRecords(storage, "k", [rec]);
  assert.equal(photos.loadPhotoRecords(storage, "k").length, 1);
});

test("floor plan color mapping available/full/maintenance", () => {
  assert.equal(ops.resolveFloorRoomStatus({ id: "A201", capacity: 24, occupied: 10, underMaintenance: false }), "available");
  assert.equal(ops.resolveFloorRoomStatus({ id: "A202", capacity: 24, occupied: 24, underMaintenance: false }), "full");
  assert.equal(ops.resolveFloorRoomStatus({ id: "A203", capacity: 24, occupied: 5, underMaintenance: true }), "maintenance");
  assert.equal(ops.getRoomStatusColor("available").bg, "#16a34a");
  assert.equal(ops.getRoomStatusColor("full").bg, "#dc2626");
  assert.equal(ops.getRoomStatusColor("maintenance").bg, "#d97706");
  const grid = ops.buildFloorGrid([
    { id: "A201", capacity: 24, occupied: 24, underMaintenance: false },
    { id: "A202", capacity: 24, occupied: 3, underMaintenance: false },
  ]);
  assert.deepEqual(grid, { A201: "full", A202: "available" });
});

test("chatbot answers rules + repair/emergency guidance", () => {
  assert.ok(ops.answerDormQuestion("gioi nghiem 23h ve muon the nao").includes("23:00"));
  assert.ok(ops.answerDormQuestion("o cam bi chay khet phai lam sao").includes("1900"));
  assert.ok(ops.answerDormQuestion("cach bao hong quat tran").includes("Maintenance"));
  assert.ok(ops.answerDormQuestion("dong tien dien nuoc vietqr").includes("VietQR"));
});

test("allocation suggests habit/faculty match first", () => {
  const student = { id: "SE1", faculty: "CNTT", nightOwl: true, quiet: false };
  const rooms = [
    { id: "R-quiet", facultyMix: ["KETOAN"], nightOwlFriendly: false, quietZone: true, freeBeds: 2 },
    { id: "R-match", facultyMix: ["CNTT"], nightOwlFriendly: true, quietZone: false, freeBeds: 2 },
    { id: "R-full", facultyMix: ["CNTT"], nightOwlFriendly: true, quietZone: false, freeBeds: 0 },
  ];
  const top = ops.suggestRoomAllocation(student, rooms, 2);
  assert.equal(top[0].id, "R-match");
  assert.ok(!top.some((r) => r.id === "R-full"));
});

test("moderation blocks banned content", () => {
  assert.equal(ops.moderateText("ban quat cu gia re").ok, true);
  assert.equal(ops.moderateText("day la spam lua dao").ok, false);
});

await run();
console.log("ALL DORM-OPS TESTS PASSED");
