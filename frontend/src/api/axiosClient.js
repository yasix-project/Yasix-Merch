import axios from "axios";
import { useAuthStore } from "../store/authStore";

const getBaseUrl = () => {
  let url = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (!url) {
    return "http://localhost:5000/api/v1";
  }

  // Jika belum ada protokol, tambahkan https:// (atau http:// untuk localhost)
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith("localhost") || url.startsWith("127.0.0.1")) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  // Hapus trailing slash di akhir
  url = url.replace(/\/+$/, "");

  // Pastikan berakhiran /api/v1
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }

  return url;
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState().token || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // PERBAIKAN: Cek apakah error berasal dari proses login
      const isLoginRequest = error.config?.url?.includes("/login");

      // Jika BUKAN proses login, baru lakukan redirect
      if (!isLoginRequest) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
