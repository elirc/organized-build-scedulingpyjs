import type { ReactNode } from "react";

export function DataTable<T>({
  items,
  columns
}: {
  items: T[];
  columns: Array<{ header: string; cell: (item: T) => ReactNode }>;
}) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.header}>{column.cell(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

