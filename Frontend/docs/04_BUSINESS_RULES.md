# 04. Business Rules and Validation

## 1. Overview

Tài liệu này mô tả các quy tắc nghiệp vụ, logic xử lý và validate dữ liệu cho hệ thống xét tuyển đại học trực tuyến.

Các quy tắc này được áp dụng trong Frontend MVP với Mock Data. Hệ thống chưa kết nối Backend thật nên toàn bộ logic sẽ được xử lý trong Frontend bằng ReactJS, TypeScript và Zustand.

## 2. Authentication Rules

### 2.1 Login

- Người dùng đăng nhập bằng email và password.
- Hệ thống kiểm tra email và password trong mockUsers.
- Nếu thông tin đúng, lưu currentUser vào Zustand store.
- currentUser được lưu vào LocalStorage để duy trì đăng nhập sau khi reload.
- Nếu thông tin sai, hiển thị thông báo lỗi.
- Nếu tài khoản có status là inactive, không cho đăng nhập.
- Sau khi đăng nhập thành công:
  - role candidate chuyển đến /candidate/dashboard.
  - role admin chuyển đến /admin/dashboard.

### 2.2 Register

- Chỉ cho phép đăng ký tài khoản candidate.
- Admin không được đăng ký từ giao diện public.
- Email đăng ký không được trùng với email đã có.
- Password và confirm password phải trùng nhau.
- Sau khi đăng ký thành công:
  - Tạo User mới với role candidate.
  - Có thể tạo Candidate profile tương ứng.
  - Hiển thị thông báo đăng ký thành công.
  - Chuyển người dùng đến /login.

### 2.3 Logout

- Khi logout, xóa currentUser khỏi Zustand store.
- Xóa currentUser khỏi LocalStorage.
- Chuyển người dùng về /login.

## 3. Authorization Rules

- Người chưa đăng nhập không được truy cập candidate routes hoặc admin routes.
- Candidate không được truy cập admin routes.
- Admin không được truy cập candidate routes.
- Nếu chưa đăng nhập, redirect về /login.
- Nếu đã đăng nhập nhưng sai quyền, redirect về /403.
- Route không tồn tại redirect về /404.

## 4. Candidate Profile Validation

Khi thí sinh cập nhật thông tin cá nhân:

### 4.1 Required Fields

Các trường bắt buộc:

- fullName
- dateOfBirth
- gender
- citizenId
- phone
- email
- address
- city
- highSchool
- graduationYear

### 4.2 Validation Rules

- fullName không được để trống.
- fullName tối thiểu 2 ký tự.
- email phải đúng định dạng email.
- phone phải có đúng 10 chữ số.
- citizenId phải có đúng 12 chữ số.
- dateOfBirth không được lớn hơn ngày hiện tại.
- graduationYear không được lớn hơn năm hiện tại.
- graduationYear không được nhỏ hơn 2000.
- address tối thiểu 5 ký tự.
- highSchool không được để trống.

## 5. University Management Rules

Áp dụng cho admin.

### 5.1 Create University

Khi thêm trường mới:

- code không được để trống.
- code không được trùng với trường đã có.
- name không được để trống.
- shortName không được để trống.
- city không được để trống.
- website nên đúng định dạng URL nếu có nhập.
- email nên đúng định dạng email nếu có nhập.
- phone nên đúng định dạng số điện thoại nếu có nhập.
- status mặc định là active.

### 5.2 Update University

Khi sửa trường:

- Không được để trống code, name, shortName, city.
- Nếu sửa code, code mới không được trùng với trường khác.
- Không xóa cứng dữ liệu trong MVP.
- Nếu không muốn hiển thị trường cho thí sinh, chuyển status sang inactive.

### 5.3 Display Rule

- Candidate chỉ thấy các trường có status là active.
- Admin thấy cả active và inactive.

## 6. Major Management Rules

Áp dụng cho admin.

### 6.1 Create Major

Khi thêm ngành mới:

