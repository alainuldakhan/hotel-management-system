import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <Title className="page-header-title" level={3}>
          {title}
        </Title>
        {subtitle && (
          <Text className="page-header-subtitle">{subtitle}</Text>
        )}
      </div>
      {actions && (
        <div className="page-header-actions">{actions}</div>
      )}
    </div>
  );
}
