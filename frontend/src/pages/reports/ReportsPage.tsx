import { useEffect, useState } from 'react';
import { FileText, BarChart3, BedDouble, Download, Loader } from 'lucide-react';
import { reportsApi } from '../../api/reports';
import { invoicesApi } from '../../api/invoices';
import type { InvoiceDto } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const today = () => new Date().toISOString().split('T')[0];
const monthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invSearch, setInvSearch] = useState('');

  const [occDate, setOccDate] = useState(today());
  const [occLoading, setOccLoading] = useState(false);

  const [revFrom, setRevFrom] = useState(monthAgo());
  const [revTo, setRevTo] = useState(today());
  const [revGroupBy, setRevGroupBy] = useState('month');
  const [revLoading, setRevLoading] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvoices = async () => {
      setInvLoading(true);
      try {
        const { data } = await invoicesApi.getAll({ pageSize: 50 });
        setInvoices(data.items);
      } finally { setInvLoading(false); }
    };
    loadInvoices();
  }, []);

  const withErr = async (fn: () => Promise<void>) => {
    setError('');
    try { await fn(); }
    catch { setError('Ошибка генерации отчёта. Убедитесь, что сервер запущен.'); }
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(invSearch.toLowerCase()) ||
    inv.guestName.toLowerCase().includes(invSearch.toLowerCase())
  );

  const sectionTitle: React.CSSProperties = {
    fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  };
  const inp: React.CSSProperties = {
    padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff',
  };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <PageHeader title="Отчёты" subtitle="Скачайте PDF-отчёты по счетам, загрузке и выручке" />

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Invoice PDF */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={sectionTitle}><FileText size={16} color="#3b82f6" /> Счёт-фактура (PDF)</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          Скачайте PDF-версию конкретного счёта для отправки гостю.
        </p>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Поиск счёта</label>
          <input
            value={invSearch}
            onChange={(e) => setInvSearch(e.target.value)}
            style={{ ...inp, width: '100%' }}
            placeholder="Номер счёта или имя гостя..."
          />
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: 8 }}>
          {invLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Загрузка...</div>
          ) : filteredInvoices.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Счета не найдены</div>
          ) : filteredInvoices.map((inv) => (
            <div key={inv.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderBottom: '1px solid #f8fafc',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{inv.invoiceNumber}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{inv.guestName} · {formatDate(inv.issuedAt)} · {formatCurrency(inv.totalAmount)}</div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                icon={<Download size={13} />}
                onClick={() => withErr(() => reportsApi.downloadInvoice(inv.id, inv.invoiceNumber))}
              >
                PDF
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Occupancy */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={sectionTitle}><BedDouble size={16} color="#3b82f6" /> Загрузка за день (PDF)</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          Список заселённых гостей и незанятых номеров на выбранную дату.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <label style={lbl}>Дата</label>
            <input type="date" value={occDate} onChange={(e) => setOccDate(e.target.value)} style={inp} />
          </div>
          <Button
            icon={occLoading ? <Loader size={14} /> : <Download size={14} />}
            loading={occLoading}
            onClick={() => { setOccLoading(true); withErr(() => reportsApi.downloadDailyOccupancy(occDate)).finally(() => setOccLoading(false)); }}
          >
            Скачать отчёт
          </Button>
        </div>
      </Card>

      {/* Revenue Report */}
      <Card>
        <h3 style={sectionTitle}><BarChart3 size={16} color="#3b82f6" /> Отчёт по выручке (PDF)</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          Сводная выручка и количество бронирований за период с группировкой.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <label style={lbl}>От</label>
            <input type="date" value={revFrom} onChange={(e) => setRevFrom(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>До</label>
            <input type="date" value={revTo} onChange={(e) => setRevTo(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Группировка</label>
            <select value={revGroupBy} onChange={(e) => setRevGroupBy(e.target.value)} style={inp}>
              <option value="day">По дням</option>
              <option value="week">По неделям</option>
              <option value="month">По месяцам</option>
            </select>
          </div>
          <Button
            icon={revLoading ? <Loader size={14} /> : <Download size={14} />}
            loading={revLoading}
            onClick={() => { setRevLoading(true); withErr(() => reportsApi.downloadRevenue(revFrom, revTo, revGroupBy)).finally(() => setRevLoading(false)); }}
          >
            Скачать отчёт
          </Button>
        </div>
      </Card>
    </div>
  );
}
