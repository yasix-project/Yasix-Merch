import { useState, useRef, useEffect } from "react";
import {
  Receipt,
  XCircle,
  CheckCircle,
  Clock,
  Printer,
  Download,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";

// Komponen UI Yasix Merch
import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import StatCard from "../../components/admin/StatCard";
import FloatingBulkBar from "../../components/admin/FloatingBulkBar";
import Button from "../../components/ui/Button";
import StrukPrinter from "../../components/shared/StrukPrinter"; // Komponen Struk Reusable

// Hooks & Formatters
import {
  useTransactions,
  useTransactionMutations,
} from "../../hooks/admin/useTransactions";
import { formatDate, formatRupiah } from "../../utils/formatters";
import { useConfirm } from "../../hooks/useConfirm";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from "../../utils/toast";

export default function MonitoringTransaksi() {
  const confirm = useConfirm();

  // --- 1. STATE & HOOKS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [printData, setPrintData] = useState([]); // Buffer untuk cetak struk

  const strukRef = useRef();

  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
  } = useTransactions();
  const { cancel } = useTransactionMutations();

  // Konfigurasi library Cetak (react-to-print)
  const triggerPrint = useReactToPrint({
    contentRef: strukRef,
    documentTitle: `Struk_Yasix_${new Date().toISOString()}`,
    onAfterPrint: () => setPrintData([]), // Reset buffer setelah dialog print tertutup
  });

  // Otomatis cetak begitu printData terisi
  useEffect(() => {
    if (printData.length > 0) {
      triggerPrint();
    }
  }, [printData, triggerPrint]);

  // --- 2. FILTER & METRICS DATA ---
  const filteredTransactions = transactions.filter((t) => {
    const query = searchQuery.toLowerCase();
    const invoice = t.invoiceNumber?.toLowerCase() || "";
    const student = t.student?.name?.toLowerCase() || "";
    const nis = t.student?.nis?.toLowerCase() || "";
    return (
      invoice.includes(query) || student.includes(query) || nis.includes(query)
    );
  });

  // Ringkasan untuk StatCard
  const totalOmzet = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  const pendingCount = transactions.filter(
    (t) =>
      t.status === "PENDING_PAYMENT" ||
      t.status === "BOOKED" ||
      t.status === "READY",
  ).length;

  const completedCount = transactions.filter(
    (t) => t.status === "COMPLETED",
  ).length;

  // --- 3. SELECTION HANDLERS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const clearSelection = () => setSelectedIds([]);

  // --- 4. EXPORT CSV (LOGIKA FRONTEND) ---
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showWarningToast("Tidak ada data untuk diekspor.");
      return;
    }

    // Tentukan data yang akan diekspor (Semua atau yang di-cek saja)
    const dataToExport =
      selectedIds.length > 0
        ? transactions.filter((t) => selectedIds.includes(t.id))
        : filteredTransactions;

    // Header CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "No Invoice,Waktu Transaksi,Kasir,Pelanggan,Status,Metode Bayar,Subtotal,Diskon,Total\n";

    // Isi Baris CSV
    dataToExport.forEach((t) => {
      const waktu = formatDate(t.createdAt, true).replace(/,/g, ""); // Hapus koma pada tanggal
      const kasir = t.cashier?.name || "Mandiri/Sistem";
      const pelanggan = t.student
        ? `${t.student.name} (NIS:${t.student.nis})`
        : "Umum";
      const row = `"${t.invoiceNumber}","${waktu}","${kasir}","${pelanggan}","${t.status}","${t.paymentMethod}",${t.subtotal},${t.discountAmount},${t.totalAmount}`;
      csvContent += row + "\n";
    });

    // Pemicu Unduhan Browser
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Data_Transaksi_Yasix_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccessToast("Data transaksi berhasil diekspor.");
  };

  const handleCancelTransaction = async (t) => {
    const isConfirmed = await confirm({
      title: "Batalkan Transaksi",
      message: `Apakah Anda yakin ingin membatalkan transaksi ${t.invoiceNumber}? Stok produk yang dibatalkan akan otomatis dikembalikan ke sistem.`,
      confirmText: "Ya, Batalkan Transaksi",
      cancelText: "Kembali",
      variant: "danger",
    });

    if (isConfirmed) {
      cancel.mutate(t.id);
    }
  };

  // --- 5. KOLOM TABEL ---
  const columns = [
    {
      header: "No. Invoice",
      cellClassName: "font-mono font-bold text-dark text-xs",
      render: (t) => t.invoiceNumber,
    },
    {
      header: "Waktu Transaksi",
      cellClassName: "text-slate-500 text-[11px]",
      render: (t) => formatDate(t.createdAt, true),
    },
    {
      header: "Pelanggan",
      render: (t) => (
        <div>
          <span className="font-bold text-dark text-sm block">
            {t.student?.name || "Umum"}
          </span>
          {t.student?.nis && (
            <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
              NIS: {t.student.nis}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Total Belanja",
      cellClassName: "font-bold text-primary",
      render: (t) => formatRupiah(t.totalAmount),
    },
    {
      header: "Status",
      render: (t) => {
        const statusConfig = {
          COMPLETED: {
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            label: "Selesai",
          },
          BOOKED: {
            color: "text-blue-700 bg-blue-50 border-blue-200",
            label: "Pre-order",
          },
          READY: {
            color: "text-amber-700 bg-amber-50 border-amber-200",
            label: "Siap Ambil",
          },
          CANCELLED: {
            color: "text-red-700 bg-red-50 border-red-200",
            label: "Batal",
          },
          PENDING_PAYMENT: {
            color: "text-slate-700 bg-slate-50 border-slate-200",
            label: "Menunggu",
          },
        };
        const config = statusConfig[t.status] || statusConfig.PENDING_PAYMENT;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (t) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="xs" variant="secondary" onClick={() => cetakSatuan(t)}>
            <Printer size={13} className="mr-1 inline" /> Cetak
          </Button>

          {(t.status === "BOOKED" ||
            t.status === "PENDING_PAYMENT" ||
            t.status === "READY") && (
            <button
              onClick={() => handleCancelTransaction(t)}
              disabled={cancel.isPending}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Batalkan Transaksi"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // --- 6. ACTION HANDLERS ---
  const cetakSatuan = (trx) => {
    setPrintData([trx]);
  };

  const cetakMassal = () => {
    const selectedTransactions = transactions.filter((t) =>
      selectedIds.includes(t.id),
    );
    setPrintData(selectedTransactions);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Hidden Struk Printer (Khusus Trigger Print CSS) */}
      <div className="hidden">
        <StrukPrinter ref={strukRef} transactions={printData} />
      </div>

      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">
            Monitoring Transaksi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit riwayat penjualan, pembatalan stok, dan cetak ulang bukti
            transaksi
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download size={15} className="text-slate-500" /> Export CSV
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Omzet Kas Masuk"
          value={formatRupiah(totalOmzet)}
          icon={Receipt}
          trendLabel="Dari transaksi lunas (Completed)"
        />
        <StatCard
          title="Pesanan Berjalan"
          value={pendingCount}
          icon={Clock}
          trendLabel="Pre-order & Siap Ambil"
        />
        <StatCard
          title="Transaksi Selesai"
          value={completedCount}
          icon={CheckCircle}
          trendLabel="Berhasil di Kasir / POS"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari nomor invoice, nama siswa, atau NIS..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Table Data */}
      <Table
        columns={columns}
        data={filteredTransactions}
        keyField="id"
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        emptyMessage="Belum ada data transaksi yang tercatat di Yasix Merch."
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
      />

      <FloatingBulkBar
        selectedCount={selectedIds.length}
        itemLabel="Transaksi Terpilih"
        onPrint={cetakMassal}
        onExport={handleExportCsv}
        onCancel={() =>
          showInfoToast(
            "Fitur Batalkan Massal memerlukan setup API Backend. Gunakan batalkan per baris sementara.",
          )
        }
        onClear={clearSelection}
      />
    </div>
  );
}
