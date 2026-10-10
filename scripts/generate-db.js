import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {
  users: [],
  buildings: [],
  floors: [],
  rooms: [],
  compartments: [],
  beds: [],
  configs: [],
  bookings: [],
  contracts: [],
  utilityRecords: [],
  invoices: [],
  tickets: []
};

// 1. Configs
db.configs.push({
  id: "c1",
  type: "PRICING",
  roomPrice: 1200000,
  electricityPrice: 3500,
  waterPrice: 15000,
  vat: 0.08
});

// 2. Users (Students, Admins, etc.)
db.users.push(
  {
    id: "u1",
    mssv: "SE123456",
    email: "student1@fpt.edu.vn",
    name: "Nguyễn Văn A",
    gender: "MALE",
    role: "STUDENT",
    status: "ACTIVE",
    previousDebt: 0,
    isSuspended: false
  },
  {
    id: "u2",
    mssv: "SE123457",
    email: "student2@fpt.edu.vn",
    name: "Lê Văn B",
    gender: "MALE",
    role: "STUDENT",
    status: "ACTIVE",
    previousDebt: 500000, // Nợ kỳ trước
    isSuspended: false
  },
  {
    id: "u3",
    mssv: "SE123458",
    email: "student3@fpt.edu.vn",
    name: "Trần Văn C",
    gender: "MALE",
    role: "STUDENT",
    status: "ACTIVE",
    previousDebt: 0,
    isSuspended: true // Bị đình chỉ
  },
  {
    id: "a1",
    email: "admin@fe.edu.vn",
    name: "Quản trị viên",
    role: "ADMIN"
  }
);

// 3. Buildings, Floors, Rooms, Compartments, Beds
const buildingId = "b1";
db.buildings.push({
  id: buildingId,
  name: "Tòa A",
  genderType: "MALE",
  totalFloors: 5
});

const statuses = ["AVAILABLE", "HOLDING", "OCCUPIED", "MAINTENANCE"];
const getRandomStatus = () => {
  const rand = Math.random();
  if (rand < 0.6) return "AVAILABLE";
  if (rand < 0.7) return "HOLDING";
  if (rand < 0.9) return "OCCUPIED";
  return "MAINTENANCE";
};

let floorCounter = 1;
let roomCounter = 1;
let compartmentCounter = 1;
let bedCounter = 1;

for (let i = 1; i <= 5; i++) { // 5 floors
  const floorId = `f${floorCounter++}`;
  db.floors.push({
    id: floorId,
    buildingId,
    level: i
  });

  for (let j = 1; j <= 4; j++) { // 4 rooms per floor
    const roomId = `r${roomCounter++}`;
    const roomName = `A${i}0${j}`; // e.g., A101, A102
    db.rooms.push({
      id: roomId,
      floorId,
      name: roomName,
      status: "ACTIVE"
    });

    const compNames = ["A", "B", "C", "D"];
    for (let k = 0; k < 4; k++) { // 4 compartments per room
      const compId = `c${compartmentCounter++}`;
      const compName = compNames[k];
      db.compartments.push({
        id: compId,
        roomId,
        name: compName
      });

      for (let l = 1; l <= 6; l++) { // 6 beds per compartment
        const bedId = `bed${bedCounter++}`;
        const bedName = `G0${l}`;
        const fullCode = `${roomName}-${compName}-${bedName}`; // e.g. A205-B1-G03 (Well B1 is B-1? Wait, SRS says B-1 but B is enough. We'll use just B for zone)
        
        db.beds.push({
          id: bedId,
          compartmentId: compId,
          name: bedName,
          fullCode: fullCode,
          status: getRandomStatus(),
          studentId: null
        });
      }
    }
  }
}

const outputPath = path.join(__dirname, '../db.json');
fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));
console.log(`Database generated successfully at ${outputPath} with ${db.beds.length} beds.`);
