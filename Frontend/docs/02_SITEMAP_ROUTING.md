# 02. Sitemap and Routing

## 1. Routing Overview

Hệ thống sử dụng React Router DOM để quản lý điều hướng.

Các route được chia thành 4 nhóm chính:

- Public routes: dành cho người chưa đăng nhập hoặc mọi người dùng.
- Candidate routes: dành cho thí sinh đã đăng nhập.
- Admin routes: dành cho quản trị viên đã đăng nhập.
- Error routes: xử lý lỗi truy cập và trang không tồn tại.

## 2. Public Routes

### /

Tên trang: Landing Page

Mục đích:

- Giới thiệu hệ thống xét tuyển đại học trực tuyến.
- Giới thiệu quy trình sử dụng hệ thống.
- Điều hướng người dùng đến trang đăng nhập hoặc đăng ký.

Thành phần chính:

- Hero section.
- Giới thiệu lợi ích của hệ thống.
- Quy trình xét tuyển.
- Nút Đăng nhập.
- Nút Đăng ký.

---

### /login

Tên trang: Login Page

Mục đích:

- Cho phép candidate hoặc admin đăng nhập vào hệ thống.

Thành phần chính:

- Input email.
- Input password.
- Button đăng nhập.
- Link sang trang đăng ký.
- Thông tin tài khoản demo.

Logic điều hướng:

- Nếu role là candidate, chuyển đến /candidate/dashboard.
- Nếu role là admin, chuyển đến /admin/dashboard.
- Nếu sai thông tin đăng nhập, hiển thị thông báo lỗi.

---

### /register

Tên trang: Register Page

Mục đích:

- Cho phép thí sinh tạo tài khoản mới.

Thành phần chính:

- Họ và tên.
- Email.
- Số điện thoại.
- Mật khẩu.
- Xác nhận mật khẩu.
- Button đăng ký.
- Link sang trang đăng nhập.

Sau khi đăng ký thành công:

- Hiển thị thông báo đăng ký thành công.
- Có thể chuyển người dùng về /login.

## 3. Candidate Routes

