import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BedDouble, CalendarDays, Clock, XCircle } from 'lucide-react';
import iconUrl from '../../assets/icon.png';
import { useAuthStore } from '../../store/authStore';
import { bookingsApi } from '../../api/bookings';
import StatusBadge from '../../components/common/StatusBadge';
import type { BookingDto } from '../../types/api';
import { BookingStatus } from '../../types/enums';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });

export default function MyBookingsPage() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    bookingsApi
      .getAll({ guestId: user.id, pageSize: 100 })
      .then(({ data }) => setBookings(data.items))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Вы уверены, что хотите отменить бронирование?')) return;
    setCancelling(id);
    try {
      await bookingsApi.cancel(id, 'Отменено гостем');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: BookingStatus.Cancelled } : b))
      );
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={iconUrl} alt="Roomy" style={{ width: 32, height: 32, borderRadius: 7, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>Roomy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
            >
              <LogOut size={14} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          Мои бронирования
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
          Активные и прошлые бронирования вашего аккаунта
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>
            Загрузка...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <BedDouble size={40} color="#cbd5e1" style={{ marginBottom: 14 }} />
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Бронирований пока нет</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Обратитесь на ресепшн для создания бронирования</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((b) => {
              const canCancel = [BookingStatus.Pending, BookingStatus.Confirmed].includes(b.status);
              return (
                <div
                  key={b.id}
                  style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}
                >
                  {/* Icon */}
                  <div style={{ width: 48, height: 48, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BedDouble size={22} color="#3b82f6" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>
                        Номер {b.roomNumber}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>{b.roomTypeName}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#64748b', fontSize: 13, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CalendarDays size={13} />
                        {fmt(b.checkInDate)} — {fmt(b.checkOutDate)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} />
                        {b.nightsCount} {b.nightsCount === 1 ? 'ночь' : b.nightsCount < 5 ? 'ночи' : 'ночей'}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                      {b.totalAmount.toLocaleString('ru-RU')} ₸
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Итого</div>
                  </div>

                  {/* Cancel */}
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelling === b.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: cancelling === b.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, opacity: cancelling === b.id ? 0.6 : 1 }}
                    >
                      <XCircle size={14} />
                      {cancelling === b.id ? 'Отмена...' : 'Отменить'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
