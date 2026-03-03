import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { maintenanceApi } from '../../api/maintenance';
import { roomsApi } from '../../api/rooms';
import type { MaintenanceRequestDto, RoomDto } from '../../types/api';
import { MaintenancePriority, MaintenanceStatus } from '../../types/enums';
import { formatDate } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 15;
const PRIORITY_COLOR: Record<string, string> = { Low: '#94a3b8', Medium: '#eab308', High: '#f97316', Urgent: '#ef4444' };

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MaintenanceRequestDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [form, setForm] = useState({ roomId: '', title: '', description: '', priority: 'Medium' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await maintenanceApi.getAll({ page, pageSize: PAGE_SIZE, status: statusFilter || undefined });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    setCreateError('');
    setCreateOpen(true);
    const { data } = await roomsApi.getAll();
    setRooms(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await maintenanceApi.create({ roomId: form.roomId, title: form.title, description: form.description || undefined, priority: form.priority });
      setCreateOpen(false);
      setForm({ roomId: '', title: '', description: '', priority: 'Medium' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg || 'Ошибка создания заявки');
    } finally { setCreating(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };

  const columns = [
    { key: 'title', header: 'Заявка', render: (r: MaintenanceRequestDto) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
    { key: 'roomNumber', header: 'Номер', render: (r: MaintenanceRequestDto) => `№${r.roomNumber}` },
    { key: 'priority', header: 'Приоритет', render: (r: MaintenanceRequestDto) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLOR[r.priority] }} />
        <StatusBadge status={r.priority} />
      </div>
    )},
    { key: 'status', header: 'Статус', render: (r: MaintenanceRequestDto) => <StatusBadge status={r.status} /> },
    { key: 'assignedToName', header: 'Исполнитель', render: (r: MaintenanceRequestDto) => r.assignedToName || <span style={{ color: '#94a3b8' }}>—</span> },
    { key: 'reportedByName', header: 'Создал', render: (r: MaintenanceRequestDto) => <span style={{ color: '#64748b', fontSize: 12 }}>{r.reportedByName}</span> },
    { key: 'createdAt', header: 'Дата', render: (r: MaintenanceRequestDto) => formatDate(r.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Техническое обслуживание"
        action={<Button icon={<Plus size={16} />} onClick={openCreate}>Новая заявка</Button>}
      />

      <Card style={{ marginBottom: 16 }} padding={12}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {['', ...Object.values(MaintenanceStatus)].map((s) => (
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
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyText="Заявок нет"
          onRowClick={(row) => navigate(`/maintenance/${(row as unknown as MaintenanceRequestDto).id}`)}
        />
      </Card>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Новая заявка">
        <form onSubmit={handleCreate}>
          {createError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{createError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Номер *</label>
              <select required value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} style={inputStyle}>
                <option value="">Выберите номер</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>№{r.number} — {r.roomTypeName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Приоритет</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} style={inputStyle}>
                {Object.values(MaintenancePriority).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Заголовок *</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="Краткое описание проблемы" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Описание</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Подробное описание проблемы..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button type="submit" loading={creating}>Создать заявку</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
