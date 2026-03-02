import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

interface Props {
  title: string;
}

export default function TopNav({ title }: Props) {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header style={{
      height: 60, background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
        <span style={{
          background: '#f1f5f9', color: '#64748b', fontSize: 11, padding: '2px 8px',
          borderRadius: 12, fontWeight: 500,
        }}>
          {new Date().toLocaleDateString('ru-KZ', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f1f5f9', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: '6px 12px', width: 220,
        }}>
          <Search size={14} color="#94a3b8" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: '#1e293b', width: '100%',
            }}
          />
        </div>

        {/* Bell */}
        <button style={{
          width: 36, height: 36, border: '1px solid #e2e8f0', borderRadius: 8,
          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={16} color="#64748b" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Выйти"
          style={{
            width: 36, height: 36, border: '1px solid #e2e8f0', borderRadius: 8,
            background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <LogOut size={16} color="#ef4444" />
        </button>
      </div>
    </header>
  );
}
