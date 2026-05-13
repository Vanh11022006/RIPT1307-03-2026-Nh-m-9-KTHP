export const EVIDENCE_CATEGORIES = {
  transcript: {
    label: "Học bạ",
  },
  citizenId: {
    label: "CCCD/CMND",
  },
  priorityProof: {
    label: "Giấy chứng nhận ưu tiên",
  },
  certificate: {
    label: "Chứng chỉ khác",
  },
  other: {
    label: "Khác",
  },
};

export const getEvidenceCategoryLabel = (code?: string): string => {
  if (!code || !EVIDENCE_CATEGORIES[code as keyof typeof EVIDENCE_CATEGORIES]) {
    return EVIDENCE_CATEGORIES.other.label;
  }
  return EVIDENCE_CATEGORIES[code as keyof typeof EVIDENCE_CATEGORIES].label;
};
