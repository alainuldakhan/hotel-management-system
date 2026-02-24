import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
  Spin,
  Alert,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingsApi } from '../../api/bookings';
import { invoicesApi } from '../../api/invoices';
import { servicesApi } from '../../api/additionalServices';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { BookingStatus } from '../../types/enums';

const { Title, Text } = Typography;

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const [msg, contextHolder] = message.useMessage();
  const [addServiceModal, setAddServiceModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [serviceForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();

  const isStaff = hasRole('Receptionist' as never, 'Manager' as never, 'SuperAdmin' as never);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsApi.getById(id!),
    enabled: !!id,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
    enabled: addServiceModal,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['bookings', id] });

  const confirmMutation = useMutation({
    mutationFn: () => bookingsApi.confirm(id!),
    onSuccess: () => { invalidate(); msg.success('Бронирование подтверждено'); },
  });

  const checkInMutation = useMutation({
    mutationFn: () => bookingsApi.checkIn(id!),
    onSuccess: () => { invalidate(); msg.success('Гость заселён'); },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => bookingsApi.checkOut(id!),
    onSuccess: () => { invalidate(); msg.success('Гость выселен'); },
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(id!),
    onSuccess: () => { invalidate(); setCancelModal(false); msg.success('Бронирование отменено'); },
  });

  const addServiceMutation = useMutation({
    mutationFn: (values: { serviceId: string; quantity: number }) =>
      bookingsApi.addService(id!, values.serviceId, values.quantity),
    onSuccess: () => {
      invalidate();
      setAddServiceModal(false);
      serviceForm.resetFields();
      msg.success('Услуга добавлена');
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (notes?: string) => invoicesApi.generate(id!, notes),
    onSuccess: () => {
      invalidate();
      setInvoiceModal(false);
      msg.success('Счёт сгенерирован');
    },
  });

  if (isLoading) return <Spin size="large" style={{ display: 'block', marginTop: 80 }} />;
  if (isError || !booking) return <Alert type="error" message="Бронирование не найдено" />;

  const canConfirm = isStaff && booking.status === BookingStatus.Pending;
  const canCheckIn = isStaff && booking.status === BookingStatus.Confirmed;
  const canCheckOut = isStaff && booking.status === BookingStatus.CheckedIn;
  const canCancel = booking.status === BookingStatus.Pending || booking.status === BookingStatus.Confirmed;
  const canAddService = isStaff && booking.status === BookingStatus.CheckedIn;
  const canGenerateInvoice = isStaff;

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/bookings')} />
        <Title level={4} style={{ margin: 0 }}>
          Бронирование
        </Title>
        <BookingStatusBadge status={booking.status} />
        <PaymentStatusBadge status={booking.paymentStatus} />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Информация о брони">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Номер комнаты">{booking.roomNumber}</Descriptions.Item>
              <Descriptions.Item label="Тип">{booking.roomTypeName}</Descriptions.Item>
              <Descriptions.Item label="Гость">{booking.guestFullName}</Descriptions.Item>
              <Descriptions.Item label="Email">{booking.guestEmail}</Descriptions.Item>
              {booking.guestPhone && (
                <Descriptions.Item label="Телефон">{booking.guestPhone}</Descriptions.Item>
              )}
              <Descriptions.Item label="Гостей">{booking.guestsCount}</Descriptions.Item>
              <Descriptions.Item label="Дата заезда">
                {dayjs(booking.checkInDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Дата выезда">
                {dayjs(booking.checkOutDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Ночей">{booking.nightsCount}</Descriptions.Item>
              <Descriptions.Item label="Сумма">
                <Text strong>{booking.totalAmount.toLocaleString()} ₸</Text>
              </Descriptions.Item>
              {booking.paidAmount != null && (
                <Descriptions.Item label="Оплачено">
                  {booking.paidAmount.toLocaleString()} ₸
                </Descriptions.Item>
              )}
              {booking.specialRequests && (
                <Descriptions.Item label="Пожелания" span={2}>
                  {booking.specialRequests}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {booking.services.length > 0 && (
            <Card title="Дополнительные услуги" style={{ marginTop: 16 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={booking.services}
                rowKey="serviceName"
                columns={[
                  { title: 'Услуга', dataIndex: 'serviceName' },
                  { title: 'Кол-во', dataIndex: 'quantity', width: 80 },
                  {
                    title: 'Цена',
                    dataIndex: 'unitPrice',
                    render: (v: number) => `${v.toLocaleString()} ₸`,
                  },
                  {
                    title: 'Итого',
                    dataIndex: 'totalPrice',
                    render: (v: number) => `${v.toLocaleString()} ₸`,
                  },
                ]}
              />
            </Card>
          )}
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Действия">
            <Space direction="vertical" style={{ width: '100%' }}>
              {canConfirm && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  block
                  loading={confirmMutation.isPending}
                  onClick={() => confirmMutation.mutate()}
                >
                  Подтвердить
                </Button>
              )}
              {canCheckIn && (
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  block
                  loading={checkInMutation.isPending}
                  onClick={() => checkInMutation.mutate()}
                >
                  Заселить гостя
                </Button>
              )}
              {canCheckOut && (
                <Button
                  icon={<LogoutOutlined />}
                  block
                  loading={checkOutMutation.isPending}
                  onClick={() => checkOutMutation.mutate()}
                >
                  Выселить гостя
                </Button>
              )}
              {canAddService && (
                <Button
                  icon={<PlusOutlined />}
                  block
                  onClick={() => setAddServiceModal(true)}
                >
                  Добавить услугу
                </Button>
              )}
              {canGenerateInvoice && (
                <Button block onClick={() => setInvoiceModal(true)}>
                  Сгенерировать счёт
                </Button>
              )}
              <Divider style={{ margin: '8px 0' }} />
              {canCancel && (
                <Button danger icon={<CloseOutlined />} block onClick={() => setCancelModal(true)}>
                  Отменить бронирование
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Add Service Modal */}
      <Modal
        title="Добавить услугу"
        open={addServiceModal}
        onOk={() =>
          serviceForm.validateFields().then((v) => addServiceMutation.mutate(v))
        }
        onCancel={() => setAddServiceModal(false)}
        confirmLoading={addServiceMutation.isPending}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Form form={serviceForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="serviceId" label="Услуга" rules={[{ required: true }]}>
            <Select
              options={services
                .filter((s) => s.isActive)
                .map((s) => ({
                  value: s.id,
                  label: `${s.name} — ${s.price.toLocaleString()} ₸`,
                }))}
              placeholder="Выберите услугу"
            />
          </Form.Item>
          <Form.Item name="quantity" label="Количество" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="Отменить бронирование?"
        open={cancelModal}
        onOk={() => cancelMutation.mutate()}
        onCancel={() => setCancelModal(false)}
        confirmLoading={cancelMutation.isPending}
        okText="Отменить бронь"
        okButtonProps={{ danger: true }}
        cancelText="Назад"
      >
        <p>Это действие нельзя отменить. Бронирование будет помечено как отменённое.</p>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        title="Сгенерировать счёт"
        open={invoiceModal}
        onOk={() =>
          invoiceForm.validateFields().then((v) => generateInvoiceMutation.mutate(v.notes))
        }
        onCancel={() => setInvoiceModal(false)}
        confirmLoading={generateInvoiceMutation.isPending}
        okText="Сгенерировать"
        cancelText="Отмена"
      >
        <Form form={invoiceForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="notes" label="Заметки (необязательно)">
            <textarea
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d9d9d9' }}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
