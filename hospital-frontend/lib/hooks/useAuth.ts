// hospital-frontend/lib/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout } from "@/lib/auth";

export function useAuth(requiredRole?: string) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentSession = getSession();
      
      if (!currentSession) {
        router.push("/login");
        return;
      }

      if (requiredRole && currentSession.role !== requiredRole) {
        router.push("/login");
        return;
      }

      setSession(currentSession);
      setLoading(false);
    };

    checkAuth();
  }, [requiredRole, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return { session, loading, logout: handleLogout };
}