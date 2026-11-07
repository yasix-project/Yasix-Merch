import { FileText, Clock, PackageCheck, FileCheck } from "lucide-react";

export default function PrintQueueStatsCards({
  totalOrders = 0,
  pendingOrders = 0,
  readyOrders = 0,
  completedOrders = 0,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Order Cetak
          </p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">
            {totalOrders}
          </p>
        </div>
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <FileText size={18} />
        </div>
      </div>

      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
            Menunggu Cetak
          </p>
          <p className="text-2xl font-black text-amber-900 mt-0.5">
            {pendingOrders}
          </p>
        </div>
        <div className="p-2.5 bg-amber-100/80 text-amber-700 rounded-xl">
          <Clock size={18} />
        </div>
      </div>

      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
            Siap Diambil
          </p>
          <p className="text-2xl font-black text-emerald-900 mt-0.5">
            {readyOrders}
          </p>
        </div>
        <div className="p-2.5 bg-emerald-100/80 text-emerald-700 rounded-xl">
          <PackageCheck size={18} />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Selesai Dicetak
          </p>
          <p className="text-2xl font-black text-slate-700 mt-0.5">
            {completedOrders}
          </p>
        </div>
        <div className="p-2.5 bg-slate-200/60 text-slate-600 rounded-xl">
          <FileCheck size={18} />
        </div>
      </div>
    </div>
  );
}
