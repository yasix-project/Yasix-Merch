import { useMutation } from "@tanstack/react-query";

import { authService } from "../../api/authService";

export function useAuthMutations() {
  const login = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
  });

  const loginAdmin = useMutation({
    mutationFn: (credentials) => authService.loginAdmin(credentials),
  });

  return { login, loginAdmin };
}
