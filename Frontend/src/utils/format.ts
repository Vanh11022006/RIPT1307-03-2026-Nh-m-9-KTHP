export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
};

export const formatScore = (score: number | undefined): string => {
  if (score === undefined) return "0.00";
  return score.toFixed(2);
};
