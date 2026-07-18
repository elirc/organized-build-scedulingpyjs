import { apiClient } from "./client";

export async function fetchCustomers() {
  const response = await apiClient.get("/customers");
  return response.data.items ?? response.data.customers ?? [];
}

export async function createCustomer(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  timezone?: string;
}) {
  const response = await apiClient.post("/customers", payload);
  return response.data.customer;
}

