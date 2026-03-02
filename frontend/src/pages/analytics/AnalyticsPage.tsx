import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, BarChart2 } from 'lucide-react';
import { analyticsApi } from '../../api/analytics';
import type { KpiStatsDto, OccupancyByRoomTypeDto, TopGuestDto } from '../../types/api';
import { formatCurrency, formatPercent, today, addDays } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';

export default function AnalyticsPage() {
  const [kpi, setKpi] = useState<KpiStatsDto | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyByRoomTypeDto[]>([]);
  const [topGuests, setTopGuests] = useState<TopGuestDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Default: last 30 days
  const dateFrom = addDays(today(), -30);
  const dateTo = today();

  useEffect(() => {
    Promise.all([
      analyticsApi.getKpi(dateFrom, dateTo),
      analyticsApi.getOccupancy(dateFrom, dateTo),
      analyticsApi.getTopGuests(8),
    ]).then(([k, o, g]) => {
      setKpi(k.data);
      setOccupancy(o.data);
      setTopGuests(g.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Загрузка аналитики...</div>;

  const kpiCards = [
    { label: 'ADR (средний тариф)', value: kpi ? formatCurrency(kpi.adr) : '—', icon: <DollarSign size={20} color="#3b82f6" />, bg: '#eff6ff', desc: 'Средняя цена за проданный номер' },
    { label: 'RevPAR', value: kpi ? formatCurrency(kpi.revPar) : '—', icon: <TrendingUp size={20} color="#22c55e" />, bg: '#f0fdf4', desc: 'Выручка на доступный номер' },
    { label: 'Загруженность', value: kpi ? formatPercent(kpi.occupancyPercent) : '—', icon: <BarChart2 size={20} color="#eab308" />, bg: '#fefce8', desc: 'Средняя за период' },
    { label: 'ALOS', value: kpi ? `${kpi.alos.toFixed(1)} ноч.` : '—', icon: <Users size={20} color="#8b5cf6" />, bg: '#f5f3ff', desc: 'Средняя длительность пребывания' },
  ];

  return (
    <div>
      <PageHeader
        title="Аналитика"
        subtitle={`Период: последние 30 дней`}
      />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map((c) => (
          <Card key={c.label}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Forward-looking stats */}
      {kpi && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Загрузка на горизонте</h3>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: '30 дней', value: kpi.roomsOnBooks30Days },
              { label: '60 дней', value: kpi.roomsOnBooks60Days },
              { label: '90 дней', value: kpi.roomsOnBooks90Days },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{item.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>забронировано на {item.label}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{kpi.totalRoomNightsSold}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>ночей продано (период)</div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Occupancy by room type */}
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Загрузка по типам номеров</h3>
          </div>
          {occupancy.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Нет данных</div>
          ) : (
            occupancy.map((o) => (
              <div key={o.roomTypeId} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{o.roomTypeName}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>{formatPercent(o.occupancyPercent)}</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(o.occupancyPercent, 100)}%`, background: o.occupancyPercent > 70 ? '#22c55e' : o.occupancyPercent > 40 ? '#eab308' : '#ef4444', borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                  <span>ADR: {formatCurrency(o.adr)}</span>
                  <span>Выручка: {formatCurrency(o.totalRevenue)}</span>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Top guests */}
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Топ гостей</h3>
          </div>
          {topGuests.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Нет данных</div>
          ) : (
            topGuests.map((g, i) => (
              <div key={g.guestId} style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? '#fefce8' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i < 3 ? '#a16207' : '#94a3b8', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{g.guestName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{g.guestEmail} · {g.totalBookings} бронир.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{formatCurrency(g.totalSpend)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>итого</div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
