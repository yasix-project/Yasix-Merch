import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,

  login: (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    localStorage.setItem("role", userData.role);

    set({
      user: userData,
      token: token,
      role: userData.role,
    });
  },

  // Tambahkan ini agar tidak error saat dipanggil oleh useCurrentUser
  updateUser: (newUserData) => {
    set((state) => {
      const mergedUser = { ...state.user, ...newUserData };
      localStorage.setItem("user", JSON.stringify(mergedUser));

      if (newUserData.role) {
        localStorage.setItem("role", newUserData.role);
      }

      return {
        user: mergedUser,
        role: newUserData.role || state.role,
      };
    });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    set({
      user: null,
      token: null,
      role: null,
    });
  },
}));