- universityId không được để trống.
- code không được để trống.
- name không được để trống.
- admissionQuota phải lớn hơn 0.
- subjectGroupCodes phải có ít nhất 1 tổ hợp.
- minScore phải từ 0 đến 30.
- tuitionFeePerYear không được âm.
- status mặc định là active.

### 6.2 Update Major

Khi sửa ngành:

- Không được để trống universityId, code, name.
- admissionQuota phải lớn hơn 0.
- minScore phải từ 0 đến 30.
- subjectGroupCodes phải có ít nhất 1 tổ hợp.
- Không xóa cứng ngành trong MVP.
- Nếu không muốn hiển thị ngành cho thí sinh, chuyển status sang inactive.

### 6.3 Display Rule

- Candidate chỉ thấy các ngành có status active.
- Candidate chỉ thấy ngành thuộc trường đang chọn.
- Admin thấy cả active và inactive.

## 7. Application Form Rules

Áp dụng khi candidate nộp hồ sơ xét tuyển.

### 7.1 Required Fields

Candidate phải nhập/chọn đầy đủ:

- universityId
- majorId
- subjectGroupCode
- scores theo đúng tổ hợp môn
- evidenceFiles
- checkbox xác nhận thông tin chính xác

### 7.2 Selection Logic

Quy trình chọn dữ liệu:

1. Candidate chọn trường.
2. Hệ thống chỉ hiển thị các ngành thuộc trường đã chọn.
3. Candidate chọn ngành.
4. Hệ thống chỉ hiển thị các tổ hợp xét tuyển của ngành đó.
5. Candidate chọn tổ hợp.
6. Hệ thống chỉ hiển thị các ô nhập điểm tương ứng với môn trong tổ hợp.
7. Hệ thống tự động tính tổng điểm.

Ví dụ:

- Chọn tổ hợp A00 thì hiển thị:
  - Toán
  - Vật lý
  - Hóa học

- Chọn tổ hợp D01 thì hiển thị:
  - Toán
  - Ngữ văn
  - Tiếng Anh

### 7.3 Score Validation

- Mỗi điểm môn phải từ 0 đến 10.
- Cho phép nhập số thập phân.
- Tối đa 2 chữ số sau dấu phẩy.
- Không cho nhập chữ.
- Không cho nhập điểm âm.
- Không cho nhập điểm lớn hơn 10.
- totalScore = tổng điểm các môn thuộc tổ hợp.
- totalScore tối đa là 30.

### 7.4 Evidence File Validation

Ở MVP, upload file chỉ là giả lập.

- Phải có ít nhất 1 file minh chứng.
- Chỉ chấp nhận file ảnh hoặc PDF.
- File type hợp lệ:
  - image/png
  - image/jpeg
  - application/pdf
- Dung lượng mỗi file tối đa 5MB.
- Tối đa 5 file cho một hồ sơ.

### 7.5 Duplicate Application Rule

Một candidate không được nộp trùng hồ sơ với cùng:

- universityId
- majorId
- subjectGroupCode

Nếu đã có hồ sơ trùng và status là pending hoặc approved, không cho nộp lại.

Nếu hồ sơ cũ rejected, có thể cho phép nộp lại bằng cách tạo hồ sơ mới.

### 7.6 Submit Rule

Sau khi nộp hồ sơ thành công:

- Tạo application mới.
- Sinh applicationCode.
- status mặc định là pending.
- submittedAt là thời gian hiện tại.
- createdAt là thời gian hiện tại.
- updatedAt là thời gian hiện tại.
- Chuyển candidate đến /candidate/applications hoặc trang chi tiết hồ sơ.
- Hiển thị thông báo nộp hồ sơ thành công.

## 8. Application Status Rules

Hồ sơ có 3 trạng thái:

### 8.1 pending

Ý nghĩa:

- Hồ sơ đã nộp.
- Đang chờ admin xử lý.

Hiển thị:

- Tag màu vàng.
- Label: Chờ duyệt.

### 8.2 approved

Ý nghĩa:

