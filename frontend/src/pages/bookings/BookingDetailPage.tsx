import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, LogOut, XCircle, FileText, Plus, Trash2, CreditCard } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import { invoicesApi } from '../../api/invoices';
import { paymentsApi } from '../../api/payments';
import { servicesApi } from '../../api/additionalServices';
import type { BookingDto, InvoiceDto, PaymentDto, AdditionalServiceDto } from '../../types/api';
import { BookingStatus, PaymentMethod } from '../../types/enums';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const METHOD_LABELS: Record<string, string> = {
  Cash: 'Наличные', Card: 'Карта', BankTransfer: 'Перевод', Online: 'Онлайн',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [allServices, setAllServices] = useState<AdditionalServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  // Cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Add service modal
  const [addSvcOpen, setAddSvcOpen] = useState(false);
  const [svcId, setSvcId] = useState('');
  const [svcQty, setSvcQty] = useState('1');
  const [svcAdding, setSvcAdding] = useState(false);
  const [svcError, setSvcError] = useState('');

  // Remove service confirm
  const [removeSvcId, setRemoveSvcId] = useState<string | null>(null);
  const [svcRemoving, setSvcRemoving] = useState(false);

  // Add payment modal
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: PaymentMethod.Cash, reference: '', notes: '' });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      const [b, invs, pmnts, svcs] = await Promise.all([
        bookingsApi.getById(id),
        invoicesApi.getByBooking(id),
        paymentsApi.getByBooking(id),
        servicesApi.getAll(),
      ]);
      setBooking(b.data);
      setInvoice(invs.data[0] ?? null);
      setPayments(pmnts.data);
      setAllServices(svcs.data.filter((s) => s.isActive));
    } catch { setError('Не удалось загрузить бронирование'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>) => {
    setActing(true);
    try { await fn(); await load(); } finally { setActing(false); }
  };

  const handleConfirm = () => act(() => bookingsApi.confirm(id!));
  const handleCheckIn = () => act(() => bookingsApi.checkIn(id!));
  const handleCheckOut = () => act(() => bookingsApi.checkOut(id!));
  const handleCancel = async () => {
    setActing(true);
    try { await bookingsApi.cancel(id!, cancelReason); setCancelOpen(false); await load(); }
    finally { setActing(false); }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcId) return;
    setSvcAdding(true);
    setSvcError('');
    try {
      await bookingsApi.addService(id!, svcId, parseInt(svcQty));
      setAddSvcOpen(false);
      setSvcId('');
      setSvcQty('1');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSvcError(msg || 'Ошибка добавления услуги');
    } finally { setSvcAdding(false); }
  };

  const handleRemoveService = async () => {
    if (!removeSvcId) return;
    setSvcRemoving(true);
    try { await bookingsApi.removeService(id!, removeSvcId); setRemoveSvcId(null); load(); }
    finally { setSvcRemoving(false); }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setPayError('');
    try {
      await paymentsApi.create({
        bookingId: id!,
        amount: parseFloat(payForm.amount),
        method: payForm.method,
        invoiceId: invoice?.id,
        reference: payForm.reference || undefined,
        notes: payForm.notes || undefined,
      });
      setPayOpen(false);
      setPayForm({ amount: '', method: PaymentMethod.Cash, reference: '', notes: '' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPayError(msg || 'Ошибка записи платежа');
    } finally { setPaying(false); }
  };

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Загрузка...</div>;
  if (error || !booking) return <div style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>{error || 'Бронирование не найдено'}</div>;

  const canManageServices = [BookingStatus.Confirmed, BookingStatus.CheckedIn].includes(booking.status);
  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 };

  const rows: [string, string | number][] = [
    ['Гость', booking.guestFullName],
    ['Email', booking.guestEmail],
    ['Номер', `№${booking.roomNumber} (${booking.roomTypeName})`],
    ['Заезд', formatDate(booking.checkInDate)],
    ['Выезд', formatDate(booking.checkOutDate)],
    ['Ночей', booking.nightsCount],
    ['Создано', formatDateTime(booking.createdAt)],
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate('/bookings')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Назад к бронированиям
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{booking.guestFullName}</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>№{booking.roomNumber} · {booking.roomTypeName} · {booking.nightsCount} ночей</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StatusBadge status={booking.status} />
          {booking.status === BookingStatus.Pending && (
            <Button icon={<CheckCircle size={15} />} onClick={handleConfirm} loading={acting}>Подтвердить</Button>
          )}
          {booking.status === BookingStatus.Confirmed && (
            <Button icon={<CheckCircle size={15} />} onClick={handleCheckIn} loading={acting}>Заселить</Button>
          )}
          {booking.status === BookingStatus.CheckedIn && (
            <Button icon={<LogOut size={15} />} onClick={handleCheckOut} loading={acting}>Выселить</Button>
          )}
          {[BookingStatus.Pending, BookingStatus.Confirmed].includes(booking.status) && (
            <Button variant="danger" icon={<XCircle size={15} />} onClick={() => setCancelOpen(true)}>Отменить</Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} color="#3b82f6" /> Детали бронирования
            </h3>
            {rows.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{value}</span>
              </div>
            ))}
            {booking.notes && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#475569' }}>
                📝 {booking.notes}
              </div>
            )}
          </Card>

          {/* Payments */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <CreditCard size={16} color="#3b82f6" /> Платежи
              </h3>
              {[BookingStatus.Confirmed, BookingStatus.CheckedIn, BookingStatus.CheckedOut].includes(booking.status) && (
                <Button size="sm" icon={<Plus size={13} />} onClick={() => { setPayForm({ amount: String(invoice?.remainingAmount ?? booking.totalAmount), method: PaymentMethod.Cash, reference: '', notes: '' }); setPayError(''); setPayOpen(true); }}>
                  Принять оплату
                </Button>
              )}
            </div>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>Платежей нет</div>
            ) : payments.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(p.amount)}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {METHOD_LABELS[p.method] ?? p.method}
                    {p.reference && ` · ${p.reference}`}
                    {p.receivedByName && ` · ${p.receivedByName}`}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'right' }}>
                  {formatDateTime(p.receivedAt)}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Финансы</h3>
            {[
              ['Общая сумма', formatCurrency(booking.totalAmount)],
              ['Оплачено', formatCurrency(invoice?.paidAmount ?? 0)],
              ['Остаток', formatCurrency(invoice?.remainingAmount ?? booking.totalAmount)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{value}</span>
              </div>
            ))}
            {invoice && <div style={{ marginTop: 10 }}><StatusBadge status={invoice.paymentStatus} /></div>}
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>Услуги</h3>
              {canManageServices && (
                <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={() => { setSvcId(''); setSvcQty('1'); setSvcError(''); setAddSvcOpen(true); }}>
                  Добавить
                </Button>
              )}
            </div>
            {(booking.services ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>Нет дополнительных услуг</div>
            ) : (booking.services ?? []).map((s) => (
              <div key={s.serviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 }}>
                <div>
                  <span style={{ color: '#475569', fontWeight: 500 }}>{s.serviceName}</span>
                  <span style={{ color: '#94a3b8', marginLeft: 6 }}>×{s.quantity}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(s.price * s.quantity)}</span>
                  {canManageServices && (
                    <button onClick={() => setRemoveSvcId(s.serviceId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Cancel modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Отмена бронирования">
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Укажите причину отмены (необязательно)</p>
        <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', height: 80, resize: 'vertical', marginBottom: 16 }}
          placeholder="Причина отмены..." />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setCancelOpen(false)}>Нет, оставить</Button>
          <Button variant="danger" onClick={handleCancel} loading={acting}>Отменить бронирование</Button>
        </div>
      </Modal>

      {/* Add service modal */}
      <Modal open={addSvcOpen} onClose={() => setAddSvcOpen(false)} title="Добавить услугу">
        <form onSubmit={handleAddService}>
          {svcError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{svcError}</div>}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Услуга *</label>
            <select required value={svcId} onChange={(e) => setSvcId(e.target.value)} style={inp}>
              <option value="">Выберите услугу</option>
              {allServices.map((s) => <option key={s.id} value={s.id}>{s.name} — {formatCurrency(s.price)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Количество</label>
            <input type="number" min="1" required value={svcQty} onChange={(e) => setSvcQty(e.target.value)} style={inp} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setAddSvcOpen(false)}>Отмена</Button>
            <Button type="submit" loading={svcAdding}>Добавить</Button>
          </div>
        </form>
      </Modal>

      {/* Remove service confirm */}
      <Modal open={!!removeSvcId} onClose={() => setRemoveSvcId(null)} title="Удалить услугу">
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Убрать услугу из бронирования?</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setRemoveSvcId(null)}>Отмена</Button>
          <Button variant="danger" onClick={handleRemoveService} loading={svcRemoving}>Удалить</Button>
        </div>
      </Modal>

      {/* Add payment modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Принять оплату">
        <form onSubmit={handleAddPayment}>
          {payError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{payError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Сумма *</label>
              <input required type="number" step="0.01" min="0.01" value={payForm.amount}
                onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} style={inp} placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>Способ оплаты</label>
              <select value={payForm.method} onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))} style={inp}>
                {Object.values(PaymentMethod).map((m) => <option key={m} value={m}>{METHOD_LABELS[m] ?? m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Референс / номер транзакции</label>
            <input value={payForm.reference} onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))} style={inp} placeholder="Необязательно" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Примечание</label>
            <input value={payForm.notes} onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))} style={inp} placeholder="Необязательно" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setPayOpen(false)}>Отмена</Button>
            <Button type="submit" loading={paying} icon={<CreditCard size={14} />}>Записать платёж</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
