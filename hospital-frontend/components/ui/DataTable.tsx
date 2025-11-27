// hospital-frontend/components/ui/DataTable.tsx
import React from 'react';

interface Column<T = any> {
  key?: keyof T;
  label: string;
  width?: string;
  render?: (value: any, row?: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T = any> {
  data?: T[];
  columns?: Column<T>[] | string[];
  rows?: (React.ReactNode | string | number)[][];
  striped?: boolean;
  hoverable?: boolean;
}

export default function DataTable<T extends { id?: string | number } = any>(
  { data, columns, rows, striped = true, hoverable = true }: DataTableProps<T>
) {
  // Support both new API (data + columns with objects) and legacy API (rows + columns as strings)
  const isLegacy = Array.isArray(rows) && rows.length > 0;
  const columnLabels = isLegacy 
    ? (columns as string[]) || []
    : (columns as Column<T>[])?.map(col => col.label) || [];
  
  const tableRows = isLegacy ? rows : (data || []).map((row: any) => 
    (columns as Column<T>[])?.map(col => col.render ? col.render(row[col.key!], row) : String(row[col.key!])) || []
  );

  if (!tableRows || tableRows.length === 0) {
    return (
      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-xl)',
        textAlign: 'center',
        color: 'var(--color-text-tertiary)',
        backgroundColor: 'var(--color-bg-secondary)',
      }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div style={{ 
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <table style={{ 
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <thead>
          <tr style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '2px solid var(--color-border-dark)',
          }}>
            {columnLabels.map((label, idx) => (
              <th 
                key={idx}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  borderRight: '1px solid var(--color-border)',
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, idx) => (
            <tr 
              key={idx}
              style={{
                backgroundColor: striped && idx % 2 === 1 ? 'var(--color-bg-secondary)' : 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)',
                transition: hoverable ? 'background-color 0.2s' : 'none',
                cursor: hoverable ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => {
                if (hoverable) e.currentTarget.style.backgroundColor = '#f9f9f9';
              }}
              onMouseLeave={(e) => {
                if (hoverable) e.currentTarget.style.backgroundColor = striped && idx % 2 === 1 ? 'var(--color-bg-secondary)' : 'var(--color-bg)';
              }}
            >
              {(row as any[]).map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    textAlign: 'left',
                    color: 'var(--color-text-secondary)',
                    borderRight: '1px solid var(--color-border)',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
