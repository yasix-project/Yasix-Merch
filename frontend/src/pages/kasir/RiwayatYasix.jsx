import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Receipt, Printer, CheckCircle, Clock } from "lucide-react";

import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import Button from "../../components/ui/Button";
import StrukPrinter from "../../components/shared/StrukPrinter";
import { useTransactions } from "../../hooks/admin/useTransactions";
import { formatDate, formatRupiah } from "../../utils/formatters";

export default function RiwayatKasir() {
  const [searchQuery, setSearchQuery] = useState("");
  const [printData, setPrintData] = useState([]);
  const strukRef = useRef();

  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
  } = useTransactions();

  const handlePrint = useReactToPrint({
    content: () => strukRef.current,
    documentTitle: "Struk_Cetak_Ulang_Yasix",
    onAfterPrint: () => setPrintData([]),
  });

  useEffect(() => {
    if (printData.length > 0) {
      handlePrint();
    }
  }, [printData, handlePrint]);

  const handleReprint = (tx) => {
    setPrintData([tx]);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesInvoice = t.invoiceNumber
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCustomer = t.student?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesInvoice || matchesCustomer;
  });

  const columns = [
    {
      header: "No. Invoice",
      cellClassName: "font-mono font-bold text-dark text-xs",
      render: (t) => t.invoiceNumber,
    },
    {
      header: "Waktu Transaksi",
      cellClassName: "text-slate-500 text-xs",
      render: (t) => formatDate(t.createdAt, true),
    },
    {
      header: "Pelanggan",
      render: (t) => (
        <div>
          <span className="font-bold text-slate-800 text-sm block">
            {t.student?.name || "Pelanggan Umum"}
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
      cellClassName: "font-bold text-blue-600 text-sm",
      render: (t) => formatRupiah(t.totalAmount),
    },
    {
      header: "Metode",
      cellClassName: "text-xs font-semibold text-slate-600 uppercase",
      render: (t) => t.paymentMethod,
    },
    {
      header: "Status",
      render: (t) => {
        const isCompleted = t.status === "COMPLETED";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isCompleted ? <CheckCircle size={12} /> : <Clock size={12} />}
            {t.status}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (t) => (
        <Button
          size="xs"
          variant="secondary"
          onClick={() => handleReprint(t)}
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Printer size={13} className="mr-1 inline text-blue-600" />
          Cetak Ulang
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-20">
      <div className="hidden">
        <StrukPrinter ref={strukRef} transactions={printData} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="text-blue-600" size={22} />
            Riwayat Transaksi Kasir
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar transaksi kasir untuk pelacakan penjualan dan cetak ulang
            struk thermal.
          </p>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Cari berdasarkan No. Invoice atau Siswa..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Table
        columns={columns}
        data={filteredTransactions}
        keyField="id"
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        emptyMessage="Belum ada transaksi yang tercatat pada sesi ini."
      />
    </div>
  );
}
