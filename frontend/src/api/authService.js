import axiosClient from "./axiosClient";

export const authService = {
  // Login Umum (Kasir / Siswa)
  login: (credentials) => axiosClient.post("/auth/login", credentials),

  // Login Khusus Admin
  loginAdmin: (credentials) =>
    axiosClient.post("/auth/login/admin", credentials),

  // Unpack data agar mengembalikan payload user langsung
  getMe: async () => {
    const res = await axiosClient.get("/auth/me");
    return res.data?.data || res.data;
  },

  updateProfile: (data) => axiosClient.put("/auth/profile", data),
};
