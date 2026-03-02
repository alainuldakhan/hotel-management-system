interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number;
}

export default function Card({ children, style, padding = 20 }: Props) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}
