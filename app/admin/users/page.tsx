"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { useUserManagementStore } from "@/store/user-management-store";
import { UserRole, Permission } from "@/types";
import { hasPermission } from "@/lib/auth/rbac";
import { RolePermissionsGuide } from "@/components/admin/RolePermissionsGuide";

export default function UserManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isCreateModalOpen, isEditModalOpen } = useUserManagementStore();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const userRole = session.user?.role as UserRole;
    if (!hasPermission(userRole, Permission.MANAGE_USERS)) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user?.role as UserRole;
  if (!hasPermission(userRole, Permission.MANAGE_USERS)) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage users, roles, and permissions
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        <RolePermissionsGuide />

        <UserManagementTable />

        {isCreateModalOpen && <CreateUserModal />}
        {isEditModalOpen && <EditUserModal />}
      </div>
    </main>
  );
}
