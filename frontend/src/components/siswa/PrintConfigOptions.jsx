export default function PrintConfigOptions({
  colorType,
  paperSize,
  finishing,
  notes,
  onColorChange,
  onPaperChange,
  onFinishingChange,
  onNotesChange,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Opsi Spesifikasi Cetak
      </h3>

      {/* Mode Warna */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          Jenis Warna Cetak
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onColorChange("BW")}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
              colorType === "BW"
                ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Hitam Putih (B/W)</span>
            <span className="text-[10px] font-normal text-slate-500 mt-0.5">
              Rp 500 / halaman
            </span>
          </button>

          <button
            type="button"
            onClick={() => onColorChange("COLOR")}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
              colorType === "COLOR"
                ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Cetak Berwarna</span>
            <span className="text-[10px] font-normal text-slate-500 mt-0.5">
              Rp 1.000 / halaman
            </span>
          </button>
        </div>
      </div>

      {/* Ukuran Kertas & Finishing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Ukuran Kertas
          </label>
          <select
            value={paperSize}
            onChange={(e) => onPaperChange(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="A4">A4 (Standar)</option>
            <option value="F4">F4 / Folio</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Jilid / Finishing
          </label>
          <select
            value={finishing}
            onChange={(e) => onFinishingChange(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">Tanpa Jilid (Stapler)</option>
            <option value="Jilid Lakban">Jilid Lakban</option>
            <option value="Jilid Spiral">Jilid Spiral</option>
            <option value="Klip Biasa">Klip Penjepit</option>
          </select>
        </div>
      </div>

      {/* Catatan Tambahan */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Catatan untuk Petugas Kasir (Opsional)
        </label>
        <input
          type="text"
          placeholder="Contoh: Cetak hal 1-5 saja..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
