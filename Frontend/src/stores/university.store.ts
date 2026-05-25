import { create } from "zustand";
import type {  University  } from "../types/university.types";
import axiosClient from "../api/axiosClient";

const normalizeUniversity = (university: any): University => {
  const status = String(university?.status ?? "").toLowerCase() === "inactive" ? "inactive" : "active";

    // try to infer city if missing using common patterns or a lookup table
    const lookupByCode: Record<string, string> = {
      'HUST': 'Hà Nội',
      'HNUT': 'Hà Nội',
      'VNU': 'Hà Nội',
      'HCMUT': 'Hồ Chí Minh',
      'HCMUS': 'Hồ Chí Minh',
      'HCM': 'Hồ Chí Minh',
      'DUT': 'Đà Nẵng',
      'CTU': 'Cần Thơ'
    };

    const inferCity = (u: any) => {
      if (u?.city) return u.city;
      const code = (u?.code || '').toUpperCase();
      if (lookupByCode[code]) return lookupByCode[code];
      const name = (u?.name || '').toLowerCase();
      if (name.includes('hanoi') || name.includes('ha noi') || name.includes('hà nội')) return 'Hà Nội';
      if (name.includes('ho chi minh') || name.includes('hcm') || name.includes('thành phố hồ chí minh') || name.includes('hồ chí minh')) return 'Hồ Chí Minh';
      if (name.includes('da nang') || name.includes('đà nẵng')) return 'Đà Nẵng';
      if (name.includes('can tho') || name.includes('cần thơ')) return 'Cần Thơ';
      return '';
    };

    return {
    id: String(university?.id ?? ""),
    code: university?.code ?? "",
    name: university?.name ?? "",
    shortName: university?.shortName ?? university?.code ?? university?.name ?? "",
    address: university?.address ?? "",
    city: inferCity(university),
    website: university?.website ?? "",
    email: university?.email ?? "",
    phone: university?.phone ?? "",
    description: university?.description ?? "",
    logo: university?.logo ?? university?.logoUrl ?? "",
    status,
    createdAt: university?.createdAt ?? "",
    updatedAt: university?.updatedAt ?? "",
  } as University;
};

interface UniversityState {
  universities: University[];
  loading: boolean;
  getUniversities: () => Promise<void>;
  getActiveUniversities: () => University[];
  getUniversityById: (id: string) => University | undefined;
  createUniversity: (university: Partial<University>) => Promise<void>;
  updateUniversity: (id: string, data: Partial<University>) => Promise<void>;
  toggleUniversityStatus: (id: string) => Promise<void>;
}

export const useUniversityStore = create<UniversityState>((set, get) => ({
  universities: [],
  loading: false,

  getUniversities: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/universities");
      const payload = response?.data ?? response;
      const universities = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      set({ universities: universities.map(normalizeUniversity) });
    } catch (error) {
      console.error("Failed to fetch universities:", error);
    } finally {
      set({ loading: false });
    }
  },

  getActiveUniversities: () => {
    return get().universities.filter((u) => u.status === "active");
  },

  getUniversityById: (id) => {
    return get().universities.find((u) => u.id === id);
  },

  createUniversity: async (university) => {
    try {
      const response = await axiosClient.post("/universities", university);
      const payload = response?.data ?? response;
      const serverUniversity = payload?.data ?? payload;
      const createdUniversity = normalizeUniversity({
        ...university,
        ...(serverUniversity || {}),
        id: String(serverUniversity?.id ?? university?.id ?? ""),
      });
      if (createdUniversity.id) {
        set((state) => ({
          universities: [...state.universities, createdUniversity]
        }));
      }
    } catch (error) {
      console.error("Failed to create university:", error);
      throw error;
    }
  },

  updateUniversity: async (id, data) => {
    try {
      const response = await axiosClient.put(`/universities/${id}`, data);
      const payload = response?.data ?? response;
      const serverUniversity = payload?.data ?? payload;

      set((state) => ({
        universities: state.universities.map((u) => {
          if (String(u.id) !== String(id)) {
            return u;
          }

          const mergedUniversity = {
            ...u,
            ...data,
            ...(serverUniversity || {}),
            id: String(serverUniversity?.id ?? u.id),
          };

          return normalizeUniversity(mergedUniversity);
        })
      }));
    } catch (error) {
      console.error("Failed to update university:", error);
      throw error;
    }
  },

  toggleUniversityStatus: async (id) => {
    try {
      const university = get().getUniversityById(id);
      if (university) {
        const newStatus = university.status === "active" ? "inactive" : "active";
        await get().updateUniversity(id, { status: newStatus });
      }
    } catch (error) {
      console.error("Failed to toggle university status:", error);
    }
  }
}));
