import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { roomTypesApi } from '../../api/roomTypes';
import type { RoomTypeDto } from '../../types/api';
import { formatCurrency } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

type Form = { name: string; description: string; basePrice: string; capacity: string; amenities: string };

export default function RoomTypesPage() {
  const [items, setItems] = useState<RoomTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<RoomTypeDto | null>(null);
  const [form, setForm] = useState<Form>({ name: '', description: '', basePrice: '', capacity: '', amenities: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const { data } = await roomTypesApi.getAll(); setItems(data); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', description: '', basePrice: '', capacity: '', amenities: '' });
    setError('');
    setCreateOpen(true);
  };

  const openEdit = (item: RoomTypeDto) => {
    setForm({ name: item.name, description: item.description ?? '', basePrice: String(item.basePrice), capacity: String(item.capacity), amenities: item.amenities.join(', ') });
    setError('');
    setEditItem(item);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      basePrice: parseFloat(form.basePrice),
      capacity: parseInt(form.capacity),
      amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    try {
      if (editItem) await roomTypesApi.update(editItem.id, payload);
      else await roomTypesApi.create(payload);
      setCreateOpen(false);
      setEditItem(null);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Ошибка сохранения');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить тип номера?')) return;
    try { await roomTypesApi.delete(id); load(); } catch { alert('Нельзя удалить тип — возможно, к нему привязаны номера.'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 };

  const FormContent = (
    <form onSubmit={handleSave}>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Название *</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Стандарт / Делюкс / Люкс" />
        </div>
        <div>
          <label style={labelStyle}>Цена за ночь (₸) *</label>
          <input required type="number" min={0} step={0.01} value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} style={inputStyle} placeholder="15000" />
        </div>
        <div>
          <label style={labelStyle}>Вместимость (чел.) *</label>
          <input required type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} style={inputStyle} placeholder="2" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Удобства (через запятую)</label>
          <input value={form.amenities} onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))} style={inputStyle} placeholder="Wi-Fi, TV, Кондиционер, Мини-бар" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Описание</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, height: 64, resize: 'vertical' }} placeholder="Описание типа номера..." />
        </div>
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
        title="Типы номеров"
        subtitle={`${items.length} типов`}
        action={<Button icon={<Plus size={16} />} onClick={openCreate}>Добавить тип</Button>}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Загрузка...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Типы номеров не найдены</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {items.map((item) => (
            <Card key={item.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{item.name}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>До {item.capacity} гостей</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{formatCurrency(item.basePrice)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>за ночь</div>
                </div>
              </div>

              {item.description && (
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>{item.description}</p>
              )}

              {item.amenities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {item.amenities.map((a) => (
                    <span key={a} style={{ padding: '3px 9px', background: '#f1f5f9', borderRadius: 4, fontSize: 11, color: '#475569', fontWeight: 500 }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                <Button size="sm" variant="secondary" icon={<Edit2 size={13} />} onClick={() => openEdit(item)}>Изменить</Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => handleDelete(item.id)}>Удалить</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Создать тип номера">{FormContent}</Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Изменить: ${editItem?.name}`}>{FormContent}</Modal>
    </div>
  );
}
