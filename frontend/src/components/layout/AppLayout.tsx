import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Дашборд',
  '/bookings': 'Бронирования',
  '/front-desk': 'Ресепшен',
  '/rooms': 'Номера',
  '/room-types': 'Типы номеров',
  '/users': 'Гости',
  '/services': 'Услуги',
  '/housekeeping': 'Уборка',
  '/maintenance': 'Техобслуживание',
  '/invoices': 'Счета',
  '/reviews': 'Отзывы',
  '/analytics': 'Аналитика',
  '/profile': 'Профиль',
};

export default function AppLayout() {
  const location = useLocation();
  const title = Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Roomy';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopNav title={title} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: '#f8fafc' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
