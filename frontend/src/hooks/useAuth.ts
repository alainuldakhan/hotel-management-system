import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth, hasRole, isAdmin, isStaff } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setAuth(data.user, data.accessToken, data.refreshToken);
    return data.user;
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return { user, isAuthenticated, login, logout, hasRole, isAdmin, isStaff };
};