- Hồ sơ đã được admin duyệt.

Hiển thị:

- Tag màu xanh.
- Label: Đã duyệt.

### 8.3 rejected

Ý nghĩa:

- Hồ sơ bị admin từ chối.

Hiển thị:

- Tag màu đỏ.
- Label: Từ chối.

## 9. Admin Application Review Rules

Áp dụng cho admin khi xử lý hồ sơ.

### 9.1 Review Pending Application

Admin có thể xử lý hồ sơ pending bằng 2 hành động:

- Approve
- Reject

### 9.2 Approve Rule

Khi admin duyệt hồ sơ:

- Chỉ hồ sơ pending mới được duyệt.
- Cập nhật status thành approved.
- Cập nhật reviewedAt.
- Cập nhật reviewedBy.
- Có thể thêm adminNote.
- Tạo review log.
- Hiển thị thông báo duyệt thành công.

### 9.3 Reject Rule

Khi admin từ chối hồ sơ:

- Chỉ hồ sơ pending mới được từ chối.
- Cập nhật status thành rejected.
- Cập nhật reviewedAt.
- Cập nhật reviewedBy.
- Bắt buộc nhập adminNote hoặc reject reason.
- Tạo review log.
- Hiển thị thông báo từ chối thành công.

### 9.4 Locked Status Rule

Trong MVP:

- Hồ sơ đã approved không nên đổi lại pending.
- Hồ sơ đã rejected không nên đổi lại pending.
- Nếu muốn xử lý lại, candidate nên tạo hồ sơ mới.

## 10. Search and Filter Rules

### 10.1 Admin Universities

Có thể tìm kiếm theo:

- code
- name
- shortName
- city

Có thể lọc theo:

- status
- city

### 10.2 Admin Majors

Có thể tìm kiếm theo:

- code
- name

Có thể lọc theo:

- universityId
- status

### 10.3 Admin Candidates

Có thể tìm kiếm theo:

- fullName
- email
- phone
- citizenId

Có thể lọc theo:

- city
- graduationYear

### 10.4 Admin Applications

Có thể tìm kiếm theo:

- applicationCode
- candidateName
- universityName
- majorName

Có thể lọc theo:

- status
- universityId
- majorId
- subjectGroupCode

## 11. Dashboard Statistics Rules

### 11.1 Candidate Dashboard

Candidate dashboard hiển thị thống kê theo candidate hiện tại:

- totalApplications
- pendingApplications
- approvedApplications
- rejectedApplications
- recentApplications

### 11.2 Admin Dashboard

Admin dashboard hiển thị thống kê toàn hệ thống:

- totalCandidates
- totalUniversities
- totalMajors
- totalApplications
- pendingApplications
- approvedApplications
- rejectedApplications
- latestApplications

## 12. Notification Rules

Dùng Ant Design message hoặc notification.

Hiển thị thông báo khi:

- Đăng nhập thành công.
- Đăng nhập thất bại.
- Đăng ký thành công.
- Đăng ký thất bại.
- Cập nhật thông tin thành công.
- Thêm/sửa trường thành công.
- Thêm/sửa ngành thành công.
- Nộp hồ sơ thành công.
- Duyệt hồ sơ thành công.
- Từ chối hồ sơ thành công.
- Dữ liệu nhập không hợp lệ.

## 13. LocalStorage Rules

Để mô phỏng đăng nhập:

- Lưu currentUser vào LocalStorage.
- Khi reload trang, đọc lại currentUser từ LocalStorage.
- Không lưu password vào LocalStorage.
- Logout thì xóa currentUser khỏi LocalStorage.

## 14. MVP Simplification Rules

Để phù hợp với bài tập lớn:

- Không cần Backend API thật.
- Không cần Database thật.
- Không cần upload file thật.
- Không cần xử lý bảo mật nâng cao.
- Không cần JWT thật.
- Không cần refresh token.
- Không cần phân quyền phức tạp.
- Không cần xác thực email.
- Không cần reset password.
- Không cần thanh toán.