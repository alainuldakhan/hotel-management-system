import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import iconUrl from '../../assets/icon.png';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/enums';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === UserRole.Guest ? '/my-bookings' : '/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1e293b', transition: 'border-color 0.15s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 };
  const focus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '36px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <img src={iconUrl} alt="Roomy" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>Roomy</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>Вход в систему</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Введите ваши учётные данные</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@mail.com"
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 42 }} onFocus={focus} onBlur={blur}
              />
              <button
                type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                {showPwd ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: 12, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <LogIn size={18} />
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
