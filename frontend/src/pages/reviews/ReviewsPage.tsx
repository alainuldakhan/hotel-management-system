import { StarFilled } from '@ant-design/icons';
import {
  Card,
  Col,
  Rate,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { reviewsApi } from '../../api/reviews';
import type { ReviewDto, RoomTypeRatingDto } from '../../types/api';

const { Title, Text } = Typography;

function StarTag({ value }: { value: number }) {
  const color =
    value >= 4 ? 'success' : value === 3 ? 'warning' : 'error';
  return (
    <Tag color={color} icon={<StarFilled />}>
      {value.toFixed(1)}
    </Tag>
  );
}

export function ReviewsPage() {
  const [roomTypeId, setRoomTypeId] = useState<string | undefined>();

  const { data: ratingsData } = useQuery({
    queryKey: ['reviews', 'ratings'],
    queryFn: reviewsApi.getRatings,
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', 'list', roomTypeId],
    queryFn: () => reviewsApi.getAll(roomTypeId),
  });

  const columns: ColumnsType<ReviewDto> = [
    {
      title: 'Оценка',
      dataIndex: 'rating',
      key: 'rating',
      width: 130,
      render: (v: number) => <Rate disabled defaultValue={v} />,
    },
    {
      title: 'Гость',
      dataIndex: 'guestFullName',
      key: 'guestFullName',
    },
    {
      title: 'Тип номера',
      dataIndex: 'roomTypeName',
      key: 'roomTypeName',
    },
    {
      title: 'Отзыв',
      dataIndex: 'comment',
      key: 'comment',
      render: (v) => v ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
  ];

  const roomTypeOptions = ratingsData?.map((r) => ({
    value: r.roomTypeId,
    label: r.roomTypeName,
  })) ?? [];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>
        Отзывы гостей
      </Title>

      {/* ── Ratings by room type ─────────────────────────────── */}
      {ratingsData && ratingsData.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {ratingsData.map((r: RoomTypeRatingDto) => (
            <Col key={r.roomTypeId} xs={24} sm={12} md={8} lg={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
                  {r.roomTypeName}
                </div>
                {r.reviewCount > 0 ? (
                  <>
                    <Rate
                      disabled
                      allowHalf
                      defaultValue={r.averageRating}
                      style={{ fontSize: 16 }}
                    />
                    <div style={{ marginTop: 4 }}>
                      <StarTag value={r.averageRating} />
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                        ({r.reviewCount} отз.)
                      </Text>
                    </div>
                  </>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Нет отзывов
                  </Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Summary stat ─────────────────────────────────────── */}
      {ratingsData && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col>
            <Statistic
              title="Всего отзывов"
              value={ratingsData.reduce((s, r) => s + r.reviewCount, 0)}
            />
          </Col>
          <Col>
            <Statistic
              title="Средняя оценка"
              value={
                ratingsData.filter((r) => r.reviewCount > 0).length > 0
                  ? (
                      ratingsData
                        .filter((r) => r.reviewCount > 0)
                        .reduce((s, r) => s + r.averageRating * r.reviewCount, 0) /
                      ratingsData
                        .filter((r) => r.reviewCount > 0)
                        .reduce((s, r) => s + r.reviewCount, 0)
                    ).toFixed(2)
                  : '—'
              }
              suffix="/ 5"
            />
          </Col>
        </Row>
      )}

      {/* ── Filter ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Фильтр по типу номера"
          style={{ width: 240 }}
          options={roomTypeOptions}
          value={roomTypeId}
          onChange={setRoomTypeId}
        />
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={reviewsData?.items ?? []}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="middle"
        locale={{ emptyText: 'Отзывов пока нет' }}
      />
    </div>
  );
}
