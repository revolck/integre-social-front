"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
}

export function ProtectedRoute({ children, roles = [], permissions = [] }: ProtectedRouteProps) {
  const { user, permissions: userPermissions, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      if (roles.length && user && !roles.includes(user.role)) {
        router.replace("/dashboard/unauthorized");
        return;
      }
      if (permissions.some((p) => !userPermissions.includes(p))) {
        router.replace("/dashboard/unauthorized");
      }
    }
  }, [loading, user, userPermissions, router, roles, permissions]);

  if (loading || !user) return null;
  if (roles.length && user && !roles.includes(user.role)) return null;
  if (permissions.some((p) => !userPermissions.includes(p))) return null;

  return <>{children}</>;
}
