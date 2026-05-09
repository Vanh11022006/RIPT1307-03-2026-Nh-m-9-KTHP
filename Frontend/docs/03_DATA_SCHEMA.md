# 03. Data Schema

## 1. Overview

Tài liệu này mô tả cấu trúc dữ liệu dùng cho Mock Data trong Frontend.

Dự án hiện tại chưa dùng Backend API thật và chưa dùng Database thật. Vì vậy, dữ liệu sẽ được khai báo trong các file mock và quản lý bằng Zustand store.

Các interface được viết bằng TypeScript để đảm bảo code rõ ràng, dễ bảo trì và hạn chế lỗi kiểu dữ liệu.

## 2. Main Data Objects

Hệ thống gồm các nhóm dữ liệu chính:

- User
- Candidate
- University
- Major
- SubjectGroup
- Application
- EvidenceFile
- ApplicationReviewLog

## 3. Common Types

```ts
export type UserRole = "candidate" | "admin";

export type UserStatus = "active" | "inactive";

export type Gender = "male" | "female" | "other";

export type EntityStatus = "active" | "inactive";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type EvidenceFileType = "image" | "pdf";
```

## 4. User

User đại diện cho tài khoản đăng nhập vào hệ thống.

```ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
```

Field description:

| Field | Type | Description |
|---|---|---|
| id | string | ID tài khoản |
| fullName | string | Họ tên người dùng |
| email | string | Email đăng nhập |
| password | string | Mật khẩu mock |
| phone | string | Số điện thoại |
| role | UserRole | candidate hoặc admin |
| avatar | string | Ảnh đại diện |
| status | UserStatus | active hoặc inactive |
| createdAt | string | Ngày tạo |
| updatedAt | string | Ngày cập nhật |

Lưu ý:

- Password chỉ dùng để mock login.
- Không lưu password vào LocalStorage.
- LocalStorage chỉ lưu currentUser sau khi đăng nhập.

## 5. Candidate

Candidate đại diện cho thông tin thí sinh.

```ts
export interface Candidate {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  citizenId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  highSchool: string;
  graduationYear: number;
  createdAt: string;
  updatedAt: string;
}
```

Field description:

| Field | Type | Description |
|---|---|---|
| id | string | ID thí sinh |
| userId | string | ID liên kết với User |
| fullName | string | Họ tên thí sinh |
| dateOfBirth | string | Ngày sinh |
| gender | Gender | Giới tính |
| citizenId | string | Số CCCD |
| phone | string | Số điện thoại |
| email | string | Email |
| address | string | Địa chỉ chi tiết |
| city | string | Tỉnh/thành phố |
| highSchool | string | Trường THPT |
| graduationYear | number | Năm tốt nghiệp |
| createdAt | string | Ngày tạo |
| updatedAt | string | Ngày cập nhật |

## 6. University

University đại diện cho trường đại học.

```ts
export interface University {
  id: string;
  code: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  logo?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
```

Field description:

| Field | Type | Description |
|---|---|---|
| id | string | ID trường |
| code | string | Mã trường |
| name | string | Tên đầy đủ của trường |
| shortName | string | Tên viết tắt |
| address | string | Địa chỉ |
| city | string | Tỉnh/thành phố |
| website | string | Website |
| email | string | Email liên hệ |
| phone | string | Số điện thoại |
| description | string | Mô tả trường |
| logo | string | Logo trường |
| status | EntityStatus | active hoặc inactive |
| createdAt | string | Ngày tạo |
| updatedAt | string | Ngày cập nhật |

## 7. Major

Major đại diện cho ngành học thuộc một trường đại học.

```ts
export interface Major {
  id: string;
  universityId: string;
  code: string;
  name: string;
  admissionQuota: number;
  subjectGroupCodes: string[];
  minScore: number;
  tuitionFeePerYear: number;
  description: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
```

Field description:

| Field | Type | Description |
|---|---|---|
| id | string | ID ngành |
| universityId | string | ID trường chứa ngành |
| code | string | Mã ngành |
| name | string | Tên ngành |
| admissionQuota | number | Chỉ tiêu tuyển sinh |
| subjectGroupCodes | string[] | Danh sách mã tổ hợp xét tuyển |
| minScore | number | Điểm sàn tham khảo |
| tuitionFeePerYear | number | Học phí/năm |
| description | string | Mô tả ngành |
| status | EntityStatus | active hoặc inactive |
| createdAt | string | Ngày tạo |
| updatedAt | string | Ngày cập nhật |

## 8. Subject Group

SubjectGroup đại diện cho tổ hợp môn xét tuyển.

```ts
export type Subject =
  | "math"
  | "literature"
  | "english"
  | "physics"
  | "chemistry"
  | "biology"
  | "history"
  | "geography"
  | "civicEducation";

export interface SubjectGroup {
  code: string;
  name: string;
  subjects: Subject[];
}
```

Example:

