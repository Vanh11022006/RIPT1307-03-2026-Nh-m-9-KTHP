export const PRIORITY_GROUPS = {
  none: {
    label: "Không thuộc diện ưu tiên",
    score: 0,
  },
  kv1: {
    label: "Khu vực 1",
    score: 0.75,
  },
  kv2nt: {
    label: "Khu vực 2 nông thôn",
    score: 0.5,
  },
  kv2: {
    label: "Khu vực 2",
    score: 0.25,
  },
  dt01: {
    label: "Đối tượng 01",
    score: 2,
  },
  dt02: {
    label: "Đối tượng 02",
    score: 1,
  },
  dt03: {
    label: "Đối tượng 03",
    score: 1,
  },
};

export const getPriorityGroupLabel = (code?: string): string => {
  if (!code || !PRIORITY_GROUPS[code as keyof typeof PRIORITY_GROUPS]) {
    return PRIORITY_GROUPS.none.label;
  }
  return PRIORITY_GROUPS[code as keyof typeof PRIORITY_GROUPS].label;
};

export const getPriorityScore = (code?: string): number => {
  if (!code || !PRIORITY_GROUPS[code as keyof typeof PRIORITY_GROUPS]) {
    return PRIORITY_GROUPS.none.score;
  }
  return PRIORITY_GROUPS[code as keyof typeof PRIORITY_GROUPS].score;
};
