import {
  CalendarOutlined,
  CloseOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Rate,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { profileApi, type UpdateProfilePayload } from '../../api/profile';
import { bookingsApi } from '../../api/bookings';
import { reviewsApi, type CreateReviewPayload } from '../../api/reviews';
import { BookingStatusBadge } from '../../components/common/StatusBadge';
import type { BookingListItemDto } from '../../types/api';
import { BookingStatus } from '../../types/enums';

const { Title, Text } = Typography;

const ROLE_LABELS: Record<string, string> = {
  Guest: 'Гость',
  Receptionist: 'Ресепшн',
  HousekeepingStaff: 'Горничная',
  MaintenanceStaff: 'Техник',
  Manager: 'Менеджер',
  SuperAdmin: 'Администратор',
};

const ROLE_COLORS: Record<string, string> = {
  Guest: 'default',
  Receptionist: 'blue',
  HousekeepingStaff: 'purple',
  MaintenanceStaff: 'orange',
  Manager: 'green',
  SuperAdmin: 'red',
};

export function ProfilePage() {
  const [msg, contextHolder] = message.useMessage();
  const [editing, setEditing] = useState(false);
  const [reviewModal, setReviewModal] = useState<BookingListItemDto | null>(null);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  const { data: myBookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMy(),
    enabled: profile?.role === 'Guest',
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateProfilePayload) => profileApi.updateProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditing(false);
      msg.success('Профиль обновлён');
    },
    onError: () => msg.error('Ошибка сохранения'),
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.create(payload),
    onSuccess: () => {
      setReviewModal(null);
      reviewForm.resetFields();
      msg.success('Отзыв опубликован. Спасибо!');
    },
    onError: () => msg.error('Не удалось опубликовать отзыв'),
  });

  if (isLoading || !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  const handleEdit = () => {
    form.setFieldsValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber ?? '',
    });
    setEditing(true);
  };

  const bookingColumns: ColumnsType<BookingListItemDto> = [
    {
      title: 'Номер',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      width: 90,
      render: (v: string) => `№${v}`,
    },
    { title: 'Тип', dataIndex: 'roomTypeName', key: 'roomTypeName' },
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
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: BookingStatus) => <BookingStatusBadge status={s} />,
    },
    {
      title: 'Сумма',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => `${v.toLocaleString()} ₸`,
    },
    {
      title: '',
      key: 'review',
      width: 120,
      render: (_, record) =>
        record.status === BookingStatus.CheckedOut ? (
          <Button
            size="small"
            icon={<StarOutlined />}
            onClick={() => {
              reviewForm.resetFields();
              setReviewModal(record);
            }}
          >
            Отзыв
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {contextHolder}

      {/* ── Header Card ─────────────────────────────────────────── */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar size={80} style={{ background: '#1677ff', fontSize: 28, fontWeight: 700 }}>
              {initials}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>
              {profile.firstName} {profile.lastName}
            </Title>
            <Text type="secondary">
              <MailOutlined style={{ marginRight: 6 }} />
              {profile.email}
            </Text>
            <br />
            <Tag color={ROLE_COLORS[profile.role] ?? 'default'} style={{ marginTop: 8 }}>
              {ROLE_LABELS[profile.role] ?? profile.role}
            </Tag>
          </Col>
          <Col>
            {!editing && (
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                Редактировать
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        {/* ── Left: Profile Details / Edit Form ─────────────────── */}
        <Col xs={24} md={14}>
          <Card title="Личные данные" style={{ marginBottom: 24 }}>
            {editing ? (
              <Form form={form} layout="vertical" onFinish={(v) => updateMutation.mutate(v)}>
                <Form.Item name="firstName" label="Имя" rules={[{ required: true }]}>
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item name="lastName" label="Фамилия" rules={[{ required: true }]}>
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Телефон">
                  <Input prefix={<PhoneOutlined />} placeholder="+7 (000) 000-00-00" />
                </Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={updateMutation.isPending}
                  >
                    Сохранить
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => { setEditing(false); form.resetFields(); }}
                  >
                    Отмена
                  </Button>
                </div>
              </Form>
            ) : (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Имя">{profile.firstName}</Descriptions.Item>
                <Descriptions.Item label="Фамилия">{profile.lastName}</Descriptions.Item>
                <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                <Descriptions.Item label="Телефон">
                  {profile.phoneNumber ?? <Text type="secondary">—</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Дата регистрации">
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {dayjs(profile.createdAt).format('DD.MM.YYYY')}
                </Descriptions.Item>
                {profile.lastBookingDate && (
                  <Descriptions.Item label="Последнее бронирование">
                    {dayjs(profile.lastBookingDate).format('DD.MM.YYYY')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}
          </Card>
        </Col>

        {/* ── Right: Stats ──────────────────────────────────────── */}
        <Col xs={24} md={10}>
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Всего броней" value={profile.totalBookings} suffix="шт." />
              </Col>
              <Col span={12}>
                <Statistic title="Потрачено" value={profile.totalSpent} precision={0} suffix="₸" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Booking History (Guest only) ─────────────────────────── */}
      {profile.role === 'Guest' && myBookings && myBookings.length > 0 && (
        <Card
          title="История бронирований"
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Нажмите «Отзыв» для выселенных бронирований
            </Text>
          }
        >
          <Table
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10, showTotal: (t) => `Всего: ${t}` }}
            dataSource={myBookings}
            columns={bookingColumns}
          />
        </Card>
      )}

      {/* ── Review Modal ─────────────────────────────────────────── */}
      <Modal
        title={
          reviewModal
            ? `Отзыв — №${reviewModal.roomNumber} (${reviewModal.roomTypeName})`
            : 'Оставить отзыв'
        }
        open={!!reviewModal}
        onOk={() =>
          reviewForm.validateFields().then((v) =>
            createReviewMutation.mutate({
              bookingId: reviewModal!.id,
              rating: v.rating,
              comment: v.comment,
            })
          )
        }
        onCancel={() => setReviewModal(null)}
        confirmLoading={createReviewMutation.isPending}
        okText="Опубликовать"
        cancelText="Отмена"
      >
        <Form form={reviewForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="rating"
            label="Оценка"
            rules={[{ required: true, message: 'Пожалуйста, поставьте оценку' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Комментарий (необязательно)">
            <Input.TextArea
              rows={4}
              placeholder="Расскажите о вашем пребывании..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
