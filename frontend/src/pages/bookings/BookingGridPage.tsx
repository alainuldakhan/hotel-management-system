import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DatePicker, Spin, Alert, Tooltip, Tag, Typography, Space, Button, Card } from 'antd';
import { CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { bookingsApi } from '../../api/bookings';
import { BookingStatus, RoomStatus } from '../../types/enums';
import type { BookingGridItemDto, RoomGridRowDto } from '../../types/api';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ── Цвета статусов бронирования ───────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  [BookingStatus.Pending]:    '#fa8c16',
  [BookingStatus.Confirmed]:  '#1677ff',
  [BookingStatus.CheckedIn]:  '#52c41a',
  [BookingStatus.CheckedOut]: '#8c8c8c',
  [BookingStatus.Cancelled]:  '#ff4d4f',
  [BookingStatus.NoShow]:     '#722ed1',
};

const STATUS_LABELS: Record<string, string> = {
  [BookingStatus.Pending]:    'Ожидает',
  [BookingStatus.Confirmed]:  'Подтверждено',
  [BookingStatus.CheckedIn]:  'Заселён',
  [BookingStatus.CheckedOut]: 'Выселен',
  [BookingStatus.Cancelled]:  'Отменено',
  [BookingStatus.NoShow]:     'Не явился',
};

const ROOM_STATUS_COLORS: Record<string, string> = {
  [RoomStatus.Available]:    '#52c41a',
  [RoomStatus.Occupied]:     '#1677ff',
  [RoomStatus.Cleaning]:     '#fa8c16',
  [RoomStatus.Maintenance]:  '#ff4d4f',
  [RoomStatus.OutOfService]: '#8c8c8c',
};

const ROOM_STATUS_LABELS: Record<string, string> = {
  [RoomStatus.Available]:    'Свободен',
  [RoomStatus.Occupied]:     'Занят',
  [RoomStatus.Cleaning]:     'Уборка',
  [RoomStatus.Maintenance]:  'Ремонт',
  [RoomStatus.OutOfService]: 'Закрыт',
};

// ── Вспомогательные функции ───────────────────────────────────────────────────

function generateDays(startDate: Dayjs, endDate: Dayjs): Dayjs[] {
  const days: Dayjs[] = [];
  let current = startDate.startOf('day');
  const end = endDate.startOf('day');
  while (!current.isAfter(end)) {
    days.push(current);
    current = current.add(1, 'day');
  }
  return days;
}

/** Находит бронь для конкретного номера и даты */
function findBookingForDay(
  bookings: BookingGridItemDto[],
  day: Dayjs,
): BookingGridItemDto | null {
  const dayStart = day.startOf('day');
  return (
    bookings.find((b) => {
      const checkIn  = dayjs(b.checkInDate).startOf('day');
      const checkOut = dayjs(b.checkOutDate).startOf('day');
      return !dayStart.isBefore(checkIn) && dayStart.isBefore(checkOut);
    }) ?? null
  );
}

/** Проверяет, является ли дата первым днём брони */
function isFirstDay(booking: BookingGridItemDto, day: Dayjs): boolean {
  return dayjs(booking.checkInDate).startOf('day').isSame(day.startOf('day'));
}

// ── Компонент ячейки бронирования ─────────────────────────────────────────────

interface BookingCellProps {
  booking: BookingGridItemDto | null;
  isFirst: boolean;
  onNavigate: (id: string) => void;
}

