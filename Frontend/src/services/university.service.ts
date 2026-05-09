import axiosClient from '../api/axiosClient';
import type { University } from '../types/university.types';

// Định dạng chung của dữ liệu trả về (tùy thuộc vào thiết kế của Backend)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export const universityService = {
  // Lấy danh sách tất cả các trường đại học
  getAll: (): Promise<ApiResponse<University[]>> => {
    return axiosClient.get('/universities');
  },

  // Lấy chi tiết một trường đại học theo ID
  getById: (id: string): Promise<ApiResponse<University>> => {
    return axiosClient.get(`/universities/${id}`);
  },

  // Thêm mới trường đại học
  create: (data: Partial<University>): Promise<ApiResponse<University>> => {
    return axiosClient.post('/universities', data);
  },

  // Cập nhật thông tin trường đại học
  update: (id: string, data: Partial<University>): Promise<ApiResponse<University>> => {
    return axiosClient.put(`/universities/${id}`, data);
  },

  // Xóa (hoặc vô hiệu hóa) trường đại học
  delete: (id: string): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/universities/${id}`);
  },
};
