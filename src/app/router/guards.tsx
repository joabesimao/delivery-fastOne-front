import { Navigate, Outlet } from "react-router-dom";
import { session } from "@/shared/session/session";
import { HOME_ROUTE, ROUTES } from "@/shared/config/routes";

export const PublicOnlyRoute = () =>
  session.isAuthenticated() ? <Navigate to={HOME_ROUTE} replace /> : <Outlet />;

export const RequireAuth = () =>
  session.isAuthenticated() ? <Outlet /> : <Navigate to={ROUTES.login} replace />;

export const RequireRole = ({ roles }: { roles: readonly string[] }) =>
  session.hasRole(roles) ? <Outlet /> : <Navigate to={HOME_ROUTE} replace />;
