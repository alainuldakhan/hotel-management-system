import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../../api/bookings';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import type { BookingListItemDto } from '../../types/api';
import { BookingStatus } from '../../types/enums';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const BOOKING_STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: BookingStatus.Pending, label: 'Ожидает' },
  { value: BookingStatus.Confirmed, label: 'Подтверждено' },
  { value: BookingStatus.CheckedIn, label: 'Заселён' },
  { value: BookingStatus.CheckedOut, label: 'Выселен' },
  { value: BookingStatus.Cancelled, label: 'Отменено' },
  { value: BookingStatus.NoShow, label: 'Не явился' },
];

export function BookingsPage() {
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, search, statusFilter, dateRange],
    queryFn: () =>
      bookingsApi.getAll({
        page,
        pageSize: 20,
        searchTerm: search || undefined,
        status: statusFilter || undefined,
        checkInFrom: dateRange?.[0] ?? undefined,
        checkInTo: dateRange?.[1] ?? undefined,
      }),
  });

  const columns: ColumnsType<BookingListItemDto> = [
    { title: 'Номер', dataIndex: 'roomNumber', key: 'roomNumber', width: 90 },
    { title: 'Гость', dataIndex: 'guestFullName', key: 'guestFullName' },
    { title: 'Email', dataIndex: 'guestEmail', key: 'guestEmail', ellipsis: true },
    {
      title: 'Заезд',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      width: 110,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Выезд',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      width: 110,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    { title: 'Ночей', dataIndex: 'nightsCount', key: 'nightsCount', width: 80 },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: BookingStatus) => <BookingStatusBadge status={s} />,
    },
    {
      title: 'Оплата',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (s) => <PaymentStatusBadge status={s} />,
    },
    {
      title: 'Сумма',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => `${v.toLocaleString()} ₸`,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/bookings/${record.id}`);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Бронирования
        </Title>
        {isStaff && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/bookings/new')}
          >
            Новое бронирование
          </Button>
        )}
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Поиск по имени или email"
          allowClear
          style={{ width: 280 }}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          onChange={(e) => { if (!e.target.value) { setSearch(''); setPage(1); } }}
        />
        <Select
          style={{ width: 180 }}
          options={BOOKING_STATUS_OPTIONS}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />
        <RangePicker
          format="DD.MM.YYYY"
          placeholder={['Заезд от', 'Заезд до']}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([
                dates[0].format('YYYY-MM-DD'),
                dates[1].format('YYYY-MM-DD'),
              ]);
            } else {
              setDateRange(null);
            }
            setPage(1);
          }}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.totalCount ?? 0,
          onChange: setPage,
          showTotal: (total) => `Всего: ${total}`,
        }}
        size="middle"
        onRow={(record) => ({
          onClick: () => navigate(`/bookings/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
}
