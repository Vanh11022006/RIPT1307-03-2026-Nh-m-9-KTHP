import type {  EntityStatus  } from "./common.types";

export interface University {
  id: string;
  code: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  logo?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
