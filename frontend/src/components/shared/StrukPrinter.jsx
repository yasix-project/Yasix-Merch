import { forwardRef } from "react";
import { formatRupiah, formatDate } from "../../utils/formatters";

/**
 * Komponen cetak struk thermal (58mm).
 * Gunakan forwardRef agar kompatibel dengan react-to-print.
 *
 * @param {Array} transactions - Array of transaction objects
 */
const StrukPrinter = forwardRef(({ transactions = [] }, ref) => {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div ref={ref} className="hidden-print-container">
      {/* CSS Khusus Print Thermal */}
      <style type="text/css" media="print">
        {`
          @page { 
            size: 58mm auto; /* Lebar kertas thermal standar 58mm */
            margin: 0mm; 
          }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            color: #000;
            background: #fff;
          }
          * {
            box-sizing: border-box;
          }
          .struk-page { 
            width: 58mm; 
            padding: 4mm; 
            page-break-after: always; /* Pastikan printer memotong/memisahkan tiap struk */
          }
          .hidden-print-container { 
            display: block !important; 
          }
          .dashed-line {
            border-bottom: 1px dashed #000;
            margin: 4px 0;
          }
        `}
      </style>

      {/* Looping semua transaksi yang dikirim (bisa 1, bisa banyak) */}
      {transactions.map((t, index) => (
        <div
          key={t.id || index}
          className="struk-page flex flex-col text-black bg-white"
        >
          {/* Header Toko */}
          <div className="text-center pb-1 mb-1 dashed-line">
            <h2 className="font-extrabold text-[13px] leading-tight">
              YASIX MERCH
            </h2>
            <p className="text-[9px] leading-tight">
              SMK Yadika 6 Jatiwaringin
            </p>
            <p className="text-[9px] leading-tight">YasixMerch</p>
          </div>

          {/* Info Transaksi */}
          <div className="text-[9px] mb-2 leading-tight space-y-0.5">
            <div className="flex justify-between">
              <span>No.</span>
              <span>{t.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tgl</span>
              <span>{formatDate(t.createdAt, true)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span>{t.cashier?.name || "Mandiri (Siswa)"}</span>
            </div>
            <div className="flex justify-between">
              <span>Siswa</span>
              <span>{t.student?.name || "Umum"}</span>
            </div>
          </div>

          <div className="dashed-line"></div>

          {/* Daftar Barang */}
          <div className="text-[10px] mb-1 space-y-1">
            {t.items?.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="font-bold">{item.itemName}</div>
                <div className="flex justify-between items-start">
                  <div className="text-[9px]">
                    {item.quantity} x {formatRupiah(item.price)}
                  </div>
                  <div className="text-[10px] font-bold">
                    {formatRupiah(item.subtotal)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashed-line"></div>

          {/* Ringkasan Biaya */}
          <div className="text-[9px] flex justify-between">
            <span>Subtotal</span>
            <span>{formatRupiah(t.subtotal)}</span>
          </div>
          {Number(t.discountAmount) > 0 && (
            <div className="text-[9px] flex justify-between">
              <span>Diskon Voucher</span>
              <span>- {formatRupiah(t.discountAmount)}</span>
            </div>
          )}
          <div className="text-[11px] font-bold flex justify-between mt-1 pt-1 border-t border-black">
            <span>TOTAL</span>
            <span>{formatRupiah(t.totalAmount)}</span>
          </div>

          {/* Info Pembayaran (Hanya jika bukan Pre-Order yang belum lunas) */}
          {t.status !== "BOOKED" && t.status !== "PENDING_PAYMENT" && (
            <>
              <div className="text-[9px] flex justify-between mt-1">
                <span>Bayar ({t.paymentMethod})</span>
                <span>{formatRupiah(t.payAmount || 0)}</span>
              </div>
              <div className="text-[9px] flex justify-between">
                <span>Kembali</span>
                <span>{formatRupiah(t.changeAmount || 0)}</span>
              </div>
            </>
          )}

          {/* Footer Struk */}
          <div className="text-center mt-3 pt-2 dashed-line text-[8px] leading-tight">
            <p className="font-bold mb-1">~ TERIMA KASIH ~</p>
            {t.status === "BOOKED" || t.status === "READY" ? (
              <p>
                Ini adalah bukti Pre-order.
                <br />
                Harap tunjukkan saat pengambilan.
              </p>
            ) : (
              <p>
                Barang yang sudah dibeli
                <br />
                tidak dapat ditukar/dikembalikan.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

StrukPrinter.displayName = "StrukPrinter";
export default StrukPrinter;
