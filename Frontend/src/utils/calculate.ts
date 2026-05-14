import type {  ApplicationScores  } from "../types/application.types";

export const calculateTotalScore = (scores: ApplicationScores): number => {
  let total = 0;
  if (scores.math) total += scores.math;
  if (scores.physics) total += scores.physics;
  if (scores.chemistry) total += scores.chemistry;
  if (scores.literature) total += scores.literature;
  if (scores.english) total += scores.english;
  if (scores.biology) total += scores.biology;
  if (scores.history) total += scores.history;
  if (scores.geography) total += scores.geography;
  if (scores.civicEducation) total += scores.civicEducation;

  return Number(total.toFixed(2));
};
