import { cn } from "@/lib/cn";

/** A plain table: header row on a tinted band, one line per row. Cells are 14 px or larger. */
export function DataTable({ columns, rows, empty }: { columns: { key: string; label: string; className?: string }[]; rows: { key: string; cells: React.ReactNode[] }[]; empty: string }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-card">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="bg-sunken">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("t-secondary-m px-5 py-3 text-ink-2", c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-line">
              {r.cells.map((cell, i) => (
                <td key={i} className={cn("px-5 py-3.5 align-middle", i === 0 ? "t-body-m" : "t-secondary", columns[i]?.className)}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="t-body px-5 py-8 text-center text-ink-2">{empty}</p> : null}
    </div>
  );
}
