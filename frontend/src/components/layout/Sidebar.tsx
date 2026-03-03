import { NavLink, useLocation } from 'react-router-dom';
import iconUrl from '../../assets/icon.png';
import {
  LayoutDashboard, CalendarDays, BedDouble, Users, Wrench,
  Sparkles, FileText, BarChart3, Star, ConciergeBell, Settings,
  ChevronRight, Building2, Tag, TrendingUp, Download,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/enums';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'ОСНОВНОЕ',
    items: [
      { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Дашборд' },
      { to: '/bookings', icon: <CalendarDays size={18} />, label: 'Бронирования' },
      { to: '/front-desk', icon: <ConciergeBell size={18} />, label: 'Ресепшен' },
    ],
  },
  {
    title: 'УПРАВЛЕНИЕ',
    items: [
      { to: '/rooms', icon: <BedDouble size={18} />, label: 'Номера', roles: [UserRole.Manager, UserRole.SuperAdmin, UserRole.Receptionist] },
      { to: '/room-types', icon: <Building2 size={18} />, label: 'Типы номеров', roles: [UserRole.Manager, UserRole.SuperAdmin] },
      { to: '/users', icon: <Users size={18} />, label: 'Гости', roles: [UserRole.Manager, UserRole.SuperAdmin, UserRole.Receptionist] },
      { to: '/services', icon: <Tag size={18} />, label: 'Услуги', roles: [UserRole.Manager, UserRole.SuperAdmin] },
      { to: '/pricing-rules', icon: <TrendingUp size={18} />, label: 'Тарифы', roles: [UserRole.Manager, UserRole.SuperAdmin] },
    ],
  },
  {
    title: 'ОПЕРАЦИИ',
    items: [
      { to: '/housekeeping', icon: <Sparkles size={18} />, label: 'Уборка' },
      { to: '/maintenance', icon: <Wrench size={18} />, label: 'Техобслуживание' },
      { to: '/invoices', icon: <FileText size={18} />, label: 'Счета' },
      { to: '/reviews', icon: <Star size={18} />, label: 'Отзывы' },
    ],
  },
  {
    title: 'АНАЛИТИКА',
    items: [
      { to: '/analytics', icon: <BarChart3 size={18} />, label: 'Аналитика', roles: [UserRole.Manager, UserRole.SuperAdmin] },
      { to: '/reports', icon: <Download size={18} />, label: 'Отчёты', roles: [UserRole.Manager, UserRole.SuperAdmin, UserRole.Receptionist] },
    ],
  },
  {
    title: 'АККАУНТ',
    items: [
      { to: '/profile', icon: <Settings size={18} />, label: 'Профиль' },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const canSee = (roles?: UserRole[]) => {
    if (!roles || !user) return true;
    return roles.includes(user.role as UserRole);
  };

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: '#0f172a',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={iconUrl} alt="Roomy" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Roomy</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canSee(item.roles));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title} style={{ marginBottom: 8 }}>
              <div style={{
                padding: '8px 20px 4px', fontSize: 10, fontWeight: 700,
                color: '#475569', letterSpacing: '0.08em',
              }}>
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 20px', textDecoration: 'none',
                      color: isActive ? '#fff' : '#94a3b8',
                      background: isActive ? '#3b82f6' : 'transparent',
                      fontSize: 13, fontWeight: 500,
                      transition: 'all 0.15s',
                      marginInline: 8, borderRadius: 8,
                    }}
                    onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.background = '#1e293b'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; } }}
                    onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8'; } }}
                  >
                    {item.icon}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && <ChevronRight size={14} />}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div style={{ padding: 16, borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#3b82f6', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </div>
              <div style={{ color: '#64748b', fontSize: 11 }}>{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
