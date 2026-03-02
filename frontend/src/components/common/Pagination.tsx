interface Props {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 16 }}>
      <PBtn disabled={page <= 1} onClick={() => onPage(page - 1)}>←</PBtn>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const p = i + 1;
        return (
          <PBtn key={p} active={p === page} onClick={() => onPage(p)}>{p}</PBtn>
        );
      })}
      <PBtn disabled={page >= totalPages} onClick={() => onPage(page + 1)}>→</PBtn>
    </div>
  );
}

function PBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
        borderRadius: 6, background: active ? '#3b82f6' : '#fff',
        color: active ? '#fff' : disabled ? '#94a3b8' : '#1e293b',
        cursor: disabled ? 'default' : 'pointer', fontSize: 13, fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}
