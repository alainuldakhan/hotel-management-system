import { useEffect, useState } from 'react';
import { TrendingUp, BedDouble, Users, DollarSign, ArrowRight, CheckCircle, Clock, Wrench } from 'lucide-react';
import { analyticsApi } from '../../api/analytics';
import { frontDeskApi } from '../../api/frontDesk';
import type { DashboardStatsDto, ArrivalItemDto, DepartureItemDto } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import Card from '../../components/common/Card';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [arrivals, setArrivals] = useState<ArrivalItemDto[]>([]);
  const [departures, setDepartures] = useState<DepartureItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.getDashboard(), frontDeskApi.getArrivals(), frontDeskApi.getDepartures()])
      .then(([s, a, d]) => { setStats(s.data); setArrivals(a.data.slice(0, 6)); setDepartures(d.data.slice(0, 6)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#94a3b8', fontSize: 14 }}>
      Загрузка дашборда...
    </div>
  );

  const statCards = [
    { label: 'Загруженность', value: stats ? `${(stats.occupancyPercent || 0).toFixed(1)}%` : '—', sub: `${stats?.occupiedRooms ?? 0} из ${stats?.totalRooms ?? 0} номеров`, icon: <TrendingUp size={22} color="#3b82f6" />, iconBg: '#eff6ff' },
    { label: 'Выручка (месяц)', value: stats ? formatCurrency(stats.revenueThisMonth) : '—', sub: `Сегодня: ${formatCurrency(stats?.revenueToday ?? 0)}`, icon: <DollarSign size={22} color="#22c55e" />, iconBg: '#f0fdf4' },
    { label: 'Заезды сегодня', value: stats?.checkInsToday ?? '—', sub: `Выезды: ${stats?.checkOutsToday ?? 0}`, icon: <Users size={22} color="#eab308" />, iconBg: '#fefce8' },
    { label: 'Свободных номеров', value: stats ? (stats.totalRooms - stats.occupiedRooms) : '—', sub: `Всего: ${stats?.totalRooms ?? 0}`, icon: <BedDouble size={22} color="#8b5cf6" />, iconBg: '#f5f3ff' },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {statCards.map((c) => (
          <Card key={c.label}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.sub}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alert row */}
      {((stats?.pendingMaintenanceRequests ?? 0) > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {(stats?.pendingMaintenanceRequests ?? 0) > 0 && (
            <Link to="/maintenance" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={16} color="#ef4444" />
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{stats?.pendingMaintenanceRequests} заявок на тех. обслуживание</span>
                <ArrowRight size={14} color="#ef4444" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Arrivals & Departures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} color="#22c55e" />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Заезды сегодня</span>
              <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 11, padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>{arrivals.length}</span>
            </div>
            <Link to="/front-desk" style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Все →</Link>
          </div>
          {arrivals.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Нет заездов на сегодня</div>
            : arrivals.map((a) => (
              <div key={a.bookingId} style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{a.guestName}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>№{a.roomNumber} · {a.nights} ноч.</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
        </Card>

        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#06b6d4" />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Выезды сегодня</span>
              <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 11, padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>{departures.length}</span>
            </div>
            <Link to="/front-desk" style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Все →</Link>
          </div>
          {departures.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Нет выездов на сегодня</div>
            : departures.map((d) => (
              <div key={d.bookingId} style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{d.guestName}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>№{d.roomNumber} · до {formatDate(d.checkOutDate)}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{formatCurrency(d.totalAmount)}</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}