Tất cả route /candidate/* yêu cầu:

- User đã đăng nhập.
- User có role là candidate.

---

### /candidate

Redirect đến:

- /candidate/dashboard

---

### /candidate/dashboard

Tên trang: Candidate Dashboard

Mục đích:

- Hiển thị tổng quan tình trạng hồ sơ của thí sinh.

Thành phần chính:

- Card tổng số hồ sơ đã nộp.
- Card số hồ sơ đang chờ duyệt.
- Card số hồ sơ đã duyệt.
- Card số hồ sơ bị từ chối.
- Danh sách hồ sơ gần đây.
- Hướng dẫn bước tiếp theo cho thí sinh.

---

### /candidate/profile

Tên trang: Candidate Profile

Mục đích:

- Cho phép thí sinh xem và cập nhật thông tin cá nhân.

Thành phần chính:

- Form thông tin cá nhân.
- Họ tên.
- Ngày sinh.
- Giới tính.
- CCCD.
- Số điện thoại.
- Email.
- Địa chỉ.
- Tỉnh/thành phố.
- Trường THPT.
- Năm tốt nghiệp.
- Button lưu thay đổi.

---

### /candidate/universities

Tên trang: University List

Mục đích:

- Cho phép thí sinh xem danh sách trường đại học đang tuyển sinh.

Thành phần chính:

- Danh sách trường dạng Card hoặc Table.
- Search theo tên trường/mã trường.
- Filter theo thành phố.
- Button xem chi tiết.
- Button nộp hồ sơ.

---

### /candidate/universities/:id

Tên trang: University Detail

Mục đích:

- Hiển thị thông tin chi tiết của một trường đại học.

Thành phần chính:

- Tên trường.
- Mã trường.
- Tên viết tắt.
- Logo.
- Địa chỉ.
- Website.
- Email.
- Số điện thoại.
- Mô tả.
- Danh sách ngành thuộc trường.
- Button nộp hồ sơ vào trường.

---

### /candidate/apply

Tên trang: Admission Application Form

Mục đích:

- Cho phép thí sinh nộp hồ sơ xét tuyển.

Thành phần chính:

- Section thông tin thí sinh.
- Dropdown chọn trường.
- Dropdown chọn ngành.
- Dropdown chọn tổ hợp xét tuyển.
- Input điểm theo từng môn.
- Upload file minh chứng giả lập.
- Preview tổng điểm.
- Checkbox xác nhận thông tin.
- Button nộp hồ sơ.

Logic chính:

- Phải chọn trường trước.
- Sau khi chọn trường, chỉ hiển thị ngành thuộc trường đó.
- Sau khi chọn ngành, chỉ hiển thị tổ hợp xét tuyển của ngành đó.
- Sau khi chọn tổ hợp, chỉ hiển thị input điểm tương ứng.
- Tổng điểm được tính tự động.
- Không cho nộp nếu thiếu thông tin bắt buộc.

---

### /candidate/applications

Tên trang: My Applications

Mục đích:

- Hiển thị danh sách hồ sơ thí sinh đã nộp.

Thành phần chính:

- Table danh sách hồ sơ.
- Search theo mã hồ sơ/trường/ngành.
- Filter theo trạng thái.
- Cột mã hồ sơ.
- Cột trường.
- Cột ngành.
- Cột tổ hợp.
- Cột tổng điểm.
- Cột trạng thái.
- Cột ngày nộp.
- Button xem chi tiết.

---

### /candidate/applications/:id

Tên trang: Candidate Application Detail

Mục đích:

- Hiển thị chi tiết một hồ sơ xét tuyển của thí sinh.

Thành phần chính:

- Thông tin thí sinh.
- Thông tin trường.
- Thông tin ngành.
- Tổ hợp xét tuyển.
- Điểm từng môn.
- Tổng điểm.
- File minh chứng.
- Trạng thái hồ sơ.
- Ghi chú từ admin nếu có.

---

### /candidate/results

Tên trang: Admission Results

Mục đích:

- Hiển thị kết quả xét tuyển của thí sinh.

Thành phần chính:

- Danh sách hồ sơ đã có kết quả.
- Hồ sơ được duyệt.
- Hồ sơ bị từ chối.
- Hồ sơ đang chờ duyệt.
- Ghi chú xử lý từ admin.
- Hướng dẫn tiếp theo.

## 4. Admin Routes

Tất cả route /admin/* yêu cầu:

- User đã đăng nhập.
- User có role là admin.

---

### /admin

Redirect đến:

- /admin/dashboard

---

### /admin/dashboard

Tên trang: Admin Dashboard

Mục đích:

- Hiển thị thống kê tổng quan hệ thống.

Thành phần chính:

- Tổng số thí sinh.
- Tổng số trường.
- Tổng số ngành.
- Tổng số hồ sơ.
- Số hồ sơ chờ duyệt.
- Số hồ sơ đã duyệt.
- Số hồ sơ bị từ chối.
- Table hồ sơ mới nhất.

---

### /admin/universities

Tên trang: University Management

Mục đích:

- Quản lý danh sách trường đại học.

Thành phần chính:

- Table danh sách trường.
- Search theo tên trường/mã trường.
- Filter theo trạng thái.
- Filter theo thành phố.
- Button thêm trường.
- Button sửa trường.
- Button chuyển trạng thái active/inactive.
- Modal form thêm/sửa trường.

---

### /admin/majors

Tên trang: Major Management

Mục đích:

- Quản lý danh sách ngành học.

Thành phần chính:

- Table danh sách ngành.
- Search theo tên ngành/mã ngành.
- Filter theo trường.
- Filter theo trạng thái.
- Button thêm ngành.
- Button sửa ngành.
- Button chuyển trạng thái active/inactive.
- Modal form thêm/sửa ngành.

---

### /admin/candidates

Tên trang: Candidate Management

Mục đích:

- Quản lý danh sách thí sinh.

Thành phần chính:

- Table danh sách thí sinh.
- Search theo họ tên/email/CCCD.
- Filter theo thành phố.
- Filter theo năm tốt nghiệp.
- Button xem chi tiết.
- Drawer hoặc Modal xem chi tiết thí sinh.

---

### /admin/applications

Tên trang: Application Management

Mục đích:

- Quản lý toàn bộ hồ sơ xét tuyển.

Thành phần chính:

- Table danh sách hồ sơ.
- Search theo mã hồ sơ/tên thí sinh/trường/ngành.
- Filter theo trạng thái.
- Filter theo trường.
- Filter theo ngành.
- Filter theo tổ hợp.
- Button xem chi tiết.
- Button duyệt nhanh nếu hồ sơ pending.
- Button từ chối nhanh nếu hồ sơ pending.

---

### /admin/applications/:id

Tên trang: Admin Application Detail

Mục đích:

- Admin xem chi tiết và xử lý hồ sơ xét tuyển.

Thành phần chính:

- Thông tin thí sinh.
- Thông tin hồ sơ.
- Điểm xét tuyển.
- File minh chứng.
- Trạng thái hiện tại.
- Ghi chú thí sinh.
- Ghi chú admin.
- Button duyệt hồ sơ.
- Button từ chối hồ sơ.
- Modal nhập lý do từ chối.

## 5. Error Routes

### /403

Tên trang: Forbidden Page

Mục đích:

- Hiển thị khi user không có quyền truy cập route.

Ví dụ:

- Candidate truy cập /admin/dashboard.
- Admin truy cập /candidate/apply.

---

### /404

Tên trang: Not Found Page

Mục đích:

- Hiển thị khi người dùng truy cập route không tồn tại.

## 6. Route Protection Rules

- Người chưa đăng nhập không được truy cập candidate routes và admin routes.
- Người chưa đăng nhập nếu truy cập private route thì chuyển về /login.
- Candidate không được truy cập admin routes.
- Admin không được truy cập candidate routes.
- User đăng nhập nhưng sai quyền thì chuyển sang /403.
- Route không tồn tại thì chuyển sang /404.

## 7. Default Redirect Rules

- /candidate chuyển về /candidate/dashboard.
- /admin chuyển về /admin/dashboard.
- Sau khi login thành công:
  - candidate chuyển về /candidate/dashboard.
  - admin chuyển về /admin/dashboard.
- Sau khi logout:
  - chuyển về /login.