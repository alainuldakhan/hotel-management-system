import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ROLE_LABELS: Record<string, string> = {
  Guest: 'Гость', Receptionist: 'Ресепшионист', HousekeepingStaff: 'Персонал уборки',
  MaintenanceStaff: 'Технический персонал', Manager: 'Менеджер', SuperAdmin: 'Суперадмин',
};

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const { data } = await profileApi.update({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone || undefined });
      updateUser(data);
      setProfileMsg('Профиль успешно обновлён');
    } catch { setProfileMsg('Ошибка сохранения'); }
    finally { setSavingProfile(false); }
  };

  const handlePwdSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { setPwdError('Пароли не совпадают'); return; }
    setSavingPwd(true);
    setPwdMsg('');
    setPwdError('');
    try {
      await profileApi.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setPwdMsg('Пароль успешно изменён');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPwdError(msg || 'Ошибка смены пароля');
    } finally { setSavingPwd(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1e293b', transition: 'border-color 0.15s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 };
  const focus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <PageHeader title="Профиль" subtitle="Управление личными данными и безопасностью" />

      {/* Avatar row */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{user?.fullName}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{user?.email}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ padding: '3px 10px', background: '#eff6ff', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#1d4ed8' }}>
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </span>
              {user?.isDnr && <span style={{ marginLeft: 8, padding: '3px 10px', background: '#fef2f2', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#dc2626' }}>⚠ DNR</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={16} color="#3b82f6" /> Личные данные
        </h3>
        <form onSubmit={handleProfileSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Имя</label>
              <input value={profileForm.firstName} onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Фамилия</label>
              <input value={profileForm.lastName} onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input value={user?.email ?? ''} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Телефон</label>
            <input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="+7 700 000 0000" />
          </div>
          {profileMsg && <div style={{ fontSize: 13, color: '#22c55e', marginBottom: 12, fontWeight: 600 }}>✓ {profileMsg}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={savingProfile} icon={<Save size={15} />}>Сохранить</Button>
          </div>
        </form>
      </Card>

      {/* Password form */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} color="#3b82f6" /> Смена пароля
        </h3>
        <form onSubmit={handlePwdSave}>
          {pwdError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{pwdError}</div>}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Текущий пароль</label>
            <input type="password" required value={pwdForm.currentPassword} onChange={(e) => setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Новый пароль</label>
              <input type="password" required value={pwdForm.newPassword} onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Подтверждение</label>
              <input type="password" required value={pwdForm.confirm} onChange={(e) => setPwdForm((f) => ({ ...f, confirm: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          {pwdMsg && <div style={{ fontSize: 13, color: '#22c55e', marginBottom: 12, fontWeight: 600 }}>✓ {pwdMsg}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={savingPwd} icon={<Lock size={15} />}>Изменить пароль</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
