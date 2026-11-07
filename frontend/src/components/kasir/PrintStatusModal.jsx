import {
  Clock,
  RefreshCw,
  PackageCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function PrintStatusModal({
  selectedOrder,
  onClose,
  onUpdateStatus,
}) {
  if (!selectedOrder) return null;

  return (
    <Modal
      isOpen={Boolean(selectedOrder)}
      onClose={onClose}
      title="Ubah Status Order Cetak"
    >
      <div className="space-y-4 text-xs">
        {/* Rincian Order */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Nomor Order</span>
            <span className="font-mono font-bold text-slate-900">
              {selectedOrder.orderNumber}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Nama File</span>
            <span
              className="font-medium text-slate-800 truncate max-w-[200px]"
              title={selectedOrder.fileName}
            >
              {selectedOrder.fileName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Pemesan</span>
            <span className="font-bold text-slate-900">
              {selectedOrder.student?.name || "Siswa Umum"} (NIS:{" "}
              {selectedOrder.student?.nis || "-"})
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500">Status Saat Ini</span>
            <Badge
              variant={
                selectedOrder.status === "READY"
                  ? "success"
                  : selectedOrder.status === "PENDING"
                    ? "warning"
                    : selectedOrder.status === "COMPLETED"
                      ? "primary"
                      : "danger"
              }
            >
              {selectedOrder.status}
            </Badge>
          </div>
        </div>

        {/* Tombol Pilihan Status */}
        <div className="space-y-2">
          <span className="font-bold text-slate-800 block text-xs">
            Pilih Status Baru:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={
                selectedOrder.status === "PENDING"
                  ? "amber"
                  : "outline"
              }
              onClick={() => {
                onUpdateStatus(selectedOrder.id, "PENDING");
                onClose();
              }}
              className="justify-start gap-1.5"
            >
              <Clock size={13} className="text-amber-600" />
              <span>Menunggu</span>
            </Button>

            <Button
              size="sm"
              variant={
                selectedOrder.status === "PROCESSING"
                  ? "primary"
                  : "outline"
              }
              onClick={() => {
                onUpdateStatus(selectedOrder.id, "PROCESSING");
                onClose();
              }}
              className="justify-start gap-1.5"
            >
              <RefreshCw size={13} className="text-blue-500" />
              <span>Sedang Dicetak</span>
            </Button>

            <Button
              size="sm"
              variant={
                selectedOrder.status === "READY"
                  ? "primary"
                  : "outline"
              }
              onClick={() => {
                onUpdateStatus(selectedOrder.id, "READY");
                onClose();
              }}
              className="justify-start gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <PackageCheck size={13} />
              <span>Siap Diambil</span>
            </Button>

            <Button
              size="sm"
              variant={
                selectedOrder.status === "COMPLETED"
                  ? "primary"
                  : "outline"
              }
              onClick={() => {
                onUpdateStatus(selectedOrder.id, "COMPLETED");
                onClose();
              }}
              className="justify-start gap-1.5"
            >
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Selesai</span>
            </Button>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onUpdateStatus(selectedOrder.id, "CANCELLED");
                onClose();
              }}
              className="w-full gap-1.5"
            >
              <XCircle size={13} />
              <span>Batalkan Order Cetak</span>
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
