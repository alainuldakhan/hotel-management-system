import type { BookingStatus, RoomStatus, PaymentStatus, MaintenanceStatus, MaintenancePriority, HousekeepingStatus } from '../../types/enums';

type Status = BookingStatus | RoomStatus | PaymentStatus | MaintenanceStatus | MaintenancePriority | HousekeepingStatus | string;

const CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  // Booking
  Pending:       { bg: '#fefce8', color: '#a16207', label: 'Ожидание' },
  Confirmed:     { bg: '#f0fdf4', color: '#166534', label: 'Подтверждено' },
  CheckedIn:     { bg: '#eff6ff', color: '#1d4ed8', label: 'Заселён' },
  CheckedOut:    { bg: '#f8fafc', color: '#475569', label: 'Выехал' },
  Cancelled:     { bg: '#fef2f2', color: '#dc2626', label: 'Отменено' },
  NoShow:        { bg: '#f8fafc', color: '#94a3b8', label: 'Не явился' },
  // Room
  Available:     { bg: '#f0fdf4', color: '#166534', label: 'Свободен' },
  Occupied:      { bg: '#eff6ff', color: '#1d4ed8', label: 'Занят' },
  Cleaning:      { bg: '#fefce8', color: '#a16207', label: 'Уборка' },
  Maintenance:   { bg: '#fef2f2', color: '#dc2626', label: 'Техобслуживание' },
  OutOfService:  { bg: '#f8fafc', color: '#475569', label: 'Не в сервисе' },
  // Payment
  PartiallyPaid: { bg: '#fff7ed', color: '#c2410c', label: 'Частично оплачен' },
  Paid:          { bg: '#f0fdf4', color: '#166534', label: 'Оплачен' },
  Refunded:      { bg: '#f8fafc', color: '#64748b', label: 'Возврат' },
  Failed:        { bg: '#fef2f2', color: '#dc2626', label: 'Ошибка' },
  // Maintenance status
  New:           { bg: '#fef2f2', color: '#dc2626', label: 'Новая' },
  InProgress:    { bg: '#eff6ff', color: '#1d4ed8', label: 'В работе' },
  Completed:     { bg: '#f0fdf4', color: '#166534', label: 'Выполнено' },
  // Priority
  Low:           { bg: '#f8fafc', color: '#475569', label: 'Низкий' },
  Medium:        { bg: '#fefce8', color: '#a16207', label: 'Средний' },
  High:          { bg: '#fff7ed', color: '#c2410c', label: 'Высокий' },
  Critical:      { bg: '#fef2f2', color: '#dc2626', label: 'Критический' },
  // Housekeeping task types
  General:       { bg: '#f8fafc', color: '#475569', label: 'Уборка' },
  Checkout:      { bg: '#fff7ed', color: '#c2410c', label: 'После выезда' },
  Turndown:      { bg: '#fefce8', color: '#a16207', label: 'Вечерняя' },
  DeepCleaning:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Генеральная' },
  Replenishment: { bg: '#f0fdf4', color: '#166534', label: 'Пополнение' },
};

interface Props {
  status: Status;
  label?: string;
}

export default function StatusBadge({ status, label }: Props) {
  const cfg = CONFIG[status] ?? { bg: '#f8fafc', color: '#475569', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 4,
      fontSize: 12, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      {label ?? cfg.label}
    </span>
  );
}
