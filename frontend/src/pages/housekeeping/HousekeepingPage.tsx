import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
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
import { housekeepingApi } from '../../api/housekeeping';
import { roomsApi } from '../../api/rooms';
import { usersApi } from '../../api/users';
import {
  HousekeepingStatusBadge,
  HousekeepingTypeBadge,
} from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import type { HousekeepingTaskListItemDto } from '../../types/api';
import { HousekeepingStatus, HousekeepingTaskType, UserRole } from '../../types/enums';

const { Title } = Typography;

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: HousekeepingStatus.Pending, label: 'Ожидает' },
  { value: HousekeepingStatus.InProgress, label: 'В работе' },
  { value: HousekeepingStatus.Completed, label: 'Выполнена' },
  { value: HousekeepingStatus.Cancelled, label: 'Отменена' },
];

const typeOptions = Object.values(HousekeepingTaskType).map((t) => ({ value: t, label: t }));

export function HousekeepingPage() {
  const qc = useQueryClient();
  const { user, isManagerOrAbove, hasRole } = useAuth();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [completeModal, setCompleteModal] = useState<string | null>(null);
  const [createForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  const { data, isLoading } = useQuery({
    queryKey: ['housekeeping', page, statusFilter],
    queryFn: () =>
      housekeepingApi.getAll({ page, pageSize: 20, status: statusFilter || undefined }),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
    enabled: createModal,
  });

  const { data: staffUsers = [] } = useQuery({
    queryKey: ['users', 'housekeeping-staff'],
    queryFn: () => usersApi.getAll(),
    enabled: !!assignModal,
    select: (users) =>
      users.filter(
        (u) => u.role === UserRole.HousekeepingStaff || u.role === UserRole.Manager || u.role === UserRole.SuperAdmin
      ),
  });

  const createMutation = useMutation({
    mutationFn: housekeepingApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['housekeeping'] });
      setCreateModal(false);
      createForm.resetFields();
      msg.success('Задача создана');
    },
    onError: () => msg.error('Ошибка при создании задачи'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assignedToUserId }: { id: string; assignedToUserId: string }) =>
      housekeepingApi.assign(id, assignedToUserId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['housekeeping'] });
      setAssignModal(null);
      assignForm.resetFields();
      msg.success('Задача назначена');
    },
    onError: () => msg.error('Ошибка при назначении'),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, completionNotes }: { id: string; completionNotes?: string }) =>
      housekeepingApi.complete(id, completionNotes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['housekeeping'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setCompleteModal(null);
      completeForm.resetFields();
      msg.success('Задача выполнена');
    },
    onError: () => msg.error('Ошибка при завершении'),
  });

  const cancelMutation = useMutation({
    mutationFn: housekeepingApi.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['housekeeping'] });
      msg.success('Задача отменена');
    },
    onError: () => msg.error('Ошибка при отмене'),
  });

  const canComplete = hasRole(
    UserRole.HousekeepingStaff,
    UserRole.Manager,
    UserRole.SuperAdmin
  );

  const columns: ColumnsType<HousekeepingTaskListItemDto> = [
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (t: HousekeepingTaskType) => <HousekeepingTypeBadge type={t} />,
    },
    { title: 'Номер', dataIndex: 'roomNumber', key: 'roomNumber', width: 90 },
    { title: 'Этаж', dataIndex: 'floor', key: 'floor', width: 70 },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: HousekeepingStatus) => <HousekeepingStatusBadge status={s} />,
    },
    { title: 'Создал', dataIndex: 'requestedBy', key: 'requestedBy' },
    {
      title: 'Исполнитель',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (v) => v ?? '—',
    },
    {
      title: 'Срок',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      render: (v?: string) => (v ? dayjs(v).format('DD.MM.YYYY') : '—'),
    },
    {
      title: 'Создана',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const isActive =
          record.status !== HousekeepingStatus.Completed &&
          record.status !== HousekeepingStatus.Cancelled;
        return (
          <Space size={4} onClick={(e) => e.stopPropagation()}>
            {isManagerOrAbove && isActive && (
              <Button
                size="small"
                icon={<UserAddOutlined />}
                title="Назначить"
                onClick={() => {
                  assignForm.resetFields();
                  setAssignModal(record.id);
                }}
              />
            )}
            {canComplete && isActive && (
              <Button
                size="small"
                icon={<CheckOutlined />}
                type="primary"
                ghost
                title="Завершить"
                onClick={() => {
                  completeForm.resetFields();
                  setCompleteModal(record.id);
                }}
              />
            )}
            {isManagerOrAbove && isActive && (
              <Popconfirm
                title="Отменить задачу?"
                onConfirm={() => cancelMutation.mutate(record.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  danger
                  title="Отменить"
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Хозяйственные задачи
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            createForm.resetFields();
            setCreateModal(true);
          }}
        >
          Новая задача
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
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
      />

      {/* Create Task Modal */}
      <Modal
        title="Новая задача уборки"
        open={createModal}
        onOk={async () => {
          const values = await createForm.validateFields();
          createMutation.mutate({
            ...values,
            requestedByUserId: user!.id,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
          });
        }}
        onCancel={() => setCreateModal(false)}
        confirmLoading={createMutation.isPending}
        okText="Создать"
        cancelText="Отмена"
        width={520}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="roomId" label="Номер комнаты" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={rooms.map((r) => ({ value: r.id, label: `Номер ${r.number} (эт. ${r.floor})` }))}
              placeholder="Выберите номер"
            />
          </Form.Item>
          <Form.Item name="type" label="Тип задачи" rules={[{ required: true }]}>
            <Select options={typeOptions} placeholder="Выберите тип" />
          </Form.Item>
          <Form.Item name="notes" label="Примечания">
            <Input.TextArea rows={3} placeholder="Дополнительные инструкции" />
          </Form.Item>
          <Form.Item name="dueDate" label="Срок выполнения">
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Modal */}
      <Modal
        title="Назначить исполнителя"
        open={!!assignModal}
        onOk={async () => {
          const values = await assignForm.validateFields();
          if (assignModal) assignMutation.mutate({ id: assignModal, ...values });
        }}
        onCancel={() => setAssignModal(null)}
        confirmLoading={assignMutation.isPending}
        okText="Назначить"
        cancelText="Отмена"
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="assignedToUserId" label="Сотрудник" rules={[{ required: true }]}>
            <Select
              options={staffUsers.map((u) => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName}`,
              }))}
              placeholder="Выберите сотрудника"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Complete Modal */}
      <Modal
        title="Завершить задачу"
        open={!!completeModal}
        onOk={async () => {
          const values = await completeForm.validateFields();
          if (completeModal)
            completeMutation.mutate({ id: completeModal, completionNotes: values.completionNotes });
        }}
        onCancel={() => setCompleteModal(null)}
        confirmLoading={completeMutation.isPending}
        okText="Завершить"
        cancelText="Отмена"
      >
        <Form form={completeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="completionNotes" label="Примечания о выполнении">
            <Input.TextArea rows={3} placeholder="Что было сделано..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
