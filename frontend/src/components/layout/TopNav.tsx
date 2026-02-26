import {
    BarChartOutlined,
    CalendarOutlined,
    ClearOutlined,
    HomeOutlined,
    LikeOutlined,
    SettingOutlined,
    TableOutlined,
    TeamOutlined,
    ToolOutlined,
    UnorderedListOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/enums';

export function TopNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isManagerOrAbove, hasRole } = useAuth();

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
            children: [
                {
                    key: '/bookings-list',
                    label: 'Список броней',
                    onClick: () => navigate('/bookings'),
                },
                {
                    key: '/bookings/new',
                    label: 'Новое бронирование',
                },
                ...(hasRole(UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin)
                    ? [{ key: '/bookings/grid', icon: <TableOutlined />, label: 'Шахматка' }]
                    : []),
            ],
        },
        {
            key: '/rooms',
            icon: <UnorderedListOutlined />,
            label: 'Номера',
            children: [
                { key: '/rooms', label: 'Все номера' },
                ...(isManagerOrAbove
                    ? [{ key: '/room-types', icon: <SettingOutlined />, label: 'Типы номеров' }]
                    : []),
            ],
        },
        {
            key: '/maintenance',
            icon: <ToolOutlined />,
            label: 'Обслуживание',
        },
        ...(hasRole(
            UserRole.HousekeepingStaff,
            UserRole.Receptionist,
            UserRole.Manager,
            UserRole.SuperAdmin
        )
            ? [{ key: '/housekeeping', icon: <ClearOutlined />, label: 'Уборка' }]
            : []),
        ...(hasRole(UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin)
            ? [{ key: '/invoices', icon: <UnorderedListOutlined />, label: 'Счета' }]
            : []),
        ...(isManagerOrAbove
            ? [
                {
                    key: 'management',
                    label: 'Управление',
                    icon: <BarChartOutlined />,
                    children: [
                        { key: '/analytics', icon: <BarChartOutlined />, label: 'Аналитика' },
                        { key: '/services', icon: <SettingOutlined />, label: 'Услуги' },
                        { key: '/reviews', icon: <LikeOutlined />, label: 'Отзывы' },
                        { key: '/users', icon: <TeamOutlined />, label: 'Сотрудники' },
                    ],
                },
            ]
            : []),
        {
            key: '/profile',
            icon: <UserOutlined />,
            label: 'Профиль',
        },
    ];

    const selectedKey =
        location.pathname === '/bookings/grid'
            ? '/bookings/grid'
            : '/' + location.pathname.split('/')[1];

    return (
        <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={({ key }) => {
                if (!key.startsWith('management') && key !== '/bookings-list') {
                    navigate(key);
                }
            }}
            style={{
                background: 'transparent',
                border: 'none',
                flex: 1,
                minWidth: 0,
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.85)',
            }}
            className="booking-nav"
            disabledOverflow
        />
    );
}
