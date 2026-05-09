# 01. Project Overview

## 1. Project Name

Online University Admission Management System

## 2. Vietnamese Name

Hệ thống quản lý xét tuyển đại học trực tuyến

## 3. Project Context

Dự án được xây dựng cho bài tập lớn cuối kỳ môn Thực hành Lập trình Web. Nhóm gồm 3 thành viên, thời gian thực hiện khoảng 1 tháng. Mục tiêu của dự án là xây dựng một hệ thống web mô phỏng quy trình xét tuyển đại học trực tuyến, giúp thí sinh có thể đăng ký tài khoản, cập nhật thông tin cá nhân, tra cứu trường/ngành, nộp hồ sơ xét tuyển và theo dõi trạng thái xử lý hồ sơ.

Trong thực tế, quy trình xét tuyển đại học thường liên quan đến nhiều loại thông tin như thông tin thí sinh, trường đại học, ngành học, tổ hợp xét tuyển, điểm xét tuyển và trạng thái hồ sơ. Nếu quản lý thủ công, quá trình này dễ phát sinh sai sót, khó tra cứu và khó theo dõi tiến độ xử lý.

Vì vậy, hệ thống này được xây dựng nhằm mô phỏng một nền tảng quản lý xét tuyển tập trung, trong đó thí sinh thao tác trên giao diện người dùng và quản trị viên quản lý dữ liệu thông qua giao diện admin.

Ở giai đoạn bài tập lớn, dự án tập trung vào phần Frontend. Backend thật chưa được triển khai. Dữ liệu được mô phỏng bằng Mock Data nằm trong Frontend để nhóm có thể xây dựng giao diện, luồng xử lý, phân quyền và các nghiệp vụ chính một cách hoàn chỉnh.

## 4. Project Objectives

Dự án hướng đến các mục tiêu chính sau:

- Xây dựng giao diện Frontend hoàn chỉnh cho hệ thống xét tuyển đại học trực tuyến.
- Mô phỏng được quy trình thí sinh đăng ký, đăng nhập, cập nhật hồ sơ và nộp hồ sơ xét tuyển.
- Mô phỏng được quy trình admin quản lý trường đại học, ngành học, thí sinh và hồ sơ xét tuyển.
- Áp dụng phân quyền cơ bản giữa thí sinh và quản trị viên.
- Sử dụng Mock Data để mô phỏng dữ liệu và hành vi hệ thống trước khi có Backend thật.
- Thiết kế giao diện hiện đại, rõ ràng, dễ sử dụng, phù hợp với môi trường giáo dục.
- Xây dựng cấu trúc code sạch, dễ bảo trì, dễ mở rộng và phù hợp với dự án nhóm sinh viên.

## 5. Main User Roles

Hệ thống có 2 nhóm người dùng chính:

### 5.1 Candidate

Candidate là thí sinh sử dụng hệ thống để thực hiện các thao tác xét tuyển.

Candidate có thể:

- Đăng ký tài khoản.
- Đăng nhập vào hệ thống.
- Xem dashboard cá nhân.
- Cập nhật thông tin cá nhân.
- Xem danh sách trường đại học.
- Xem chi tiết trường đại học.
- Xem danh sách ngành học thuộc từng trường.
- Chọn trường, ngành và tổ hợp xét tuyển.
- Nhập điểm xét tuyển.
- Upload file minh chứng giả lập.
- Nộp hồ sơ xét tuyển.
- Xem danh sách hồ sơ đã nộp.
- Xem chi tiết hồ sơ xét tuyển.
- Theo dõi trạng thái hồ sơ.
- Xem kết quả xét tuyển.

### 5.2 Admin

Admin là quản trị viên sử dụng hệ thống để quản lý dữ liệu xét tuyển.

Admin có thể:

- Đăng nhập vào trang quản trị.
- Xem dashboard tổng quan hệ thống.
- Quản lý danh sách trường đại học.
- Quản lý danh sách ngành học.
- Quản lý danh sách thí sinh.
- Quản lý hồ sơ xét tuyển.
- Tìm kiếm, lọc và xem chi tiết dữ liệu.
- Duyệt hồ sơ xét tuyển.
- Từ chối hồ sơ xét tuyển và nhập lý do từ chối.

## 6. Technology Stack

### 6.1 Frontend Core

- ReactJS
- TypeScript

### 6.2 Framework/Base

- Vite

### 6.3 UI Library

- Ant Design

### 6.4 State Management

- Zustand

### 6.5 Routing

- React Router DOM

### 6.6 Data Layer in MVP

