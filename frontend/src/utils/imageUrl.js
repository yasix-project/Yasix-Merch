/**
 * Utility untuk menghasilkan URL lengkap aset (gambar produk atau file dokumen PDF)
 * dari backend secara konsisten, baik di lingkungan lokal maupun produksi (Vercel + Railway).
 */

export const getBackendBaseUrl = () => {
  const rawUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

  let base = (rawUrl || "").trim();

  // Jika belum ada protokol, tambahkan https:// (atau http:// jika localhost)
  if (!/^https?:\/\//i.test(base)) {
    if (base.startsWith("localhost") || base.startsWith("127.0.0.1")) {
      base = `http://${base}`;
    } else {
      base = `https://${base}`;
    }
  }

  // Bersihkan path API jika ada (/api/v1 atau /api)
  base = base.replace(/\/api(\/v\d+)?\/?$/i, "");

  // Hapus trailing slash di akhir
  base = base.replace(/\/+$/, "");

  return base;
};

export const resolveFileUrl = (filePath) => {
  if (!filePath) return null;

  // Jika sudah merupakan URL lengkap atau data base64/blob
  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://") ||
    filePath.startsWith("data:") ||
    filePath.startsWith("blob:")
  ) {
    return filePath;
  }

  const backendBase = getBackendBaseUrl();

  // Normalisasi backslash Windows (\) ke forward slash (/)
  let cleanPath = filePath.replace(/\\/g, "/");

  // Jika ada path absolute sistem (misal C:/.../uploads/), ambil mulai dari uploads/
  cleanPath = cleanPath.replace(/^.*uploads\//, "uploads/");

  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  return `${backendBase}${cleanPath}`;
};

export default resolveFileUrl;
