import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import { roomsApi } from '../../api/rooms';
import { usersApi } from '../../api/users';
import { servicesApi } from '../../api/additionalServices';
import type { BookingDto, RoomDto, UserDto, AdditionalServiceDto } from '../../types/api';
import { BookingStatus } from '../../types/enums';
import { formatCurrency, formatDate, today, addDays } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 15;

export default function BookingsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<BookingDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [guests, setGuests] = useState<UserDto[]>([]);
  const [services, setServices] = useState<AdditionalServiceDto[]>([]);
  const [form, setForm] = useState({ guestId: '', roomId: '', checkIn: today(), checkOut: addDays(today(), 1), guestsCount: 1, notes: '', serviceIds: [] as string[] });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await bookingsApi.getAll({ page, pageSize: PAGE_SIZE, status: statusFilter || undefined });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    setCreateError('');
    setCreateOpen(true);
    const [r, u, s] = await Promise.allSettled([
      roomsApi.getAll(),
      usersApi.getAll({ role: 'Guest', pageSize: 100 }),
      servicesApi.getAll(),
    ]);
    if (r.status === 'fulfilled') setRooms(r.value.data);
    if (u.status === 'fulfilled') setGuests(u.value.data.items ?? []);
    if (s.status === 'fulfilled') setServices(s.value.data ?? []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const { data: created } = await bookingsApi.create({
        guestId: form.guestId,
        roomId: form.roomId,
        checkInDate: form.checkIn,
        checkOutDate: form.checkOut,
        guestsCount: form.guestsCount,
        specialRequests: form.notes || undefined,
      });
      if (form.serviceIds.length > 0) {
        await Promise.allSettled(
          form.serviceIds.map((sid) => bookingsApi.addService((created as unknown as { id: string }).id, sid))
        );
      }
      setCreateOpen(false);
      setForm({ guestId: '', roomId: '', checkIn: today(), checkOut: addDays(today(), 1), guestsCount: 1, notes: '', serviceIds: [] });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg || 'Ошибка создания бронирования');
    } finally { setCreating(false); }
  };

  const toggleService = (id: string) =>
    setForm((f) => ({ ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((s) => s !== id) : [...f.serviceIds, id] }));

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };

  const columns = [
    { key: 'guestFullName', header: 'Гость', render: (r: BookingDto) => <span style={{ fontWeight: 600 }}>{r.guestFullName}</span> },
    { key: 'room', header: 'Номер', render: (r: BookingDto) => `№${r.roomNumber} · ${r.roomTypeName}` },
    { key: 'checkInDate', header: 'Заезд', render: (r: BookingDto) => formatDate(r.checkInDate) },
    { key: 'checkOutDate', header: 'Выезд', render: (r: BookingDto) => formatDate(r.checkOutDate) },
    { key: 'nightsCount', header: 'Ночей' },
    { key: 'totalAmount', header: 'Сумма', render: (r: BookingDto) => <span style={{ fontWeight: 700 }}>{formatCurrency(r.totalAmount)}</span> },
    { key: 'status', header: 'Статус', render: (r: BookingDto) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Бронирования"
        action={<Button icon={<Plus size={16} />} onClick={openCreate}>Новое бронирование</Button>}
      />

      <Card style={{ marginBottom: 16 }} padding={12}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', flex: 1, maxWidth: 280 }}>
            <Search size={14} color="#94a3b8" />
            <input placeholder="Поиск..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, color: '#1e293b', width: '100%' }} />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#1e293b', background: '#fff', outline: 'none' }}>
            <option value="">Все статусы</option>
            {Object.values(BookingStatus).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button variant="secondary" icon={<RefreshCw size={14} />} size="sm" onClick={load}>Обновить</Button>
        </div>
      </Card>

      <Card padding={0}>
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyText="Бронирований нет"
          onRowClick={(row) => navigate(`/bookings/${(row as unknown as BookingDto).id}`)}
        />
      </Card>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Новое бронирование" width={580}>
        <form onSubmit={handleCreate}>
          {createError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{createError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Гость *</label>
              <select required value={form.guestId} onChange={(e) => setForm((f) => ({ ...f, guestId: e.target.value }))} style={inputStyle}>
                <option value="">Выберите гостя</option>
                {guests.map((g) => <option key={g.id} value={g.id}>{g.fullName} — {g.email}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Номер *</label>
              <select required value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} style={inputStyle}>
                <option value="">Выберите номер</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>№{r.number} — {r.roomTypeName} ({formatCurrency((r as unknown as { pricePerNight: number }).pricePerNight ?? r.roomTypeBasePrice)}/ночь)</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Дата заезда *</label>
              <input type="date" required value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Дата выезда *</label>
              <input type="date" required value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Гостей *</label>
              <input type="number" required min={1} max={20} value={form.guestsCount} onChange={(e) => setForm((f) => ({ ...f, guestsCount: parseInt(e.target.value) || 1 }))} style={inputStyle} />
            </div>
          </div>

          {services.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Дополнительные услуги</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {services.filter((s) => s.isActive).map((s) => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: `1px solid ${form.serviceIds.includes(s.id) ? '#3b82f6' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, background: form.serviceIds.includes(s.id) ? '#eff6ff' : '#fff' }}>
                    <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} style={{ margin: 0 }} />
                    {s.name} — {formatCurrency(s.price)}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Примечания</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, height: 72, resize: 'vertical' }} placeholder="Дополнительные пожелания..." />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button type="submit" loading={creating}>Создать бронирование</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
