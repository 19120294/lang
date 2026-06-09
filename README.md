# Lặng — Website Cẩm nang & Tra cứu Sức khỏe Tâm lý

Một "khoảng lặng" an toàn để người dùng hiểu cảm xúc của mình, tra cứu kiến thức tâm lý đáng tin cậy và tìm sự hỗ trợ phù hợp. **An toàn người dùng được ưu tiên trên mọi tính năng khác.**

> ⚠️ Thông tin trên website chỉ mang tính tham khảo, **không thay thế chẩn đoán/điều trị y khoa chuyên môn**.

---

## Kiến trúc

| Tầng | Công nghệ | Thư mục |
|---|---|---|
| Frontend | Angular 19 + Tailwind CSS v4 | `lang-app/` |
| Backend | NestJS + Prisma | `lang-backend/` |
| Database | PostgreSQL | (local hoặc Neon/Supabase) |

## Tính năng chính
- **Đánh giá tâm lý**: PHQ-9, GAD-7, DASS-21, **EPDS** (thai kỳ/sau sinh), **GDS-15** (người cao tuổi), **PSS-10** (căng thẳng) — chấm điểm chuẩn lâm sàng, lịch sử & so sánh theo thời gian.
- **An toàn**: nút SOS sticky + hotline; tự kích hoạt hỗ trợ khi PHQ-9 câu 9 / EPDS câu 10 > 0 hoặc phát hiện từ khóa nguy cơ trong chatbot/cộng đồng.
- **Tra cứu**: thư viện kiến thức có nội dung đầy đủ + nguồn trích dẫn, tìm kiếm & lọc.
- **Tự chăm sóc**: theo dõi cảm xúc (biểu đồ xu hướng), nhật ký (mã hóa), bài tập thở, nhắc nhở ghi mood (opt-in).
- **Cộng đồng**: chia sẻ ẩn danh, **pre-moderation** (kiểm duyệt trước khi hiển thị) + báo cáo.
- **Thư viện sách**, **cơ sở hỗ trợ** (Google Maps), **chatbot** định hướng (rule-based, an toàn).
- Guest-first (không bắt buộc đăng nhập), dark mode, accessibility, **age-gating < 18**.

---

## Chạy local

### 1. Database (PostgreSQL)
Cài PostgreSQL, tạo database `lang_db` và user. Hoặc dùng chuỗi kết nối Neon/Supabase.

### 2. Backend
```bash
cd lang-backend
cp .env.example .env          # điền DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY
# Tạo ENCRYPTION_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm install
npx prisma migrate dev        # tạo schema (lần đầu)
npm run seed                  # nạp dữ liệu mẫu
npm run start:dev             # → http://localhost:3001/api/v1
```
Tài khoản quản trị mẫu: `admin@lang.dev` / `admin12345`

### 3. Frontend
```bash
cd lang-app
npm install
npx ng serve                  # → http://localhost:4200
```

---

## Deploy 100% MIỄN PHÍ (không cần thẻ tín dụng)

App phi lợi nhuận — toàn bộ stack dưới đây **free vĩnh viễn và KHÔNG yêu cầu thẻ**:

| Phần | Nền tảng free | Giới hạn (đủ cho app nhỏ) |
|---|---|---|
| Frontend (SSR) | **Vercel** (Hobby) | Tự nhận diện Angular SSR; hoặc Render Node. Domain free |
| Backend | **Render** (Free Web Service) | "Ngủ" sau 15 phút → cold start ~30s |
| Database | **Neon** (Free) | 0.5 GB, không hết hạn |
| Email | **Brevo** (Free) | 300 email/ngày — không cần domain riêng |
| CI/CD | **GitHub Actions** | Free cho repo public |

### ⚠️ Để KHÔNG bao giờ bị tính tiền
- **Không nhập thẻ tín dụng** ở Vercel/Render → không thể bị charge.
- **Không dùng Render PostgreSQL** (bản free bị xóa sau 90 ngày). Dùng **Neon** — free vĩnh viễn.
- **Không mua domain** — dùng subdomain `.vercel.app` / `.onrender.com` miễn phí.
- **Email**: dùng **Brevo** (chỉ cần xác minh 1 email người gửi, không cần domain). Tránh Resend (bắt buộc domain riêng).
- Nút SOS + hotline là **tĩnh ở frontend** → luôn hoạt động kể cả khi backend free đang "ngủ".

### Các bước deploy
1. **Neon**: tạo project → copy `DATABASE_URL`.
2. **Brevo**: đăng ký free → xác minh email người gửi → lấy SMTP (`smtp-relay.brevo.com:587`, user/key).
3. **Render**: tạo Web Service từ repo (dùng `render.yaml` + `Dockerfile`), dán env:
   - `DATABASE_URL` (Neon), `JWT_SECRET` (random mới), `ENCRYPTION_KEY` (random 64 hex mới),
   - `FRONTEND_URL` (domain Vercel), `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`, `NODE_ENV=production`.
4. **Vercel**: import repo `lang-app`. Frontend dùng **SSR** (Angular Universal) → Vercel tự nhận diện và deploy serverless. Đặt `environment.prod.ts` → `apiUrl` trỏ tới Render (URL tuyệt đối, để SSR gọi API được). Có thể deploy SSR trên Render Node thay thế: `npm run build` → chạy `node dist/lang-app/server/server.mjs`.
5. Backend tự chạy `prisma migrate deploy` khi khởi động (đã cấu hình trong Dockerfile).

> 💡 Email là **tùy chọn**: nếu chưa cấu hình SMTP, app vẫn chạy bình thường — link đặt lại mật khẩu sẽ in ra log server thay vì gửi email. Bật SMTP bất cứ lúc nào mà không cần sửa code.

Sinh khóa bí mật production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"  # JWT_SECRET
```

---

## Bảo mật & tuân thủ
- Dữ liệu nhạy cảm (nhật ký, ghi chú cảm xúc) **mã hóa AES-256-GCM** trước khi lưu.
- Local-first cho mood/journal; chỉ đồng bộ server khi người dùng đăng nhập.
- Rate limiting, Helmet, validation (class-validator), JWT + refresh token.
- Quyền **xóa toàn bộ dữ liệu** (theo Nghị định 13/2023/NĐ-CP).
- Log sự kiện khủng hoảng **ẩn danh** (aggregate), không lưu PII.

## 🚩 Việc cần làm trước khi phát hành thật
- **Xác minh lại số hotline & giờ hoạt động** định kỳ (hiện dùng số công khai: 115, 111, Ngày Mai 096 306 1414).
- Nội dung tra cứu nên được **chuyên gia lâm sàng review** chính thức.
- Cân nhắc bật **SSR** (Angular Universal) cho SEO mục Tra cứu.
- Bổ sung test tự động (unit/e2e).
