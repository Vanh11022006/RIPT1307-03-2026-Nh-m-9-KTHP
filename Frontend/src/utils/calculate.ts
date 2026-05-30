import type {  ApplicationScores  } from "../types/application.types";

export const calculateTotalScore = (scores: ApplicationScores): number => {
  if (!scores || typeof scores !== "object") {
    return 0;
  }
  
  let total = 0;
  
  // Use Object.entries to iterate all properties
  Object.values(scores).forEach((value) => {
    if (value !== undefined && value !== null && value !== "" && !isNaN(Number(value))) {
      const numValue = Number(value);
      total += numValue;
    }
  });

  return Number(total.toFixed(2));
};
