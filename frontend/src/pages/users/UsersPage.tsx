import { Modal, Select, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { usersApi } from '../../api/users';
import type { UserListItemDto } from '../../types/api';
import { UserRole } from '../../types/enums';
import { roleLabels } from '../../utils/permissions';

const { Title } = Typography;

const roleOptions = Object.values(UserRole).map((r) => ({
  value: r,
  label: roleLabels[r],
}));

export function UsersPage() {
  const qc = useQueryClient();
  const [msg, contextHolder] = message.useMessage();
  const [roleModal, setRoleModal] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setRoleModal(null);
      msg.success('Роль обновлена');
    },
  });

  const columns: ColumnsType<UserListItemDto> = [
    {
      title: 'Имя',
      key: 'name',
      render: (_, r) => `${r.firstName} ${r.lastName}`,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Телефон', dataIndex: 'phoneNumber', key: 'phoneNumber', render: (v) => v ?? '—' },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => {
        const colors: Partial<Record<UserRole, string>> = {
          [UserRole.SuperAdmin]: 'red',
          [UserRole.Manager]: 'purple',
          [UserRole.Receptionist]: 'blue',
          [UserRole.HousekeepingStaff]: 'cyan',
          [UserRole.MaintenanceStaff]: 'orange',
          [UserRole.Guest]: 'default',
        };
        return <Tag color={colors[role] ?? 'default'}>{roleLabels[role]}</Tag>;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Активен' : 'Неактивен'}</Tag>,
    },
    {
      title: 'Зарегистрирован',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <a
          onClick={() => {
            setSelectedRole(record.role);
            setRoleModal({ id: record.id, name: `${record.firstName} ${record.lastName}`, role: record.role });
          }}
        >
          Изменить роль
        </a>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 16 }}>
        Сотрудники и гости
      </Title>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={isLoading}
        pagination={{ pageSize: 25 }}
        size="middle"
      />

      <Modal
        title={`Изменить роль: ${roleModal?.name}`}
        open={!!roleModal}
        onOk={() => {
          if (roleModal && selectedRole) {
            updateRoleMutation.mutate({ id: roleModal.id, role: selectedRole });
          }
        }}
        onCancel={() => setRoleModal(null)}
        confirmLoading={updateRoleMutation.isPending}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <div style={{ marginTop: 16 }}>
          <Select
            style={{ width: '100%' }}
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
          />
        </div>
      </Modal>
    </div>
  );
}
