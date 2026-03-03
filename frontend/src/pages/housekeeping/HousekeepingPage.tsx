import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, CheckCircle } from 'lucide-react';
import { housekeepingApi } from '../../api/housekeeping';
import { roomsApi } from '../../api/rooms';
import { usersApi } from '../../api/users';
import type { HousekeepingTaskDto, RoomDto, UserDto } from '../../types/api';
import { HousekeepingTaskType, HousekeepingStatus, UserRole } from '../../types/enums';
import { formatDate } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const PAGE_SIZE = 15;
const TASK_LABELS: Record<string, string> = {
  Cleaning: 'Уборка', LaundryChange: 'Смена белья', Maintenance: 'Техобслуживание',
  Inspection: 'Инспекция', Turndown: 'Вечерняя уборка',
};

export default function HousekeepingPage() {
  const [items, setItems] = useState<HousekeepingTaskDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [staff, setStaff] = useState<UserDto[]>([]);
  const [form, setForm] = useState({ roomId: '', taskType: 'Cleaning', notes: '', assignedToId: '', scheduledFor: '' });
  const [creating, setCreating] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await housekeepingApi.getAll({ page, pageSize: PAGE_SIZE, status: statusFilter || undefined });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    setCreateOpen(true);
    const [r, u] = await Promise.all([roomsApi.getAll(), usersApi.getAll({ role: UserRole.HousekeepingStaff, pageSize: 100 })]);
    setRooms(r.data);
    setStaff(u.data.items ?? []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await housekeepingApi.create({ roomId: form.roomId, taskType: form.taskType, notes: form.notes || undefined, assignedToId: form.assignedToId || undefined, scheduledFor: form.scheduledFor || undefined });
      setCreateOpen(false);
      setForm({ roomId: '', taskType: 'Cleaning', notes: '', assignedToId: '', scheduledFor: '' });
      load();
    } finally { setCreating(false); }
  };

  const handleComplete = async (id: string) => {
    setActing(id);
    try { await housekeepingApi.complete(id); load(); } finally { setActing(null); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };

  const columns = [
    { key: 'roomNumber', header: 'Номер', render: (t: HousekeepingTaskDto) => <span style={{ fontWeight: 600 }}>№{t.roomNumber}</span> },
    { key: 'taskType', header: 'Задача', render: (t: HousekeepingTaskDto) => TASK_LABELS[t.taskType] || t.taskType },
    { key: 'status', header: 'Статус', render: (t: HousekeepingTaskDto) => <StatusBadge status={t.status} /> },
    { key: 'assignedToName', header: 'Исполнитель', render: (t: HousekeepingTaskDto) => t.assignedToName || <span style={{ color: '#94a3b8' }}>—</span> },
    { key: 'scheduledFor', header: 'Запланировано', render: (t: HousekeepingTaskDto) => t.scheduledFor ? formatDate(t.scheduledFor) : <span style={{ color: '#94a3b8' }}>—</span> },
    { key: 'createdAt', header: 'Создано', render: (t: HousekeepingTaskDto) => formatDate(t.createdAt) },
    { key: 'actions', header: '', render: (t: HousekeepingTaskDto) => (
      t.status !== 'Completed' && t.status !== 'Cancelled' ? (
        <Button size="sm" variant="secondary" icon={<CheckCircle size={13} color="#22c55e" />} loading={acting === t.id} onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleComplete(t.id); }}>
          Выполнено
        </Button>
      ) : null
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Уборка"
        action={<Button icon={<Plus size={16} />} onClick={openCreate}>Новая задача</Button>}
      />

      <Card style={{ marginBottom: 16 }} padding={12}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {['', ...Object.values(HousekeepingStatus)].map((s) => (
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
        <Table columns={columns} data={items} loading={loading} emptyText="Задач нет" />
      </Card>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Новая задача уборки">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Номер *</label>
              <select required value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} style={inputStyle}>
                <option value="">Выберите номер</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>№{r.number} — {r.roomTypeName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Тип задачи *</label>
              <select value={form.taskType} onChange={(e) => setForm((f) => ({ ...f, taskType: e.target.value }))} style={inputStyle}>
                {Object.values(HousekeepingTaskType).map((t) => <option key={t} value={t}>{TASK_LABELS[t] || t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Исполнитель</label>
              <select value={form.assignedToId} onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))} style={inputStyle}>
                <option value="">Не назначен</option>
                {staff.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Запланировано</label>
              <input type="date" value={form.scheduledFor} onChange={(e) => setForm((f) => ({ ...f, scheduledFor: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Примечания</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, height: 64, resize: 'vertical' }} placeholder="Особые указания..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button type="submit" loading={creating}>Создать задачу</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
