import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, Lock, Unlock } from 'lucide-react';
import { roomsApi } from '../../api/rooms';
import { roomTypesApi } from '../../api/roomTypes';
import type { RoomDto, RoomTypeDto, RoomBlockDto } from '../../types/api';
import { RoomStatus } from '../../types/enums';
import { formatCurrency, formatDate } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const PAGE_SIZE = 15;
const STATUS_DOT: Record<string, string> = {
  Available: '#22c55e', Occupied: '#3b82f6', Cleaning: '#eab308',
  Maintenance: '#ef4444', OutOfService: '#94a3b8',
};

const todayStr = () => new Date().toISOString().split('T')[0];
const weekLaterStr = () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; };

export default function RoomsPage() {
  const [allItems, setAllItems] = useState<RoomDto[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDto[]>([]);

  const filtered = statusFilter ? allItems.filter((r) => r.status === statusFilter) : allItems;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ number: '', floor: '', roomTypeId: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editItem, setEditItem] = useState<RoomDto | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editing, setEditing] = useState(false);

  const [blocksRoom, setBlocksRoom] = useState<RoomDto | null>(null);
  const [blocks, setBlocks] = useState<RoomBlockDto[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blockForm, setBlockForm] = useState({ blockedFrom: todayStr(), blockedTo: weekLaterStr(), reason: '' });
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState('');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rooms, types] = await Promise.all([
        roomsApi.getAll(),
        roomTypesApi.getAll(),
      ]);
      setAllItems(rooms.data);
      setRoomTypes(types.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadBlocks = async (roomId: string) => {
    setBlocksLoading(true);
    try {
      const { data } = await roomsApi.getBlocks(roomId);
      setBlocks(data);
    } finally { setBlocksLoading(false); }
  };

  const openBlocks = (room: RoomDto) => {
    setBlocksRoom(room);
    setBlockForm({ blockedFrom: todayStr(), blockedTo: weekLaterStr(), reason: '' });
    setBlockError('');
    loadBlocks(room.id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await roomsApi.create({ number: form.number, floor: parseInt(form.floor), roomTypeId: form.roomTypeId, description: form.description || undefined });
      setCreateOpen(false);
      setForm({ number: '', floor: '', roomTypeId: '', description: '' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg || 'Ошибка создания номера');
    } finally { setCreating(false); }
  };

  const handleStatusChange = async () => {
    if (!editItem || !editStatus) return;
    setEditing(true);
    try { await roomsApi.changeStatus(editItem.id, editStatus); setEditItem(null); load(); } finally { setEditing(false); }
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blocksRoom) return;
    setBlockError('');
    setBlocking(true);
    try {
      await roomsApi.blockRoom(blocksRoom.id, blockForm);
      setBlockForm({ blockedFrom: todayStr(), blockedTo: weekLaterStr(), reason: '' });
      loadBlocks(blocksRoom.id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setBlockError(msg || 'Ошибка блокировки');
    } finally { setBlocking(false); }
  };

  const handleUnblock = async (blockId: string) => {
    if (!blocksRoom) return;
    setUnblockingId(blockId);
    try { await roomsApi.unblockRoom(blocksRoom.id, blockId); loadBlocks(blocksRoom.id); }
    finally { setUnblockingId(null); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 };

  const columns = [
    { key: 'number', header: 'Номер', render: (r: RoomDto) => <span style={{ fontWeight: 700, fontSize: 15 }}>№{r.number}</span> },
    { key: 'floor', header: 'Этаж', render: (r: RoomDto) => `${r.floor} эт.` },
    { key: 'roomTypeName', header: 'Тип' },
    { key: 'pricePerNight', header: 'Цена/ночь', render: (r: RoomDto) => formatCurrency(r.pricePerNight) },
    { key: 'status', header: 'Статус', render: (r: RoomDto) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[r.status] ?? '#94a3b8' }} />
        <StatusBadge status={r.status} />
      </div>
    )},
    { key: 'actions', header: '', render: (r: RoomDto) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditItem(r); setEditStatus(r.status); }}>
          Статус
        </Button>
        <Button size="sm" variant="secondary" icon={<Lock size={12} />} onClick={(e: React.MouseEvent) => { e.stopPropagation(); openBlocks(r); }}>
          Блоки
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Номера"
        subtitle={`${filtered.length} номеров`}
        action={<Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Добавить номер</Button>}
      />

      <Card style={{ marginBottom: 16 }} padding={12}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {['', ...Object.values(RoomStatus)].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${statusFilter === s ? '#3b82f6' : '#e2e8f0'}`,
              background: statusFilter === s ? '#3b82f6' : '#fff',
              color: statusFilter === s ? '#fff' : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {s && <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusFilter === s ? '#fff' : STATUS_DOT[s] }} />}
              {s || 'Все'}
            </button>
          ))}
          <Button variant="secondary" icon={<RefreshCw size={14} />} size="sm" onClick={load} style={{ marginLeft: 'auto' }}>Обновить</Button>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_DOT).map(([s, color]) => {
          const count = items.filter((r) => r.status === s).length;
          if (count === 0) return null;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
              <span style={{ color: '#64748b' }}>{s}</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{count}</span>
            </div>
          );
        })}
      </div>

      <Card padding={0}>
        <Table columns={columns} data={items} loading={loading} emptyText="Номера не найдены" />
      </Card>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Добавить номер">
        <form onSubmit={handleCreate}>
          {createError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{createError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Номер комнаты *</label>
              <input required value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} style={inputStyle} placeholder="101" />
            </div>
            <div>
              <label style={lbl}>Этаж *</label>
              <input required type="number" min={1} value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} style={inputStyle} placeholder="1" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Тип номера *</label>
            <select required value={form.roomTypeId} onChange={(e) => setForm((f) => ({ ...f, roomTypeId: e.target.value }))} style={inputStyle}>
              <option value="">Выберите тип</option>
              {roomTypes.map((t) => <option key={t.id} value={t.id}>{t.name} — {formatCurrency(t.basePrice)}/ночь</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Описание</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, height: 64, resize: 'vertical' }} placeholder="Особенности номера..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button type="submit" loading={creating}>Добавить</Button>
          </div>
        </form>
      </Modal>

      {/* Status modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Статус номера №${editItem?.number}`}>
        <div style={{ marginBottom: 20 }}>
          {Object.values(RoomStatus).map((s) => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1px solid ${editStatus === s ? '#3b82f6' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', background: editStatus === s ? '#eff6ff' : '#fff', marginBottom: 8 }}>
              <input type="radio" name="status" value={s} checked={editStatus === s} onChange={() => setEditStatus(s)} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[s] }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{s}</span>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setEditItem(null)}>Отмена</Button>
          <Button onClick={handleStatusChange} loading={editing}>Сохранить</Button>
        </div>
      </Modal>

      {/* Blocks modal */}
      <Modal open={!!blocksRoom} onClose={() => setBlocksRoom(null)} title={`Блокировки номера №${blocksRoom?.number}`}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>Активные блокировки</div>
          {blocksLoading ? (
            <div style={{ padding: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Загрузка...</div>
          ) : blocks.filter((b) => b.isActive).length === 0 ? (
            <div style={{ padding: '12px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Нет активных блокировок</div>
          ) : blocks.filter((b) => b.isActive).map((b) => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>{formatDate(b.blockedFrom)} → {formatDate(b.blockedTo)}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{b.reason}{b.blockedByName && ` · ${b.blockedByName}`}</div>
              </div>
              <Button size="sm" variant="secondary" icon={<Unlock size={12} />}
                loading={unblockingId === b.id}
                onClick={() => handleUnblock(b.id)}>
                Снять
              </Button>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={13} /> Добавить блокировку
          </div>
          <form onSubmit={handleBlock}>
            {blockError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{blockError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={lbl}>От *</label>
                <input required type="date" value={blockForm.blockedFrom} onChange={(e) => setBlockForm((f) => ({ ...f, blockedFrom: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={lbl}>До *</label>
                <input required type="date" value={blockForm.blockedTo} onChange={(e) => setBlockForm((f) => ({ ...f, blockedTo: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Причина *</label>
              <input required value={blockForm.reason} onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))} style={inputStyle} placeholder="VIP резерв, ремонт, техработы..." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="secondary" type="button" onClick={() => setBlocksRoom(null)}>Закрыть</Button>
              <Button type="submit" loading={blocking} icon={<Lock size={13} />}>Заблокировать</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
