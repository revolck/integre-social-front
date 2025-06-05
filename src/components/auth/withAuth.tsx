import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";

interface Options {
  roles?: string[];
  permissions?: string[];
}

export function withAuth<P>(Component: React.ComponentType<P>, options?: Options) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute roles={options?.roles} permissions={options?.permissions}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
