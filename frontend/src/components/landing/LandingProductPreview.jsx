import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { productService } from "../../api/productService";
import { formatRupiah } from "../../utils/formatters";
import { resolveFileUrl } from "../../utils/imageUrl";
import { useAuthStore } from "../../store/authStore";

const FALLBACK_PRODUCTS = [
  {
    id: "f1",
    name: "Seragam Kejuruan Resmi SMK Yadika 6",
    description: "Seragam praktik kejuruan bahan drill tebal & adem dengan bordir nama sekolah.",
    sellingPrice: 135000,
    stock: 25,
    category: { name: "Seragam & Atribut", type: "KEBUTUHAN_SISWA" },
    imageUrl: null,
  },
  {
    id: "f2",
    name: "Dasi & Ikat Pinggang Logo Yadika 6",
    description: "Atribut kelengkapan upacara resmi siswa SMK Yadika 6 dengan logo emboss rapi.",
    sellingPrice: 35000,
    stock: 60,
    category: { name: "Seragam & Atribut", type: "KEBUTUHAN_SISWA" },
    imageUrl: null,
  },
  {
    id: "f3",
    name: "Buku Folio Garis Tebal (100 Lembar)",
    description: "Buku catatan folio bergaris kertas HVS 70 gsm cocok untuk laporan praktikum.",
    sellingPrice: 18000,
    stock: 45,
    category: { name: "Alat Tulis Kantor", type: "ATK" },
    imageUrl: null,
  },
  {
    id: "f4",
    name: "Map Snelhefter & Mika Laporan Tugas",
    description: "Map tugas jepit kertas transparan untuk pengumpulan ujian dan tugas harian.",
    sellingPrice: 4500,
    stock: 120,
    category: { name: "Alat Tulis Kantor", type: "ATK" },
    imageUrl: null,
  },
  {
    id: "f5",
    name: "Tote Bag Kanvas Printing Yadika Merch",
    description: "Tas jinjing kanvas tebal hasil sablon unit produksi kreatif siswa kejuruan.",
    sellingPrice: 45000,
    stock: 18,
    category: { name: "Merchandise & KIK", type: "KIK_PRODUCT" },
    imageUrl: null,
  },
  {
    id: "f6",
    name: "Gantungan Kunci Akrilik SMK Yadika 6",
    description: "Souvenir gantungan kunci akrilik dua sisi dengan desain maskot & logo sekolah.",
    sellingPrice: 10000,
    stock: 80,
    category: { name: "Merchandise & KIK", type: "KIK_PRODUCT" },
    imageUrl: null,
  },
];

export default function LandingProductPreview() {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const user = useAuthStore((state) => state.user);

  const { data: publicProducts = [] } = useQuery({
    queryKey: ["landing-public-products"],
    queryFn: async () => {
      try {
        const res = await productService.getPublic({ limit: 12 });
        if (res.data?.data && res.data.data.length > 0) {
          return res.data.data;
        }
      } catch (err) {
        // Fallback to static mock on network/auth error
      }
      return FALLBACK_PRODUCTS;
    },
    staleTime: 1000 * 60 * 5,
  });

  const displayList = publicProducts.length > 0 ? publicProducts : FALLBACK_PRODUCTS;

  const filteredProducts = useMemo(() => {
    if (selectedFilter === "ALL") return displayList;
    return displayList.filter((item) => {
      const type = item.category?.type || "";
      const catName = item.category?.name?.toLowerCase() || "";

      if (selectedFilter === "ATK") {
        return type === "ATK" || catName.includes("atk") || catName.includes("tulis");
      }
      if (selectedFilter === "SERAGAM") {
        return (
          type === "KEBUTUHAN_SISWA" ||
          catName.includes("seragam") ||
          catName.includes("atribut")
        );
      }
      if (selectedFilter === "KIK") {
        return (
          type === "KIK_PRODUCT" ||
          catName.includes("merch") ||
          catName.includes("kik") ||
          catName.includes("karya")
        );
      }
      return true;
    });
  }, [displayList, selectedFilter]);

  return (
    <section id="produk" className="py-16 md:py-24 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header without decorative eyebrow */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Katalog Produk Business Center
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Daftar barang kebutuhan seragam, ATK, dan produk kejuruan yang tersedia langsung di loket kasir.
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: "ALL", label: "Semua" },
              { id: "SERAGAM", label: "Seragam & Atribut" },
              { id: "ATK", label: "Alat Tulis" },
              { id: "KIK", label: "Karya Siswa (KIK)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedFilter === tab.id
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.slice(0, 6).map((prod) => {
            const hasImage = Boolean(prod.imageUrl);
            const resolvedImg = hasImage ? resolveFileUrl(prod.imageUrl) : null;

            return (
              <div
                key={prod.id}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                {/* Media Image / Graphic Banner */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden flex items-center justify-center">
                  {resolvedImg ? (
                    <img
                      src={resolvedImg}
                      alt={prod.name}
                      width={400}
                      height={250}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <div className="p-3 rounded-lg bg-slate-800 text-slate-400 mb-2">
                        <Package size={24} />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        SMK Yadika 6
                      </span>
                    </div>
                  )}

                  {/* Category Pill Tag (Solid, no blur) */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-sky border border-slate-700">
                      {prod.category?.name || "Produk"}
                    </span>
                  </div>

                  {/* Stock indicator badge (Solid, no blur) */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-emerald-400 border border-slate-700">
                      Stok: {prod.stock > 0 ? `${prod.stock} unit` : "Habis"}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-white line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                      {prod.description || "Tersedia untuk pembelian di loket kasir Business Center SMK Yadika 6."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga:</span>
                      <span className="text-sm font-bold text-accent font-mono">
                        {formatRupiah(prod.sellingPrice)}
                      </span>
                    </div>

                    <Button
                      as={Link}
                      to={user ? "/siswa/katalog" : "/login"}
                      size="xs"
                      variant="dark"
                    >
                      <span>{user ? "Beli via Portal" : "Masuk"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Link */}
        <div className="mt-10 text-center">
          <Link
            to={user ? "/siswa/katalog" : "/login"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:text-white underline underline-offset-4"
          >
            Buka Katalog Lengkap di Portal Siswa
          </Link>
        </div>
      </div>
    </section>
  );
}
