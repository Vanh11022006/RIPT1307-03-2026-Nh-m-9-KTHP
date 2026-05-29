# BÁO CÁO KẾ HOẠCH KIỂM THỬ (TEST PLAN)

## 1. Thông tin chung
* **Dự án:** Cổng Đăng ký Xét tuyển Đại học Trực tuyến
* **Thành viên phụ trách:** Khuất Tiến Quang
* **Vai trò:** Tester & Support Frontend

## 2. Kế hoạch thực hiện (Theo phân công của Trưởng nhóm)
* **Giai đoạn 1 (28/05 - 30/05):** Kiểm tra lỗ hổng bảo mật IDOR trên hồ sơ thí sinh.
* **Giai đoạn 2 (31/05 - 02/06):** Integration & End-to-End Testing (Kiểm thử toàn bộ luồng đăng ký).
* **Giai đoạn 3 (03/06 - 04/06):** UAT & Performance Test (Kiểm thử hiệu năng upload file minh chứng lên S3).

## 3. Nhật ký và Kết quả kiểm thử (Ngày 29/05)
- **Người thực hiện:** Khuất Tiến Quang
- **Trạng thái script:** Hoạt động ổn định trên môi trường Node.js local.
- **Kết quả vận hành:** Đã chạy thử nghiệm file `idor_security.test.js`. Hệ thống bắt lỗi an toàn và ghi nhận trạng thái mất kết nối do Server Backend hiện đang offline (lỗi cấu hình Mail chưa nổ máy được). Khung quét tự động đã sẵn sàng 100%, chỉ chờ Backend mở cổng `8080` là có thể quét lỗ hổng IDOR ngay lập tức.