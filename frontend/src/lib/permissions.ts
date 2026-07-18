export type Role = "SYSTEM_ADMIN" | "MANAGER" | "SCHEDULER" | "STAFF" | "CUSTOMER" | "READ_ONLY";

const roleLevels: Record<Role, number> = {
  SYSTEM_ADMIN: 6,
  MANAGER: 5,
  SCHEDULER: 4,
  STAFF: 3,
  CUSTOMER: 2,
  READ_ONLY: 1
};

export function hasMinimumRole(role: Role | null | undefined, minimumRole: Role) {
  if (!role) {
    return false;
  }
  return roleLevels[role] >= roleLevels[minimumRole];
}

