import {
  Clock,
  RefreshCw,
  PackageCheck,
  CheckCircle2,
  XCircle,
  BookOpen,
  Printer,
} from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { parsePrintSpecs, parseOrderPageNotes } from "../../utils/printSpecs";

export default function PrintStatusModal({
  selectedOrder,
  onClose,
  onUpdateStatus,
}) {
  if (!selectedOrder) return null;

  const specs = parsePrintSpecs(selectedOrder);
  const pageNotes = parseOrderPageNotes(selectedOrder.notes);

  return (
    <Modal
      isOpen={Boolean(selectedOrder)}
      onClose={onClose}
      title="Ubah Status Order Cetak"
    >
      <div className="space-y-4 text-xs">
        {/* Rincian Order */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
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

          {/* Spesifikasi Dokumen & Jilid */}
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Jumlah Halaman:</span>
              <span className="font-bold text-slate-800">
                {specs.effectivePageCount || specs.totalPages} Hal ({specs.paperSize}) •{" "}
                {specs.isColor ? "Warna" : "B/W"}
              </span>
            </div>
            {specs.finishing && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Jilid / Finishing:</span>
                <span className="font-bold text-purple-700 flex items-center gap-1">
                  <BookOpen size={11} />
                  {specs.finishing}
                </span>
              </div>
            )}
            {pageNotes.isCustom && (
              <div className="bg-white p-2 rounded-xl border border-slate-200 mt-1 space-y-0.5">
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Printer size={12} />
                    Cetak Hal:
                  </span>
                  <span className="font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {pageNotes.printPages}
                  </span>
                </div>
                {pageNotes.skipPages && (
                  <div className="flex items-center justify-between text-[10px] text-rose-600">
                    <span>Lewati:</span>
                    <span className="font-mono">Hal {pageNotes.skipPages}</span>
                  </div>
                )}
              </div>
            )}
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
              <RefreshCw size={13} className="text-blue-600" />
              <span>Diproses</span>
            </Button>

            <Button
              size="sm"
              variant={
                selectedOrder.status === "READY"
                  ? "success"
                  : "outline"
              }
              onClick={() => {
                onUpdateStatus(selectedOrder.id, "READY");
                onClose();
              }}
              className="justify-start gap-1.5"
            >
              <PackageCheck size={13} className="text-emerald-600" />
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
              <CheckCircle2 size={13} className="text-blue-600" />
              <span>Selesai</span>
            </Button>
          </div>

          {/* Opsi Batalkan */}
          <div className="pt-2 border-t border-slate-200">
            <Button
              size="sm"
              variant={
                selectedOrder.status === "CANCELLED"
                  ? "danger"
                  : "outline"
              }
              onClick={() => {
                onUpdateStatus(selectedOrder.id, "CANCELLED");
                onClose();
              }}
              className="w-full justify-center gap-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            >
              <XCircle size={13} />
              <span>Batalkan Pesanan Cetak</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
