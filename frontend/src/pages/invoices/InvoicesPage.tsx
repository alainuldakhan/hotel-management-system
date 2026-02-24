import { DollarOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { invoicesApi } from '../../api/invoices';
import { bookingsApi } from '../../api/bookings';
import type { InvoiceDto } from '../../types/api';
import { PaymentStatus } from '../../types/enums';

const { Title } = Typography;

const PAYMENT_METHODS = ['Наличные', 'Банковская карта', 'Онлайн-оплата', 'Банковский перевод'];

export function InvoicesPage() {
  const [msg, contextHolder] = message.useMessage();
  const [markPaidModal, setMarkPaidModal] = useState<{ id: string; invoiceNumber: string } | null>(null);
  const [generateModal, setGenerateModal] = useState(false);
  const [markForm] = Form.useForm();
  const [generateForm] = Form.useForm();

  // Fetch invoices from bookings (simplified: load all confirmed bookings and their invoices)
  // For simplicity, we show all from a specific booking or use a broader search
  const { data: bookings } = useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: () => bookingsApi.getAll({ pageSize: 100 }),
  });

  // We'll collect invoice IDs per booking - simplified implementation
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);

  const loadInvoicesForBooking = async (bookingId: string) => {
    try {
      const data = await invoicesApi.getByBooking(bookingId);
      setInvoices((prev) => {
        const existing = new Set(prev.map((i) => i.id));
        return [...prev, ...data.filter((i) => !existing.has(i.id))];
      });
    } catch {
      // Booking may not have invoices
    }
  };

  const generateMutation = useMutation({
    mutationFn: (values: { bookingId: string; notes?: string }) =>
      invoicesApi.generate(values.bookingId, values.notes),
    onSuccess: async (_result, variables) => {
      await loadInvoicesForBooking(variables.bookingId);
      setGenerateModal(false);
      generateForm.resetFields();
      msg.success(`Счёт создан`);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (values: { paymentMethod: string; notes?: string }) =>
      invoicesApi.markPaid(markPaidModal!.id, values.paymentMethod, values.notes),
    onSuccess: () => {
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === markPaidModal!.id ? { ...i, status: PaymentStatus.Paid } : i
        )
      );
      setMarkPaidModal(null);
      markForm.resetFields();
      msg.success('Счёт отмечен оплаченным');
    },
  });

  const columns: ColumnsType<InvoiceDto> = [
    { title: '№ счёта', dataIndex: 'invoiceNumber', key: 'invoiceNumber', width: 150 },
    { title: 'Гость', dataIndex: 'guestFullName', key: 'guestFullName' },
    { title: 'Номер', dataIndex: 'roomNumber', key: 'roomNumber', width: 90 },
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
      render: (s: PaymentStatus) => {
        const colors: Record<PaymentStatus, string> = {
          [PaymentStatus.Pending]: 'default',
          [PaymentStatus.Paid]: 'green',
          [PaymentStatus.PartiallyPaid]: 'orange',
          [PaymentStatus.Refunded]: 'cyan',
          [PaymentStatus.Failed]: 'red',
        };
        return <Tag color={colors[s]}>{s}</Tag>;
      },
    },
    {
      title: 'Способ оплаты',
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
      width: 110,
      render: (_, record) =>
        record.status === PaymentStatus.Pending ? (
          <Button
            size="small"
            icon={<DollarOutlined />}
            type="primary"
            onClick={() => {
              setMarkPaidModal({ id: record.id, invoiceNumber: record.invoiceNumber });
              markForm.resetFields();
            }}
          >
            Оплачен
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Счета
        </Title>
        <Button
          type="primary"
          onClick={() => {
            generateForm.resetFields();
            setGenerateModal(true);
          }}
        >
          Сгенерировать счёт
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={invoices}
        loading={false}
        pagination={{ pageSize: 20 }}
        size="middle"
        locale={{ emptyText: 'Загрузите счета через бронирования или создайте новый' }}
      />

      {/* Generate Invoice Modal */}
      <Modal
        title="Сгенерировать счёт"
        open={generateModal}
        onOk={() =>
          generateForm.validateFields().then((v) => generateMutation.mutate(v))
        }
        onCancel={() => setGenerateModal(false)}
        confirmLoading={generateMutation.isPending}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={generateForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="bookingId" label="Бронирование" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Выберите бронирование"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={
                bookings?.items?.map((b) => ({
                  value: b.id,
                  label: `${b.guestFullName} — №${b.roomNumber} (${dayjs(b.checkInDate).format('DD.MM.YYYY')})`,
                })) ?? []
              }
            />
          </Form.Item>
          <Form.Item name="notes" label="Заметки">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal
        title={`Отметить оплаченным: ${markPaidModal?.invoiceNumber}`}
        open={!!markPaidModal}
        onOk={() =>
          markForm.validateFields().then((v) => markPaidMutation.mutate(v))
        }
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
