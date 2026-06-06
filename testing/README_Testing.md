# BÁO CÁO KẾ HOẠCH KIỂM THỬ (TEST PLAN)

## 1. Thông tin chung
* **Dự án:** Cổng Đăng ký Xét tuyển Đại học Trực tuyến
* **Thành viên phụ trách:** Khuất Tiến Quang
* **Vai trò:** Tester và viết báo cáo

## 2. Kế hoạch thực hiện (Theo phân công của Trưởng nhóm)
* **Giai đoạn 1 (28/05 - 30/05):** Kiểm tra lỗ hổng bảo mật IDOR trên hồ sơ thí sinh.
* **Giai đoạn 2 (31/05 - 02/06):** Integration & End-to-End Testing (Kiểm thử toàn bộ luồng đăng ký).
* **Giai đoạn 3 (03/06 - 04/06):** UAT & Performance Test (Kiểm thử hiệu năng upload file minh chứng lên S3).

## 3. Nhật ký và Kết quả kiểm thử (Ngày 29/05)
- **Người thực hiện:** Khuất Tiến Quang
- **Trạng thái script:** Hoạt động ổn định trên môi trường Node.js local.
- **Kết quả vận hành:** Đã chạy thử nghiệm file `idor_security.test.js`. Hệ thống bắt lỗi an toàn và ghi nhận trạng thái mất kết nối do Server Backend hiện đang offline (lỗi cấu hình Mail chưa nổ máy được). Khung quét tự động đã sẵn sàng 100%, chỉ chờ Backend mở cổng `8080` là có thể quét lỗ hổng IDOR ngay lập tức.

## 4. Nhật ký và Kết quả kiểm thử (Ngày 30/05)
- **Người thực hiện:** Khuất Tiến Quang
- **Trạng thái:** Server Backend đã online local ổn định (cổng 8080).
- **Kết quả vận hành:** Đã kết nối thành công đến API Backend. Hệ thống trả về mã lỗi `401 (Unauthorized)`. Spring Security đang chặn lọc request không có token rất tốt, bước đầu không tồn tại lỗ hổng IDOR công khai khi chưa đăng nhập.


## 5. Nhật ký và Kết quả kiểm thử (Ngày 31/05 - 02/06)
- **Hạng mục thực hiện:** Integration & End-to-End (E2E) Testing.
- **Trạng thái kịch bản tự động:** File biên dịch `integration_e2e.test.js` hoạt động ổn định, liên thông dữ liệu thành công.
- **Kết quả kiểm thử thực tế:** * Luồng toàn trình (E2E) từ Đăng ký tài khoản -> Kích hoạt -> Đăng nhập -> Điền Profile -> Nộp hồ sơ -> Admin phê duyệt vận hành thông suốt.
  * **Phát hiện Bug nghiệp vụ (Business Rule):** Hệ thống hiện tại CHƯA chặn hành vi nộp trùng lặp hồ sơ xét tuyển. Khi giả lập gửi request trùng, hệ thống không trả về lỗi `400` mà vẫn ghi nhận dữ liệu vào DB (Ghi nhận lỗi logic ở Bước 4 trong Log Terminal).

### Bằng chứng kiểm thử thực tế (Log Terminal):
```text
====== KÍCH HOẠT KIỂM THỬ TÍCH HỢP & TOÀN TRÌNH  ======
[1] Luồng E2E: Khởi tạo yêu cầu đăng ký tài khoản thí sinh...
=> Trạng thái kiểm thử: Đăng ký thành công tài khoản [sinhvien_test_22898@gmail.com]
[1.5] Luồng can thiệp từ Testing: Kết nối MySQL để kích hoạt tài khoản kiểm thử...
=> Trạng thái kiểm thử: Kích hoạt trạng thái ACTIVE thành công trên Cơ sở dữ liệu.
[2] Luồng E2E: Xác thực thông tin đăng nhập tài khoản thí sinh...
=> Trạng thái kiểm thử: Đăng nhập thành công. Mã người dùng (User ID): [14]
[2.5] Luồng E2E: Giả lập hành động điền hồ sơ thông tin cá nhân thí sinh (UI)...
=> Trạng thái kiểm thử: Kích hoạt hồ sơ thành công. Mã thí sinh (Candidate ID): [13]
[3] Luồng E2E: Gửi yêu cầu khởi tạo hồ sơ đăng ký xét tuyển nguyện vọng...
=> Trạng thái kiểm thử: Khởi tạo hồ sơ thành công. Mã định danh trên UI: [HS20260007]
[4] Kiểm thử Logic nghiệp vụ: Gửi yêu cầu nộp trùng lặp thông tin hồ sơ hiện tại...
❌ Kết quả kiểm thử: Thất bại. Hệ thống không chặn trùng lặp hồ sơ theo Business Rules.
[5] Luồng E2E: Xác thực thông tin đăng nhập với quyền Quản trị viên (Admin)...
=> Trạng thái kiểm thử: Đăng nhập quyền Admin thành công.
[6] Luồng E2E: Thực hiện thao tác phê duyệt hồ sơ mã định danh...
 LUỒNG KIỂM THỬ TÍCH HỢP TOÀN TRÌNH HOÀN THÀNH.
=> Quy trình nghiệp vụ vận hành thông suốt từ giao diện thí sinh đến giao diện quản trị.
```
## 6. Nhật ký và Kết quả kiểm thử hạng mục 16 (Ngày 03/06 - 04/06)
- **Hạng mục thực hiện:** UAT & Performance Test (Kiểm thử hiệu năng và nghiệm thu người dùng).
- **Trạng thái kịch bản tự động:** File biên dịch `performance_uat.test.js` hoạt động ổn định. Tự động sinh dữ liệu giả lập (dummy file buffer) và sử dụng `perf_hooks` để đo lường độ trễ mạng (latency) chính xác đến mili-giây.
- **Kết quả kiểm thử thực tế:** * **Luồng Upload tiêu chuẩn (Nghiệm thu UAT):** Hệ thống xử lý tải lên file minh chứng dung lượng 2MB cực kỳ mượt mà. Thời gian phản hồi thực tế chỉ đạt **42.32 ms**, vượt xa tiêu chuẩn đặt ra của hệ thống (dưới 2000 ms).
  * **Phát hiện giới hạn khi Kiểm thử Biên (Boundary Testing):** Khi giả lập gửi tệp tin nặng đúng 5MB (chạm ngưỡng giới hạn cho phép), hệ thống lập tức từ chối và trả về mã lỗi `413 Payload Too Large`. Nguyên nhân do cấu hình `max-request-size=5MB` ở tầng Backend chặn quá sát, không tính toán đến dung lượng dư thừa của Request Header và JWT Token. Đề xuất team nâng giới hạn cấu hình lên `6MB` hoặc `10MB`.


