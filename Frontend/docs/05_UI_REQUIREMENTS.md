# 05. UI Requirements

## 1. Design Goal

Giao diện cần hiện đại, sạch sẽ, dễ dùng và phù hợp với hệ thống giáo dục. Ưu tiên trải nghiệm rõ ràng, thao tác đơn giản và dễ demo với giảng viên.

Dự án sử dụng Ant Design làm UI library chính. Vì vậy, cần tận dụng tối đa các component có sẵn để giao diện đồng bộ, đẹp và tiết kiệm thời gian phát triển.

## 2. Technology UI Decision

Công nghệ giao diện đã chốt:

- ReactJS
- TypeScript
- Vite
- Ant Design
- Zustand
- Mock Data

Không sử dụng thêm UI library khác nếu không thật sự cần thiết.

Không dùng Tailwind CSS trong phiên bản MVP để tránh phức tạp và tránh xung đột style với Ant Design.

## 3. Ant Design Components to Use

Nên ưu tiên các component sau:

- Layout
- Menu
- Button
- Form
- Input
- InputNumber
- Select
- Table
- Card
- Statistic
- Tag
- Modal
- Drawer
- Upload
- Steps
- Breadcrumb
- Result
- Empty
- Spin
- Alert
- Descriptions
- Avatar
- Dropdown
- Popconfirm
- message
- notification

## 4. Visual Style

### 4.1 Main Style

- Phong cách: modern, clean, academic, professional.
- Chủ đề: hệ thống tuyển sinh đại học.
- Cảm giác giao diện: tin cậy, rõ ràng, dễ thao tác.
- Không dùng quá nhiều animation.
- Không dùng màu quá lòe loẹt.
- Ưu tiên khoảng trắng hợp lý.
- Giao diện phải dễ nhìn khi trình chiếu trên lớp.

### 4.2 Color Direction

Màu chủ đạo đề xuất:

- Primary: xanh dương.
- Dark navy: xanh navy cho sidebar admin.
- Background: xám nhạt.
- Card background: trắng.
- Success: xanh lá.
- Warning: vàng/cam.
- Error: đỏ.
- Text: đen/xám đậm.

Gợi ý:

