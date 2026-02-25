import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  Spin,
  Statistic,
  Tag,
  Typography,
  message,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { profileApi, type UpdateProfilePayload } from '../../api/profile';
import { bookingsApi } from '../../api/bookings';

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
  const [form] = Form.useForm();
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

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {contextHolder}

      {/* ── Header Card ───────────────────────────────────────────── */}
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
              <Form
                form={form}
                layout="vertical"
                onFinish={(v) => updateMutation.mutate(v)}
              >
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
                  <Button icon={<CloseOutlined />} onClick={handleCancel}>
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
                <Statistic
                  title="Всего броней"
                  value={profile.totalBookings}
                  suffix="шт."
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Потрачено"
                  value={profile.totalSpent}
                  precision={0}
                  suffix="₸"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Recent Bookings (Guest only) ──────────────────────────── */}
      {profile.role === 'Guest' && myBookings && myBookings.length > 0 && (
        <Card title="История бронирований">
          <Descriptions column={1} size="small">
            {myBookings.slice(0, 5).map((b) => (
              <Descriptions.Item
                key={b.id}
                label={`№${b.roomNumber} (${b.roomTypeName})`}
              >
                {dayjs(b.checkInDate).format('DD.MM.YYYY')} —{' '}
                {dayjs(b.checkOutDate).format('DD.MM.YYYY')} ·{' '}
                {b.totalAmount.toLocaleString()} ₸
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}
    </div>
  );
}
