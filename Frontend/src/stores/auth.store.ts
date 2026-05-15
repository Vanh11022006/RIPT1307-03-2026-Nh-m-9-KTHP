import { create } from "zustand";
import type { User } from "../types/auth.types";
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
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

const readStoredUser = (): User | null => {
  if (!isBrowser) return null;

  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch (error) {
    console.error("Failed to parse stored user", error);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

const readStoredToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(TOKEN_KEY);
};

const persistAuth = (token: string, user: User) => {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

const clearAuthStorage = () => {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

// Read persisted auth only in the browser so the store is safe in tests/build tooling.
const _initialUser = readStoredUser();
const _initialToken = readStoredToken();
export const useAuthStore = create<AuthState>((set) => ({
  currentUser: _initialUser,
  isAuthenticated: !!(_initialUser && _initialToken),

  loadCurrentUserFromStorage: () => {
    if (!isBrowser) {
      return;
    }

    const storedUser = readStoredUser();
    const token = readStoredToken();

    if (storedUser && token) {
      set({ currentUser: storedUser, isAuthenticated: true });
      return;
    }

    clearAuthStorage();
    set({ currentUser: null, isAuthenticated: false });
  },

  login: async (email, password) => {
    try {
      const response = await axiosClient.post("/auth/login", { email, password });
      const payload = response?.data ?? response;
      const authData = payload?.data ?? payload;
      const token = authData?.token ?? payload?.token ?? null;
      const user = authData?.user ?? payload?.user ?? null;

      if (token && user) {
        persistAuth(token, user);
        set({ currentUser: user, isAuthenticated: true });
        return { success: true, message: "Đăng nhập thành công" };
      }

      return { success: false, message: payload?.message || "Đăng nhập thất bại" };
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
      const payload = response?.data ?? response;
      if (payload) {
        return { success: true, message: "Đăng ký thành công" };
      }

      return { success: false, message: payload?.message || "Đăng ký thất bại" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Email đã tồn tại trong hệ thống";
      return { success: false, message };
    }
  },

  logout: () => {
    clearAuthStorage();
    set({ currentUser: null, isAuthenticated: false });
  }
}));