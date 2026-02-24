import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  message,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../../api/bookings';
import { roomsApi } from '../../api/rooms';
import { usersApi } from '../../api/users';
import type { CreateBookingRequest } from '../../types/api';
import { UserRole } from '../../types/enums';

const { Title } = Typography;

export function CreateBookingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();
  const [availableRooms, setAvailableRooms] = useState<Awaited<ReturnType<typeof roomsApi.getAvailable>>>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: guests = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    select: (users) => users.filter((u) => u.role === UserRole.Guest),
  });

  const searchRoomsMutation = useMutation({
    mutationFn: async () => {
      const values = await form.validateFields(['checkInDate', 'checkOutDate', 'guestsCount']);
      const checkIn = dayjs(values.checkInDate).format('YYYY-MM-DD');
      const checkOut = dayjs(values.checkOutDate).format('YYYY-MM-DD');
      return roomsApi.getAvailable(checkIn, checkOut, values.guestsCount);
    },
    onSuccess: (rooms) => {
      setAvailableRooms(rooms);
      setSearchError(null);
      if (rooms.length === 0) setSearchError('Нет доступных номеров на выбранные даты');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingsApi.create(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      msg.success('Бронирование создано');
      navigate(`/bookings/${result.id}`);
    },
  });

  const onFinish = async (values: Record<string, unknown>) => {
    createMutation.mutate({
      roomId: values.roomId as string,
      guestId: values.guestId as string,
      checkInDate: dayjs(values.checkInDate as string).format('YYYY-MM-DD'),
      checkOutDate: dayjs(values.checkOutDate as string).format('YYYY-MM-DD'),
      guestsCount: values.guestsCount as number,
      specialRequests: values.specialRequests as string | undefined,
    });
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {contextHolder}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/bookings')} />
        <Title level={4} style={{ margin: 0 }}>
          Новое бронирование
        </Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checkInDate"
                label="Дата заезда"
                rules={[{ required: true, message: 'Укажите дату заезда' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  disabledDate={(d) => d.isBefore(dayjs(), 'day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkOutDate"
                label="Дата выезда"
                rules={[{ required: true, message: 'Укажите дату выезда' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  disabledDate={(d) => {
                    const checkIn = form.getFieldValue('checkInDate');
                    return checkIn ? d.isBefore(dayjs(checkIn).add(1, 'day'), 'day') : false;
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="guestsCount"
            label="Количество гостей"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>

          <Button
            onClick={() => searchRoomsMutation.mutate()}
            loading={searchRoomsMutation.isPending}
            style={{ marginBottom: 16 }}
          >
            Найти доступные номера
          </Button>

          {searchError && (
            <Alert type="warning" message={searchError} style={{ marginBottom: 16 }} />
          )}

          <Form.Item
            name="roomId"
            label="Номер"
            rules={[{ required: true, message: 'Выберите номер' }]}
          >
            <Select
              placeholder="Сначала найдите доступные номера"
              options={availableRooms.map((r) => ({
                value: r.id,
                label: `№${r.number} — ${r.roomTypeName} (${r.pricePerNight.toLocaleString()} ₸/ночь, до ${r.maxOccupancy} чел.)`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="guestId"
            label="Гость"
            rules={[{ required: true, message: 'Выберите гостя' }]}
          >
            <Select
              showSearch
              placeholder="Выберите гостя"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={guests.map((g) => ({
                value: g.id,
                label: `${g.firstName} ${g.lastName} (${g.email})`,
              }))}
            />
          </Form.Item>

          <Form.Item name="specialRequests" label="Пожелания">
            <Input.TextArea rows={3} placeholder="Необязательно" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              block
            >
              Создать бронирование
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
