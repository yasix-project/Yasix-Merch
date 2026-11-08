import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SalesBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center h-72 text-slate-400 text-xs font-semibold gap-2">
        <p>Belum ada rekaman grafik penjualan pada rentang waktu ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-dark">Grafik Penjualan</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Perbandingan Omset & Keuntungan Bersih
          </p>
        </div>

        {/* Custom Legend */}
        <div className="flex items-center gap-6 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-primary inline-block"></span>
            <span className="text-slate-600">Omset</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-accent inline-block"></span>
            <span className="text-slate-600">Margin/Profit</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              tickFormatter={(val) => `Rp${val / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              }}
              formatter={(value) => [`Rp ${value.toLocaleString("id-ID")}`, ""]}
            />
            <Bar
              dataKey="pendapatan"
              fill="#1C62C4"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="keuntungan"
              fill="#FFC800"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