```ts
export const subjectGroups: SubjectGroup[] = [
  {
    code: "A00",
    name: "Toán, Vật lý, Hóa học",
    subjects: ["math", "physics", "chemistry"]
  },
  {
    code: "A01",
    name: "Toán, Vật lý, Tiếng Anh",
    subjects: ["math", "physics", "english"]
  },
  {
    code: "B00",
    name: "Toán, Hóa học, Sinh học",
    subjects: ["math", "chemistry", "biology"]
  },
  {
    code: "C00",
    name: "Ngữ văn, Lịch sử, Địa lý",
    subjects: ["literature", "history", "geography"]
  },
  {
    code: "D01",
    name: "Toán, Ngữ văn, Tiếng Anh",
    subjects: ["math", "literature", "english"]
  }
];
```

## 9. Evidence File

EvidenceFile đại diện cho file minh chứng trong hồ sơ xét tuyển.

```ts
export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  type: EvidenceFileType;
  size: number;
  uploadedAt: string;
}
```

Field description:

| Field | Type | Description |
|---|---|---|
| id | string | ID file |
| name | string | Tên file |
| url | string | Link mock |
| type | EvidenceFileType | image hoặc pdf |
| size | number | Dung lượng file tính bằng bytes |
| uploadedAt | string | Thời gian upload |

## 10. Application Scores

ApplicationScores lưu điểm từng môn của hồ sơ xét tuyển.

```ts
export interface ApplicationScores {
  math?: number;
  literature?: number;
  english?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
  history?: number;
  geography?: number;
  civicEducation?: number;
}
```

## 11. Application

Application đại diện cho hồ sơ xét tuyển.

```ts
export interface Application {
  id: string;
  applicationCode: string;
  candidateId: string;
  universityId: string;
  majorId: string;
  subjectGroupCode: string;
  scores: ApplicationScores;
  totalScore: number;
  evidenceFiles: EvidenceFile[];
  status: ApplicationStatus;
  candidateNote?: string;
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

Field description:

| Field | Type | Description |
|---|---|---|
| id | string | ID hồ sơ |
| applicationCode | string | Mã hồ sơ hiển thị |
| candidateId | string | ID thí sinh |
| universityId | string | ID trường |
| majorId | string | ID ngành |
| subjectGroupCode | string | Mã tổ hợp xét tuyển |
| scores | ApplicationScores | Điểm từng môn |
| totalScore | number | Tổng điểm |
| evidenceFiles | EvidenceFile[] | File minh chứng |
| status | ApplicationStatus | pending, approved hoặc rejected |
| candidateNote | string | Ghi chú của thí sinh |
| adminNote | string | Ghi chú của admin |
| submittedAt | string | Ngày nộp |
| reviewedAt | string | Ngày duyệt/từ chối |
| reviewedBy | string | ID admin xử lý |
| createdAt | string | Ngày tạo |
| updatedAt | string | Ngày cập nhật |

## 12. Application Review Log

ApplicationReviewLog dùng để lưu lịch sử xử lý hồ sơ ở mức mock.

```ts
export interface ApplicationReviewLog {
  id: string;
  applicationId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  note?: string;
  reviewedBy: string;
  reviewedAt: string;
}
```

## 13. Mock Auth Accounts

Dự án cần có sẵn ít nhất 2 tài khoản mock để test đăng nhập.

```ts
export const mockUsers: User[] = [
  {
    id: "user_admin_001",
    fullName: "System Administrator",
    email: "admin@example.com",
    password: "123456",
    phone: "0900000001",
    role: "admin",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  {
    id: "user_candidate_001",
    fullName: "Nguyễn Văn An",
    email: "candidate@example.com",
    password: "123456",
    phone: "0900000002",
    role: "candidate",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  }
];
```

## 14. Suggested Mock Data Volume

Để giao diện có dữ liệu đẹp khi demo:

- Users: 6-10 records.
- Candidates: 5-8 records.
- Universities: 5-8 records.
- Majors: 15-25 records.
- Applications: 15-30 records.
- Subject groups: 5-8 records.
- Review logs: 5-15 records.

## 15. ID Naming Convention

Dùng string ID có tiền tố rõ ràng:

```ts
"user_admin_001"
"user_candidate_001"
"candidate_001"
"university_001"
"major_001"
"application_001"
"file_001"
"review_log_001"
```

## 16. Date Format

Tất cả ngày tháng trong mock data nên dùng ISO string:

```ts
"2026-05-01T08:00:00.000Z"
```

Khi hiển thị trên giao diện, format lại thành dạng dễ đọc:

```txt
01/05/2026
```

## 17. Mock Data Storage Rule

Vì hiện tại chưa có Backend thật:

- Mock data được khai báo trong thư mục src/mocks.
- Zustand store dùng mock data làm initial state.
- Các thao tác thêm/sửa/xóa/duyệt chỉ thay đổi state trong phiên chạy hiện tại.
- currentUser được lưu vào LocalStorage để giữ trạng thái đăng nhập khi reload.
- Không cần lưu toàn bộ mock data vào LocalStorage trong MVP.