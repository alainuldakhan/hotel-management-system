import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, DollarSign } from 'lucide-react';
import { invoicesApi } from '../../api/invoices';
import type { InvoiceDto } from '../../types/api';
import { PaymentStatus } from '../../types/enums';
import { formatCurrency, formatDate } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const PAGE_SIZE = 15;

export default function InvoicesPage() {
  const [items, setItems] = useState<InvoiceDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [payItem, setPayItem] = useState<InvoiceDto | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await invoicesApi.getAll({ page, pageSize: PAGE_SIZE, status: statusFilter || undefined });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openPay = (inv: InvoiceDto) => {
    setPayItem(inv);
    setPayAmount(String(inv.remainingAmount));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payItem) return;
    setPaying(true);
    try { await invoicesApi.markPaid(payItem.id, parseFloat(payAmount)); setPayItem(null); load(); }
    finally { setPaying(false); }
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Номер счёта', render: (i: InvoiceDto) => <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{i.invoiceNumber}</span> },
    { key: 'guestName', header: 'Гость', render: (i: InvoiceDto) => <span style={{ fontWeight: 600 }}>{i.guestName}</span> },
    { key: 'roomNumber', header: 'Номер', render: (i: InvoiceDto) => `№${i.roomNumber}` },
    { key: 'totalAmount', header: 'Итого', render: (i: InvoiceDto) => <span style={{ fontWeight: 700 }}>{formatCurrency(i.totalAmount)}</span> },
    { key: 'paidAmount', header: 'Оплачено', render: (i: InvoiceDto) => <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatCurrency(i.paidAmount)}</span> },
    { key: 'remainingAmount', header: 'Остаток', render: (i: InvoiceDto) => (
      <span style={{ color: i.remainingAmount > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{formatCurrency(i.remainingAmount)}</span>
    )},
    { key: 'paymentStatus', header: 'Статус', render: (i: InvoiceDto) => <StatusBadge status={i.paymentStatus} /> },
    { key: 'issuedAt', header: 'Дата', render: (i: InvoiceDto) => formatDate(i.issuedAt) },
    { key: 'actions', header: '', render: (i: InvoiceDto) => (
      i.paymentStatus !== 'Paid' ? (
        <Button size="sm" icon={<DollarSign size={13} />} onClick={(e: React.MouseEvent) => { e.stopPropagation(); openPay(i); }}>
          Оплатить
        </Button>
      ) : null
    )},
  ];

  return (
    <div>
      <PageHeader title="Счета" subtitle="Управление платежами и задолженностями" />

      <Card style={{ marginBottom: 16 }} padding={12}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {['', ...Object.values(PaymentStatus)].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
              padding: '6px 14px', borderRadius: 20, border: `1px solid ${statusFilter === s ? '#3b82f6' : '#e2e8f0'}`,
              background: statusFilter === s ? '#3b82f6' : '#fff', color: statusFilter === s ? '#fff' : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {s || 'Все'}
            </button>
          ))}
          <Button variant="secondary" icon={<RefreshCw size={14} />} size="sm" onClick={load} style={{ marginLeft: 'auto' }}>Обновить</Button>
        </div>
      </Card>

      <Card padding={0}>
        <Table columns={columns} data={items} loading={loading} emptyText="Счета не найдены" />
      </Card>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <Modal open={!!payItem} onClose={() => setPayItem(null)} title={`Оплата: ${payItem?.invoiceNumber}`}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Гость</span>
            <span style={{ fontWeight: 600 }}>{payItem?.guestName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Итого</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(payItem?.totalAmount ?? 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Оплачено</span>
            <span style={{ fontWeight: 600, color: '#22c55e' }}>{formatCurrency(payItem?.paidAmount ?? 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #e2e8f0', fontSize: 14 }}>
            <span style={{ fontWeight: 700 }}>Остаток</span>
            <span style={{ fontWeight: 800, color: '#ef4444' }}>{formatCurrency(payItem?.remainingAmount ?? 0)}</span>
          </div>
        </div>
        <form onSubmit={handlePay}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Сумма к оплате *</label>
            <input
              type="number" required min={0.01} step={0.01} max={payItem?.remainingAmount}
              value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 700, outline: 'none', color: '#1e293b' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setPayItem(null)}>Отмена</Button>
            <Button type="submit" loading={paying} icon={<DollarSign size={15} />}>Принять оплату</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
