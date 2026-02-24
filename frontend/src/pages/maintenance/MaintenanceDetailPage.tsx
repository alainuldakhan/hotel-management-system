import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Space,
  Typography,
  message,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { maintenanceApi } from '../../api/maintenance';
import { usersApi } from '../../api/users';
import { MaintenanceStatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { MaintenanceStatus, UserRole } from '../../types/enums';

const { Title } = Typography;

export function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isManagerOrAbove, hasRole } = useAuth();
  const [msg, contextHolder] = message.useMessage();
  const [assignModal, setAssignModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [assignForm] = Form.useForm();
  const [resolveForm] = Form.useForm();

  const { data: request, isLoading, isError } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceApi.getById(id!),
    enabled: !!id,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    select: (users) => users.filter((u) => u.role === UserRole.MaintenanceStaff),
    enabled: assignModal,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['maintenance', id] });

  const assignMutation = useMutation({
    mutationFn: (assignedToUserId: string) => maintenanceApi.assign(id!, assignedToUserId),
    onSuccess: () => { invalidate(); setAssignModal(false); msg.success('Заявка назначена'); },
  });

  const resolveMutation = useMutation({
    mutationFn: (resolution: string) => maintenanceApi.resolve(id!, resolution),
    onSuccess: () => { invalidate(); setResolveModal(false); msg.success('Заявка выполнена'); },
  });

  const cancelMutation = useMutation({
    mutationFn: () => maintenanceApi.cancel(id!),
    onSuccess: () => { invalidate(); msg.success('Заявка отменена'); },
  });

  if (isLoading) return <Spin size="large" style={{ display: 'block', marginTop: 80 }} />;
  if (isError || !request) return <Alert type="error" message="Заявка не найдена" />;

  const canAssign = isManagerOrAbove && request.status === MaintenanceStatus.New;
  const canResolve =
    hasRole(UserRole.MaintenanceStaff, UserRole.Manager, UserRole.SuperAdmin) &&
    request.status === MaintenanceStatus.InProgress;
  const canCancel =
    isManagerOrAbove &&
    (request.status === MaintenanceStatus.New || request.status === MaintenanceStatus.InProgress);

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/maintenance')} />
        <Title level={4} style={{ margin: 0 }}>
          {request.title}
        </Title>
        <MaintenanceStatusBadge status={request.status} />
        <PriorityBadge priority={request.priority} />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Детали заявки">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Номер комнаты">{request.roomNumber}</Descriptions.Item>
              <Descriptions.Item label="Описание">{request.description}</Descriptions.Item>
              <Descriptions.Item label="Заявитель">{request.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Исполнитель">
                {request.assignedTo ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Создана">
                {dayjs(request.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
              {request.resolvedAt && (
                <Descriptions.Item label="Выполнена">
                  {dayjs(request.resolvedAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              )}
              {request.resolution && (
                <Descriptions.Item label="Решение">{request.resolution}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Действия">
            <Space direction="vertical" style={{ width: '100%' }}>
              {canAssign && (
                <Button type="primary" block onClick={() => setAssignModal(true)}>
                  Назначить исполнителя
                </Button>
              )}
              {canResolve && (
                <Button block onClick={() => setResolveModal(true)}>
                  Отметить выполненной
                </Button>
              )}
              {canCancel && (
                <Button danger block onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
                  Отменить заявку
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Assign Modal */}
      <Modal
        title="Назначить исполнителя"
        open={assignModal}
        onOk={() =>
          assignForm.validateFields().then((v) => assignMutation.mutate(v.assignedToUserId))
        }
        onCancel={() => setAssignModal(false)}
        confirmLoading={assignMutation.isPending}
        okText="Назначить"
        cancelText="Отмена"
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="assignedToUserId"
            label="Исполнитель"
            rules={[{ required: true }]}
          >
            <Select
              options={staff.map((s) => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName}`,
              }))}
              placeholder="Выберите сотрудника"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        title="Отметить выполненной"
        open={resolveModal}
        onOk={() =>
          resolveForm.validateFields().then((v) => resolveMutation.mutate(v.resolution))
        }
        onCancel={() => setResolveModal(false)}
        confirmLoading={resolveMutation.isPending}
        okText="Завершить"
        cancelText="Отмена"
      >
        <Form form={resolveForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="resolution"
            label="Описание решения"
            rules={[{ required: true, message: 'Укажите что было сделано' }]}
          >
            <Input.TextArea rows={4} placeholder="Опишите выполненные работы" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
