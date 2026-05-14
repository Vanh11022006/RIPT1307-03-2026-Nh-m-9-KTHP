import { create } from "zustand";
import type {  User  } from "../types/auth.types";
import axiosClient from "../api/axiosClient";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password?: string, fullName?: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loadCurrentUserFromStorage: () => void;
}

const STORAGE_KEY = "currentUser";
const TOKEN_KEY = "access_token";

// Synchronously read stored user and token so the initial state
// reflects persisted authentication and avoids redirect on first render.
let _initialUser: User | null = null;
try {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) _initialUser = JSON.parse(s) as User;
} catch (e) {
  console.error("Failed to parse stored user", e);
  localStorage.removeItem(STORAGE_KEY);
}
const _initialToken = localStorage.getItem(TOKEN_KEY);

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: _initialUser,
  isAuthenticated: !!(_initialUser && _initialToken),

  loadCurrentUserFromStorage: () => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (storedUser && token) {
      try {
        const user: User = JSON.parse(storedUser);
        set({ currentUser: user, isAuthenticated: true });
      } catch (error) {
        console.error("Failed to parse user from storage", error);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  },

  login: async (email, password) => {
    try {
      const response = await axiosClient.post("/auth/login", { email, password });
      
      if (response && response.data) {
        const { token, user } = response.data;
        
        // Store token and user
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        
        set({ currentUser: user, isAuthenticated: true });
        return { success: true, message: "Đăng nhập thành công" };
      }
      
      return { success: false, message: response?.message || "Đăng nhập thất bại" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Email hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa";
      return { success: false, message };
    }
  },

  register: async (email, password, fullName = "", phone = "") => {
    try {
      const response = await axiosClient.post("/auth/register", { 
        email, 
        password,
        fullName,
        phone
      });
      
      if (response && response.data) {
        return { success: true, message: "Đăng ký thành công" };
      }
      
      return { success: false, message: response?.message || "Đăng ký thất bại" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Email đã tồn tại trong hệ thống";
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    set({ currentUser: null, isAuthenticated: false });
  }
}));
