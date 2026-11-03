const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const MOCK_USERS = {
  student: {
    id: "usr_student_01",
    fullName: "Nguyễn Hoàng Vinh",
    email: "hoangvinh.student@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    role: "student",
    roleTitle: "Sinh viên lưu trú",
    studentId: "SE182049",
    phone: "0912 345 678",
    citizenId: "079204018293",
    dob: "2004-05-15",
    gender: "male",
    hometown: "TP. Hồ Chí Minh",
    major: "Kỹ thuật Phần mềm (Software Engineering)",
    cohort: "K19 - Khóa 2023-2027",
    status: "active",
    joinedDate: "2024-09-01",
    dormitoryStatus: {
      building: "Tòa A (Nam)",
      room: "A205",
      compartment: "Buồng B",
      bedCode: "A205-B-G03",
      contractStart: "2026-09-01",
      contractEnd: "2027-01-15",
      debtStatus: 0,
      checkInDate: "2026-09-05",
      roomStatus: "OCCUPIED",
    },
    emergencyContact: {
      parentName: "Nguyễn Văn Hùng",
      relationship: "Bố (Phụ huynh)",
      phone: "0903 123 456",
      address: "123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
      email: "hung.nguyen.parent@gmail.com",
    },
  },
  manager: {
    id: "usr_manager_01",
    fullName: "Vũ Thành Nam",
    email: "namvt@fpt.edu.vn",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    role: "manager",
    roleTitle: "Trưởng Ban Quản Lý (Tòa A & B - Nam)",
    staffId: "MGR-004",
    phone: "0988 765 432",
    citizenId: "001082001924",
    dob: "1982-11-20",
    gender: "male",
    hometown: "Hà Nội",
    department: "Phòng Quản lý KTX & Công tác Sinh viên (CTSV)",
    status: "active",
    joinedDate: "2020-03-15",
    emergencyContact: {
      parentName: "Vũ Đình Khiêm",
      relationship: "Thân nhân",
      phone: "0912 999 888",
      address: "Khu Đô thị FPT City, Phường Hòa Hải, Quận Ngũ Hành Sơn, Đà Nẵng",
    },
  },
  technician: {
    id: "usr_tech_01",
    fullName: "Đỗ Mạnh Hùng",
    email: "hungdm.tech@fpt.edu.vn",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    role: "technician",
    roleTitle: "Trưởng Kỹ Thuật Viên (Tòa A & B)",
    staffId: "TECH-012",
    phone: "0977 112 233",
    citizenId: "034076008123",
    dob: "1976-08-10",
    gender: "male",
    hometown: "Đà Nẵng",
    department: "Đội Kỹ thuật & Cơ điện (Tòa A & B)",
    status: "active",
    joinedDate: "2021-08-01",
    emergencyContact: {
      parentName: "Đỗ Thị Mai",
      relationship: "Vợ",
      phone: "0905 556 677",
      address: "Đường Nam Kỳ Khởi Nghĩa, Quận Ngũ Hành Sơn, Đà Nẵng",
    },
  }
};

const TOKENS = {
  accessToken: "mock_jwt_token_valid_for_testing",
  refreshToken: "mock_refresh_token",
  expiresAt: Date.now() + 15 * 60 * 1000,
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      } catch (e) {}
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(process.env.TEMP, 'edge_cdp_profile_' + Date.now());

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    await sleep(2000);

    const listRes = await fetch('http://127.0.0.1:9222/json');
    const list = await listRes.json();
    const target = list.find(t => t.title === 'about:blank') || list.find(t => t.type === 'page');

    if (!target) throw new Error('No suitable page target found');
    console.log('Connecting to target:', target.title, target.webSocketDebuggerUrl);

    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
      mobile: false
    });

    const outDir = path.join(__dirname, '..', 'public', 'screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const tasks = [
      {
        name: '01_landing_page.png',
        url: 'http://localhost:4173/welcome',
        role: null,
        wait: 1200,
      },
      {
        name: '02_login_page.png',
        url: 'http://localhost:4173/login',
        role: null,
        wait: 1000,
      },
      {
        name: '03_student_overview.png',
        url: 'http://localhost:4173/overview',
        role: 'student',
        wait: 1500,
      },
      {
        name: '04_booking_146.png',
        url: 'http://localhost:4173/booking',
        role: 'student',
        wait: 1500,
      },
      {
        name: '05_my_room.png',
        url: 'http://localhost:4173/my-room',
        role: 'student',
        wait: 1500,
      },
      {
        name: '06_billing_technician_uc16.png',
        url: 'http://localhost:4173/billing',
        role: 'technician',
        wait: 1500,
      },
      {
        name: '07_billing_student_invoice.png',
        url: 'http://localhost:4173/billing',
        role: 'student',
        wait: 1500,
      },
      {
        name: '08_maintenance_student_uc20.png',
        url: 'http://localhost:4173/maintenance',
        role: 'student',
        wait: 1500,
      },
      {
        name: '09_maintenance_technician_board.png',
        url: 'http://localhost:4173/maintenance',
        role: 'technician',
        wait: 1500,
      },
      {
        name: '10_gate_curfew_mobile_uc25.png',
        url: 'http://localhost:4173/mobile',
        role: 'student',
        wait: 1500,
      },
      {
        name: '11_manager_dashboard.png',
        url: 'http://localhost:4173/manager',
        role: 'manager',
        wait: 1500,
      },
      {
        name: '12_student_profile.png',
        url: 'http://localhost:4173/profile',
        role: 'student',
        wait: 1200,
      },
    ];

    for (const task of tasks) {
      console.log(`Processing: ${task.name}...`);
      
      // Navigate to blank domain first
      await client.send('Page.navigate', { url: 'http://localhost:4173/welcome' });
      await sleep(600);

      if (task.role && MOCK_USERS[task.role]) {
        const u = JSON.stringify(MOCK_USERS[task.role]);
        const t = JSON.stringify(TOKENS);
        await client.send('Runtime.evaluate', {
          expression: `
            localStorage.setItem("dms_auth_user_session", JSON.stringify(${u}));
            localStorage.setItem("dms_auth_tokens_session", JSON.stringify(${t}));
          `
        });
      } else {
        await client.send('Runtime.evaluate', {
          expression: `
            localStorage.removeItem("dms_auth_user_session");
            localStorage.removeItem("dms_auth_tokens_session");
          `
        });
      }

      await client.send('Page.navigate', { url: task.url });
      await sleep(task.wait);

      const res = await client.send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(outDir, task.name);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`✓ Saved ${task.name} (${Math.round(res.data.length / 1024)} KB)`);
    }

    console.log('All 12 screenshots captured successfully!');
    client.close();
  } catch (err) {
    console.error('Error in capture process:', err);
  } finally {
    edge.kill();
  }
}

main().catch(console.error);
