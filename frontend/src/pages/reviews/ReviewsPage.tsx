import { useEffect, useState, useCallback } from 'react';
import { Star, Trash2, RefreshCw } from 'lucide-react';
import { reviewsApi } from '../../api/reviews';
import type { ReviewDto } from '../../types/api';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const PAGE_SIZE = 12;

export default function ReviewsPage() {
  const [items, setItems] = useState<ReviewDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reviewsApi.getAll({ page, pageSize: PAGE_SIZE });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return;
    await reviewsApi.delete(id);
    load();
  };

  const avgRating = items.length > 0 ? (items.reduce((s, r) => s + r.rating, 0) / items.length).toFixed(1) : '—';

  return (
    <div>
      <PageHeader
        title="Отзывы"
        subtitle={`${items.length} отзывов · Средний рейтинг: ${avgRating}`}
        action={<Button variant="secondary" icon={<RefreshCw size={14} />} onClick={load}>Обновить</Button>}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Загрузка...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Отзывов пока нет</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {items.map((r) => (
            <Card key={r.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {r.guestName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{r.guestName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>№{r.roomNumber} · {r.roomTypeName}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill={s <= r.rating ? '#eab308' : 'none'} color={s <= r.rating ? '#eab308' : '#e2e8f0'} />
                ))}
                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4, fontWeight: 600 }}>{r.rating}/5</span>
              </div>

              {r.comment && (
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 10 }}>"{r.comment}"</p>
              )}

              <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(r.createdAt)}</div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
