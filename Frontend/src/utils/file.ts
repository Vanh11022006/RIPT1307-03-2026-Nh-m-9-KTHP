export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return "Chưa cập nhật";
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(2)} KB`;
  return `${(bytes / (k * k)).toFixed(2)} MB`;
};