- Mock Data inside Frontend

### 6.7 Authentication Simulation

- Zustand store
- LocalStorage

## 7. Backend Status

Ở giai đoạn hiện tại, dự án chưa sử dụng Backend thật.

Backend được mô phỏng bằng Mock Data trong Frontend. Các dữ liệu như user, candidate, university, major và application sẽ được khai báo trong các file mock.

Các thao tác như đăng nhập, đăng ký, thêm trường, sửa trường, thêm ngành, sửa ngành, nộp hồ sơ, duyệt hồ sơ và từ chối hồ sơ sẽ được xử lý giả lập thông qua Zustand store.

Dữ liệu không cần lưu vĩnh viễn vào database thật. Tuy nhiên, currentUser cần được lưu vào LocalStorage để mô phỏng trạng thái đăng nhập khi reload trang.

## 8. MVP Scope

Phạm vi MVP tập trung vào các chức năng cốt lõi sau:

### 8.1 Public Features

- Landing page giới thiệu hệ thống.
- Trang đăng nhập.
- Trang đăng ký thí sinh.

### 8.2 Candidate Features

- Dashboard cá nhân.
- Cập nhật thông tin cá nhân.
- Xem danh sách trường đại học.
- Xem chi tiết trường đại học.
- Xem danh sách ngành theo trường.
- Chọn trường, ngành, tổ hợp xét tuyển.
- Nhập điểm xét tuyển.
- Upload file minh chứng giả lập.
- Nộp hồ sơ xét tuyển.
- Xem danh sách hồ sơ đã nộp.
- Xem chi tiết hồ sơ đã nộp.
- Xem kết quả/trạng thái xét tuyển.

### 8.3 Admin Features

- Dashboard thống kê hệ thống.
- Quản lý trường đại học.
- Quản lý ngành học.
- Quản lý thí sinh.
- Quản lý hồ sơ xét tuyển.
- Xem chi tiết hồ sơ.
- Duyệt hồ sơ.
- Từ chối hồ sơ.
- Lọc hồ sơ theo trạng thái.
- Tìm kiếm dữ liệu trong bảng.

## 9. Out of Scope

Các chức năng sau chưa nằm trong phạm vi MVP:

- Backend API thật.
- Database thật.
- Đăng nhập bằng JWT thật.
- Phân quyền nâng cao nhiều cấp.
- Upload file lên server thật.
- Thanh toán lệ phí xét tuyển.
- Gửi email/SMS thông báo thật.
- Xác thực email.
- Quên mật khẩu/đặt lại mật khẩu.
- Tích hợp cổng tuyển sinh quốc gia.
- Tích hợp chữ ký số.
- Tích hợp AI tư vấn ngành học.
- Xuất PDF/Excel chính thức.
- Quản lý lịch phỏng vấn hoặc thi năng lực.

## 10. Expected Output

Sau khi hoàn thành Frontend MVP, hệ thống cần đạt được:

- Chạy được bằng lệnh npm install và npm run dev.
- Có đầy đủ routing cho public, candidate, admin, 403 và 404.
- Có layout riêng cho public, candidate và admin.
- Có mock login phân quyền theo role.
- Có mock register cho candidate.
- Có dữ liệu mẫu cho user, candidate, university, major, subject group và application.
- Có các bảng quản lý bằng Ant Design Table.
- Có các form nhập liệu bằng Ant Design Form.
- Có validate dữ liệu cơ bản.
- Có trạng thái hồ sơ rõ ràng: pending, approved, rejected.
- Có UI sạch, hiện đại, dễ demo trước giảng viên.
- Code có cấu trúc thư mục rõ ràng, dễ mở rộng.

## 11. Success Criteria

Dự án được xem là đạt yêu cầu nếu:

- Người dùng có thể đăng ký và đăng nhập giả lập.
- Candidate có thể cập nhật thông tin cá nhân.
- Candidate có thể nộp hồ sơ xét tuyển bằng form.
- Candidate có thể xem lại hồ sơ đã nộp.
- Candidate có thể theo dõi trạng thái hồ sơ.
- Admin có thể xem danh sách hồ sơ.
- Admin có thể duyệt hoặc từ chối hồ sơ.
- Admin có thể quản lý trường và ngành ở mức mô phỏng.
- Dữ liệu mock hiển thị nhất quán trên giao diện.
- Các route chính điều hướng chính xác.
- Không bị lỗi layout nghiêm trọng khi demo.
- Code dễ đọc, dễ sửa, phù hợp với nhóm sinh viên.