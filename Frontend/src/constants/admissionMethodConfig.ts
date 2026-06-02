import type { ApplicationScores, CertificateType } from "../types/application.types";

// ─── Bảng quy đổi chứng chỉ quốc tế → thang 10 ─────────────────────────────
export const IELTS_CONVERSION: { min: number; score: number }[] = [
  { min: 7.5, score: 10.0 },
  { min: 7.0, score: 10.0 },
  { min: 6.5, score: 9.0 },
  { min: 6.0, score: 8.5 },
  { min: 5.5, score: 8.0 },
  { min: 5.0, score: 7.0 },
  { min: 4.5, score: 6.0 },
];

export const TOEFL_IBT_CONVERSION: { min: number; score: number }[] = [
  { min: 110, score: 10.0 },
  { min: 100, score: 10.0 },
  { min: 87,  score: 9.0 },
  { min: 72,  score: 8.5 },
  { min: 60,  score: 8.0 },
  { min: 46,  score: 7.0 },
  { min: 35,  score: 6.0 },
];

export const SAT_CONVERSION: { min: number; score: number }[] = [
  { min: 1500, score: 10.0 },
  { min: 1400, score: 9.5 },
  { min: 1300, score: 9.0 },
  { min: 1200, score: 8.5 },
  { min: 1100, score: 8.0 },
  { min: 1000, score: 7.0 },
];

export const ACT_CONVERSION: { min: number; score: number }[] = [
  { min: 34, score: 10.0 },
  { min: 31, score: 9.5 },
  { min: 28, score: 9.0 },
  { min: 25, score: 8.5 },
  { min: 22, score: 8.0 },
  { min: 19, score: 7.0 },
];

export function convertCertificateScore(
  type: CertificateType | undefined,
  raw: number | undefined
): number {
  if (!type || raw == null) return 0;
  let table: { min: number; score: number }[];
  switch (type) {
    case "IELTS":      table = IELTS_CONVERSION; break;
    case "TOEFL_IBT":  table = TOEFL_IBT_CONVERSION; break;
    case "SAT":        table = SAT_CONVERSION; break;
    case "ACT":        table = ACT_CONVERSION; break;
    default:           return 0;
  }
  for (const row of table) {
    if (raw >= row.min) return row.score;
  }
  return 0;
}

// ─── Hệ số quy đổi ĐGNL về thang 30 ────────────────────────────────────────
/** HCM: thang 1200 → quy về 30: chia cho 40 (= 1200/30) */
export const GNL_HCM_SCALE = 1200;
/** HN:  thang 150  → quy về 30: chia cho 5  (= 150/30) */
export const GNL_HANOI_SCALE = 150;

// ─── Tên hiển thị phương thức ─────────────────────────────────────────────────
export const ADMISSION_METHOD_LABELS: Record<string, string> = {
  THPT_SCORE:             "Điểm thi THPT Quốc gia",
  SCHOOL_TRANSCRIPT:      "Xét học bạ THPT",
  COMPETENCY_ASSESSMENT:  "Đánh giá năng lực (ĐGNL)",
  THINKING_ASSESSMENT:    "Đánh giá tư duy (ĐGTD - Bách Khoa HN)",
  TALENT_ADMISSION:       "Xét tuyển tài năng (Kết hợp)",
  INTERVIEW:              "Phỏng vấn / Xét tuyển thẳng",
};

