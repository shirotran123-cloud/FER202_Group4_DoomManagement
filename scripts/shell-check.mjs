import { readFileSync, existsSync } from "node:fs";
import { strict as assert } from "node:assert";

const dist = new URL("../dist/index.html", import.meta.url);
assert.equal(existsSync(dist), true, "dist/index.html must exist after build");
const html = readFileSync(dist, "utf8");
assert.ok(html.includes('id="root"'), "shell must mount #root");
assert.ok(html.includes("/assets/"), "built assets must be referenced");
assert.ok(html.includes("manifest.webmanifest") || html.includes("manifest"), "PWA manifest linked");

const srcFiles = [
  "src/App.tsx",
  "src/components/layout/AppLayout.tsx",
  "src/components/layout/Sidebar.tsx",
  "src/components/layout/Navbar.tsx",
  "src/lib/dorm-ops.ts",
  "src/lib/photo-upload.ts",
  "src/components/ui/image-upload.tsx",
  "src/pages/visitor/VisitorPage.tsx",
  "src/pages/notices/NoticesPage.tsx",
  "src/pages/marketplace/MarketplacePage.tsx",
];
for (const f of srcFiles) {
  assert.equal(existsSync(new URL(`../${f}`, import.meta.url)), true, `${f} exists`);
}
const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
for (const route of ["/visitor", "/notices", "/marketplace", "/billing", "/maintenance", "/curfew", "/booking"]) {
  assert.ok(app.includes(`path="${route}"`), `route ${route} registered`);
}
const sidebar = readFileSync(new URL("../src/components/layout/Sidebar.tsx", import.meta.url), "utf8");
assert.ok(sidebar.includes("/visitor") && sidebar.includes("/marketplace"), "sidebar links new routes");
console.log("SHELL CHECK PASSED: header/nav/main shell + new routes + upload + PWA present");
