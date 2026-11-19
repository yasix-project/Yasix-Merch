import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

import Button from "../../components/ui/Button";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingHero from "../../components/landing/LandingHero";
import LandingFeatures from "../../components/landing/LandingFeatures";
import LandingPrintEstimator from "../../components/landing/LandingPrintEstimator";
import LandingProductPreview from "../../components/landing/LandingProductPreview";
import LandingQuickTracker from "../../components/landing/LandingQuickTracker";
import LandingFooter from "../../components/landing/LandingFooter";

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Set document title
    document.title =
      "YasixMerch — Business Center & Print Mandiri SMK Yadika 6";

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary selection:text-white">
      {/* Sticky Header */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section */}
        <LandingHero />

        {/* 4 Pilar Layanan & Cara Kerja */}
        <LandingFeatures />

        {/* Kalkulator Biaya Cetak Interaktif */}
        <LandingPrintEstimator />

        {/* Etalase Produk Unggulan */}
        <LandingProductPreview />

        {/* Lacak Tiket Pesanan Cepat */}
        <LandingQuickTracker />
      </main>

      {/* FAQ, Jam Buka & Footer */}
      <LandingFooter />

      {/* Back to Top Floating Button */}
      {showScrollTop && (
        <Button
          type="button"
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          variant="primary"
          size="sm"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl shadow-xl shadow-primary/30 min-h-0 animate-in fade-in"
        >
          <ArrowUp size={20} />
        </Button>
      )}
    </div>
  );
}
