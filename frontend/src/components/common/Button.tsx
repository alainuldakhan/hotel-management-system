interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS: Record<string, React.CSSProperties> = {
  primary:   { background: '#1e293b', color: '#fff',     border: 'none' },
  secondary: { background: '#fff',    color: '#1e293b',  border: '1px solid #e2e8f0' },
  danger:    { background: '#fef2f2', color: '#dc2626',  border: '1px solid #fecaca' },
  ghost:     { background: 'transparent', color: '#64748b', border: 'none' },
};

const HOVER: Record<string, React.CSSProperties> = {
  primary:   { background: '#0f172a' },
  secondary: { background: '#f8fafc', borderColor: '#cbd5e1' },
  danger:    { background: '#fee2e2' },
  ghost:     { background: '#f1f5f9' },
};

const SIZES: Record<string, React.CSSProperties> = {
  sm: { padding: '5px 12px', fontSize: 12, height: 30 },
  md: { padding: '7px 16px', fontSize: 13, height: 36 },
  lg: { padding: '10px 20px', fontSize: 14, height: 42 },
};

export default function Button({
  variant = 'primary', size = 'md', loading, icon,
  children, style, disabled, onMouseEnter, onMouseLeave, ...rest
}: Props) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const h = HOVER[variant];

  return (
    <button
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign((e.currentTarget as HTMLButtonElement).style, h);
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        Object.assign((e.currentTarget as HTMLButtonElement).style, {
          background: v.background ?? '',
          borderColor: (v.border as string)?.split(' ').at(-1) ?? '',
        });
        onMouseLeave?.(e);
      }}
      {...rest}
      style={{
        ...v, ...s,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        borderRadius: 8, fontWeight: 600,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.6 : 1,
        transition: 'background 0.15s, border-color 0.15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {loading ? (
        <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
      ) : icon}
      {children}
    </button>
  );
}
