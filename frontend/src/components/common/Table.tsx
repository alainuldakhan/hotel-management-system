export interface Column {
  key: string;
  header: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (row: any) => React.ReactNode;
  width?: number | string;
}

interface Props {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  keyField?: string;
  loading?: boolean;
  emptyText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick?: (row: any) => void;
}

export default function Table({ columns, data, keyField = 'id', loading, emptyText = 'Нет данных', onRowClick }: Props) {
  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                color: '#64748b', borderBottom: '1px solid #e2e8f0', width: col.width,
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Загрузка...</td></tr>
          )}
          {!loading && data.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>{emptyText}</td></tr>
          )}
          {!loading && data.map((row, i) => (
            <tr
              key={String(row[keyField] ?? i)}
              onClick={() => onRowClick?.(row)}
              style={{ borderBottom: '1px solid #f1f5f9', cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
              onMouseEnter={(e) => { if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '11px 14px', fontSize: 13, color: '#1e293b' }}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
