import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { servicesApi } from '../../api/additionalServices';
import type { AdditionalServiceDto } from '../../types/api';
import { formatCurrency } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function ServicesPage() {
  const [items, setItems] = useState<AdditionalServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdditionalServiceDto | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const { data } = await servicesApi.getAll(); setItems(data); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '', description: '', price: '' }); setError(''); setCreateOpen(true); };
  const openEdit = (item: AdditionalServiceDto) => {
    setForm({ name: item.name, description: item.description ?? '', price: String(item.price) });
    setError(''); setEditItem(item);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    const payload = { name: form.name, description: form.description || undefined, price: parseFloat(form.price) };
    try {
      if (editItem) await servicesApi.update(editItem.id, payload);
      else await servicesApi.create(payload);
      setCreateOpen(false); setEditItem(null); load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Ошибка сохранения');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (item: AdditionalServiceDto) => {
    await servicesApi.update(item.id, { isActive: !item.isActive });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить услугу?')) return;
    await servicesApi.delete(id); load();
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 };

  const FormContent = (
    <form onSubmit={handleSave}>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>{error}</div>}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Название *</label>
        <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Завтрак, Трансфер, СПА..." />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Цена (₸) *</label>
        <input required type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} style={inputStyle} placeholder="5000" />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Описание</label>
        <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, height: 64, resize: 'vertical' }} placeholder="Описание услуги..." />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={() => { setCreateOpen(false); setEditItem(null); }}>Отмена</Button>
        <Button type="submit" loading={saving}>{editItem ? 'Сохранить' : 'Создать'}</Button>
      </div>
    </form>
  );

  const activeItems = items.filter((i) => i.isActive);
  const inactiveItems = items.filter((i) => !i.isActive);

  return (
    <div>
      <PageHeader
        title="Дополнительные услуги"
        subtitle={`${activeItems.length} активных · ${inactiveItems.length} неактивных`}
        action={<Button icon={<Plus size={16} />} onClick={openCreate}>Добавить услугу</Button>}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Загрузка...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map((item) => (
            <Card key={item.id} style={{ opacity: item.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{item.name}</h3>
                <span style={{ fontSize: 16, fontWeight: 800, color: item.isActive ? '#1e293b' : '#94a3b8' }}>
                  {formatCurrency(item.price)}
                </span>
              </div>

              {item.description && (
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>{item.description}</p>
              )}

              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 12, alignItems: 'center' }}>
                <button onClick={() => handleToggleActive(item)} title={item.isActive ? 'Деактивировать' : 'Активировать'} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: item.isActive ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                  {item.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {item.isActive ? 'Активна' : 'Неактивна'}
                </button>
                <div style={{ flex: 1 }} />
                <Button size="sm" variant="secondary" icon={<Edit2 size={13} />} onClick={() => openEdit(item)}>Изменить</Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => handleDelete(item.id)}>Удалить</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Добавить услугу">{FormContent}</Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Изменить: ${editItem?.name}`}>{FormContent}</Modal>
    </div>
  );
}
