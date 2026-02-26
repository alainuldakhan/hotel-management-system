import { DollarOutlined, FilePdfOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { invoicesApi } from '../../api/invoices';
import { bookingsApi } from '../../api/bookings';
import { reportsApi } from '../../api/reports';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge';
import type { BookingListItemDto, InvoiceDto } from '../../types/api';
import { BookingStatus, PaymentStatus } from '../../types/enums';

const { Title } = Typography;

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

// ── Expandable row: счета конкретного бронирования ──────────────────────────

function BookingInvoices({
  bookingId,
  onMarkPaid,
  onDownloadPdf,
  onGenerateInvoice,
}: {
  bookingId: string;
  onMarkPaid: (invoice: InvoiceDto) => void;
  onDownloadPdf: (invoice: InvoiceDto) => void;
  onGenerateInvoice: (bookingId: string) => void;
}) {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', 'booking', bookingId],
    queryFn: () => invoicesApi.getByBooking(bookingId),
  });

  const invoiceColumns: ColumnsType<InvoiceDto> = [
    { title: '№ счёта', dataIndex: 'invoiceNumber', key: 'invoiceNumber', width: 160 },
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
      title: 'Метод оплаты',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (v) => v ?? '—',
    },
    {
      title: 'Дата оплаты',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (v) => (v ? dayjs(v).format('DD.MM.YYYY') : '—'),
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space size={4}>
          {record.status === PaymentStatus.Pending && (
            <Button
              size="small"
              icon={<DollarOutlined />}
              type="primary"
              onClick={() => onMarkPaid(record)}
            >
              Оплачен
            </Button>
          )}
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => onDownloadPdf(record)}
          >
            PDF
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: '16px 24px' }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div style={{ background: '#fafafa', padding: '12px 16px', borderRadius: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span style={{ fontWeight: 600, color: '#555', fontSize: 13 }}>
          Счета{invoices.length > 0 ? ` (${invoices.length})` : ''}
        </span>
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onGenerateInvoice(bookingId)}
        >
          Создать счёт
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div style={{ color: '#999', fontSize: 13, padding: '6px 0' }}>Счетов нет</div>
      ) : (
        <Table
          rowKey="id"
          columns={invoiceColumns}
          dataSource={invoices}
          pagination={false}
          size="small"
        />
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const BOOKING_STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: BookingStatus.Confirmed, label: 'Подтверждено' },
  { value: BookingStatus.CheckedIn, label: 'Заселён' },
  { value: BookingStatus.CheckedOut, label: 'Выселен' },
];

export function InvoicesPage() {
  const [msg, contextHolder] = message.useMessage();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [markPaidModal, setMarkPaidModal] = useState<InvoiceDto | null>(null);
  const [generateBookingId, setGenerateBookingId] = useState<string | null>(null);

  const [markForm] = Form.useForm();
  const [generateForm] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings-for-invoices', page, search, statusFilter],
    queryFn: () =>
      bookingsApi.getAll({
        page,
        pageSize: 20,
        searchTerm: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const generateMutation = useMutation({
    mutationFn: (values: { notes?: string }) =>
      invoicesApi.generate(generateBookingId!, values.notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', 'booking', generateBookingId] });
      setGenerateBookingId(null);
      generateForm.resetFields();
      msg.success('Счёт создан');
    },
    onError: () => msg.error('Ошибка при создании счёта'),
  });

  const markPaidMutation = useMutation({
    mutationFn: (values: { paymentMethod: string; notes?: string }) =>
      invoicesApi.markPaid(markPaidModal!.id, values.paymentMethod, values.notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', 'booking', markPaidModal?.bookingId] });
      setMarkPaidModal(null);
      markForm.resetFields();
      msg.success('Счёт отмечен оплаченным');
    },
    onError: () => msg.error('Ошибка при обновлении'),
  });

  const handleDownloadPdf = async (invoice: InvoiceDto) => {
    try {
      await reportsApi.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } catch {
      msg.error('Ошибка скачивания PDF');
    }
  };

  const columns: ColumnsType<BookingListItemDto> = [
    { title: 'Номер', dataIndex: 'roomNumber', key: 'roomNumber', width: 90 },
    { title: 'Гость', dataIndex: 'guestFullName', key: 'guestFullName' },
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
  ];

  return (
    <div>
      {contextHolder}

      <Title level={4} style={{ margin: '0 0 16px' }}>
        Счета
      </Title>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Поиск по гостю или email"
          allowClear
          style={{ width: 280 }}
          onSearch={setSearch}
          onChange={(e) => !e.target.value && setSearch('')}
        />
        <Select
          style={{ width: 180 }}
          options={BOOKING_STATUS_OPTIONS}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
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
        expandable={{
          expandedRowRender: (record) => (
            <BookingInvoices
              bookingId={record.id}
              onMarkPaid={(invoice) => {
                setMarkPaidModal(invoice);
                markForm.resetFields();
              }}
              onDownloadPdf={handleDownloadPdf}
              onGenerateInvoice={(bookingId) => {
                generateForm.resetFields();
                setGenerateBookingId(bookingId);
              }}
            />
          ),
          rowExpandable: () => true,
        }}
      />

      {/* Generate Invoice Modal */}
      <Modal
        title="Создать счёт"
        open={!!generateBookingId}
        onOk={() => generateForm.validateFields().then((v) => generateMutation.mutate(v))}
        onCancel={() => setGenerateBookingId(null)}
        confirmLoading={generateMutation.isPending}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={generateForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="notes" label="Заметки (необязательно)">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Mark Paid Modal */}
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
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