export const ALL_ADMISSION_METHODS = Object.entries(ADMISSION_METHOD_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const SUBJECT_NAMES: Record<string, string> = {
  math:                      "Toán học",
  physics:                   "Vật lý",
  chemistry:                 "Hóa học",
  literature:                "Ngữ văn",
  english:                   "Tiếng Anh",
  biology:                   "Sinh học",
  history:                   "Lịch sử",
  geography:                 "Địa lý",
  civicEducation:            "GDCD",
  gnlType:                   "Loại kỳ thi ĐGNL",
  gnlScore:                  "Điểm thi ĐGNL",
  gtdScore:                  "Điểm thi ĐGTD",
  certificateType:           "Loại chứng chỉ quốc tế",
  certificateRawScore:       "Điểm chứng chỉ (gốc)",
  certificateConvertedScore: "Điểm chứng chỉ quy đổi",
  subject2Score:             "Điểm môn 2 (học bạ)",
  subject3Score:             "Điểm môn 3 (học bạ)",
  hsgAward:                  "Đạt giải HSG",
  hsgSubject:                "Môn đạt giải HSG",
  hsgLevel:                  "Cấp giải HSG",
  hsgBonusScore:             "Điểm cộng giải HSG",
  directAdmission:           "Hình thức xét tuyển thẳng",
  profileScore:              "Điểm hồ sơ",
  interviewScore:            "Điểm phỏng vấn",
};

// ─── Kết quả tính điểm ────────────────────────────────────────────────────────
export interface ScoreCalculationResult {
  /** Tổng điểm môn học (chưa cộng ưu tiên) */
  subjectScore: number;
  /** Điểm ưu tiên đã quy đổi (nếu cần) */
  convertedPriorityScore: number;
  /** Tổng điểm xét tuyển cuối cùng */
  finalScore: number;
  /** Chuỗi mô tả công thức */
  formula: string;
  /** Xét thẳng */
  isDirectAdmission: boolean;
}

// ─── Hàm tính điểm theo phương thức ─────────────────────────────────────────
export function calculateScoreByMethod(
  method: string,
  scores: ApplicationScores,
  priorityScore: number
): ScoreCalculationResult {
  const p = priorityScore ?? 0;

  switch (method) {
    // 1. Điểm thi THPT Quốc gia
    case "THPT_SCORE": {
      const subjectVals = [
        scores.math, scores.literature, scores.english,
        scores.physics, scores.chemistry, scores.biology,
        scores.history, scores.geography, scores.civicEducation,
      ].filter((v): v is number => v != null && !isNaN(v));
      const subjectScore = Number(subjectVals.reduce((a, b) => a + b, 0).toFixed(2));
      const finalScore = Number((subjectScore + p).toFixed(2));
      return {
        subjectScore,
        convertedPriorityScore: p,
        finalScore,
        formula: `ĐXT = Môn1 + Môn2 + Môn3 + Điểm ưu tiên (${p})`,
        isDirectAdmission: false,
      };
    }

    // 2. Xét học bạ THPT (trung bình môn)
    case "SCHOOL_TRANSCRIPT": {
      const subjectVals = [
        scores.math, scores.literature, scores.english,
        scores.physics, scores.chemistry, scores.biology,
        scores.history, scores.geography, scores.civicEducation,
      ].filter((v): v is number => v != null && !isNaN(v));
      const subjectScore = Number(subjectVals.reduce((a, b) => a + b, 0).toFixed(2));
      const finalScore = Number((subjectScore + p).toFixed(2));
      return {
        subjectScore,
        convertedPriorityScore: p,
        finalScore,
        formula: `ĐXT = ĐTB Môn1 + ĐTB Môn2 + ĐTB Môn3 + Điểm ưu tiên (${p})`,
        isDirectAdmission: false,
      };
    }

    // 3. Đánh giá năng lực (ĐGNL) → quy về thang 30
    case "COMPETENCY_ASSESSMENT": {
      const gnlScore = scores.gnlScore ?? 0;
      const gnlType = scores.gnlType ?? "hcm";
      const scale = gnlType === "hcm" ? GNL_HCM_SCALE : GNL_HANOI_SCALE;
      // Quy về thang 30: score × 30 / scale
      const converted30 = Number(((gnlScore * 30) / scale).toFixed(2));
      const finalScore = Number((converted30 + p).toFixed(2));
      const scaleLabel = gnlType === "hcm" ? "1200" : "150";
      const divisor = scale / 30; // 40 hoặc 5
      return {
        subjectScore: converted30,
        convertedPriorityScore: p,
        finalScore,
        formula: `ĐXT = Điểm ĐGNL × 30/${scaleLabel} (${gnlScore} / ${divisor} = ${converted30}) + ưu tiên (${p}) [Thang 30]`,
        isDirectAdmission: false,
      };
    }

    // 4. Đánh giá tư duy (ĐGTD – Bách Khoa HN, thang 100 → quy về 30)
    case "THINKING_ASSESSMENT": {
      const gtdScore = scores.gtdScore ?? 0;
      const converted = Number(((gtdScore * 3) / 10).toFixed(2));
      const finalScore = Number((converted + p).toFixed(2));
      return {
        subjectScore: converted,
        convertedPriorityScore: p,
        finalScore,
        formula: `ĐXT = (${gtdScore} × 3/10 = ${converted}) + Điểm ưu tiên (${p})`,
        isDirectAdmission: false,
      };
    }

    // 5. Xét tuyển tài năng (kết hợp chứng chỉ + học bạ + HSG)
    case "TALENT_ADMISSION": {
      const certConverted = scores.certificateConvertedScore ??
        convertCertificateScore(scores.certificateType, scores.certificateRawScore);
      const s2 = scores.subject2Score ?? 0;
      const s3 = scores.subject3Score ?? 0;
      const hsgBonus = scores.hsgBonusScore ?? 0;
      const subjectScore = Number((certConverted + s2 + s3 + hsgBonus).toFixed(2));
      const finalScore = Number((subjectScore).toFixed(2)); // ưu tiên đã nằm trong hsgBonus
      return {
        subjectScore,
        convertedPriorityScore: 0,
        finalScore,
        formula: `ĐXT = CC quy đổi (${certConverted}) + HB Môn2 (${s2}) + HB Môn3 (${s3}) + Giải HSG (${hsgBonus})`,
        isDirectAdmission: false,
      };
    }

    // 6. Phỏng vấn / Xét tuyển thẳng → thang 30 (hồ sơ 0–15, phỏng vấn 0–15)
    case "INTERVIEW": {
      if (scores.directAdmission === "pass") {
        return {
          subjectScore: 0,
          convertedPriorityScore: 0,
          finalScore: 0,
          formula: "Xét tuyển thẳng – ĐẠT (không tính điểm tổng)",
          isDirectAdmission: true,
        };
      }
      const profile = scores.profileScore ?? 0;    // 0–15
      const interview = scores.interviewScore ?? 0; // 0–15
      const subjectScore = Number((profile + interview).toFixed(2));  // max 30
      const finalScore = Number((subjectScore).toFixed(2));
      return {
        subjectScore,
        convertedPriorityScore: 0,
        finalScore,
        formula: `ĐXT = Điểm hồ sơ (${profile}/15) + Điểm phỏng vấn (${interview}/15) = ${subjectScore}/30`,
        isDirectAdmission: false,
      };
    }

    default: {
      return {
        subjectScore: 0,
        convertedPriorityScore: 0,
        finalScore: 0,
        formula: "Chưa chọn phương thức xét tuyển",
        isDirectAdmission: false,
      };
    }
  }
}
