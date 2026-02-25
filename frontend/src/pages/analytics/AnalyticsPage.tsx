import { Button, Card, Col, DatePicker, Row, Select, Space, Spin, Table, Typography, message } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsApi } from '../../api/analytics';
import { reportsApi } from '../../api/reports';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

export function AnalyticsPage() {
  const [msg, contextHolder] = message.useMessage();
  const [revenueRange, setRevenueRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs(),
  ]);
  const [groupBy, setGroupBy] = useState<'month' | 'week' | 'day'>('month');
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const handleDownload = async (type: 'revenue' | 'daily') => {
    setPdfLoading(type);
    try {
      if (type === 'revenue') {
        await reportsApi.downloadRevenueReport(
          revenueRange[0].format('YYYY-MM-DD'),
          revenueRange[1].format('YYYY-MM-DD'),
          groupBy,
        );
      } else {
        await reportsApi.downloadDailyOccupancyReport(dayjs().format('YYYY-MM-DD'));
      }
    } catch {
      msg.error('Ошибка при генерации PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  const { data: revenue = [], isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue', revenueRange, groupBy],
    queryFn: () =>
      analyticsApi.getRevenue(
        revenueRange[0].format('YYYY-MM-DD'),
        revenueRange[1].format('YYYY-MM-DD'),
        groupBy
      ),
  });

  const { data: occupancy = [], isLoading: occupancyLoading } = useQuery({
    queryKey: ['analytics-occupancy'],
    queryFn: () => analyticsApi.getOccupancyByRoomType(),
  });

  const { data: topGuests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['analytics-top-guests'],
    queryFn: () => analyticsApi.getTopGuests(10),
  });

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Аналитика
        </Title>
        <Space>
          <Button
            icon={<FilePdfOutlined />}
            loading={pdfLoading === 'daily'}
            onClick={() => handleDownload('daily')}
          >
            Отчёт за сегодня
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            loading={pdfLoading === 'revenue'}
            onClick={() => handleDownload('revenue')}
          >
            Экспорт выручки
          </Button>
        </Space>
      </div>

      {/* Revenue Chart */}
      <Card
        title="Выручка по периодам"
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Select
              value={groupBy}
              onChange={setGroupBy}
              style={{ width: 120 }}
              options={[
                { value: 'day', label: 'По дням' },
                { value: 'week', label: 'По неделям' },
                { value: 'month', label: 'По месяцам' },
              ]}
            />
            <RangePicker
              value={revenueRange}
              onChange={(v) => v && setRevenueRange(v as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD.MM.YYYY"
            />
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        {revenueLoading ? (
          <Spin />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString()} ₸`, 'Выручка']}
              />
              <Legend />
              <Bar dataKey="revenue" name="Выручка (₸)" fill="#1677ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bookingsCount" name="Бронирований" fill="#52c41a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Row gutter={[16, 16]}>
        {/* Occupancy by Room Type */}
        <Col xs={24} lg={12}>
          <Card title="Загруженность по типам номеров">
            {occupancyLoading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={occupancy}
                    dataKey="averageOccupancyPercent"
                    nameKey="roomTypeName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) =>
                      `${entry.name}: ${Number(entry.value).toFixed(0)}%`
                    }
                  >
                    {occupancy.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Загруженность']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Room Type Revenue */}
        <Col xs={24} lg={12}>
          <Card title="Выручка по типам номеров">
            {occupancyLoading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={occupancy} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="roomTypeName" width={90} />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} ₸`, 'Выручка']} />
                  <Bar dataKey="totalRevenue" name="Выручка" fill="#722ed1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Guests */}
      <Card title="Топ гостей" style={{ marginTop: 16 }}>
        <Table
          rowKey="guestId"
          loading={guestsLoading}
          pagination={false}
          size="middle"
          dataSource={topGuests}
          columns={[
            { title: '#', key: 'index', render: (_, __, i) => i + 1, width: 50 },
            { title: 'Гость', dataIndex: 'fullName', key: 'fullName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Броней', dataIndex: 'totalBookings', key: 'totalBookings', width: 90 },
            { title: 'Ночей', dataIndex: 'totalNights', key: 'totalNights', width: 90 },
            {
              title: 'Потрачено',
              dataIndex: 'totalSpent',
              key: 'totalSpent',
              render: (v: number) => `${v.toLocaleString()} ₸`,
            },
            {
              title: 'Последний визит',
              dataIndex: 'lastVisit',
              key: 'lastVisit',
              render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
            },
          ]}
        />
      </Card>
    </div>
  );
}
