import { Tag } from 'antd';
import { BookingStatus, HousekeepingStatus, HousekeepingTaskType, MaintenancePriority, MaintenanceStatus, PaymentStatus, RoomStatus } from '../../types/enums';

const roomStatusConfig: Record<RoomStatus, { color: string; label: string }> = {
  [RoomStatus.Available]: { color: 'green', label: 'Свободен' },
  [RoomStatus.Occupied]: { color: 'red', label: 'Занят' },
  [RoomStatus.Cleaning]: { color: 'orange', label: 'Уборка' },
  [RoomStatus.Maintenance]: { color: 'volcano', label: 'Ремонт' },
  [RoomStatus.OutOfService]: { color: 'default', label: 'Не работает' },
};

const bookingStatusConfig: Record<BookingStatus, { color: string; label: string }> = {
  [BookingStatus.Pending]: { color: 'default', label: 'Ожидает' },
  [BookingStatus.Confirmed]: { color: 'blue', label: 'Подтверждён' },
  [BookingStatus.CheckedIn]: { color: 'green', label: 'Заселён' },
  [BookingStatus.CheckedOut]: { color: 'purple', label: 'Выселен' },
  [BookingStatus.Cancelled]: { color: 'red', label: 'Отменён' },
  [BookingStatus.NoShow]: { color: 'magenta', label: 'Неявка' },
};

const paymentStatusConfig: Record<PaymentStatus, { color: string; label: string }> = {
  [PaymentStatus.Pending]: { color: 'default', label: 'Ожидает' },
  [PaymentStatus.Paid]: { color: 'green', label: 'Оплачен' },
  [PaymentStatus.PartiallyPaid]: { color: 'orange', label: 'Частично' },
  [PaymentStatus.Refunded]: { color: 'cyan', label: 'Возврат' },
  [PaymentStatus.Failed]: { color: 'red', label: 'Ошибка' },
};

const maintenanceStatusConfig: Record<MaintenanceStatus, { color: string; label: string }> = {
  [MaintenanceStatus.New]: { color: 'blue', label: 'Новая' },
  [MaintenanceStatus.InProgress]: { color: 'orange', label: 'В работе' },
  [MaintenanceStatus.Completed]: { color: 'green', label: 'Выполнена' },
  [MaintenanceStatus.Cancelled]: { color: 'default', label: 'Отменена' },
};

const priorityConfig: Record<MaintenancePriority, { color: string; label: string }> = {
  [MaintenancePriority.Low]: { color: 'default', label: 'Низкий' },
  [MaintenancePriority.Medium]: { color: 'blue', label: 'Средний' },
  [MaintenancePriority.High]: { color: 'orange', label: 'Высокий' },
  [MaintenancePriority.Critical]: { color: 'red', label: 'Критический' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const cfg = roomStatusConfig[status] ?? { color: 'default', label: status };
  return <Tag color={cfg.color}>{cfg.label}</Tag>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = bookingStatusConfig[status] ?? { color: 'default', label: status };
  return <Tag color={cfg.color}>{cfg.label}</Tag>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = paymentStatusConfig[status] ?? { color: 'default', label: status };
  return <Tag color={cfg.color}>{cfg.label}</Tag>;
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  const cfg = maintenanceStatusConfig[status] ?? { color: 'default', label: status };
  return <Tag color={cfg.color}>{cfg.label}</Tag>;
}

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  const cfg = priorityConfig[priority] ?? { color: 'default', label: priority };
  return <Tag color={cfg.color}>{cfg.label}</Tag>;
}

const housekeepingStatusConfig: Record<HousekeepingStatus, { color: string; label: string }> = {
  [HousekeepingStatus.Pending]: { color: 'default', label: 'Ожидает' },
  [HousekeepingStatus.InProgress]: { color: 'orange', label: 'В работе' },
  [HousekeepingStatus.Completed]: { color: 'green', label: 'Выполнена' },
  [HousekeepingStatus.Cancelled]: { color: 'red', label: 'Отменена' },
};

const housekeepingTypeConfig: Record<HousekeepingTaskType, { label: string }> = {
  [HousekeepingTaskType.General]: { label: 'Общая уборка' },
  [HousekeepingTaskType.Checkout]: { label: 'После выезда' },
  [HousekeepingTaskType.Turndown]: { label: 'Вечерняя' },
  [HousekeepingTaskType.DeepCleaning]: { label: 'Глубокая уборка' },
  [HousekeepingTaskType.Replenishment]: { label: 'Пополнение' },
};

export function HousekeepingStatusBadge({ status }: { status: HousekeepingStatus }) {
  const cfg = housekeepingStatusConfig[status] ?? { color: 'default', label: status };
  return <Tag color={cfg.color}>{cfg.label}</Tag>;
}

export function HousekeepingTypeBadge({ type }: { type: HousekeepingTaskType }) {
  const cfg = housekeepingTypeConfig[type] ?? { label: type };
  return <Tag>{cfg.label}</Tag>;
}

export function housekeepingTypeLabel(type: HousekeepingTaskType): string {
  return housekeepingTypeConfig[type]?.label ?? type;
}
