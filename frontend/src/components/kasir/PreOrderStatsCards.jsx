import { Clock, PackageCheck, CheckCircle2 } from "lucide-react";

export default function PreOrderStatsCards({
  totalCount = 0,
  bookedCount = 0,
  readyCount = 0,
  completedCount = 0,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <span className="text-xs font-medium text-slate-500">
          Total Pre-Order
        </span>
        <p className="text-2xl font-black text-slate-900">{totalCount}</p>
      </div>

      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">
            Menunggu Diproses
          </span>
          <Clock size={16} className="text-amber-600" />
        </div>
        <p className="text-2xl font-black text-amber-900">{bookedCount}</p>
      </div>

      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900">
            Siap Diambil
          </span>
          <PackageCheck size={16} className="text-emerald-600" />
        </div>
        <p className="text-2xl font-black text-emerald-900">{readyCount}</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Selesai Diambil
          </span>
          <CheckCircle2 size={16} className="text-slate-400" />
        </div>
        <p className="text-2xl font-black text-slate-700">{completedCount}</p>
      </div>
    </div>
  );
}
