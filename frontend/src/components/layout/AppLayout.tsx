import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Space, Tooltip, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { roleLabels } from '../../utils/permissions';
import { TopNav } from './TopNav';

const { Header, Content } = Layout;
const { Text } = Typography;

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Мой профиль',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: logout,
    },
  ];

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '??';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Top Header ────────────────────────────────────────────── */}
      <Header
        style={{
          background: '#003580',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}
          >
            Roomy
          </span>
        </div>

        {/* Navigation */}
        <TopNav />

        {/* User area */}
        <Space size={12} style={{ flexShrink: 0 }}>
          <Tooltip title="Уведомления">
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />}
              style={{ padding: '4px 8px' }}
            />
          </Tooltip>

          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
                className="user-dropdown"
              >
                <Avatar
                  style={{
                    backgroundColor: '#0071c2',
                    border: '2px solid rgba(255,255,255,0.3)',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  size={34}
                >
                  {initials}
                </Avatar>
                <div style={{ lineHeight: 1.2 }}>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'block',
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: 11,
                      display: 'block',
                    }}
                  >
                    {roleLabels[user.role]}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          )}
        </Space>
      </Header>

      {/* ── Content ───────────────────────────────────────────────── */}
      <Content
        style={{
          background: '#f2f6fa',
          minHeight: 'calc(100vh - 60px)',
          padding: '24px',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
