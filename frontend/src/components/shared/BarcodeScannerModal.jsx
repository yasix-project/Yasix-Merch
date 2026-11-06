// src/components/shared/BarcodeScannerModal.jsx
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  X,
  Scan,
  RefreshCw,
  Volume2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { playBarcodeBeep } from "../../utils/sound";

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "Scan Barcode Produk",
  description = "Arahkan barcode 1D produk atau QR Code ke hadapan webcam laptop Anda.",
  continuous = true, // true untuk scan barang berturut-turut di kasir
}) {
  const [scannerError, setScannerError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const scannerRef = useRef(null);
  const cooldownRef = useRef(false);

  // Inisialisasi dan jalankan scanner saat modal dibuka
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setLastScanned(null);
      setScannerError("");
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setScannerError("");
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          throw new Error("Tidak ada kamera/webcam yang terdeteksi di perangkat ini.");
        }

        if (isMounted) {
          setCameras(devices);
          const defaultCamId = devices[devices.length - 1].id; // Kamera utama
          setSelectedCameraId(defaultCamId);
          await initCamera(defaultCamId);
        }
      } catch (err) {
        if (isMounted) {
          setScannerError(
            err.message ||
              "Gagal mengakses webcam. Pastikan izin kamera telah diizinkan di browser."
          );
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const initCamera = async (cameraId) => {
    try {
      await stopScanner();

      // Gunakan BarcodeDetector native jika didukung browser (Chrome/Edge/Android)
      // untuk pemindaian barcode 1D berkecepatan tinggi
      const html5QrCode = new Html5Qrcode("barcode-scanner-view", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      // Area pemindaian dinamis luas agar barcode 1D horizontal tidak terpotong
      const config = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const width = Math.floor(Math.min(viewfinderWidth * 0.9, 360));
          const height = Math.floor(Math.min(viewfinderHeight * 0.65, 220));
          return { width, height };
        },
        aspectRatio: 1.333333,
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // Frame scanner ignore
        }
      );

      setIsCameraActive(true);
    } catch (err) {
      setScannerError("Gagal memulai stream webcam: " + (err.message || err));
      setIsCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        // Abaikan error cleanup
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSuccessfulScan = (text) => {
    if (cooldownRef.current) return;

    // Cooldown 1.2 detik agar scan tidak terpicu berkali-kali dalam 1 detik
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, 1200);

    playBarcodeBeep();
    setLastScanned({
      code: text,
      time: new Date().toLocaleTimeString("id-ID"),
    });

    if (onScan) {
      onScan(text);
    }

    // Jika bukan mode berkelanjutan, otomatis tutup modal
    if (!continuous) {
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  const handleSwitchCamera = async (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    await initCamera(newId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>

        {/* Viewport Kamera Scanner */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[260px]">
          {/* Target Box Animasi */}
          <div
            id="barcode-scanner-view"
            className="w-full h-full min-h-[260px] overflow-hidden"
          />

          {!isCameraActive && !scannerError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900/90 z-10 gap-2">
              <Camera size={28} className="animate-pulse text-blue-400" />
              <span className="text-xs font-medium">Menghubungkan ke Webcam...</span>
            </div>
          )}

          {scannerError && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center text-red-400 bg-slate-950/95 z-20 gap-3">
              <CameraOff size={32} className="text-red-500" />
              <p className="text-xs font-semibold text-red-300 max-w-xs">
                {scannerError}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedCameraId && initCamera(selectedCameraId)}
                className="border-red-500/40 text-red-200 hover:bg-red-500/20 text-xs gap-1.5"
              >
                <RefreshCw size={12} /> Coba Lagi
              </Button>
            </div>
          )}

          {/* Laser Guide Line Animasi Lebar */}
          {isCameraActive && (
            <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-full max-w-[340px] h-36 border-2 border-dashed border-blue-400/80 rounded-2xl relative shadow-[0_0_24px_rgba(59,130,246,0.35)]">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/90 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  Arahkan Barcode / QR Di Sini
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Informasi Hasil Scan Terakhir */}
        {lastScanned && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Terbaca Sukses ({lastScanned.time})
                </p>
                <p className="font-mono font-bold text-xs text-slate-800">
                  {lastScanned.code}
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-200/60 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Beep!
            </span>
          </div>
        )}

        {/* Pilihan Kamera Jika Lebih Dari 1 */}
        {cameras.length > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-medium">Pilih Kamera:</span>
            <select
              value={selectedCameraId}
              onChange={handleSwitchCamera}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none font-medium max-w-[220px] truncate"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Kamera ${c.id.substring(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            {continuous
              ? "Mode kasir: scan terus menerus tanpa menutup modal."
              : "Kamera akan menutup otomatis setelah berhasil scan."}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Selesai / Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
