import { apiClient } from "./client";

export async function login(payload: { email: string; password: string }) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data as {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      role: "SYSTEM_ADMIN" | "MANAGER" | "SCHEDULER" | "STAFF" | "CUSTOMER" | "READ_ONLY";
      firstName: string;
      lastName: string;
    };
  };
}

export async function fetchMe() {
  const response = await apiClient.get("/auth/me");
  return response.data.user;
}

