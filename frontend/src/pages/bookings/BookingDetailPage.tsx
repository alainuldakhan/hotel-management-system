import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DollarOutlined,
  FilePdfOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import {
  Alert,
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
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingsApi } from '../../api/bookings';
import { invoicesApi } from '../../api/invoices';
import { reportsApi } from '../../api/reports';
import { servicesApi } from '../../api/additionalServices';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import type { InvoiceDto } from '../../types/api';
import { BookingStatus, PaymentStatus } from '../../types/enums';

const { Title, Text } = Typography;

const PAYMENT_METHODS = ['Наличные', 'Банковская карта', 'Онлайн-оплата', 'Банковский перевод'];

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Ожидает',
  Paid: 'Оплачен',
  PartiallyPaid: 'Частично',
  Refunded: 'Возврат',
  Failed: 'Ошибка',
};
const STATUS_COLORS: Record<string, string> = {
  Pending: 'orange',
  Paid: 'green',
  PartiallyPaid: 'gold',
  Refunded: 'cyan',
  Failed: 'red',
};

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const [msg, contextHolder] = message.useMessage();

  const [addServiceModal, setAddServiceModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState<InvoiceDto | null>(null);
  const [qrModal, setQrModal] = useState(false);

  const [serviceForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();
  const [markForm] = Form.useForm();

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

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', 'booking', id],
    queryFn: () => invoicesApi.getByBooking(id!),
    enabled: !!id && isStaff,
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
      qc.invalidateQueries({ queryKey: ['invoices', 'booking', id] });
      setInvoiceModal(false);
      msg.success('Счёт сгенерирован');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (values: { paymentMethod: string; notes?: string }) =>
      invoicesApi.markPaid(markPaidModal!.id, values.paymentMethod, values.notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', 'booking', id] });
      setMarkPaidModal(null);
      markForm.resetFields();
      msg.success('Счёт отмечен оплаченным');
    },
  });

  const handleDownloadPdf = async (invoice: InvoiceDto) => {
    try {
      await reportsApi.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } catch {
      msg.error('Ошибка скачивания PDF');
    }
  };

  if (isLoading) return <Spin size="large" style={{ display: 'block', marginTop: 80 }} />;
  if (isError || !booking) return <Alert type="error" message="Бронирование не найдено" />;

  const canConfirm = isStaff && booking.status === BookingStatus.Pending;
  const canCheckIn = isStaff && booking.status === BookingStatus.Confirmed;
  const canCheckOut = isStaff && booking.status === BookingStatus.CheckedIn;
  const canCancel = booking.status === BookingStatus.Pending || booking.status === BookingStatus.Confirmed;
  const canAddService = isStaff && booking.status === BookingStatus.CheckedIn;
  const canGenerateInvoice = isStaff;

  const invoiceColumns = [
    { title: '№ счёта', dataIndex: 'invoiceNumber', key: 'invoiceNumber', width: 150 },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `${v.toLocaleString()} ₸`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: PaymentStatus) => (
        <Tag color={STATUS_COLORS[s]}>{STATUS_LABELS[s] ?? s}</Tag>
      ),
    },
    {
      title: 'Метод',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: InvoiceDto) => (
        <Space size={4}>
          {record.status === PaymentStatus.Pending && (
            <Button
              size="small"
              icon={<DollarOutlined />}
              type="primary"
              onClick={() => { setMarkPaidModal(record); markForm.resetFields(); }}
            >
              Оплачен
            </Button>
          )}
          <Button size="small" icon={<FilePdfOutlined />} onClick={() => handleDownloadPdf(record)}>
            PDF
          </Button>
        </Space>
      ),
    },
  ];

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
        {/* ── Left: Info + Services + Invoices ─────────────────── */}
        <Col xs={24} lg={15}>
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
              {booking.actualCheckIn && (
                <Descriptions.Item label="Факт. заезд">
                  {dayjs(booking.actualCheckIn).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              )}
              {booking.actualCheckOut && (
                <Descriptions.Item label="Факт. выезд">
                  {dayjs(booking.actualCheckOut).format('DD.MM.YYYY HH:mm')}
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

          {/* ── Счета ───────────────────────────────────────────── */}
          {isStaff && (
            <Card
              title="Счета"
              style={{ marginTop: 16 }}
              extra={
                canGenerateInvoice && (
                  <Button size="small" icon={<PlusOutlined />} onClick={() => setInvoiceModal(true)}>
                    Создать счёт
                  </Button>
                )
              }
            >
              {invoicesLoading ? (
                <Spin size="small" />
              ) : invoices.length === 0 ? (
                <Text type="secondary">Счетов нет</Text>
              ) : (
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={invoices}
                  columns={invoiceColumns}
                />
              )}
            </Card>
          )}
        </Col>

        {/* ── Right: Actions + QR ──────────────────────────────── */}
        <Col xs={24} lg={9}>
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
              {booking.qrCodeToken && isStaff && (
                <Button
                  icon={<QrcodeOutlined />}
                  block
                  onClick={() => setQrModal(true)}
                >
                  QR-код заезда
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

          {/* QR Token info card (if available) */}
          {booking.qrCodeToken && (
            <Card
              size="small"
              style={{ marginTop: 12, background: '#f0f9ff', border: '1px solid #bae6fd' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <QrcodeOutlined style={{ color: '#0284c7', fontSize: 16 }} />
                <Text style={{ fontWeight: 600, color: '#0284c7', fontSize: 13 }}>
                  QR-токен заезда
                </Text>
              </div>
              <Text
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: '#374151',
                  wordBreak: 'break-all',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                {booking.qrCodeToken}
              </Text>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(booking.qrCodeToken!);
                  msg.success('Токен скопирован');
                }}
              >
                Копировать
              </Button>
            </Card>
          )}
        </Col>
      </Row>

      {/* ── QR Modal ─────────────────────────────────────────────────────────── */}
      <Modal
        title="QR-код для заезда"
        open={qrModal}
        onCancel={() => setQrModal(false)}
        footer={
          <Button onClick={() => setQrModal(false)}>Закрыть</Button>
        }
        centered
      >
        {booking.qrCodeToken && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(booking.qrCodeToken)}`}
              alt="QR Code"
              style={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <div style={{ marginTop: 16, fontSize: 13, color: '#6b7280' }}>
              Гость сканирует код для самостоятельного заезда
            </div>
            <Text
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#9ca3af',
                display: 'block',
                marginTop: 8,
                wordBreak: 'break-all',
              }}
            >
              {booking.qrCodeToken}
            </Text>
          </div>
        )}
      </Modal>

      {/* ── Add Service Modal ─────────────────────────────────────────────────── */}
      <Modal
        title="Добавить услугу"
        open={addServiceModal}
        onOk={() => serviceForm.validateFields().then((v) => addServiceMutation.mutate(v))}
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

      {/* ── Cancel Modal ─────────────────────────────────────────────────────── */}
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

      {/* ── Invoice Modal ─────────────────────────────────────────────────────── */}
      <Modal
        title="Создать счёт"
        open={invoiceModal}
        onOk={() =>
          invoiceForm.validateFields().then((v) => generateInvoiceMutation.mutate(v.notes))
        }
        onCancel={() => setInvoiceModal(false)}
        confirmLoading={generateInvoiceMutation.isPending}
        okText="Создать"
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

      {/* ── Mark Paid Modal ───────────────────────────────────────────────────── */}
      <Modal
        title={`Оплата счёта: ${markPaidModal?.invoiceNumber}`}
        open={!!markPaidModal}
        onOk={() => markForm.validateFields().then((v) => markPaidMutation.mutate(v))}
        onCancel={() => setMarkPaidModal(null)}
        confirmLoading={markPaidMutation.isPending}
        okText="Подтвердить"
        cancelText="Отмена"
      >
        <Form form={markForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="paymentMethod" label="Способ оплаты" rules={[{ required: true }]}>
            <Select
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
              placeholder="Выберите способ"
            />
          </Form.Item>
          <Form.Item name="notes" label="Заметки">
            <textarea
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d9d9d9' }}
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