```txt
Primary: #1677ff
Dark navy: #001529
Background: #f5f7fa
Card background: #ffffff
Success: #52c41a
Warning: #faad14
Error: #ff4d4f
5. Language

Giao diện chính dùng tiếng Việt.

Ví dụ:

Đăng nhập
Đăng ký
Trang chủ
Bảng điều khiển
Thông tin cá nhân
Danh sách trường
Nộp hồ sơ
Hồ sơ của tôi
Kết quả xét tuyển
Quản lý trường
Quản lý ngành
Quản lý thí sinh
Quản lý hồ sơ
Chờ duyệt
Đã duyệt
Từ chối

Tên biến, tên file, tên function trong code dùng tiếng Anh để code chuyên nghiệp.

6. Layout Requirements
6.1 Public Layout

Áp dụng cho:

/
/login
/register

Yêu cầu:

Header đơn giản.
Logo hoặc tên hệ thống bên trái.
Nút Đăng nhập / Đăng ký bên phải.
Nội dung căn giữa, dễ nhìn.
Footer đơn giản.

Landing page nên có:

Hero section.
Mô tả ngắn về hệ thống.
Button "Bắt đầu đăng ký".
Button "Đăng nhập".
Quy trình xét tuyển dạng Steps.
Một số lợi ích nổi bật.
6.2 Candidate Layout

Áp dụng cho các route /candidate/*.

Yêu cầu:

Có sidebar bên trái.
Sidebar có thể thu gọn.
Header có tên hệ thống, tên thí sinh, avatar và nút logout.
Có breadcrumb ở mỗi trang.
Nội dung chính nằm trong Card hoặc vùng nền trắng.
Giao diện thân thiện, đơn giản hơn admin.

Menu candidate gồm:

Bảng điều khiển
Thông tin cá nhân
Danh sách trường
Nộp hồ sơ
Hồ sơ của tôi
Kết quả xét tuyển
6.3 Admin Layout

Áp dụng cho các route /admin/*.

Yêu cầu:

Sidebar cố định bên trái.
Sidebar dùng màu navy hoặc dark.
Header bên trên.
Tên hệ thống hoặc logo ở sidebar.
Header có avatar admin, tên admin và nút logout.
Nội dung chính có page title và breadcrumb.
Các trang quản lý sử dụng Table là chính.

Menu admin gồm:

Bảng điều khiển
Quản lý trường
Quản lý ngành
Quản lý thí sinh
Quản lý hồ sơ
7. Page UI Requirements
7.1 Landing Page

Thành phần:

Hero title: "Hệ thống xét tuyển đại học trực tuyến"
Subtitle mô tả ngắn.
Button "Bắt đầu đăng ký".
Button "Đăng nhập".
Section quy trình:
Tạo tài khoản
Cập nhật thông tin
Chọn trường/ngành
Nộp hồ sơ
Theo dõi kết quả
Section lợi ích:
Tiện lợi
Minh bạch
Dễ theo dõi
Quản lý tập trung
7.2 Login Page

Thành phần:

Card đăng nhập ở giữa màn hình.
Email input.
Password input.
Button đăng nhập.
Link sang đăng ký.
Gợi ý tài khoản demo.

Tài khoản demo hiển thị nhỏ bên dưới form:

Admin: admin@example.com / 123456
Thí sinh: candidate@example.com / 123456

Sau login thành công:

Hiển thị message.
Redirect theo role.
7.3 Register Page

Thành phần:

Card đăng ký.
Họ và tên.
Email.
Số điện thoại.
Mật khẩu.
Xác nhận mật khẩu.
Button đăng ký.
Link sang đăng nhập.
7.4 Candidate Dashboard

Thành phần:

Lời chào thí sinh.
4 statistic cards:
Tổng hồ sơ
Chờ duyệt
Đã duyệt
Từ chối
Table hồ sơ gần đây.
Card hướng dẫn bước tiếp theo.
7.5 Candidate Profile

Thành phần:

Form thông tin cá nhân.
Chia thành các nhóm:
Thông tin cơ bản
Thông tin liên hệ
Thông tin học tập
Button Lưu thay đổi.
Validate đầy đủ.
7.6 University List

Thành phần:

Search input.
Filter theo thành phố.
Danh sách trường dạng Card hoặc Table.
Mỗi trường hiển thị:
Logo
Tên trường
Mã trường
Thành phố
Website
Button xem chi tiết
Button nộp hồ sơ
7.7 University Detail

Thành phần:

Card thông tin trường.
Danh sách ngành thuộc trường.
Table ngành gồm:
Mã ngành
Tên ngành
Chỉ tiêu
Tổ hợp
Điểm sàn
Học phí
Button nộp hồ sơ.
7.8 Application Form

Đây là trang quan trọng nhất của candidate.

Nên dùng Card hoặc Steps.

Gợi ý chia section:

Section 1: Thông tin thí sinh
Hiển thị thông tin cơ bản của thí sinh.
Có cảnh báo nếu hồ sơ cá nhân chưa đầy đủ.
Section 2: Chọn nguyện vọng
Chọn trường.
Chọn ngành.
Chọn tổ hợp xét tuyển.
Section 3: Nhập điểm
Hiển thị input điểm theo tổ hợp đã chọn.
Tự động tính tổng điểm.
Hiển thị tổng điểm bằng Statistic hoặc Alert.
Section 4: Minh chứng
Upload file giả lập.
Ghi chú hồ sơ nếu có.
Section 5: Xác nhận
Checkbox xác nhận thông tin chính xác.
Button Nộp hồ sơ.
7.9 My Applications

Thành phần:

Table danh sách hồ sơ.
Search theo mã hồ sơ/trường/ngành.
Filter trạng thái.

Cột:

Mã hồ sơ
Trường
Ngành
Tổ hợp
Tổng điểm
Trạng thái
Ngày nộp
Hành động

Hành động:

Xem chi tiết.
7.10 Candidate Application Detail

Thành phần:

Descriptions hoặc Card.
Thông tin hồ sơ.
Điểm từng môn.
Tổng điểm.
File minh chứng.
Trạng thái.
Ghi chú admin nếu có.
Timeline xử lý nếu có.
7.11 Candidate Results

Thành phần:

Danh sách hồ sơ đã có kết quả.
Card kết quả theo từng hồ sơ.
Nếu approved, hiển thị thông báo chúc mừng.
Nếu rejected, hiển thị lý do từ chối.
Nếu pending, hiển thị đang chờ xử lý.
7.12 Admin Dashboard

Thành phần:

Statistic cards:
Tổng thí sinh
Tổng trường
Tổng ngành
Tổng hồ sơ
Chờ duyệt
Đã duyệt
Từ chối
Table hồ sơ mới nhất.
Có thể thêm chart đơn giản nếu cần, nhưng không bắt buộc.
7.13 Admin University Management

Thành phần:

Page title.
Search input.
Filter status.
Filter city.
Button thêm trường.
Table danh sách trường.
Modal thêm/sửa trường.

Cột table:

Mã trường
Tên trường
Tên viết tắt
Thành phố
Website
Trạng thái
Hành động

Hành động:

Sửa
Chuyển trạng thái active/inactive
7.14 Admin Major Management

Thành phần:

Search input.
Filter trường.
Filter status.
Button thêm ngành.
Table danh sách ngành.
Modal thêm/sửa ngành.

Cột table:

Mã ngành
Tên ngành
Trường
Chỉ tiêu
Tổ hợp
Điểm sàn
Học phí
Trạng thái
Hành động
7.15 Admin Candidate Management

Thành phần:

Search input.
Filter thành phố.
Table danh sách thí sinh.
Drawer hoặc Modal xem chi tiết.

Cột table:

Họ tên
Email
Số điện thoại
CCCD
Thành phố
Trường THPT
Năm tốt nghiệp
Số hồ sơ
Hành động
7.16 Admin Application Management

Thành phần:

Search input.
Filter trạng thái.
Filter trường.
Filter ngành.
Filter tổ hợp.
Table danh sách hồ sơ.

Cột table:

Mã hồ sơ
Thí sinh
Trường
Ngành
Tổ hợp
Tổng điểm
Trạng thái
Ngày nộp
Hành động

Hành động:

Xem chi tiết.
Duyệt nếu pending.
Từ chối nếu pending.
7.17 Admin Application Detail

Thành phần:

Thông tin thí sinh.
Thông tin nguyện vọng.
Điểm xét tuyển.
File minh chứng.
Trạng thái hồ sơ.
Ghi chú thí sinh.
Ghi chú admin.
Button Duyệt.
Button Từ chối.
Modal nhập lý do từ chối.
8. Component Requirements

Nên tạo các component tái sử dụng:

AppLogo
PageHeader
ProtectedRoute
RoleBasedRoute
StatusTag
ApplicationStatusTag
EntityStatusTag
StatisticCard
SearchFilterBar
EmptyState
LoadingScreen
ConfirmActionModal
9. Status Tag UI

Trạng thái hồ sơ hiển thị bằng Tag:

pending  -> Chờ duyệt -> warning/yellow
approved -> Đã duyệt -> success/green
rejected -> Từ chối -> error/red

Trạng thái entity:

active   -> Đang hoạt động -> green
inactive -> Ngừng hoạt động -> gray
10. Form UX Requirements
Dùng Ant Design Form.
Label rõ ràng bằng tiếng Việt.
Các field bắt buộc có required.
Validate khi submit.
Hiển thị lỗi gần field.
Button submit có loading state.
Sau submit thành công, hiển thị message.
Không reset form nếu submit thất bại.
Form dài nên chia section bằng Card.
Form nộp hồ sơ nên dùng Steps hoặc nhiều Card.
11. Table UX Requirements

Các table quản lý cần có:

Search.
Filter.
Pagination.
Status tag.
Action buttons.
Empty state khi không có dữ liệu.
Loading state nếu cần mô phỏng.
Column alignment rõ ràng.
Horizontal scroll nếu nhiều cột.
12. Responsive Requirements

Ưu tiên:

Desktop.
Laptop.
Tablet ở mức cơ bản.
Mobile không cần hoàn hảo nhưng không được vỡ layout nghiêm trọng.

Yêu cầu:

Sidebar có thể collapsed.
Table có horizontal scroll nếu nhiều cột.
Form không bị tràn màn hình.
Card tự xuống hàng khi màn hình nhỏ.
13. Empty and Error States

Cần có giao diện cho:

Không có dữ liệu.
Không tìm thấy kết quả.
Không có quyền truy cập.
Trang không tồn tại.
Form nhập sai.
Login thất bại.
14. Loading States

Dù dùng Mock Data, vẫn nên có loading state nhẹ để giao diện chuyên nghiệp:

Loading khi login.
Loading khi register.
Loading khi submit form.
Loading khi duyệt/từ chối hồ sơ.
Loading khi lưu thông tin.
Loading khi thêm/sửa dữ liệu.
15. Code Style Requirements
Code bằng TypeScript.
Component đặt tên PascalCase.
Hook đặt tên bắt đầu bằng use.
File store đặt tên rõ ràng.
Interface/type đặt trong thư mục types.
Mock data đặt trong thư mục mocks.
Không viết code quá phức tạp.
Không over-engineer.
Ưu tiên dễ hiểu, dễ demo, dễ chỉnh sửa.
Tránh thêm thư viện không cần thiết.
Không dùng Tailwind CSS trong MVP.
16. Suggested Folder Structure
src/
├── app/
│   ├── App.tsx
│   └── router.tsx
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   └── status/
├── constants/
├── features/
│   ├── auth/
│   ├── candidate/
│   ├── admin/
│   ├── universities/
│   ├── majors/
│   └── applications/
├── layouts/
│   ├── PublicLayout.tsx
│   ├── CandidateLayout.tsx
│   └── AdminLayout.tsx
├── mocks/
│   ├── users.mock.ts
│   ├── candidates.mock.ts
│   ├── universities.mock.ts
│   ├── majors.mock.ts
│   ├── applications.mock.ts
│   └── subjectGroups.mock.ts
├── pages/
│   ├── public/
│   ├── candidate/
│   ├── admin/
│   └── errors/
├── stores/
│   ├── auth.store.ts
│   ├── university.store.ts
│   ├── major.store.ts
│   ├── candidate.store.ts
│   └── application.store.ts
├── types/
│   ├── auth.types.ts
│   ├── candidate.types.ts
│   ├── university.types.ts
│   ├── major.types.ts
│   ├── application.types.ts
│   └── common.types.ts
├── utils/
│   ├── date.ts
│   ├── format.ts
│   ├── validation.ts
│   └── calculate.ts
├── main.tsx
└── index.css
17. Demo Priority

Khi code, ưu tiên hoàn thành theo thứ tự:

Project setup bằng Vite + React + TypeScript.
Cài Ant Design.
Cài React Router DOM.
Cài Zustand.
Tạo routing.
Tạo layout.
Tạo mock data.
Tạo Zustand stores.
Tạo mock login/logout.
Tạo protected routes.
Tạo candidate dashboard.
Tạo application form.
Tạo my applications.
Tạo admin dashboard.
Tạo admin application management.
Tạo admin review application.
Tạo university management.
Tạo major management.
Tạo candidate management.
Polish UI.