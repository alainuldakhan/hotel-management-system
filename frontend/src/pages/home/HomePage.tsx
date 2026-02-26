import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Checkbox, DatePicker, Popover, Spin, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useAuth } from '../../hooks/useAuth';
import { roomTypesApi } from '../../api/roomTypes';
import { servicesApi } from '../../api/additionalServices';
import { reviewsApi } from '../../api/reviews';

dayjs.locale('ru');

const { RangePicker } = DatePicker;

interface GuestCount {
  adults: number;
  children: number;
  rooms: number;
}

const NAV_PILLS = [
  {
    label: 'Номера',
    anchor: 'rooms-section',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M2 9V19H22V9" /><path d="M2 9L12 3L22 9" /><rect x="9" y="13" width="6" height="6" />
      </svg>
    ),
  },
  {
    label: 'Услуги',
    anchor: 'services-section',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    label: 'Акции',
    anchor: 'offers-section',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    label: 'Отзывы',
    anchor: 'reviews-section',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const ROOM_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop',
];



const WHY_FEATURES = [
  {
    title: 'Лучшая гарантия цены',
    desc: 'Бронируйте напрямую — мы гарантируем лучшую цену без скрытых комиссий.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0071c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Бесплатная отмена',
    desc: 'Отменяйте бронирование без штрафа за 24 часа до заезда.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0071c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'Уборка каждый день',
    desc: 'Профессиональная уборка, свежее бельё и полотенца ежедневно.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0071c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    title: 'Поддержка 24/7',
    desc: 'Наша служба поддержки готова помочь вам в любое время суток.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0071c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

function getServiceIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('завтрак') || n.includes('питани') || n.includes('ресторан') || n.includes('кофе')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    );
  }
  if (n.includes('трансфер') || n.includes('аэропорт') || n.includes('такси') || n.includes('автомобил')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }
  if (n.includes('спа') || n.includes('бассейн') || n.includes('сауна') || n.includes('массаж')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <path d="M12 22s-8-5-8-11a8 8 0 0 1 16 0c0 6-8 11-8 11z" />
      </svg>
    );
  }
  if (n.includes('парковк') || n.includes('автостоянк')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </svg>
    );
  }
  if (n.includes('прачечн') || n.includes('стирк') || n.includes('химчистк')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <path d="M3 6a9 9 0 1 0 18 0" /><path d="M3 6H2" /><path d="M22 6h-1" />
        <path d="M21 6a9 9 0 0 1-9 9" /><path d="M12 15a9 9 0 0 1-9-9" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [guests, setGuests] = useState<GuestCount>({ adults: 2, children: 0, rooms: 1 });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [transferNeeded, setTransferNeeded] = useState(false);
  const [activePill, setActivePill] = useState('Номера');

  const { data: roomTypes = [], isLoading: roomTypesLoading } = useQuery({
    queryKey: ['room-types-public'],
    queryFn: roomTypesApi.getAll,
    select: (types) => types.filter((t) => t.isActive),
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services-public'],
    queryFn: servicesApi.getAll,
    select: (list) => list.filter((s) => s.isActive),
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews-public'],
    queryFn: () => reviewsApi.getAll(undefined, 1, 6),
  });

  /* ── Search handler ─────────────────────────────────────────── */
  const handleSearch = () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning('Пожалуйста, выберите даты заезда и выезда');
      return;
    }
    const params = new URLSearchParams({
      checkIn: dateRange[0].format('YYYY-MM-DD'),
      checkOut: dateRange[1].format('YYYY-MM-DD'),
      adults: String(guests.adults),
      ...(transferNeeded ? { transfer: '1' } : {}),
    });
    navigate(user ? `/bookings/new?${params}` : '/login');
  };

  /* ── Pill navigation ─────────────────────────────────────────── */
  const handlePillClick = (pill: (typeof NAV_PILLS)[0]) => {
    setActivePill(pill.label);
    document.getElementById(pill.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── Room type quick-book ────────────────────────────────────── */
  const handleBookRoom = () => {
    if (!user) { navigate('/login'); return; }
    const params = new URLSearchParams({ adults: String(guests.adults) });
    if (dateRange[0]) params.set('checkIn', dateRange[0].format('YYYY-MM-DD'));
    if (dateRange[1]) params.set('checkOut', dateRange[1].format('YYYY-MM-DD'));
    navigate(`/bookings/new?${params}`);
  };

  /* ── Guests label ────────────────────────────────────────────── */
  const guestsLabel = [
    `${guests.adults} взр.`,
    guests.children > 0 ? `${guests.children} дет.` : null,
    `${guests.rooms} ном.`,
  ]
    .filter(Boolean)
    .join(' · ');

  /* ── Counter row for guests popover ─────────────────────────── */
  const counterRow = (label: string, sublabel: string, key: keyof GuestCount, min: number) => (
    <div
      key={key}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f2f6fa' }}
    >
      <div>
        <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => setGuests((g) => ({ ...g, [key]: Math.max(min, g[key] - 1) }))}
          disabled={guests[key] <= min}
          style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${guests[key] <= min ? '#e2e8f0' : '#0071c2'}`, background: '#fff', cursor: guests[key] <= min ? 'not-allowed' : 'pointer', fontSize: 20, lineHeight: 1, color: guests[key] <= min ? '#c0c4cc' : '#0071c2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          −
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', minWidth: 20, textAlign: 'center' }}>
          {guests[key]}
        </span>
        <button
          onClick={() => setGuests((g) => ({ ...g, [key]: Math.min(10, g[key] + 1) }))}
          disabled={guests[key] >= 10}
          style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${guests[key] >= 10 ? '#e2e8f0' : '#0071c2'}`, background: '#fff', cursor: guests[key] >= 10 ? 'not-allowed' : 'pointer', fontSize: 20, lineHeight: 1, color: guests[key] >= 10 ? '#c0c4cc' : '#0071c2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          +
        </button>
      </div>
    </div>
  );

  const guestsContent = (
    <div style={{ width: 300 }}>
      {counterRow('Взрослые', 'от 18 лет', 'adults', 1)}
      {counterRow('Дети', '0–17 лет', 'children', 0)}
      {counterRow('Номера', '', 'rooms', 1)}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" style={{ background: '#0071c2', fontWeight: 700, borderRadius: 6 }} onClick={() => setGuestsOpen(false)}>
          Готово
        </Button>
      </div>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '"DM Sans", sans-serif' }}>

      {/* ═══ HERO ════════════════════════════════════════════════ */}
      <div style={{ background: '#003580', color: '#ffffff', paddingBottom: 52 }}>

        {/* Row 1: Logo + Auth */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFB700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>Roomy</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500 }}>{user.firstName}</span>
                <Button
                  style={{ background: '#FFB700', color: '#003580', fontWeight: 700, border: 'none', borderRadius: 6, height: 36 }}
                  onClick={() => navigate('/dashboard')}
                >
                  Мой кабинет
                </Button>
              </>
            ) : (
              <>
                <span
                  style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500 }}
                  onClick={() => message.info('Служба поддержки: +7 (727) 000-00-00')}
                >
                  Служба поддержки
                </span>
                <Button
                  style={{ color: '#003580', fontWeight: 600, borderRadius: 6, height: 36, border: '2px solid #ffffff', background: '#ffffff' }}
                  onClick={() => navigate('/login')}
                >
                  Регистрация
                </Button>
                <Button
                  style={{ color: '#ffffff', fontWeight: 600, borderRadius: 6, height: 36, border: '2px solid #ffffff', background: 'transparent' }}
                  onClick={() => navigate('/login')}
                >
                  Войти
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Nav pills */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 20px', display: 'flex', gap: 4 }}>
          {NAV_PILLS.map((pill) => {
            const isActive = activePill === pill.label;
            return (
              <div
                key={pill.label}
                onClick={() => handlePillClick(pill)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: isActive ? '2px solid #ffffff' : '2px solid transparent', borderRadius: 30, background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#ffffff', transition: 'background 0.15s', userSelect: 'none', whiteSpace: 'nowrap' as const }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {pill.icon}
                {pill.label}
              </div>
            );
          })}
        </div>

        {/* Hero title */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 20px' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.2 }}>
            Забронируйте идеальный номер
          </h1>
          <p style={{ fontSize: 20, margin: 0, opacity: 0.85, fontWeight: 400 }}>
            Бронируйте напрямую в Roomy — лучшие цены с гарантией комфорта
          </p>
        </div>
      </div>

      {/* ═══ SEARCH BAR ══════════════════════════════════════════ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{ background: '#FFB700', padding: 4, borderRadius: 8, display: 'flex', marginTop: -32, boxShadow: '0 4px 20px rgba(0,0,0,0.22)', gap: 4, height: 64 }}
        >
          {/* Dates */}
          <div style={{ flex: 2, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 14px', overflow: 'hidden', gap: 8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, color: '#6b7280', flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates ? [dates[0], dates[1]] : [null, null])}
              format="D MMM"
              placeholder={['Дата заезда', 'Дата выезда']}
              disabledDate={(d) => d.isBefore(dayjs(), 'day')}
              variant="borderless"
              style={{ flex: 1, fontSize: 15, fontWeight: 600, padding: 0, minWidth: 0 }}
              separator="—"
              suffixIcon={null}
              allowClear={false}
              popupStyle={{ fontFamily: '"DM Sans", sans-serif' }}
            />
          </div>

          {/* Guests */}
          <Popover
            content={guestsContent}
            trigger="click"
            placement="bottom"
            open={guestsOpen}
            onOpenChange={setGuestsOpen}
            overlayInnerStyle={{ padding: 0, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            <div style={{ flex: 1.2, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 14px', cursor: 'pointer', gap: 8, userSelect: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, color: '#6b7280', flexShrink: 0 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{guestsLabel}</span>
            </div>
          </Popover>

          {/* Button */}
          <Button
            type="primary"
            style={{ flex: '0 0 148px', height: '100%', background: '#0071c2', borderRadius: 4, fontSize: 17, fontWeight: 700, border: 'none' }}
            onClick={handleSearch}
          >
            Найти номер
          </Button>
        </div>

        {/* Transfer */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1a1a2e' }}>
          <Checkbox checked={transferNeeded} onChange={(e) => setTransferNeeded(e.target.checked)}>
            Нужен трансфер от аэропорта
          </Checkbox>
        </div>
      </div>

      {/* ═══ ROOM TYPES ══════════════════════════════════════════ */}
      <div id="rooms-section" style={{ background: '#ffffff', marginTop: 56, paddingBottom: 64, scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 52, marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px 0' }}>Наши номера</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Найдите идеальный вариант для вашего отдыха</p>
          </div>

          {roomTypesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '56px 0' }}>
              <Spin size="large" />
            </div>
          ) : roomTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: '#6b7280', fontSize: 16 }}>
              Информация о номерах скоро появится
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {roomTypes.map((type, idx) => (
                <div
                  key={type.id}
                  style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,53,128,0.07)', transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,53,128,0.15)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,53,128,0.07)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ height: 200, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={type.imageUrl || ROOM_FALLBACK_IMAGES[idx % ROOM_FALLBACK_IMAGES.length]}
                      alt={type.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>{type.name}</div>
                    <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.55, marginBottom: 16, flex: 1 }}>
                      {type.description || 'Комфортный номер с современными удобствами'}
                    </div>
                    <div style={{ display: 'flex', gap: 18, marginBottom: 18, fontSize: 13, color: '#4b5563' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                        до {type.maxOccupancy} гостей
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                        {type.area} м²
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 22, fontWeight: 800, color: '#003580' }}>
                          {type.basePrice.toLocaleString('ru-RU')} ₸
                        </span>
                        <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>/ночь</span>
                      </div>
                      <Button
                        type="primary"
                        style={{ background: '#0071c2', fontWeight: 700, borderRadius: 6, height: 38, padding: '0 20px', border: 'none' }}
                        onClick={handleBookRoom}
                      >
                        Забронировать
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ SERVICES ════════════════════════════════════════════ */}
      <div id="services-section" style={{ background: '#f0f4f8', paddingBottom: 64, scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 52, marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px 0' }}>Наши услуги</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Дополнительные сервисы для вашего комфорта</p>
          </div>

          {servicesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <Spin size="large" />
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280', fontSize: 16 }}>
              Информация об услугах скоро появится
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {services.map((service) => (
                <div
                  key={service.id}
                  style={{ background: '#ffffff', borderRadius: 12, padding: '24px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,53,128,0.06)', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,53,128,0.12)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,53,128,0.06)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ width: 52, height: 52, background: '#dbeafe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#1d4ed8' }}>
                    {getServiceIcon(service.name)}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>{service.name}</div>
                  {service.description && (
                    <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5, marginBottom: 14 }}>{service.description}</div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#003580' }}>
                    {service.price.toLocaleString('ru-RU')} ₸
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ WHY ROOMY ═══════════════════════════════════════════ */}
      <div style={{ background: '#ffffff', paddingBottom: 64 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 52, marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px 0' }}>Почему выбирают Roomy?</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Мы заботимся о каждом госте</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {WHY_FEATURES.map((f, idx) => (
              <div key={idx} style={{ background: '#f8faff', borderRadius: 12, padding: '24px 20px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 8, lineHeight: 1.35 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ REVIEWS ═════════════════════════════════════════════ */}
      <div id="reviews-section" style={{ background: '#f0f4f8', paddingBottom: 64, scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 52, marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px 0' }}>Отзывы гостей</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Нам доверяют сотни гостей</p>
          </div>
          {reviewsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <Spin size="large" />
            </div>
          ) : !reviewsData || reviewsData.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280', fontSize: 16 }}>
              Отзывов пока нет
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {reviewsData.items.map((review) => (
                <div key={review.id} style={{ background: '#ffffff', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,53,128,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill={i < review.rating ? '#FFB700' : '#e2e8f0'}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.65, marginBottom: 20, flex: 1, fontStyle: 'italic' }}>
                    "{review.comment || 'Отличный отель!'}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{review.guestFullName}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{review.roomTypeName}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {new Date(review.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ OFFERS ══════════════════════════════════════════════ */}
      <div id="offers-section" style={{ background: '#ffffff', paddingBottom: 64, scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 52, marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px 0' }}>Спецпредложения</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Акции и специальные тарифы для вас</p>
          </div>

          <div
            style={{ background: 'linear-gradient(135deg, #003580 0%, #0059a8 55%, #0071c2 100%)', borderRadius: 16, padding: '40px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 24px rgba(0,53,128,0.25)', overflow: 'hidden', position: 'relative' }}
          >
            <div style={{ position: 'absolute', right: -70, top: -70, width: 280, height: 280, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ maxWidth: '60%', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-block', background: '#FFB700', color: '#003580', fontWeight: 700, fontSize: 11, padding: '4px 12px', borderRadius: 100, marginBottom: 16, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                Горячее предложение
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', marginBottom: 12, lineHeight: 1.3 }}>
                Скидка 15% на длительное проживание
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 28, lineHeight: 1.65 }}>
                Забронируйте от 3 ночей и сэкономьте 15%. Акция действует до 1 апреля 2026 года.
              </div>
              <Button
                style={{ background: '#FFB700', color: '#003580', fontWeight: 700, borderRadius: 8, height: 44, padding: '0 28px', fontSize: 15, border: 'none' }}
                onClick={() => navigate(user ? '/bookings/new' : '/login')}
              >
                Забронировать со скидкой
              </Button>
            </div>
            <div style={{ width: 190, height: 170, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=380&h=340&fit=crop"
                alt="Спецпредложение"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ══════════════════════════════════════════════ */}
      <footer style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.7)', padding: '44px 20px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 14, letterSpacing: '-0.3px' }}>Roomy</div>
              <div style={{ fontSize: 14, lineHeight: 1.75 }}>
                Премиальный отель в центре города. Мы заботимся о вашем комфорте и создаём незабываемые воспоминания.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Навигация</div>
              {NAV_PILLS.map((pill) => (
                <div
                  key={pill.label}
                  style={{ fontSize: 14, marginBottom: 12, cursor: 'pointer', transition: 'color 0.15s' }}
                  onClick={() => handlePillClick(pill)}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                >
                  {pill.label}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Контакты</div>
              <div style={{ fontSize: 14, marginBottom: 10 }}>г. Алматы, ул. Примерная, 1</div>
              <div style={{ fontSize: 14, marginBottom: 10 }}>+7 (727) 000-00-00</div>
              <div style={{ fontSize: 14, marginBottom: 10 }}>info@roomy.kz</div>
              <div style={{ fontSize: 14 }}>Ресепшн: 24/7</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <div>© 2026 Roomy. Все права защищены.</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <span style={{ cursor: 'pointer' }}>Политика конфиденциальности</span>
              <span style={{ cursor: 'pointer' }}>Условия бронирования</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