## 6. Nhật ký và Kết quả kiểm thử  (Ngày 03/06 - 04/06)
- **Hạng mục thực hiện:** UAT & Performance Test (Kiểm thử hiệu năng và nghiệm thu người dùng).
- **Trạng thái kịch bản tự động:** File biên dịch `performance_uat.test.js` hoạt động ổn định. Tự động sinh dữ liệu giả lập (dummy file buffer) và sử dụng `perf_hooks` để đo lường độ trễ mạng (latency) chính xác đến mili-giây.
- **Kết quả kiểm thử thực tế:** * **Luồng Upload tiêu chuẩn (Nghiệm thu UAT):** Hệ thống xử lý tải lên file minh chứng dung lượng 2MB cực kỳ mượt mà. Thời gian phản hồi thực tế chỉ đạt **42.32 ms**, vượt xa tiêu chuẩn đặt ra của hệ thống (dưới 2000 ms).
  * **Phát hiện giới hạn khi Kiểm thử Biên (Boundary Testing):** Khi giả lập gửi tệp tin nặng đúng 5MB (chạm ngưỡng giới hạn cho phép), hệ thống lập tức từ chối và trả về mã lỗi `413 Payload Too Large`. Nguyên nhân do cấu hình `max-request-size=5MB` ở tầng Backend chặn quá sát, không tính toán đến dung lượng dư thừa của Request Header và JWT Token. Đề xuất team nâng giới hạn cấu hình lên `6MB` hoặc `10MB`.

### Bằng chứng kiểm thử thực tế (Log Terminal):
```text
====== KÍCH HOẠT KIỂM THỬ HIỆU NĂNG & UAT ======
=> Mục tiêu: Đo lường thời gian phản hồi khi Upload file minh chứng (Yêu cầu < 2000ms)

[1] Đang xác thực tài khoản thí sinh...
=> Trạng thái: Đăng nhập thành công, đã cấp Token.

[2] Đang tạo file giả lập (Dummy File) dung lượng 4MB để mô phỏng Học bạ/CCCD...
[3] Bắt đầu đẩy file lên máy chủ (Upload to Server/S3)...
=> Kết quả trả về từ Server: Phản hồi mã [200 OK]

====== KẾT QUẢ NGHIỆM THU HIỆU NĂNG ======
Thời gian phản hồi thực tế: 42.32 ms
✅ KẾT LUẬN: ĐẠT (PASSED). Hệ thống xử lý mượt mà, phản hồi dưới 2 giây theo đúng chuẩn UAT.

-----------------------------------------------------------
[KIỂM THỬ GIÁ TRỊ BIÊN - BOUNDARY TEST]

====== KÍCH HOẠT KIỂM THỬ HIỆU NĂNG & UAT  ======
=> Mục tiêu: Đo lường thời gian phản hồi khi Upload file minh chứng (Yêu cầu < 2000ms)

[1] Đang xác thực tài khoản thí sinh...
=> Trạng thái: Đăng nhập thành công, đã cấp Token.

[2] Đang tạo file giả lập (Dummy File) dung lượng 5MB để mô phỏng Học bạ/CCCD...
[3] Bắt đầu đẩy file lên máy chủ (Upload to Server/S3)...

❌ Quá trình kiểm thử thất bại do lỗi API:
{
  success: false,
  message: 'Maximum upload size exceeded; nested exception is java.lang.IllegalStateException: org.apache.tomcat.util.http.fileupload.impl.SizeLimitExceededException: the request was rejected because its size (5243104) exceeds the configured maximum (5242880)',
  data: null
}

=> KẾT LUẬN: Đã chặn chính xác cấu hình max-request-size tại mốc 5MB. 
Đề xuất tăng giới hạn request.