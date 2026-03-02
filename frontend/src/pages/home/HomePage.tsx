import { useNavigate } from 'react-router-dom';
import {
  LogIn, UserPlus, BedDouble, CalendarCheck, BarChart3,
  Shield, Wrench, Sparkles, TrendingUp, ArrowRight,
} from 'lucide-react';
import iconUrl from '../../assets/icon.png';

const FEATURES = [
  { icon: BedDouble,     color: '#3b82f6', bg: '#eff6ff', title: 'Управление номерами',  desc: 'Статусы в реальном времени, блокировка и история обслуживания каждого номера.' },
  { icon: CalendarCheck, color: '#8b5cf6', bg: '#f5f3ff', title: 'Бронирования',          desc: 'Полный цикл: создание, подтверждение, QR-заселение и выезд гостя.' },
  { icon: BarChart3,     color: '#0ea5e9', bg: '#f0f9ff', title: 'Аналитика и KPI',       desc: 'RevPAR, ADR, загрузка по типам номеров — все метрики в одном месте.' },
  { icon: Sparkles,      color: '#10b981', bg: '#f0fdf4', title: 'Горничные',             desc: 'Задания на уборку, смена белья, контроль выполнения в реальном времени.' },
  { icon: Wrench,        color: '#f59e0b', bg: '#fffbeb', title: 'Техобслуживание',       desc: 'Заявки с приоритетами, назначение ответственных и закрытие задач.' },
  { icon: Shield,        color: '#ef4444', bg: '#fef2f2', title: 'Ролевой доступ',        desc: 'Разграничение прав: ресепшн, горничные, техники, менеджеры и гости.' },
];

const STATS = [
  { value: '6',   label: 'ролей пользователей', icon: Shield },
  { value: '14+', label: 'модулей системы',      icon: TrendingUp },
  { value: '∞',   label: 'масштабируемость',     icon: ArrowRight },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', padding: '0 56px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={iconUrl} alt="Roomy" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: 19, color: '#0f172a' }}>Roomy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '8px 20px', background: 'transparent', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '8px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)', padding: '80px 56px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 52, fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginBottom: 22, letterSpacing: '-0.02em' }}>
              Управляйте<br />
              отелем{' '}
              <span style={{ color: '#3b82f6' }}>с уверенностью</span>
            </h1>

            <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.75, marginBottom: 40, maxWidth: 480 }}>
              Roomy полная платформа для гостиничного бизнеса. Бронирования, заселение, уборка, техобслуживание и аналитика в одном окне.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
              <button
                onClick={() => navigate('/login')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                <LogIn size={17} />
                Войти в систему
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                <UserPlus size={17} />
                Создать аккаунт
              </button>
            </div>

            {/* Trust line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {['Безопасно', 'Быстро', 'Надёжно'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#10b981' }}>✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — mock dashboard card */}
          <div style={{ position: 'relative' }}>
            {/* Shadow blur behind card */}
            <div style={{ position: 'absolute', inset: -24, background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: 32 }} />

            <div style={{ position: 'relative', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 24px 64px rgba(0,0,0,0.09)', overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={iconUrl} alt="Roomy" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Roomy Dashboard</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Обзор за сегодня</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                  Онлайн
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderBottom: '1px solid #f1f5f9' }}>
                {[
                  { label: 'Заняты', value: '87%', sub: 'загрузка', color: '#3b82f6' },
                  { label: 'Заселений', value: '12', sub: 'сегодня', color: '#8b5cf6' },
                  { label: 'Доход', value: '450K', sub: 'тенге', color: '#10b981' },
                ].map((s, i) => (
                  <div key={s.label} style={{ padding: '18px 20px', borderRight: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 3 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Occupancy bar */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Загрузка</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>87%</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ width: '87%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 8 }} />
                </div>
              </div>

              {/* Room status list */}
              <div style={{ padding: '16px 24px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Статус номеров</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Свободных', count: 8,  color: '#10b981', bg: '#f0fdf4' },
                    { label: 'Занятых',   count: 54, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Уборка',    count: 6,  color: '#f59e0b', bg: '#fffbeb' },
                  ].map((r) => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                        <span style={{ fontSize: 13, color: '#475569' }}>{r.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: r.color, background: r.bg, padding: '2px 10px', borderRadius: 6 }}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: -16, right: 24, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>+24% доход</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>по сравнению с прошлым месяцем</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 56px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderRight: i < 2 ? '1px solid #f1f5f9' : 'none', paddingLeft: i > 0 ? 48 : 0 }}>
              <div style={{ width: 44, height: 44, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: '#f8fafc', padding: '80px 56px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 14, letterSpacing: '-0.02em' }}>Всё необходимое в одном месте</h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              Roomy покрывает все процессы отеля от бронирования до аналитики.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 44, height: 44, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
