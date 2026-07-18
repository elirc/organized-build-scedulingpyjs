import { Role } from "@prisma/client";

export const roleLevels: Record<Role, number> = {
  SYSTEM_ADMIN: 6,
  MANAGER: 5,
  SCHEDULER: 4,
  STAFF: 3,
  CUSTOMER: 2,
  READ_ONLY: 1
};

export function hasRoleAccess(role: Role, minimumRole: Role) {
  return roleLevels[role] >= roleLevels[minimumRole];
}

export function canViewAllCalendars(role: Role) {
  return hasRoleAccess(role, Role.SCHEDULER);
}

export function canManageServices(role: Role) {
  return hasRoleAccess(role, Role.MANAGER);
}

export function canManageUsers(role: Role) {
  return hasRoleAccess(role, Role.MANAGER);
}

