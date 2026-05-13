import type {  EntityStatus  } from "./common.types";

export interface Major {
  id: string;
  universityId: string;
  code: string;
  name: string;
  admissionQuota: number;
  subjectGroupCodes: string[];
  minScore: number;
  tuitionFeePerYear: number;
  description: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
