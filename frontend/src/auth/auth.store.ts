import { create } from "zustand";
import { apiClient } from "../api/client";

type AuthState = {
  token: string | null;
  user: {
    id: string;
    email: string;
    role: "SYSTEM_ADMIN" | "MANAGER" | "SCHEDULER" | "STAFF" | "CUSTOMER" | "READ_ONLY";
  } | null;
  setToken: (token: string | null) => void;
  setSession: (token: string, user: AuthState["user"]) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
    set({ token });
  },
  setSession: (token, user) => {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    set({ token, user });
  },
  clearSession: () => {
    delete apiClient.defaults.headers.common.Authorization;
    set({ token: null, user: null });
  }
}));
