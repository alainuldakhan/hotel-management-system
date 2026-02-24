import {
  CalendarOutlined,
  CheckCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  ToolOutlined,
  HomeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography, Spin, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics';

const { Title } = Typography;

export function DashboardPage() {
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
    return <Alert type="error" message="Не удалось загрузить данные дашборда" />;
  }

  const stats = data!;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        Обзор
      </Title>

      {/* Main KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Загруженность"
              value={stats.occupancyPercent}
              suffix="%"
              valueStyle={{ color: stats.occupancyPercent > 70 ? '#3f8600' : '#1677ff' }}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Активные брони"
              value={stats.activeBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Выручка сегодня"
              value={stats.revenueToday}
              prefix={<DollarOutlined />}
              suffix="₸"
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Выручка за месяц"
              value={stats.revenueThisMonth}
              prefix={<DollarOutlined />}
              suffix="₸"
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Today's activity */}
      <Title level={5} style={{ marginTop: 32, marginBottom: 16 }}>
        Сегодня
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Бронирований"
              value={stats.bookingsToday}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Заселений"
              value={stats.checkInsToday}
              prefix={<LoginOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Выселений"
              value={stats.checkOutsToday}
              prefix={<LogoutOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Заявки на ремонт"
              value={stats.pendingMaintenanceRequests}
              prefix={<ToolOutlined />}
              valueStyle={{
                color: stats.pendingMaintenanceRequests > 0 ? '#cf1322' : '#3f8600',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Room status */}
      <Title level={5} style={{ marginTop: 32, marginBottom: 16 }}>
        Статус номеров
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={8} sm={5}>
          <Card style={{ borderLeft: '4px solid #52c41a' }}>
            <Statistic title="Свободны" value={stats.totalRooms - stats.occupiedRooms} />
          </Card>
        </Col>
        <Col xs={8} sm={5}>
          <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Statistic title="Заняты" value={stats.occupiedRooms} />
          </Card>
        </Col>
        <Col xs={8} sm={5}>
          <Card style={{ borderLeft: '4px solid #1677ff' }}>
            <Statistic title="Всего" value={stats.totalRooms} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