function BookingCell({ booking, isFirst, onNavigate }: BookingCellProps) {
  if (!booking) {
    return (
      <td
        style={{
          minWidth: 40,
          height: 44,
          border: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
        }}
      />
    );
  }

  const color = STATUS_COLORS[booking.status] ?? '#ccc';

  return (
    <td
      style={{
        minWidth: 40,
        height: 44,
        border: `1px solid ${color}33`,
        backgroundColor: `${color}18`,
        cursor: 'pointer',
        position: 'relative',
        padding: 0,
      }}
      onClick={() => onNavigate(booking.id)}
    >
      {isFirst && (
        <Tooltip
          title={
            <div>
              <div><b>{booking.guestFullName}</b></div>
              <div>{dayjs(booking.checkInDate).format('DD.MM')} — {dayjs(booking.checkOutDate).format('DD.MM')}</div>
              <div>{booking.nightsCount} ноч.</div>
              <div>{STATUS_LABELS[booking.status]}</div>
            </div>
          }
        >
          <div
            style={{
              position: 'absolute',
              inset: '3px 4px',
              backgroundColor: color,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 6,
              overflow: 'hidden',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {booking.guestFullName.split(' ')[0]}
            </Text>
          </div>
        </Tooltip>
      )}
    </td>
  );
}

// ── Главный компонент ─────────────────────────────────────────────────────────

export function BookingGridPage() {
  const navigate = useNavigate();
  const today = dayjs();

  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    today,
    today.add(13, 'day'),
  ]);

  const [startDate, endDate] = range;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['booking-grid', startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')],
    queryFn: () =>
      bookingsApi.getGrid(
        startDate.format('YYYY-MM-DD'),
        endDate.add(1, 'day').format('YYYY-MM-DD'),
      ),
  });

  const days = useMemo(() => generateDays(startDate, endDate), [startDate, endDate]);

  const rooms: RoomGridRowDto[] = data ?? [];

  const handleRangeChange = (
    values: [Dayjs | null, Dayjs | null] | null,
  ) => {
    if (values?.[0] && values?.[1]) {
      setRange([values[0], values[1]]);
    }
  };

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Заголовок и управление */}
      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Space size="middle" wrap>
          <CalendarOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>Шахматка номеров</span>
          <RangePicker
            value={range}
            onChange={handleRangeChange as any}
            format="DD.MM.YYYY"
            allowClear={false}
            style={{ width: 260 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          >
            Обновить
          </Button>
          <Space size={4} wrap>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <Tag key={status} color={STATUS_COLORS[status]} style={{ margin: 0 }}>
                {label}
              </Tag>
            ))}
          </Space>
        </Space>
      </Card>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      )}

      {isError && (
        <Alert type="error" message="Ошибка загрузки данных шахматки" style={{ marginBottom: 16 }} />
      )}

      {!isLoading && !isError && (
        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e8e8e8', background: '#fff' }}>
          <table
            style={{
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              minWidth: '100%',
            }}
          >
            <colgroup>
              {/* Колонка с номером комнаты */}
              <col style={{ width: 160, minWidth: 160 }} />
              {/* Колонки для дней */}
              {days.map((d) => (
                <col key={d.format('YYYY-MM-DD')} style={{ width: 40, minWidth: 40 }} />
              ))}
            </colgroup>

            {/* Шапка с датами */}
            <thead>
              <tr>
                <th
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    backgroundColor: '#f0f5ff',
                    border: '1px solid #d9e8ff',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Номер / Тип
                </th>
                {days.map((day) => {
                  const isToday = day.isSame(today, 'day');
                  const isWeekend = day.day() === 0 || day.day() === 6;
                  return (
                    <th
                      key={day.format('YYYY-MM-DD')}
                      style={{
                        padding: '4px 2px',
                        textAlign: 'center',
                        border: '1px solid #e8e8e8',
                        backgroundColor: isToday
                          ? '#e6f4ff'
                          : isWeekend
                          ? '#fff7e6'
                          : '#fafafa',
                        minWidth: 40,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: isWeekend ? '#d46b08' : '#8c8c8c',
                          lineHeight: 1.2,
                        }}
                      >
                        {day.format('ddd')}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#1677ff' : '#262626',
                          lineHeight: 1.3,
                        }}
                      >
                        {day.format('DD')}
                      </div>
                      <div style={{ fontSize: 10, color: '#8c8c8c', lineHeight: 1.2 }}>
                        {day.format('MM')}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Строки с номерами */}
            <tbody>
              {rooms.length === 0 && (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    style={{ textAlign: 'center', padding: 32, color: '#8c8c8c' }}
                  >
                    Нет данных
                  </td>
                </tr>
              )}
              {rooms.map((room) => (
                <tr key={room.roomId}>
                  {/* Ячейка с описанием номера */}
                  <td
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      backgroundColor: '#fff',
                      border: '1px solid #e8e8e8',
                      borderLeft: '3px solid #1677ff',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>№ {room.roomNumber}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{room.roomTypeName}</div>
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: ROOM_STATUS_COLORS[room.roomStatus] ?? '#ccc',
                          marginRight: 4,
                        }}
                      />
                      <span style={{ fontSize: 10, color: '#595959' }}>
                        {ROOM_STATUS_LABELS[room.roomStatus] ?? room.roomStatus}
                      </span>
                    </div>
                  </td>

                  {/* Ячейки с бронями по дням */}
                  {days.map((day) => {
                    const booking = findBookingForDay(room.bookings, day);
                    const first = booking ? isFirstDay(booking, day) : false;
                    return (
                      <BookingCell
                        key={day.format('YYYY-MM-DD')}
                        booking={booking}
                        isFirst={first}
                        onNavigate={(id) => navigate(`/bookings/${id}`)}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Итоговая статистика */}
      {!isLoading && !isError && rooms.length > 0 && (
        <Card style={{ marginTop: 16 }} styles={{ body: { padding: '12px 24px' } }}>
          <Space size="large" wrap>
            <Text type="secondary">
              Всего номеров: <b>{rooms.length}</b>
            </Text>
            <Text type="secondary">
              Период: <b>{startDate.format('DD.MM.YYYY')} — {endDate.format('DD.MM.YYYY')}</b>
            </Text>
            <Text type="secondary">
              Дней: <b>{days.length}</b>
            </Text>
            <Text type="secondary">
              Броней в периоде:{' '}
              <b>
                {new Set(rooms.flatMap((r) => r.bookings.map((b) => b.id))).size}
              </b>
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
}
