// src/components/ui/FilterBar.jsx
import { Search, X } from "lucide-react";

export default function FilterBar({
  searchPlaceholder = "Cari...",
  searchValue = "",
  onSearchChange,
  onKeyDown,
  filterTabs = [], // Format: [{ label: "Semua", value: "all" }, ...]
  activeTab,
  onTabChange,
}) {
  return (
    // Wadah luar: sama dengan Table (bg-bright, rounded-2xl, border halus)
    <div className="bg-bright p-2 rounded-2xl border border-slate-200 shadow-sm shadow-dark/5 flex flex-col md:flex-row gap-2 justify-between items-stretch md:items-center">
      {/* Kolom pencarian */}
      <div className="relative w-full md:w-80 group">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
          size={16}
        />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full pl-10 pr-9 py-2.5 text-xs font-medium text-dark placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl outline-none hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-dark hover:bg-sky transition-colors"
            aria-label="Hapus pencarian"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Tab filter: kelompok pil, tab aktif bergaya header tabel (bg-dark) */}
      {filterTabs.length > 0 && (
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto w-full md:w-auto">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-dark text-white shadow-md shadow-dark/25"
                    : "text-slate-500 hover:bg-sky/60 hover:text-dark"
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
