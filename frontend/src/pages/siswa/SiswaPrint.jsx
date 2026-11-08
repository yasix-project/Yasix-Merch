import { Printer, AlertCircle, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";

import { useStudentPrint } from "../../hooks/siswa/useStudentPrint";
import PrintSuccessTicket from "../../components/siswa/PrintSuccessTicket";
import PrintFileUploader from "../../components/siswa/PrintFileUploader";
import PrintConfigOptions from "../../components/siswa/PrintConfigOptions";
import PrintCostSummary from "../../components/siswa/PrintCostSummary";

export default function SiswaPrint() {
  const {
    file,
    colorType,
    paperSize,
    finishing,
    copies,
    docTotalPages,
    selectedPages,
    estimate,
    isEstimating,
    isSubmitting,
    errorMessage,
    successOrder,
    setFinishing,
    setCopies,
    handleFileSelect,
    handleColorChange,
    handlePaperChange,
    togglePage,
    selectAllPages,
    selectOddPages,
    selectEvenPages,
    resetFile,
    submitOrder,
  } = useStudentPrint();

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Printer className="text-primary" size={20} />
          Print Mandiri Siswa
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Unggah dokumen PDF, tentukan halaman yang ingin dicetak, pilih jilid, dan ambil langsung di konter kasir.
        </p>
      </div>

      {/* Tiket Berhasil */}
      {successOrder && <PrintSuccessTicket order={successOrder} />}

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-3 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-danger" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulir Print */}
      <form onSubmit={submitOrder} className="space-y-4">
        <PrintFileUploader
          file={file}
          onSelectFile={handleFileSelect}
          onResetFile={resetFile}
        />

        <PrintConfigOptions
          colorType={colorType}
          paperSize={paperSize}
          finishing={finishing}
          copies={copies}
          docTotalPages={docTotalPages}
          selectedPages={selectedPages}
          onColorChange={handleColorChange}
          onPaperChange={handlePaperChange}
          onFinishingChange={setFinishing}
          onCopiesChange={setCopies}
          onTogglePage={togglePage}
          onSelectAllPages={selectAllPages}
          onSelectOddPages={selectOddPages}
          onSelectEvenPages={selectEvenPages}
        />

        {file && (
          <PrintCostSummary estimate={estimate} isEstimating={isEstimating} />
        )}

        <Button
          type="submit"
          disabled={!file || isEstimating || isSubmitting || selectedPages.length === 0}
          className="w-full py-3.5 text-sm font-bold bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 rounded-2xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Mengirim Antrean Cetak...
            </>
          ) : (
            <>
              <Printer size={16} />
              Kirim Antrean Cetak ({selectedPages.length || 0} Halaman)
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
