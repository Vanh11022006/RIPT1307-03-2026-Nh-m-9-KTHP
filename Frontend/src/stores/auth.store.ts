import { create } from "zustand";
import type { User } from "../types/auth.types";
import axiosClient from "../api/axiosClient";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password?: string, fullName?: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, token: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loadCurrentUserFromStorage: () => void;
}

const STORAGE_KEY = "currentUser";
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const REMEMBER_KEY = "remember_me";
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

const readStorageValue = (key: string): string | null => {
  if (!isBrowser) return null;
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
};

const writeStorageValue = (key: string, value: string, remember: boolean) => {
  if (!isBrowser) return;
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(key, value);
};

const clearStorageKey = (key: string) => {
  if (!isBrowser) return;
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

const readStoredUser = (): User | null => {
  try {
    const storedUser = readStorageValue(STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch (error) {
    console.error("Failed to parse stored user", error);
    clearStorageKey(STORAGE_KEY);
    clearStorageKey(TOKEN_KEY);
    clearStorageKey(REFRESH_TOKEN_KEY);
    clearStorageKey(REMEMBER_KEY);
    return null;
  }
};

const readStoredToken = (): string | null => {
  return readStorageValue(TOKEN_KEY);
};

const persistAuth = (token: string, user: User, remember: boolean, refreshToken?: string | null) => {
  if (!isBrowser) return;

  writeStorageValue(TOKEN_KEY, token, remember);
  writeStorageValue(STORAGE_KEY, JSON.stringify(user), remember);
  writeStorageValue(REMEMBER_KEY, remember ? "true" : "false", remember);

  if (remember && refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (remember) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(REMEMBER_KEY);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
};

const clearAuthStorage = () => {
  clearStorageKey(STORAGE_KEY);
  clearStorageKey(TOKEN_KEY);
  clearStorageKey(REFRESH_TOKEN_KEY);
  clearStorageKey(REMEMBER_KEY);
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

  login: async (email, password, remember = false) => {
    try {
      const response = await axiosClient.post("/auth/login", { email, password, remember });
      const payload = response?.data ?? response;
      const authData = payload?.data ?? payload;
      const token = authData?.token ?? authData?.accessToken ?? payload?.token ?? payload?.accessToken ?? null;
      const refreshToken = authData?.refreshToken ?? payload?.refreshToken ?? null;
      const user = authData?.user ?? payload?.user ?? null;

      if (token && user) {
        persistAuth(token, user, remember, refreshToken);
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

  requestPasswordReset: async (email) => {
    try {
      const response = await axiosClient.post(
        "/auth/forgot-password",
        { email },
        { timeout: 30000 }
      );
      const payload = response?.data ?? response;

      return {
        success: !!payload?.success,
        message: payload?.message || "Đã gửi mã khôi phục mật khẩu",
        data: payload?.data ?? null,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể gửi yêu cầu khôi phục mật khẩu";
      return { success: false, message };
    }
  },

  resetPassword: async (email: string, token: string, newPassword: string, confirmPassword: string) => {
    try {
      const response = await axiosClient.post(
        "/auth/reset-password",
        {
          email,
          token,
          newPassword,
          confirmPassword,
        },
        { timeout: 30000 }
      );
      const payload = response?.data ?? response;

      return {
        success: !!payload?.success,
        message: payload?.message || "Đặt lại mật khẩu thành công",
      };
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể đặt lại mật khẩu";
      return { success: false, message };
    }
  },

  logout: () => {
    clearAuthStorage();
    set({ currentUser: null, isAuthenticated: false });
  }
}));