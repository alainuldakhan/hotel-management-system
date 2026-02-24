import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { servicesApi } from '../../api/additionalServices';
import type { AdditionalServiceDto } from '../../types/api';

const { Title } = Typography;

export function ServicesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      closeModal();
      msg.success('Услуга создана');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof servicesApi.update>[1] }) =>
      servicesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      closeModal();
      msg.success('Услуга обновлена');
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
      updateMutation.mutate({ id: editingId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: ColumnsType<AdditionalServiceDto> = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Описание', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (v: number) => `${v.toLocaleString()} ₸`,
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Активна' : 'Неактивна'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingId(record.id);
            form.setFieldsValue({
              name: record.name,
              description: record.description,
              price: record.price,
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
          Дополнительные услуги
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
          Добавить услугу
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={services}
        loading={isLoading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editingId ? 'Редактировать услугу' : 'Новая услуга'}
        open={modalOpen}
        onOk={onSave}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input placeholder="Завтрак, Трансфер, СПА..." />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Цена (₸)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
