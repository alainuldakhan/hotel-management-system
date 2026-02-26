import {
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Alert, Col, Row, Spin, Statistic, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: React.ReactNode;
  color?: string;
  accent?: string;
}

function StatCard({ title, value, suffix, prefix, color = '#1a1a2e', accent = '#0071c2' }: StatCardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,53,128,0.08)',
        borderTop: `4px solid ${accent}`,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: 'default',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,53,128,0.15)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,53,128,0.08)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <Statistic
        title={
          <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </span>
        }
        value={value}
        suffix={suffix}
        prefix={prefix ? <span style={{ color: accent, marginRight: 4, fontSize: 18 }}>{prefix}</span> : undefined}
        valueStyle={{ color, fontWeight: 800, fontSize: 28 }}
      />
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsApi.getDashboard,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return <Alert type="error" message="Не удалось загрузить данные дашборда" showIcon style={{ borderRadius: 8 }} />;
  }

  const stats = data!;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #003580 0%, #0071c2 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(0,53,128,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: '#ffffff', fontWeight: 800 }}>
            Добро пожаловать{user ? `, ${user.firstName}!` : '!'}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            Обзор отеля на сегодня — {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </div>
        <div
          style={{
            width: 72,
            height: 72,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" style={{ width: 38, height: 38 }}>
            <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 11v2M8 15v2M12 11v2M12 15v2M16 11v2M16 15v2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* KPI Section */}
      <Title level={5} style={{ marginBottom: 16, color: '#003580', fontWeight: 700 }}>
        Ключевые показатели
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={12} sm={8} lg={6}>
          <StatCard
            title="Загруженность"
            value={stats.occupancyPercent}
            suffix="%"
            prefix={<HomeOutlined />}
            color={stats.occupancyPercent > 70 ? '#008234' : '#0071c2'}
            accent={stats.occupancyPercent > 70 ? '#008234' : '#0071c2'}
          />
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <StatCard
            title="Активные брони"
            value={stats.activeBookings}
            prefix={<CalendarOutlined />}
            accent="#0071c2"
          />
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <StatCard
            title="Выручка сегодня"
            value={stats.revenueToday}
            suffix=" ₸"
            prefix={<DollarOutlined />}
            color="#008234"
            accent="#008234"
          />
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <StatCard
            title="Выручка за месяц"
            value={stats.revenueThisMonth}
            suffix=" ₸"
            prefix={<DollarOutlined />}
            color="#008234"
            accent="#FFB700"
          />
        </Col>
      </Row>

      {/* Today's Activity */}
      <Title level={5} style={{ marginTop: 28, marginBottom: 16, color: '#003580', fontWeight: 700 }}>
        Активность сегодня
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={12} sm={6}>
          <StatCard
            title="Бронирований"
            value={stats.bookingsToday}
            prefix={<CheckCircleOutlined />}
            accent="#0071c2"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Заселений"
            value={stats.checkInsToday}
            prefix={<LoginOutlined />}
            color="#0071c2"
            accent="#0071c2"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Выселений"
            value={stats.checkOutsToday}
            prefix={<LogoutOutlined />}
            accent="#6b7280"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Заявки на ремонт"
            value={stats.pendingMaintenanceRequests}
            prefix={<ToolOutlined />}
            color={stats.pendingMaintenanceRequests > 0 ? '#cc0000' : '#008234'}
            accent={stats.pendingMaintenanceRequests > 0 ? '#cc0000' : '#008234'}
          />
        </Col>
      </Row>

      {/* Room Status */}
      <Title level={5} style={{ marginTop: 28, marginBottom: 16, color: '#003580', fontWeight: 700 }}>
        Статус номеров
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={8} sm={5}>
          <StatCard
            title="Свободных"
            value={stats.totalRooms - stats.occupiedRooms}
            accent="#008234"
            color="#008234"
          />
        </Col>
        <Col xs={8} sm={5}>
          <StatCard
            title="Занятых"
            value={stats.occupiedRooms}
            accent="#cc0000"
            color="#cc0000"
          />
        </Col>
        <Col xs={8} sm={5}>
          <StatCard
            title="Всего номеров"
            value={stats.totalRooms}
            accent="#003580"
          />
        </Col>
      </Row>
    </div>
  );
}
