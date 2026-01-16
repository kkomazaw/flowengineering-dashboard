"use client";

import { useState } from "react";
import { UserRole, Permission } from "@/types";
import { rolePermissions, getRoleName } from "@/lib/auth/rbac";

const permissionDescriptions: Record<Permission, string> = {
  [Permission.READ_DASHBOARD]: "View dashboard and metrics",
  [Permission.WRITE_DASHBOARD]: "Edit dashboard settings and configurations",
  [Permission.MANAGE_CONFIG]: "Manage VSM configurations and presets",
  [Permission.MANAGE_USERS]: "Create, edit, and delete users",
  [Permission.VIEW_ANALYTICS]: "Access advanced analytics and trends",
  [Permission.EXPORT_DATA]: "Export data and generate reports",
};

export function RolePermissionsGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">Role & Permission Guide</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission
                  </th>
                  {Object.values(UserRole).map((role) => (
                    <th
                      key={role}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {getRoleName(role)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(Permission).map((permission) => (
                  <tr key={permission} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {permission.split(":")[1].replace("_", " ")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {permissionDescriptions[permission]}
                      </div>
                    </td>
                    {Object.values(UserRole).map((role) => (
                      <td
                        key={`${permission}-${role}`}
                        className="px-6 py-4 whitespace-nowrap text-center"
                      >
                        {rolePermissions[role].includes(permission) ? (
                          <svg
                            className="w-5 h-5 text-green-500 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-300 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Role Descriptions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-purple-800">Admin:</span>{" "}
                <span className="text-gray-600">
                  Full system access including user management
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Manager:</span>{" "}
                <span className="text-gray-600">
                  Can manage configurations and view analytics
                </span>
              </div>
              <div>
                <span className="font-medium text-green-800">Member:</span>{" "}
                <span className="text-gray-600">
                  Can read and modify dashboard settings
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Viewer:</span>{" "}
                <span className="text-gray-600">
                  Read-only access to dashboard
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
