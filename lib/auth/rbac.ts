import { UserRole, Permission } from "@/types";

/**
 * Role-Based Access Control (RBAC) Configuration
 */

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.READ_DASHBOARD,
    Permission.WRITE_DASHBOARD,
    Permission.MANAGE_CONFIG,
    Permission.MANAGE_USERS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.MANAGER]: [
    Permission.READ_DASHBOARD,
    Permission.WRITE_DASHBOARD,
    Permission.MANAGE_CONFIG,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.MEMBER]: [
    Permission.READ_DASHBOARD,
    Permission.WRITE_DASHBOARD,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.VIEWER]: [Permission.READ_DASHBOARD, Permission.VIEW_ANALYTICS],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false;
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if a role can manage other roles
 */
export function canManageRole(
  managerRole: UserRole,
  targetRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.ADMIN]: 4,
    [UserRole.MANAGER]: 3,
    [UserRole.MEMBER]: 2,
    [UserRole.VIEWER]: 1,
  };

  return roleHierarchy[managerRole] > roleHierarchy[targetRole];
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrator",
    [UserRole.MANAGER]: "Manager",
    [UserRole.MEMBER]: "Member",
    [UserRole.VIEWER]: "Viewer",
  };

  return roleNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.ADMIN]:
      "Full access to all features including user management and system configuration",
    [UserRole.MANAGER]:
      "Can manage VSM configurations, view analytics, and export data",
    [UserRole.MEMBER]:
      "Can view and edit dashboard data, access analytics features",
    [UserRole.VIEWER]: "Read-only access to dashboard and analytics",
  };

  return descriptions[role] || "";
}
