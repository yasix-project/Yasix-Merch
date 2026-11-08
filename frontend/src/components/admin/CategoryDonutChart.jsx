// src/components/admin/CategoryDonutChart.jsx
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatRupiah } from "../../utils/formatters";

export default function CategoryDonutChart({ data = [] }) {
  // Guard check jika data kosong
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-center h-64 text-slate-400 text-xs font-semibold">
        Data kategori belum tersedia.
      </div>
    );
  }

  // Filter potongan chart yang memiliki nilai > 0 untuk Recharts
  const activeSlices = data.filter((item) => Number(item.value) > 0);
  const chartData =
    activeSlices.length > 0
      ? activeSlices
      : [{ name: "Belum Ada Transaksi", value: 100, color: "#E2E8F0", nominal: 0 }];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-dark mb-1">
          Kategori Terlaris
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Proporsi Transaksi Berdasarkan Jenis Produk (Seluruh Kategori)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Donut Chart */}
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={75}
                paddingAngle={activeSlices.length > 1 ? 4 : 0}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.id || index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  const nominal =
                    props?.payload?.nominal !== undefined
                      ? ` (${formatRupiah(props.payload.nominal)})`
                      : "";
                  return [`${value}%${nominal}`, "Porsi Penjualan"];
                }}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List: Menampilkan SEMUA Kategori beserta Persentase & Nominal */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {data.map((item) => (
            <div
              key={item.id || item.name}
              className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="font-medium text-slate-700 truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatRupiah(item.nominal || 0)}
                </span>
                <span className="font-mono font-bold text-dark w-12 text-right">
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
