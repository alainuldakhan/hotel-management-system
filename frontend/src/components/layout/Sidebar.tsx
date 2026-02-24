import {
  BarChartOutlined,
  CalendarOutlined,
  ClearOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/enums';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isManagerOrAbove, hasRole } = useAuth();

  const items: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/bookings',
      icon: <CalendarOutlined />,
      label: 'Бронирования',
    },
    {
      key: '/rooms',
      icon: <UnorderedListOutlined />,
      label: 'Номера',
    },
    ...(isManagerOrAbove
      ? [
          {
            key: '/room-types',
            icon: <SettingOutlined />,
            label: 'Типы номеров',
          },
        ]
      : []),
    {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: 'Обслуживание',
    },
    ...(hasRole(UserRole.HousekeepingStaff, UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin)
      ? [
          {
            key: '/housekeeping',
            icon: <ClearOutlined />,
            label: 'Уборка',
          },
        ]
      : []),
    ...(hasRole(UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin)
      ? [
          {
            key: '/invoices',
            icon: <UnorderedListOutlined />,
            label: 'Счета',
          },
        ]
      : []),
    ...(isManagerOrAbove
      ? [
          {
            key: '/services',
            icon: <SettingOutlined />,
            label: 'Услуги',
          },
          {
            key: '/analytics',
            icon: <BarChartOutlined />,
            label: 'Аналитика',
          },
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: 'Сотрудники',
          },
        ]
      : []),
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: user ? `${user.firstName} ${user.lastName}` : 'Профиль',
    },
  ];

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}
