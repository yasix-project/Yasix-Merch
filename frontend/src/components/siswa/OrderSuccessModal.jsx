import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  ShoppingBag,
  ArrowRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "../../utils/formatters";
import Button from "../ui/Button";

export default function OrderSuccessModal({ order, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !order) return null;

  const invoiceNumber = order.invoiceNumber || "";
  const totalAmount = Number(order.totalAmount || 0);
  const items = order.items || [];

  const handleCopy = () => {
    if (!invoiceNumber) return;
    navigator.clipboard.writeText(invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewOrders = () => {
    onClose();
    navigate("/siswa/pesanan");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Sukses */}
        <div className="bg-success/10 border-b border-success/20 p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="w-12 h-12 bg-success text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-success/25 mb-2.5">
            <CheckCircle2 size={26} />
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Pre-Order Berhasil Dibuat!
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pesanan Anda telah dicatat di sistem Business Center SMK Yadika 6.
          </p>
        </div>

        {/* Konten Tiket Pengambilan */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Box Invoice & QR Code */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Nomor Pesanan (Invoice)
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-base font-mono font-black text-slate-900">
                  {invoiceNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Salin Nomor Invoice"
                >
                  {copied ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Scannable */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-2xs">
              <QRCodeSVG
                value={invoiceNumber}
                size={110}
                level="H"
                includeMargin={false}
              />
              <span className="text-[8px] font-mono font-bold text-slate-400 block mt-1">
                SCAN DI KASIR
              </span>
            </div>

            {/* Batas Pengambilan */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/15 border border-accent/30 rounded-full text-amber-900 text-[11px] font-semibold">
              <Clock size={13} className="text-accent" />
              <span>Ambil di kasir dalam waktu 1 jam</span>
            </div>
          </div>

          {/* Rincian Ringkas Pesanan */}
          <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Rincian Barang ({items.length} item)
            </span>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700">
                <span className="truncate max-w-[180px]">
                  {item.quantity}x {item.itemName || item.product?.name || "Produk"}
                </span>
                <span className="font-semibold text-slate-900 shrink-0">
                  {formatRupiah(item.subtotal || item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
              <span className="text-slate-800">Total Tagihan Kasir:</span>
              <span className="text-sm font-black text-primary">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 text-xs py-2.5 rounded-xl font-bold"
          >
            Lanjut Belanja
          </Button>
          <Button
            variant="primary"
            onClick={handleViewOrders}
            className="flex-1 text-xs py-2.5 rounded-xl font-bold gap-1.5"
          >
            <span>Lihat Pesanan</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
