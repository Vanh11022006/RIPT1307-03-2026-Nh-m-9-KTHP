import type {  ApplicationStatus, EvidenceFileType  } from "./common.types";

export type Subject =
  | "math"
  | "literature"
  | "english"
  | "physics"
  | "chemistry"
  | "biology"
  | "history"
  | "geography"
  | "civicEducation";

export interface SubjectGroup {
  code: string;
  name: string;
  subjects: Subject[];
}

export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  type: EvidenceFileType;
  category?: string;
  size: number;
  uploadedAt: string;
}

export interface ApplicationScores {
  math?: number;
  literature?: number;
  english?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
  history?: number;
  geography?: number;
  civicEducation?: number;
}

export interface Application {
  id: string;
  applicationCode: string;
  candidateId: string;
  universityId: string;
  majorId: string;
  subjectGroupCode: string;
  admissionRoundId?: string;
  priorityGroup?: string;
  priorityScore?: number;
  finalScore?: number;
  scores: ApplicationScores;
  totalScore: number;
  evidenceFiles: EvidenceFile[];
  status: ApplicationStatus;
  candidateNote?: string;
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationReviewLog {
  id: string;
  applicationId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  note?: string;
  reviewedBy: string;
  reviewedAt: string;
}
