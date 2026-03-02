import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, Pencil, Trash2, Tag } from 'lucide-react';
import { pricingRulesApi } from '../../api/pricingRules';
import { roomTypesApi } from '../../api/roomTypes';
import type { PricingRuleDto, RoomTypeDto } from '../../types/api';
import { formatCurrency } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAY_NAMES_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const fmtMultiplier = (m: number) => {
  const pct = Math.round((m - 1) * 100);
  return pct >= 0 ? `×${m} (+${pct}%)` : `×${m} (${pct}%)`;
};

const emptyForm = {
  name: '', multiplier: '1.20', startDate: '', endDate: '',
  applicableDays: [] as number[], minOccupancyPercent: '', maxDaysBeforeCheckIn: '',
  roomTypeId: '', isActive: true,
};

export default function PricingRulesPage() {
  const [items, setItems] = useState<PricingRuleDto[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PricingRuleDto | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [deleteItem, setDeleteItem] = useState<PricingRuleDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rules, types] = await Promise.all([pricingRulesApi.getAll(), roomTypesApi.getAll()]);
      setItems(rules.data);
      setRoomTypes(types.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ ...emptyForm }); setSaveError(''); setCreateOpen(true); };
  const openEdit = (r: PricingRuleDto) => {
    setForm({
      name: r.name,
      multiplier: String(r.multiplier),
      startDate: r.startDate?.split('T')[0] ?? '',
      endDate: r.endDate?.split('T')[0] ?? '',
      applicableDays: r.applicableDays ?? [],
      minOccupancyPercent: r.minOccupancyPercent != null ? String(r.minOccupancyPercent) : '',
      maxDaysBeforeCheckIn: r.maxDaysBeforeCheckIn != null ? String(r.maxDaysBeforeCheckIn) : '',
      roomTypeId: r.roomTypeId ?? '',
      isActive: r.isActive,
    });
    setSaveError('');
    setEditItem(r);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const payload = {
      name: form.name,
      multiplier: parseFloat(form.multiplier),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      applicableDays: form.applicableDays.length > 0 ? form.applicableDays : undefined,
      minOccupancyPercent: form.minOccupancyPercent ? parseFloat(form.minOccupancyPercent) : undefined,
      maxDaysBeforeCheckIn: form.maxDaysBeforeCheckIn ? parseInt(form.maxDaysBeforeCheckIn) : undefined,
      roomTypeId: form.roomTypeId || undefined,
      isActive: form.isActive,
    };
    try {
      if (editItem) {
        await pricingRulesApi.update(editItem.id, payload);
        setEditItem(null);
      } else {
        await pricingRulesApi.create(payload);
        setCreateOpen(false);
      }
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaveError(msg || 'Ошибка сохранения');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await pricingRulesApi.delete(deleteItem.id); setDeleteItem(null); load(); }
    finally { setDeleting(false); }
  };

  const toggleDay = (d: number) =>
    setForm((f) => ({
      ...f,
      applicableDays: f.applicableDays.includes(d)
        ? f.applicableDays.filter((x) => x !== d)
        : [...f.applicableDays, d],
    }));

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 };

  const RuleForm = () => (
    <form onSubmit={handleSave}>
      {saveError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{saveError}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Название *</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inp} placeholder="Weekend Surcharge" />
        </div>
        <div>
          <label style={lbl}>Множитель * (напр. 1.20)</label>
          <input required type="number" step="0.01" min="0.1" max="10" value={form.multiplier}
            onChange={(e) => setForm((f) => ({ ...f, multiplier: e.target.value }))} style={inp} />
        </div>
        <div>
          <label style={lbl}>Тип номера (необяз.)</label>
          <select value={form.roomTypeId} onChange={(e) => setForm((f) => ({ ...f, roomTypeId: e.target.value }))} style={inp}>
            <option value="">Все типы</option>
            {roomTypes.map((t) => <option key={t.id} value={t.id}>{t.name} — {formatCurrency(t.basePrice)}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Дата начала</label>
          <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} style={inp} />
        </div>
        <div>
          <label style={lbl}>Дата окончания</label>
          <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} style={inp} />
        </div>
        <div>
          <label style={lbl}>Мин. загрузка % (необяз.)</label>
          <input type="number" min="0" max="100" value={form.minOccupancyPercent}
            onChange={(e) => setForm((f) => ({ ...f, minOccupancyPercent: e.target.value }))} style={inp} placeholder="напр. 80" />
        </div>
        <div>
          <label style={lbl}>Макс. дней до заезда (необяз.)</label>
          <input type="number" min="0" value={form.maxDaysBeforeCheckIn}
            onChange={(e) => setForm((f) => ({ ...f, maxDaysBeforeCheckIn: e.target.value }))} style={inp} placeholder="напр. 7" />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Применимые дни недели (необяз.)</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DAY_NAMES.map((name, i) => (
            <button key={i} type="button" onClick={() => toggleDay(i)} style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${form.applicableDays.includes(i) ? '#3b82f6' : '#e2e8f0'}`,
              background: form.applicableDays.includes(i) ? '#3b82f6' : '#fff',
              color: form.applicableDays.includes(i) ? '#fff' : '#64748b',
            }}>{name}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
          <span style={{ fontWeight: 600, color: '#1e293b' }}>Правило активно</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={() => { setCreateOpen(false); setEditItem(null); }}>Отмена</Button>
        <Button type="submit" loading={saving}>{editItem ? 'Сохранить' : 'Создать'}</Button>
      </div>
    </form>
  );

  return (
    <div>
      <PageHeader
        title="Правила ценообразования"
        subtitle="Динамические надбавки: выходные, высокий сезон, загрузка"
        action={<Button icon={<Plus size={16} />} onClick={openCreate}>Добавить правило</Button>}
      />

      <Card style={{ marginBottom: 12 }} padding={12}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>{items.length} правил</span>
          <Button variant="secondary" icon={<RefreshCw size={14} />} size="sm" onClick={load} style={{ marginLeft: 'auto' }}>Обновить</Button>
        </div>
      </Card>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Загрузка...</div>
      ) : items.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            <Tag size={40} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Нет правил ценообразования</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>Создайте первое правило для динамического ценообразования</div>
            <Button onClick={openCreate} icon={<Plus size={15} />}>Добавить правило</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {items.map((rule) => (
            <Card key={rule.id} style={{ borderLeft: `4px solid ${rule.isActive ? '#3b82f6' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{rule.name}</div>
                  {rule.roomTypeName && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{rule.roomTypeName}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: rule.isActive ? '#eff6ff' : '#f8fafc',
                    color: rule.isActive ? '#1d4ed8' : '#94a3b8',
                    border: `1px solid ${rule.isActive ? '#bfdbfe' : '#e2e8f0'}`,
                  }}>{rule.isActive ? 'Активно' : 'Неактивно'}</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: rule.multiplier >= 1 ? '#16a34a' : '#dc2626' }}>
                  {fmtMultiplier(rule.multiplier)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(rule.startDate || rule.endDate) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Период</span>
                    <span style={{ fontWeight: 600 }}>
                      {rule.startDate ? new Date(rule.startDate).toLocaleDateString('ru-RU') : '?'}
                      {' → '}
                      {rule.endDate ? new Date(rule.endDate).toLocaleDateString('ru-RU') : '∞'}
                    </span>
                  </div>
                )}
                {(rule.applicableDays ?? []).length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Дни</span>
                    <span style={{ fontWeight: 600 }}>{(rule.applicableDays ?? []).map((d) => DAY_NAMES_FULL[d]).join(', ')}</span>
                  </div>
                )}
                {rule.minOccupancyPercent != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Мин. загрузка</span>
                    <span style={{ fontWeight: 600 }}>{rule.minOccupancyPercent}%</span>
                  </div>
                )}
                {rule.maxDaysBeforeCheckIn != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>До заезда ≤</span>
                    <span style={{ fontWeight: 600 }}>{rule.maxDaysBeforeCheckIn} дн.</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={() => openEdit(rule)}>Изменить</Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => setDeleteItem(rule)}>Удалить</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Новое правило ценообразования">
        <RuleForm />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Изменить: ${editItem?.name}`}>
        <RuleForm />
      </Modal>

      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Удалить правило">
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          Удалить правило <strong style={{ color: '#1e293b' }}>{deleteItem?.name}</strong>? Это действие нельзя отменить.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteItem(null)}>Отмена</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Удалить</Button>
        </div>
      </Modal>
    </div>
  );
}
