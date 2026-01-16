import { create } from "zustand";
import { User, UserRole } from "@/types";

interface UserManagementState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedUserId: string | null;
  searchQuery: string;
  roleFilter: UserRole | "all";
  teamFilter: string | "all";

  // Actions
  setUsers: (users: User[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (userId: string) => void;
  closeEditModal: () => void;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: UserRole | "all") => void;
  setTeamFilter: (team: string | "all") => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  fetchUsers: () => Promise<void>;
}

export const useUserManagementStore = create<UserManagementState>(
  (set, get) => ({
    users: [],
    isLoading: false,
    error: null,
    isCreateModalOpen: false,
    isEditModalOpen: false,
    selectedUserId: null,
    searchQuery: "",
    roleFilter: "all",
    teamFilter: "all",

    setUsers: (users) => set({ users }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    openCreateModal: () => set({ isCreateModalOpen: true }),
    closeCreateModal: () => set({ isCreateModalOpen: false }),

    openEditModal: (userId) =>
      set({ isEditModalOpen: true, selectedUserId: userId }),
    closeEditModal: () =>
      set({ isEditModalOpen: false, selectedUserId: null }),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setRoleFilter: (role) => set({ roleFilter: role }),
    setTeamFilter: (team) => set({ teamFilter: team }),

    addUser: (user) => set((state) => ({ users: [...state.users, user] })),

    updateUser: (userId, updates) =>
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, ...updates, updatedAt: new Date() } : user
        ),
      })),

    deleteUser: (userId) =>
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      })),

    fetchUsers: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const users = await response.json();
        set({ users, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        });
      }
    },
  })
);
