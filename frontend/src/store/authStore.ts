import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfoDto } from '../types/api';
import { UserRole } from '../types/enums';

interface AuthState {
  user: UserInfoDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: UserInfoDto, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken && !!get().user,

      hasRole: (...roles: UserRole[]) => {
        const user = get().user;
        return !!user && roles.includes(user.role);
      },

      isStaff: () => {
        const user = get().user;
        if (!user) return false;
        return user.role !== UserRole.Guest;
      },
    }),
    {
      name: 'hms-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
