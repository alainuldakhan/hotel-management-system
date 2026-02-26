import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(values);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Неверный email или пароль';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#003580',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(0,113,194,0.3)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(0,113,194,0.2)',
          pointerEvents: 'none',
        }}
      />

      {/* Top brand bar */}
      <div
        style={{
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: '-0.5px',
          }}
        >
          Roomy
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            width: '100%',
            maxWidth: 420,
            overflow: 'hidden',
          }}
        >
          {/* Card header strip */}
          <div
            style={{
              background: 'linear-gradient(135deg, #003580 0%, #0071c2 100%)',
              padding: '28px 36px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>🏨</div>
            <Title level={3} style={{ margin: 0, color: '#ffffff', fontWeight: 800 }}>
              Добро пожаловать
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              Система управления гостиницей
            </Text>
          </div>

          {/* Form body */}
          <div style={{ padding: '32px 36px' }}>
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 20, borderRadius: 8 }}
                closable
                onClose={() => setError(null)}
              />
            )}

            <Form layout="vertical" onFinish={onFinish} size="large">
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 700, color: '#1a1a2e' }}>Email адрес</span>}
                rules={[
                  { required: true, message: 'Введите email' },
                  { type: 'email', message: 'Некорректный email' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#0071c2' }} />}
                  placeholder="your@email.com"
                  autoComplete="email"
                  style={{ borderRadius: 8, height: 46 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: 700, color: '#1a1a2e' }}>Пароль</span>}
                rules={[{ required: true, message: 'Введите пароль' }]}
                style={{ marginBottom: 24 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#0071c2' }} />}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ borderRadius: 8, height: 46 }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: '#0071c2',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 4px 12px rgba(0,113,194,0.4)',
                }}
              >
                Войти в систему
              </Button>
            </Form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
        © 2026 Roomy — Инновационная система управления гостиницей
      </div>
    </div>
  );
}
