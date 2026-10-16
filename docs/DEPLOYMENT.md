# Triển khai DMS (Deployment)

## 1. Chạy local
```bash
npm ci
npm run dev        # frontend :5173
npm run server     # backend :3001
```

## 2. Docker Compose (dev/staging)
```bash
docker compose up --build
# frontend http://localhost:8080, backend http://localhost:3001
```

## 3. Kiểm tra sống
- `GET /api/health` → `{ ok: true, version: "2.0.0" }`
- `GET /api/config` → biểu giá, mốc giới nghiêm, mô hình 1:4:6
- `GET /api/events` → SSE realtime

## 3b. Kiểm thử backend
```bash
npm run check:domain      # luật nghiệp vụ thuần (69 assertions)
npm run check:contract    # shape khớp frontend (30 assertions)
npm run test:api          # phân quyền 4 vai trò (58 assertions)
npm run check:backend     # chạy cả 3 (cần backend đang chạy cho 2 bộ sau)
```

## 4. Biến môi trường
Copy `.env.example` thành `.env`. Không commit key thật.

## 5. Production gợi ý
- Frontend: Vercel/Render hoặc Nginx container.
- Backend: VPS + HTTPS/TLS + HSTS (headers đã cấu hình ở `nginx.conf` + `server.js`).
- Cache: thay Map in-memory bằng Redis (interface `cacheGet/cacheSet` giữ nguyên).
- Queue: thay `setTimeout` worker bằng BullMQ (interface `enqueueJob` giữ nguyên).
- K8s: dùng 2 Deployment (frontend/backend) + Service + Ingress TLS; manifest mẫu theo `docker-compose.yml`.
