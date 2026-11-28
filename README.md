# Frontend – Hệ thống đặt lịch khám và quản lý hàng đợi tích hợp AI

Ứng dụng React (Create React App) cho đồ án tốt nghiệp VKU. Hiện tại frontend đã có **luồng đặt lịch và quản trị kế thừa**; các **màn hình hàng đợi/AI theo đề cương chưa được làm** (xem [Việc cần làm](#việc-cần-làm-giao-diện-hàng-đợi--ai)).

Tổng quan toàn hệ thống: [README gốc](../README.md). Backend: [backend/README.md](../backend/README.md).

## Đã có

| Phân hệ | Nội dung | Thư mục |
|---|---|---|
| Trang chủ & tra cứu | Trang chủ, danh sách chuyên khoa/phòng khám/bác sĩ, chi tiết bác sĩ, cẩm nang, gói khám | `src/containers/HomePage`, `Patient/*` |
| Bệnh nhân | Đăng ký/đăng nhập (kèm Google/Facebook OAuth), đặt lịch theo khung giờ (cập nhật slot realtime), lịch sử khám, khám tại nhà/tại viện, bài kiểm tra sức khoẻ | `src/containers/Patient`, `Auth` |
| Bác sĩ | Quản lý lịch làm việc, danh sách bệnh nhân, tóm tắt bệnh án, kê đơn + gửi đơn thuốc PDF | `src/containers/System/Doctor` |
| Quản trị | Quản lý người dùng, bác sĩ, chuyên khoa, phòng khám, cẩm nang, câu hỏi khảo sát | `src/containers/System/*` |
| Thu ngân | Thanh toán, biên lai | `src/containers/System/Cashier` |
| Chat | Chat bác sĩ–bệnh nhân (Socket.io) và trợ lý AI chatbot (gọi Chatbot Flask) | `src/containers/Chat`, `HomePage/AIAssistant.js` |
| Đa ngôn ngữ | Tiếng Việt / English (`react-intl`) | `src/translations` |

Đã chỉnh để tương thích backend v2: socket gửi cookie `jwt` khi kết nối (`src/socket.js`), cập nhật trạng thái slot theo schema mới.

## Công nghệ

React 17 · Redux + Redux Thunk + Redux Persist · React Router 5 · Axios · Socket.io-client · `react-intl` · Bootstrap 5 + Material UI 4 + SCSS · Firebase (FCM web push) · Markdown (`markdown-it`, `react-markdown-editor-lite`).

## Cài đặt và chạy

Cần: Node.js (khuyến nghị 18–22) và backend đang chạy ([hướng dẫn](../backend/README.md)).

```bash
cd frontend
npm install
cp .env.example .env     # chỉnh các biến bên dưới
npm start                # http://localhost:3000
```

| Biến (`.env`) | Ý nghĩa |
|---|---|
| `REACT_APP_BACKEND_URL` | URL backend. **Backend mặc định chạy cổng `6969`** → đặt `http://localhost:6969` (file mẫu đang ghi 5000, phải sửa cho khớp) |
| `REACT_APP_CHATBOT_URL` | URL Chatbot (Flask, mặc định cổng `5002`), tuỳ chọn |
| `REACT_APP_GOOGLE_CLIENT_ID` · `REACT_APP_FACEBOOK_APP_ID` | Đăng nhập OAuth, tuỳ chọn |
| `REACT_APP_ROUTER_BASE_NAME` | Tiền tố đường dẫn khi triển khai trong thư mục con |
| `PORT` | Cổng dev server (mặc định 3000) |

Chỉ biến bắt đầu bằng `REACT_APP_` mới vào được bundle; **không đặt bí mật** (khoá API, mật khẩu) vào đây. Sau khi đổi `.env` phải khởi động lại `npm start`.

Lệnh khác: `npm run build` (bản production vào `build/`), `npm test`.

## Cấu trúc

```text
src/
├── containers/   các trang theo phân hệ (HomePage, Patient, System, Auth, Chat, Header)
├── components/   thành phần dùng chung
├── routes/       định nghĩa route theo vai trò (Home, Login, System, Doctor)
├── services/     gọi API (axios): user, doctor, admin, facility, package, question
├── store/        Redux (actions, reducers)
├── hoc/          xác thực, IntlProvider
├── hooks/        hook cho chat
├── socket.js     kết nối Socket.io (dùng cookie jwt)
├── axios.js      cấu hình axios + xử lý token/refresh
├── translations/ vi.json, en.json
└── utils/        hằng số, tiện ích
```

## Việc cần làm: giao diện hàng đợi & AI

Backend đã sẵn sàng toàn bộ API và sự kiện dưới đây (chi tiết: [QUEUE_ENGINE.md](../backend/QUEUE_ENGINE.md), [AI_INTEGRATION.md](../backend/AI_INTEGRATION.md), [REMINDERS.md](../backend/REMINDERS.md)). Frontend **chưa gọi** các API này.

| Màn hình theo đề cương | Dùng API / sự kiện của backend |
|---|---|
| **e-Ticket QR + Live Queue Tracker** (bệnh nhân) | `POST /api/queue/check-in {bookingId}` · `GET /api/queue/my-tickets` · socket `QUEUE_TICKET_UPDATED` (vị trí + ETA, có `etaBasis` = `ml`/`history`/`default` để hiển thị độ tin cậy) · `POST /api/queue/tickets/:id/postpone` (dời lượt) |
| **Chuông thông báo** | `GET /api/notifications` · `/unread-count` · `POST /:id/read` · `/read-all` · socket `NOTIFICATION_NEW` |
| **Ô nhập triệu chứng → gợi ý chuyên khoa** | `POST /api/ai/triage {text}` (công khai; kết quả kèm `disclaimer`, cảnh báo cấp cứu cần hiển thị nổi bật; AI lỗi thì trả `available:false` → cho chọn chuyên khoa thủ công, không chặn đặt lịch) |
| **Cổng bác sĩ** (danh sách chờ, gọi số một chạm) | `GET /api/queue/doctor/board` · `POST /api/queue/doctor/call-next` · `/tickets/:id/{call,start,finish,no-show,emergency}` · socket `DOCTOR_QUEUE_UPDATED` |
| **TV sảnh** (số thứ tự toàn màn hình + đọc loa tiếng Việt) | socket vào `queue:room:<roomId>`: `QUEUE_UPDATED` (danh sách) · `TICKET_CALLED` (có sẵn câu đọc `announce`, dùng Web Speech API; cần một thao tác người dùng ban đầu để mở khoá âm thanh) · `GET /api/queue/rooms/:roomId/display` |
| **Quầy tiếp đón** (vãng lai, check-in hộ) | `POST /api/queue/walk-in` (chọn chuyên khoa → tự chọn bác sĩ chờ ngắn nhất) · `GET /api/queue/walk-in/suggest` (bảng tải) · `POST /api/queue/check-in` |
| **Quản lý phòng** | `GET/POST /api/queue/rooms` · `PUT /api/queue/rooms/:id` · `PUT /api/queue/assign-room` |
| **Quản trị phân quyền (RBAC)** | `/api/rbac/roles` · `/permissions` · `/roles/:code/permissions` · `/users/:id/role` · `/audit-logs` · `GET /api/rbac/me` (quyền của người đăng nhập, dùng để ẩn/hiện menu) |
| **Heatmap phòng khám, đối sánh AI** (Admin) | đối sánh AI: `GET /api/ai/metrics` · Heatmap: **backend chưa có API tổng hợp** (cần làm trước) |

Ghi chú kết nối: socket xác thực bằng cookie `jwt` (đã bật `withCredentials`); bệnh nhân tự vào phòng `user:<id>`, bác sĩ/TV cần có quyền tương ứng (xem đầu `backend/src/socket/queueSocket.js`).
