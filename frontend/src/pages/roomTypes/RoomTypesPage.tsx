import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { roomTypesApi } from '../../api/roomTypes';
import type { RoomTypeListItemDto } from '../../types/api';

const { Title } = Typography;

const COMMON_AMENITIES = [
  'WiFi',
  'Кондиционер',
  'Телевизор',
  'Мини-бар',
  'Сейф',
  'Ванна',
  'Душ',
  'Балкон',
  'Вид на море',
  'Завтрак включён',
  'Тапочки и халат',
  'Фен',
];

export function RoomTypesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const { data: roomTypes = [], isLoading } = useQuery({
    queryKey: ['room-types'],
    queryFn: roomTypesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: roomTypesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['room-types'] });
      closeModal();
      msg.success('Тип номера создан');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof roomTypesApi.update>[1] }) =>
      roomTypesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['room-types'] });
      closeModal();
      msg.success('Тип номера обновлён');
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onSave = async () => {
    const values = await form.validateFields();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { ...values, amenities: values.amenities ?? [] } });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: ColumnsType<RoomTypeListItemDto> = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Описание', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Вместимость',
      dataIndex: 'maxOccupancy',
      key: 'maxOccupancy',
      width: 120,
      render: (v: number) => `до ${v} чел.`,
    },
    {
      title: 'Базовая цена',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (v: number) => `${v.toLocaleString()} ₸/ночь`,
    },
    {
      title: 'Площадь',
      dataIndex: 'area',
      key: 'area',
      width: 90,
      render: (v: number) => `${v} м²`,
    },
    { title: 'Номеров', dataIndex: 'roomsCount', key: 'roomsCount', width: 90 },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Активен' : 'Неактивен'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={async () => {
            const detail = await roomTypesApi.getById(record.id);
            setEditingId(record.id);
            form.setFieldsValue({
              name: detail.name,
              description: detail.description,
              maxOccupancy: detail.maxOccupancy,
              basePrice: detail.basePrice,
              area: detail.area,
              amenities: detail.amenities,
            });
            setModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Типы номеров
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Добавить тип
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={roomTypes}
        loading={isLoading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editingId ? 'Редактировать тип' : 'Новый тип номера'}
        open={modalOpen}
        onOk={onSave}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Сохранить"
        cancelText="Отмена"
        width={540}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input placeholder="Стандарт, Люкс, Президентский..." />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="maxOccupancy" label="Макс. гостей" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} max={20} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="basePrice" label="Цена за ночь (₸)" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="area" label="Площадь (м²)" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="amenities" label="Удобства">
            <Select
              mode="tags"
              placeholder="Выберите или добавьте удобства"
              options={COMMON_AMENITIES.map((a) => ({ value: a, label: a }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
