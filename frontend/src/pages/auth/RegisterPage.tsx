import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import iconUrl from '../../assets/icon.png';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await authApi.register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone || undefined, password: form.password,
      });
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/my-bookings');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1e293b', transition: 'border-color 0.15s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 };
  const focus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '36px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <img src={iconUrl} alt="Roomy" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>Roomy</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>Создать аккаунт</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Заполните данные для регистрации</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={labelStyle}>Имя</label><input name="firstName" required value={form.firstName} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="Имя" /></div>
            <div><label style={labelStyle}>Фамилия</label><input name="lastName" required value={form.lastName} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="Фамилия" /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email</label><input name="email" type="email" required value={form.email} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="user@mail.com" /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Телефон (необязательно)</label><input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="+7 700 000 0000" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div><label style={labelStyle}>Пароль</label><input name="password" type="password" required value={form.password} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="••••••••" /></div>
            <div><label style={labelStyle}>Подтверждение</label><input name="confirm" type="password" required value={form.confirm} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="••••••••" /></div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <UserPlus size={18} />
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}
