import type {  ApplicationStatus, EvidenceFileType  } from "./common.types";

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

export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  type: EvidenceFileType;
  category?: string;
  size: number;
  uploadedAt: string;
}

export type GnlType = "hcm" | "hanoi";
export type CertificateType = "IELTS" | "TOEFL_IBT" | "SAT" | "ACT";
export type HsgLevel = "national" | "provincial";
export type DirectAdmissionResult = "pass" | "fail" | "";

export interface ApplicationScores {
  // --- THPT_SCORE & SCHOOL_TRANSCRIPT ---
  math?: number;
  literature?: number;
  english?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
  history?: number;
  geography?: number;
  civicEducation?: number;

  // --- COMPETENCY_ASSESSMENT (ĐGNL) ---
  gnlType?: GnlType;          // "hcm" (thang 1200) | "hanoi" (thang 150)
  gnlScore?: number;           // điểm thi ĐGNL thô

  // --- THINKING_ASSESSMENT (ĐGTD - Bách Khoa HN) ---
  gtdScore?: number;           // điểm thi ĐGTD (0–100)

  // --- TALENT_ADMISSION (Xét tuyển tài năng / kết hợp) ---
  certificateType?: CertificateType;    // loại chứng chỉ quốc tế
  certificateRawScore?: number;          // điểm chứng chỉ gốc (VD: IELTS 6.5)
  certificateConvertedScore?: number;    // điểm quy đổi (VD: 9.0 thang 10)
  subject2Score?: number;               // ĐTB môn 2 từ học bạ
  subject3Score?: number;               // ĐTB môn 3 từ học bạ
  hsgAward?: boolean;                   // có giải HSG không
  hsgSubject?: string;                  // môn đạt giải
  hsgLevel?: HsgLevel;                  // cấp giải: quốc gia / tỉnh
  hsgBonusScore?: number;               // điểm cộng giải HSG (0–2)

  // --- INTERVIEW / Xét tuyển thẳng ---
  directAdmission?: DirectAdmissionResult;  // "pass" | "fail"
  profileScore?: number;        // điểm hồ sơ (học bạ / giải thưởng)
  interviewScore?: number;      // điểm phỏng vấn trực tiếp
}

export interface Application {
  id: string;
  applicationCode: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateDateOfBirth?: string;
  candidateGender?: string;
  candidateCitizenId?: string;
  candidateAddress?: string;
  candidateCity?: string;
  candidateHighSchool?: string;
  candidateGraduationYear?: number;
  universityId: string;
  majorId: string;
  subjectGroupCode: string;
  admissionRoundId?: string;
  priorityGroup?: string;
  priorityScore?: number;
  finalScore?: number;
  reviewScoreAverage?: number;
  reviewCount?: number;
  scores: ApplicationScores;
  totalScore: number;
  evidenceFiles: EvidenceFile[];
  status: ApplicationStatus;
  candidateNote?: string;
  adminNote?: string;
  admissionMethod?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationReviewLog {
  id: string;
  applicationId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  note?: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface ReviewerSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface ApplicationReviewSummary {
  applicationId: string;
  assignedReviewers: ReviewerSummary[];
  averageReviewScore?: number | null;
  reviewCount?: number | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewLogs: ApplicationReviewLog[];
}

export interface ApplicationReviewSubmission {
  reviewerId?: string;
  reviewScore: number;
  notes?: string;
}
