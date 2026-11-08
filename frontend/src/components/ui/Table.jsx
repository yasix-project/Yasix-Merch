// src/components/ui/Table.jsx
import { Loader2, Inbox, AlertTriangle } from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  keyField = "id",
  isLoading,
  isError,
  errorMessage = "Gagal mengambil data dari server.",
  emptyMessage = "Tidak ada data.",
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  rowClassName, // Fungsi (row) => string untuk custom class per baris (diterapkan ke setiap sel)
}) {
  const isAllSelected =
    data.length > 0 &&
    data.every((item) => selectedIds.includes(item[keyField]));

  // Wadah luar: terang (bg-bright), sudut besar, border halus
  const shell =
    "bg-bright rounded-2xl border border-slate-200 shadow-sm shadow-dark/5";

  if (isLoading) {
    return (
      <div
        className={`${shell} p-12 flex items-center justify-center gap-2.5 text-primary`}
      >
        <Loader2 className="animate-spin" size={18} />
        <span className="text-xs font-medium text-slate-500">
          Memuat data...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`${shell} p-8 flex flex-col items-center gap-2 text-center border-danger/30 bg-danger/5`}
      >
        <AlertTriangle size={20} className="text-danger" />
        <p className="text-xs font-medium text-danger">{errorMessage}</p>
      </div>
    );
  }

  // Gaya sel: baris putih "melayang" dengan sudut membulat di ujung kiri & kanan
  const cellBase =
    "px-4 py-3 border-y first:border-l last:border-r first:rounded-l-xl last:rounded-r-xl transition-colors";

  return (
    <div className={`${shell} max-w-6xl p-2`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-y-1.5">
          <thead>
            <tr>
              {onSelectAll && onSelectRow && (
                <th className="px-4 py-3 text-center w-8 bg-dark first:rounded-l-xl last:rounded-r-xl">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    aria-label="Pilih semua baris"
                    className="rounded border-white/40 bg-transparent accent-accent cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 bg-dark text-[11px] font-semibold uppercase tracking-wider text-sky first:rounded-l-xl last:rounded-r-xl ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="font-sans text-dark">
            {data.map((row) => {
              const isSelected = selectedIds.includes(row[keyField]);
              const customClass = rowClassName ? rowClassName(row) : "";

              const cellState = isSelected
                ? "bg-sky border-primary/40 first:shadow-[inset_4px_0_0_var(--color-accent)]"
                : "bg-white border-slate-200/80 group-hover:bg-sky/40 group-hover:border-primary/30";

              return (
                <tr key={row[keyField]} className="group">
                  {onSelectAll && onSelectRow && (
                    <td
                      className={`${cellBase} ${cellState} text-center ${customClass}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow(row[keyField])}
                        aria-label={`Pilih baris ${row[keyField]}`}
                        className="rounded border-slate-300 accent-primary cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, index) => (
                    <td
                      key={index}
                      className={`${cellBase} ${cellState} ${
                        col.cellClassName || ""
                      } ${customClass}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              );
            })}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onSelectAll ? 1 : 0)}
                  className="py-12 bg-white border border-dashed border-slate-300 rounded-xl"
                >
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Inbox size={22} />
                    <span className="text-xs font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
