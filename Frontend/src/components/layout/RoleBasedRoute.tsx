import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import type {  UserRole  } from "../../types/common.types";

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
