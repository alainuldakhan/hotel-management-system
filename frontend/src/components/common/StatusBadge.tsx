import {
  BookingStatus,
  HousekeepingStatus,
  HousekeepingTaskType,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentStatus,
  RoomStatus,
} from '../../types/enums';

/* ── helpers ─────────────────────────────────────────── */
type PillColor =
  | 'green' | 'red' | 'blue' | 'orange'
  | 'purple' | 'gray' | 'yellow' | 'cyan'
  | 'magenta' | 'volcano';

function Pill({ color, label }: { color: PillColor; label: string }) {
  return <span className={`status-pill status-pill--${color}`}>{label}</span>;
}

/* ── Room Status ─────────────────────────────────────── */
const roomStatusConfig: Record<RoomStatus, { color: PillColor; label: string }> = {
  [RoomStatus.Available]:    { color: 'green',   label: 'Свободен' },
  [RoomStatus.Occupied]:     { color: 'red',     label: 'Занят' },
  [RoomStatus.Cleaning]:     { color: 'orange',  label: 'Уборка' },
  [RoomStatus.Maintenance]:  { color: 'volcano', label: 'Ремонт' },
  [RoomStatus.OutOfService]: { color: 'gray',    label: 'Не работает' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const cfg = roomStatusConfig[status] ?? { color: 'gray' as PillColor, label: status };
  return <Pill color={cfg.color} label={cfg.label} />;
}

/* ── Booking Status ──────────────────────────────────── */
const bookingStatusConfig: Record<BookingStatus, { color: PillColor; label: string }> = {
  [BookingStatus.Pending]:    { color: 'gray',    label: 'Ожидает' },
  [BookingStatus.Confirmed]:  { color: 'blue',    label: 'Подтверждён' },
  [BookingStatus.CheckedIn]:  { color: 'green',   label: 'Заселён' },
  [BookingStatus.CheckedOut]: { color: 'purple',  label: 'Выселен' },
  [BookingStatus.Cancelled]:  { color: 'red',     label: 'Отменён' },
  [BookingStatus.NoShow]:     { color: 'magenta', label: 'Неявка' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = bookingStatusConfig[status] ?? { color: 'gray' as PillColor, label: status };
  return <Pill color={cfg.color} label={cfg.label} />;
}

/* ── Payment Status ──────────────────────────────────── */
const paymentStatusConfig: Record<PaymentStatus, { color: PillColor; label: string }> = {
  [PaymentStatus.Pending]:       { color: 'gray',   label: 'Ожидает' },
  [PaymentStatus.Paid]:          { color: 'green',  label: 'Оплачен' },
  [PaymentStatus.PartiallyPaid]: { color: 'orange', label: 'Частично' },
  [PaymentStatus.Refunded]:      { color: 'cyan',   label: 'Возврат' },
  [PaymentStatus.Failed]:        { color: 'red',    label: 'Ошибка' },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = paymentStatusConfig[status] ?? { color: 'gray' as PillColor, label: status };
  return <Pill color={cfg.color} label={cfg.label} />;
}

/* ── Maintenance Status ──────────────────────────────── */
const maintenanceStatusConfig: Record<MaintenanceStatus, { color: PillColor; label: string }> = {
  [MaintenanceStatus.New]:        { color: 'blue',   label: 'Новая' },
  [MaintenanceStatus.InProgress]: { color: 'orange', label: 'В работе' },
  [MaintenanceStatus.Completed]:  { color: 'green',  label: 'Выполнена' },
  [MaintenanceStatus.Cancelled]:  { color: 'gray',   label: 'Отменена' },
};

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  const cfg = maintenanceStatusConfig[status] ?? { color: 'gray' as PillColor, label: status };
  return <Pill color={cfg.color} label={cfg.label} />;
}

/* ── Priority Badge ──────────────────────────────────── */
const priorityConfig: Record<MaintenancePriority, { color: PillColor; label: string }> = {
  [MaintenancePriority.Low]:      { color: 'gray',   label: 'Низкий' },
  [MaintenancePriority.Medium]:   { color: 'blue',   label: 'Средний' },
  [MaintenancePriority.High]:     { color: 'orange', label: 'Высокий' },
  [MaintenancePriority.Critical]: { color: 'red',    label: 'Критический' },
};

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  const cfg = priorityConfig[priority] ?? { color: 'gray' as PillColor, label: priority };
  return <Pill color={cfg.color} label={cfg.label} />;
}

/* ── Housekeeping Status ─────────────────────────────── */
const housekeepingStatusConfig: Record<HousekeepingStatus, { color: PillColor; label: string }> = {
  [HousekeepingStatus.Pending]:    { color: 'gray',   label: 'Ожидает' },
  [HousekeepingStatus.InProgress]: { color: 'orange', label: 'В работе' },
  [HousekeepingStatus.Completed]:  { color: 'green',  label: 'Выполнена' },
  [HousekeepingStatus.Cancelled]:  { color: 'red',    label: 'Отменена' },
};

export function HousekeepingStatusBadge({ status }: { status: HousekeepingStatus }) {
  const cfg = housekeepingStatusConfig[status] ?? { color: 'gray' as PillColor, label: status };
  return <Pill color={cfg.color} label={cfg.label} />;
}

/* ── Housekeeping Type ───────────────────────────────── */
const housekeepingTypeConfig: Record<HousekeepingTaskType, { label: string }> = {
  [HousekeepingTaskType.General]:      { label: 'Общая уборка' },
  [HousekeepingTaskType.Checkout]:     { label: 'После выезда' },
  [HousekeepingTaskType.Turndown]:     { label: 'Вечерняя' },
  [HousekeepingTaskType.DeepCleaning]: { label: 'Глубокая уборка' },
  [HousekeepingTaskType.Replenishment]:{ label: 'Пополнение' },
};

export function HousekeepingTypeBadge({ type }: { type: HousekeepingTaskType }) {
  const cfg = housekeepingTypeConfig[type] ?? { label: type };
  return <span className="status-pill status-pill--blue">{cfg.label}</span>;
}

export function housekeepingTypeLabel(type: HousekeepingTaskType): string {
  return housekeepingTypeConfig[type]?.label ?? type;
}
