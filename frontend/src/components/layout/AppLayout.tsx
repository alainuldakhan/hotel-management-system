import {
  BankOutlined,
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
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          gap: 16,
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
            userSelect: 'none',
          }}
        >
          {/* Hotel icon */}
          <div
            style={{
              width: 32,
              height: 32,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BankOutlined style={{ fontSize: 17, color: '#FFB700' }} />
          </div>
          <div style={{ lineHeight: 1 }}>
            <span
              style={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: '-0.5px',
              }}
            >
              Roomy
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                background: '#FFB700',
                borderRadius: '50%',
                marginLeft: 2,
                marginBottom: 4,
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <TopNav />

        {/* User area */}
        <Space size={4} style={{ flexShrink: 0 }}>
          <Tooltip title="Уведомления" placement="bottom">
            <Button
              type="text"
              icon={
                <BellOutlined
                  style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}
                />
              }
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                transition: 'background 0.15s',
              }}
            />
          </Tooltip>

          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space
                size={10}
                style={{
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 8,
                  transition: 'background 0.15s',
                }}
                className="user-dropdown"
              >
                <Avatar
                  style={{
                    backgroundColor: '#0071c2',
                    border: '2px solid rgba(255,255,255,0.25)',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                  size={34}
                >
                  {initials}
                </Avatar>
                <div style={{ lineHeight: 1.25 }}>
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
                      color: 'rgba(255,255,255,0.55)',
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
          background: '#f0f4f8',
          minHeight: 'calc(100vh - 60px)',
          padding: '28px',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
