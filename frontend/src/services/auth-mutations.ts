import { useMutation } from "@tanstack/react-query";

import { login, register } from "@/services/auth";
import { useAuth } from "@/hooks/use-auth";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

export function useLoginMutation() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (session) => {
      setSession(session);
    },
  });
}

export function useRegisterMutation() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (session) => {
      setSession(session);
    },
  });
}
