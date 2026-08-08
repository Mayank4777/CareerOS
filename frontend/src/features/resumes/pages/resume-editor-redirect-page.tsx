import { useEffect } from "react";
import { Navigate } from "react-router-dom";

import { APP_ROUTES } from "@/constants/routes";
import { useToast } from "@/components/ui/toast";

export function ResumeEditorRedirectPage() {
  const toast = useToast();

  useEffect(() => {
    toast.info("Select a resume to edit.");
  }, [toast]);

  return (
    <Navigate
      replace
      to={APP_ROUTES.resumeLibrary}
      state={{ resumeEditorRedirect: true }}
    />
  );
}
