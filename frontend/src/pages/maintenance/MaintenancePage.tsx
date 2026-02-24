import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceApi } from '../../api/maintenance';
import { roomsApi } from '../../api/rooms';
import { MaintenanceStatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import type { MaintenanceRequestListItemDto } from '../../types/api';
import { MaintenancePriority, MaintenanceStatus } from '../../types/enums';

const { Title } = Typography;

const statusOptions = [
  { value: '', label: 'Все статусы' },
  ...Object.values(MaintenanceStatus).map((s) => ({ value: s, label: s })),
];

const priorityOptions = Object.values(MaintenancePriority).map((p) => ({
  value: p,
  label: p,
}));

export function MaintenancePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [form] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', page, statusFilter],
    queryFn: () =>
      maintenanceApi.getAll({
        page,
        pageSize: 20,
        status: statusFilter || undefined,
      }),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
    enabled: createModal,
  });

  const createMutation = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      setCreateModal(false);
      form.resetFields();
      msg.success('Заявка создана');
    },
  });

  const onSave = async () => {
    const values = await form.validateFields();
    createMutation.mutate({
      ...values,
      reportedByUserId: user!.id,
    });
  };

  const columns: ColumnsType<MaintenanceRequestListItemDto> = [
    { title: 'Заголовок', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Номер', dataIndex: 'roomNumber', key: 'roomNumber', width: 90 },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: MaintenanceStatus) => <MaintenanceStatusBadge status={s} />,
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (p: MaintenancePriority) => <PriorityBadge priority={p} />,
    },
    { title: 'Заявитель', dataIndex: 'reportedBy', key: 'reportedBy' },
    { title: 'Исполнитель', dataIndex: 'assignedTo', key: 'assignedTo', render: (v) => v ?? '—' },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/maintenance/${record.id}`)}
        />
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Техническое обслуживание
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setCreateModal(true);
          }}
        >
          Новая заявка
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.totalCount ?? 0,
          onChange: setPage,
          showTotal: (total) => `Всего: ${total}`,
        }}
        size="middle"
        onRow={(record) => ({
          onClick: () => navigate(`/maintenance/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />

      <Modal
        title="Новая заявка на обслуживание"
        open={createModal}
        onOk={onSave}
        onCancel={() => setCreateModal(false)}
        confirmLoading={createMutation.isPending}
        okText="Создать"
        cancelText="Отмена"
        width={540}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="roomId" label="Номер" rules={[{ required: true }]}>
            <Select
              options={rooms.map((r) => ({ value: r.id, label: `Номер ${r.number}` }))}
              placeholder="Выберите номер"
            />
          </Form.Item>
          <Form.Item name="title" label="Заголовок" rules={[{ required: true }]}>
            <Input placeholder="Краткое описание проблемы" />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Подробное описание" />
          </Form.Item>
          <Form.Item name="priority" label="Приоритет" initialValue={MaintenancePriority.Medium}>
            <Select options={priorityOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
