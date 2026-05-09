import type {  Gender  } from "./common.types";

export interface Candidate {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  citizenId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  highSchool: string;
  graduationYear: number;
  createdAt: string;
  updatedAt: string;
}
