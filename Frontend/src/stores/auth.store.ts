import { create } from "zustand";
import type {  User  } from "../types/auth.types";
import { mockUsers } from "../mocks/users.mock";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loadCurrentUserFromStorage: () => void;
}

const STORAGE_KEY = "currentUser";

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,

  loadCurrentUserFromStorage: () => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        set({ currentUser: user, isAuthenticated: true });
      } catch (error) {
        console.error("Failed to parse user from storage", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  },

  login: async (email, password) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password && u.status === "active"
    );

    if (user) {
      // Do not store password in state or localstorage for security (even in mock)
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
      set({ currentUser: userWithoutPassword, isAuthenticated: true });
      return { success: true, message: "Đăng nhập thành công" };
    }

    return { success: false, message: "Email hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa" };
  },

  register: async (email, _password) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return { success: false, message: "Email đã tồn tại trong hệ thống" };
    }

    // In a real app, we'd add it to backend. Here we just pretend it succeeds.
    return { success: true, message: "Đăng ký thành công" };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ currentUser: null, isAuthenticated: false });
  }
}));
