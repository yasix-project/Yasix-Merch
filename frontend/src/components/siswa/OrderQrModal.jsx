import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Clock, X } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";
import Button from "../ui/Button";

export default function OrderQrModal({ order, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const invoiceNumber = order.invoiceNumber || "";
  const totalAmount = Number(order.totalAmount || 0);

  const handleCopy = () => {
    if (!invoiceNumber) return;
    navigator.clipboard.writeText(invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">
            Kode Pengambilan Pesanan
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* QR Section */}
        <div className="p-6 text-center space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-2xs">
            <QRCodeSVG
              value={invoiceNumber}
              size={140}
              level="H"
              includeMargin={false}
            />
            <span className="text-[9px] font-mono font-bold text-slate-400 block mt-2">
              SCAN DI KASIR YASIXMERCH
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Nomor Invoice
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm font-mono font-black text-slate-900">
                {invoiceNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Salin Nomor Invoice"
              >
                {copied ? (
                  <Check size={13} className="text-success" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
            <span className="text-slate-500">Total Tagihan Kasir:</span>
            <span className="font-extrabold text-primary">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tunjukkan kode QR ini ke kasir YasixMerch saat mengambil dan
            melunasi pesanan Anda.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-xs py-2.5 rounded-xl font-bold"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
