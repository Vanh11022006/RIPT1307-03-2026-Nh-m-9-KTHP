import type {  ApplicationScores  } from "../types/application.types";

export const calculateTotalScore = (scores: ApplicationScores): number => {
  console.log("🔍 calculateTotalScore input:", scores);
  
  if (!scores || typeof scores !== "object") {
    console.log("❌ Scores is not an object");
    return 0;
  }
  
  let total = 0;
  
  // Use Object.entries to iterate all properties
  Object.entries(scores).forEach(([key, value]) => {
    console.log(`  Checking ${key}: ${value} (type: ${typeof value})`);
    if (value !== undefined && value !== null && value !== "" && !isNaN(Number(value))) {
      const numValue = Number(value);
      total += numValue;
      console.log(`    ✓ Added ${numValue}, total now: ${total}`);
    }
  });

  const result = Number(total.toFixed(2));
  console.log("📊 Final total score:", result);
  return result;
};
