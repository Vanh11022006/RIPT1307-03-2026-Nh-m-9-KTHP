import type { ApplicationScores } from "../types/application.types";
import { calculateScoreByMethod } from "../constants/admissionMethodConfig";

/**
 * Tính tổng điểm môn học (subjectScore) theo phương thức xét tuyển.
 * Không cộng điểm ưu tiên – dùng để lưu vào `totalScore`.
 */
export const calculateTotalScore = (
  scores: ApplicationScores,
  method?: string
): number => {
  if (!scores || typeof scores !== "object") return 0;
  if (!method) {
    // Fallback: cộng tất cả giá trị số
    let total = 0;
    Object.values(scores).forEach((value) => {
      if (value !== undefined && value !== null && value !== "" && !isNaN(Number(value))) {
        total += Number(value);
      }
    });
    return Number(total.toFixed(2));
  }
  const result = calculateScoreByMethod(method, scores, 0);
  return result.subjectScore;
};
