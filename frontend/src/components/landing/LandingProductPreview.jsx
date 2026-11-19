import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  Package,
  ArrowRight,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { productService } from "../../api/productService";
import { formatRupiah } from "../../utils/formatters";
import { resolveFileUrl } from "../../utils/imageUrl";
import { useAuthStore } from "../../store/authStore";

// Mock Fallback jika backend kosong atau belum terisi
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

  // Ambil data produk publik dari backend
  const { data: publicProducts = [], isLoading } = useQuery({
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
    staleTime: 1000 * 60 * 5, // 5 menit
  });

  const displayList = publicProducts.length > 0 ? publicProducts : FALLBACK_PRODUCTS;

  // Filter kategori
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
    <section id="produk" className="py-20 md:py-28 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div>
              <Badge variant="sky" icon={ShoppingBag}>
                Etalase Business Center
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Produk & Perlengkapan Sekolah
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Lihat pratinjau barang yang tersedia di konter YasixMerch. Siswa dapat
              melakukan pemesanan langsung melalui portal.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "Semua Produk" },
              { id: "SERAGAM", label: "Seragam & Atribut" },
              { id: "ATK", label: "Alat Tulis (ATK)" },
              { id: "KIK", label: "KIK & Merch" },
            ].map((tab) => (
              <Button
                key={tab.id}
                type="button"
                size="xs"
                variant={selectedFilter === tab.id ? "primary" : "dark"}
                onClick={() => setSelectedFilter(tab.id)}
                className={selectedFilter === tab.id ? "shadow-primary/30" : "text-slate-400 hover:text-white"}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.slice(0, 6).map((prod) => {
            const hasImage = Boolean(prod.imageUrl);
            const resolvedImg = hasImage ? resolveFileUrl(prod.imageUrl) : null;

            return (
              <div
                key={prod.id}
                className="group bg-slate-950 border border-slate-800 hover:border-primary/50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 flex flex-col justify-between"
              >
                {/* Media Image / Graphic Banner */}
                <div className="relative aspect-[16/10] bg-slate-850 overflow-hidden flex items-center justify-center">
                  {resolvedImg ? (
                    <img
                      src={resolvedImg}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                      <div className="p-3.5 rounded-2xl bg-primary/10 text-sky mb-2 group-hover:scale-110 transition-transform">
                        <Package size={28} />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        YasixMerch Yadika 6
                      </span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="sky" className="text-[10px] font-bold shadow-md">
                      {prod.category?.name || "Kategori Produk"}
                    </Badge>
                  </div>

                  {/* Stock indicator badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="emerald" className="text-[10px] font-bold">
                      Stok: {prod.stock > 0 ? `${prod.stock} unit` : "Habis"}
                    </Badge>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {prod.description || "Tersedia untuk pembelian langsung di loket kasir Business Center SMK Yadika 6."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Satuan:</span>
                      <span className="text-base font-extrabold text-accent">
                        {formatRupiah(prod.sellingPrice)}
                      </span>
                    </div>

                    <Button
                      as={Link}
                      to={user ? "/siswa/katalog" : "/login"}
                      size="xs"
                      variant="primary"
                      rightIcon={ArrowRight}
                    >
                      <span>{user ? "Pesan" : "Masuk"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center">
          <Button
            as={Link}
            to={user ? "/siswa/katalog" : "/login"}
            variant="dark"
            rightIcon={ArrowRight}
            className="text-sky hover:text-white border-slate-800 hover:border-slate-700 px-5 py-3 rounded-2xl"
          >
            <span>Lihat Seluruh Katalog Lengkap di Portal Siswa</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
