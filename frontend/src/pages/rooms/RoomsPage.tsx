import {
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { roomsApi } from '../../api/rooms';
import { roomTypesApi } from '../../api/roomTypes';
import { RoomStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import type { RoomListItemDto } from '../../types/api';
import { RoomStatus } from '../../types/enums';

const { Title } = Typography;

const statusFilterOptions = Object.values(RoomStatus).map((s) => ({
  value: s,
  label: <RoomStatusBadge status={s} />,
}));

const roomStatusOptions = Object.values(RoomStatus).map((s) => ({
  value: s,
  label: <RoomStatusBadge status={s} />,
}));

export function RoomsPage() {
  const qc = useQueryClient();
  const { isManagerOrAbove, hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState<RoomStatus | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomListItemDto | null>(null);
  const [statusModal, setStatusModal] = useState<{ id: string; current: RoomStatus } | null>(null);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
  });

  const { data: roomTypes = [] } = useQuery({
    queryKey: ['room-types'],
    queryFn: roomTypesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setModalOpen(false);
      form.resetFields();
      msg.success('Номер создан');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof roomsApi.update>[1] }) =>
      roomsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setModalOpen(false);
      setEditingRoom(null);
      form.resetFields();
      msg.success('Номер обновлён');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RoomStatus }) =>
      roomsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setStatusModal(null);
      msg.success('Статус обновлён');
    },
  });

  const canChangeStatus = hasRole(
    'Receptionist' as never,
    'HousekeepingStaff' as never,
    'Manager' as never,
    'SuperAdmin' as never
  );

  const filtered = statusFilter ? rooms.filter((r) => r.status === statusFilter) : rooms;

  const columns: ColumnsType<RoomListItemDto> = [
    { title: 'Номер', dataIndex: 'number', key: 'number', width: 90 },
    { title: 'Этаж', dataIndex: 'floor', key: 'floor', width: 80 },
    { title: 'Тип', dataIndex: 'roomTypeName', key: 'roomTypeName' },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: RoomStatus) => <RoomStatusBadge status={s} />,
    },
    { title: 'Вместимость', dataIndex: 'maxOccupancy', key: 'maxOccupancy', width: 120 },
    {
      title: 'Цена/ночь',
      dataIndex: 'pricePerNight',
      key: 'pricePerNight',
      render: (v: number) => `${v.toLocaleString()} ₸`,
    },
    { title: 'Площадь', dataIndex: 'area', key: 'area', render: (v: number) => `${v} м²` },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          {canChangeStatus && (
            <Button
              size="small"
              onClick={() => {
                setStatusModal({ id: record.id, current: record.status });
                statusForm.setFieldValue('status', record.status);
              }}
            >
              Статус
            </Button>
          )}
          {isManagerOrAbove && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRoom(record);
                form.setFieldsValue({
                  number: record.number,
                  floor: record.floor,
                  roomTypeId: roomTypes.find((rt) => rt.name === record.roomTypeName)?.id,
                });
                setModalOpen(true);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  const onSave = async () => {
    const values = await form.validateFields();
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Номера
        </Title>
        <Space>
          <Select
            allowClear
            placeholder="Фильтр по статусу"
            style={{ width: 180 }}
            options={statusFilterOptions}
            onChange={(v) => setStatusFilter(v)}
          />
          {isManagerOrAbove && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRoom(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Добавить номер
            </Button>
          )}
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="middle"
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingRoom ? 'Редактировать номер' : 'Новый номер'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => {
          setModalOpen(false);
          setEditingRoom(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="number" label="Номер комнаты" rules={[{ required: true }]}>
            <Input maxLength={10} placeholder="101" />
          </Form.Item>
          <Form.Item name="floor" label="Этаж" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="roomTypeId" label="Тип номера" rules={[{ required: true }]}>
            <Select
              options={roomTypes.map((rt) => ({ value: rt.id, label: rt.name }))}
              placeholder="Выберите тип"
            />
          </Form.Item>
          <Form.Item name="notes" label="Заметки">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        title="Изменить статус номера"
        open={!!statusModal}
        onOk={() =>
          statusForm.validateFields().then((v) => {
            if (statusModal) statusMutation.mutate({ id: statusModal.id, status: v.status });
          })
        }
        onCancel={() => setStatusModal(null)}
        confirmLoading={statusMutation.isPending}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={statusForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="status" label="Новый статус" rules={[{ required: true }]}>
            <Select options={roomStatusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
