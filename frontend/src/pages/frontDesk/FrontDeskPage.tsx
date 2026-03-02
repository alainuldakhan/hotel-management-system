import { useEffect, useState } from 'react';
import { Users, LogIn, LogOut } from 'lucide-react';
import { frontDeskApi } from '../../api/frontDesk';
import type { ArrivalItemDto, DepartureItemDto, InHouseGuestDto } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import { bookingsApi } from '../../api/bookings';
import Button from '../../components/common/Button';

type Tab = 'arrivals' | 'departures' | 'inhouse';

export default function FrontDeskPage() {
  const [tab, setTab] = useState<Tab>('arrivals');
  const [arrivals, setArrivals] = useState<ArrivalItemDto[]>([]);
  const [departures, setDepartures] = useState<DepartureItemDto[]>([]);
  const [inhouse, setInhouse] = useState<InHouseGuestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, d, i] = await Promise.all([frontDeskApi.getArrivals(), frontDeskApi.getDepartures(), frontDeskApi.getInHouse()]);
      setArrivals(a.data);
      setDepartures(d.data);
      setInhouse(i.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCheckIn = async (bookingId: string) => {
    setActing(bookingId);
    try { await bookingsApi.checkIn(bookingId); await load(); } finally { setActing(null); }
  };

  const handleCheckOut = async (bookingId: string) => {
    setActing(bookingId);
    try { await bookingsApi.checkOut(bookingId); await load(); } finally { setActing(null); }
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'arrivals', label: 'Заезды сегодня', icon: <LogIn size={16} />, count: arrivals.length },
    { key: 'departures', label: 'Выезды сегодня', icon: <LogOut size={16} />, count: departures.length },
    { key: 'inhouse', label: 'В отеле', icon: <Users size={16} />, count: inhouse.length },
  ];

  return (
    <div>
      <PageHeader
        title="Ресепшен"
        subtitle={new Date().toLocaleDateString('ru-KZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
            border: `1px solid ${tab === t.key ? '#3b82f6' : '#e2e8f0'}`,
            borderRadius: 8, background: tab === t.key ? '#eff6ff' : '#fff',
            color: tab === t.key ? '#1d4ed8' : '#64748b',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {t.icon} {t.label}
            <span style={{ background: tab === t.key ? '#3b82f6' : '#f1f5f9', color: tab === t.key ? '#fff' : '#64748b', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Загрузка...</div>
      ) : (
        <Card padding={0}>
          {tab === 'arrivals' && (
            arrivals.length === 0
              ? <Empty text="Нет заездов на сегодня" />
              : arrivals.map((a) => (
                <div key={a.bookingId} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {a.guestName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{a.guestName}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>№{a.roomNumber} · {a.roomTypeName} · {a.nights} ноч. · {formatCurrency(a.totalAmount)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Выезд: {formatDate(a.checkOutDate)}</div>
                  </div>
                  <StatusBadge status={a.status} />
                  {a.status === 'Confirmed' && (
                    <Button size="sm" icon={<LogIn size={13} />} loading={acting === a.bookingId} onClick={() => handleCheckIn(a.bookingId)}>
                      Заселить
                    </Button>
                  )}
                </div>
              ))
          )}

          {tab === 'departures' && (
            departures.length === 0
              ? <Empty text="Нет выездов на сегодня" />
              : departures.map((d) => (
                <div key={d.bookingId} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ecfeff', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {d.guestName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{d.guestName}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>№{d.roomNumber} · {d.roomTypeName} · {formatCurrency(d.totalAmount)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Выезд: {formatDate(d.checkOutDate)}</div>
                  </div>
                  <Button size="sm" variant="secondary" icon={<LogOut size={13} />} loading={acting === d.bookingId} onClick={() => handleCheckOut(d.bookingId)}>
                    Выселить
                  </Button>
                </div>
              ))
          )}

          {tab === 'inhouse' && (
            inhouse.length === 0
              ? <Empty text="В отеле нет гостей" />
              : inhouse.map((g) => (
                <div key={g.bookingId} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {g.guestName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{g.guestName}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>№{g.roomNumber} · {g.roomTypeName} · {g.nights} ноч.</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Выезд: {formatDate(g.checkOutDate)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{formatCurrency(g.totalAmount)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>итого</div>
                  </div>
                </div>
              ))
          )}
        </Card>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{text}</div>;
}
