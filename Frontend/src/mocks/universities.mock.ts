import type {  University  } from "../types/university.types";

export const mockUniversities: University[] = [
  {
    id: "university_001",
    code: "QGH",
    name: "Đại học Quốc gia Hà Nội",
    shortName: "VNU",
    address: "144 Xuân Thủy, Cầu Giấy",
    city: "Hà Nội",
    website: "https://vnu.edu.vn",
    email: "contact@vnu.edu.vn",
    phone: "02437547670",
    description: "Đại học Quốc gia Hà Nội là một trong hai hệ thống đại học quốc gia của Việt Nam.",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  {
    id: "university_002",
    code: "BKA",
    name: "Đại học Bách khoa Hà Nội",
    shortName: "HUST",
    address: "1 Đại Cồ Việt, Hai Bà Trưng",
    city: "Hà Nội",
    website: "https://hust.edu.vn",
    email: "ccpr@hust.edu.vn",
    phone: "02438692115",
    description: "Đại học Bách khoa Hà Nội là trường đại học kỹ thuật đầu ngành tại Việt Nam.",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  {
    id: "university_003",
    code: "KHT",
    name: "Trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
    shortName: "HCMUS",
    address: "227 Nguyễn Văn Cừ, Quận 5",
    city: "Hồ Chí Minh",
    website: "https://hcmus.edu.vn",
    email: "info@hcmus.edu.vn",
    phone: "02838353193",
    description: "Trường Đại học Khoa học Tự nhiên là đơn vị thành viên của Đại học Quốc gia TP.HCM.",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  }
];
