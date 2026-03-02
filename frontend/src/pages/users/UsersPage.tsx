import { useEffect, useState, useCallback } from 'react';
import { Search, UserX, UserCheck, Flag, RefreshCw } from 'lucide-react';
import { usersApi } from '../../api/users';
import type { UserDto } from '../../types/api';
import { UserRole } from '../../types/enums';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const PAGE_SIZE = 15;
const ROLE_LABELS: Record<string, string> = {
  Guest: 'Гость', Receptionist: 'Ресепшионист', HousekeepingStaff: 'Уборка',
  MaintenanceStaff: 'Техперсонал', Manager: 'Менеджер', SuperAdmin: 'Суперадмин',
};

export default function UsersPage() {
  const [items, setItems] = useState<UserDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dnrUser, setDnrUser] = useState<UserDto | null>(null);
  const [dnrReason, setDnrReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.getAll({ page, pageSize: PAGE_SIZE, role: roleFilter || undefined, search: search || undefined });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } finally { setLoading(false); }
  }, [page, roleFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleToggleActive = async (user: UserDto) => {
    if (!confirm(`${user.isActive ? 'Деактивировать' : 'Активировать'} пользователя ${user.fullName}?`)) return;
    setActing(true);
    try {
      if (user.isActive) await usersApi.deactivate(user.id);
      else await usersApi.activate(user.id);
      load();
    } finally { setActing(false); }
  };

  const handleDnr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dnrUser) return;
    setActing(true);
    try { await usersApi.flagDnr(dnrUser.id, dnrReason); setDnrUser(null); setDnrReason(''); load(); }
    finally { setActing(false); }
  };

  const handleUnDnr = async (user: UserDto) => {
    if (!confirm(`Снять DNR флаг с ${user.fullName}?`)) return;
    setActing(true);
    try { await usersApi.unflagDnr(user.id); load(); } finally { setActing(false); }
  };

  const columns = [
    { key: 'fullName', header: 'Пользователь', render: (u: UserDto) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {u.firstName[0]}{u.lastName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{u.fullName}</div>
          {u.isDnr && <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700 }}>⚠ DNR</div>}
        </div>
      </div>
    )},
    { key: 'email', header: 'Email', render: (u: UserDto) => <span style={{ color: '#64748b', fontSize: 12 }}>{u.email}</span> },
    { key: 'phone', header: 'Телефон', render: (u: UserDto) => u.phone || <span style={{ color: '#94a3b8' }}>—</span> },
    { key: 'role', header: 'Роль', render: (u: UserDto) => (
      <span style={{ padding: '3px 8px', background: '#f1f5f9', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#475569' }}>
        {ROLE_LABELS[u.role] || u.role}
      </span>
    )},
    { key: 'isActive', header: 'Статус', render: (u: UserDto) => (
      <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: u.isActive ? '#f0fdf4' : '#fef2f2', color: u.isActive ? '#166534' : '#dc2626' }}>
        {u.isActive ? 'Активен' : 'Неактивен'}
      </span>
    )},
    { key: 'createdAt', header: 'Дата рег.', render: (u: UserDto) => <span style={{ color: '#64748b', fontSize: 12 }}>{formatDate(u.createdAt)}</span> },
    { key: 'actions', header: '', render: (u: UserDto) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(u); }}
          title={u.isActive ? 'Деактивировать' : 'Активировать'}
          style={{ width: 28, height: 28, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {u.isActive ? <UserX size={13} color="#ef4444" /> : <UserCheck size={13} color="#22c55e" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (u.isDnr) handleUnDnr(u); else { setDnrUser(u); setDnrReason(''); }}}
          title={u.isDnr ? 'Снять DNR' : 'Отметить DNR'}
          style={{ width: 28, height: 28, border: `1px solid ${u.isDnr ? '#fecaca' : '#e2e8f0'}`, borderRadius: 6, background: u.isDnr ? '#fef2f2' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Flag size={13} color={u.isDnr ? '#dc2626' : '#94a3b8'} />
        </button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Пользователи" subtitle="Управление гостями и персоналом" />

      <Card style={{ marginBottom: 16 }} padding={12}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', flex: 1, maxWidth: 280 }}>
            <Search size={14} color="#94a3b8" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Поиск по имени, email..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, color: '#1e293b', width: '100%' }} />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#1e293b', background: '#fff', outline: 'none' }}>
            <option value="">Все роли</option>
            {Object.values(UserRole).map((r) => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
          </select>
          <Button variant="secondary" icon={<RefreshCw size={14} />} size="sm" onClick={load}>Обновить</Button>
        </div>
      </Card>

      <Card padding={0}>
        <Table columns={columns} data={items} loading={loading} emptyText="Пользователи не найдены" />
      </Card>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <Modal open={!!dnrUser} onClose={() => setDnrUser(null)} title={`DNR: ${dnrUser?.fullName}`}>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          <strong>Do Not Rent</strong> — гость будет помечен как нежелательный для будущих бронирований. Укажите причину.
        </p>
        <form onSubmit={handleDnr}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Причина *</label>
            <textarea required value={dnrReason} onChange={(e) => setDnrReason(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', height: 80, resize: 'vertical' }} placeholder="Опишите причину..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setDnrUser(null)}>Отмена</Button>
            <Button variant="danger" type="submit" loading={acting}>Отметить DNR</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
