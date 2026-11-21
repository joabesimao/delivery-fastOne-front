import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { FLEET_MANAGER_ROLES } from "@/features/fleet";
import { HOME_ROUTE, ROUTES } from "@/shared/config/routes";
import { ADMIN_ROLES } from "@/shared/session/roles";
import MaintenancePage from "@/shared/ui/MaintenancePage";
import PageLoader from "@/shared/ui/PageLoader";
import LocationsLayout from "../layout/LocationsLayout";
import ProtectedLayout from "../layout/ProtectedLayout";
import { PublicOnlyRoute, RequireAuth, RequireRole } from "./guards";

const LoginPage = lazy(() => import("@/features/auth/ui/pages/LoginPage"));
const DashboardPage = lazy(
  () => import("@/features/dashboard/ui/pages/DashboardPage"),
);
const ClientsPage = lazy(
  () => import("@/features/clients/ui/pages/ClientsPage"),
);
const UsersPage = lazy(() => import("@/features/users/ui/pages/UsersPage"));
const DeliveriesPage = lazy(
  () => import("@/features/deliveries/ui/pages/DeliveriesPage"),
);
const FinishDeliveryPage = lazy(
  () => import("@/features/deliveries/ui/pages/FinishDeliveryPage"),
);
const DeliveryReportsPage = lazy(
  () => import("@/features/deliveries/ui/pages/DeliveryReportsPage"),
);
const DeliverymanRankingPage = lazy(
  () => import("@/features/deliveries/ui/pages/DeliverymanRankingPage"),
);
const DeliverymenPage = lazy(
  () => import("@/features/deliverymen/ui/pages/DeliverymenPage"),
);
const RegisterClientPage = lazy(
  () => import("@/features/clients/ui/pages/RegisterClientPage"),
);
const RegisterDeliverymanPage = lazy(
  () => import("@/features/deliverymen/ui/pages/RegisterDeliverymanPage"),
);
const NeighborhoodsPage = lazy(
  () => import("@/features/neighborhoods/ui/pages/NeighborhoodsPage"),
);
const CitiesPage = lazy(() => import("@/features/cities/ui/pages/CitiesPage"));
const VehiclesPage = lazy(
  () => import("@/features/vehicles/ui/pages/VehiclesPage"),
);
const RegisterOilChangePage = lazy(
  () => import("@/features/oil-changes/ui/pages/RegisterOilChangePage"),
);
const RegisterFuelRefillPage = lazy(
  () => import("@/features/fuel-refills/ui/pages/RegisterFuelRefillPage"),
);
const OilChangesPage = lazy(
  () => import("@/features/oil-changes/ui/pages/OilChangesPage"),
);
const FuelRefillsPage = lazy(
  () => import("@/features/fuel-refills/ui/pages/FuelRefillsPage"),
);
const VisualSettingsPage = lazy(
  () => import("@/features/settings/ui/pages/VisualSettingsPage"),
);
const FleetSettingsPage = lazy(
  () => import("@/features/settings/ui/pages/FleetSettingsPage"),
);
const ChatPage = lazy(() => import("@/features/chat/ui/pages/ChatPage"));

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [ROUTES.root, ROUTES.login].map((path) => ({
      path,
      element: (
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      ),
    })),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.dashboardReports, element: <DashboardPage /> },
          { path: ROUTES.clients, element: <ClientsPage /> },
          {
            path: ROUTES.products,
            element: <MaintenancePage moduleName="Produtos" />,
          },
          {
            element: <RequireRole roles={ADMIN_ROLES} />,
            children: [{ path: ROUTES.users, element: <UsersPage /> }],
          },
          { path: ROUTES.finishDelivery, element: <FinishDeliveryPage /> },
          { path: ROUTES.deliveryReports, element: <DeliveryReportsPage /> },
          {
            path: ROUTES.deliverymanReports,
            element: <DeliverymanRankingPage />,
          },
          { path: ROUTES.deliveries, element: <DeliveriesPage /> },
          { path: ROUTES.deliverymen, element: <DeliverymenPage /> },
          { path: ROUTES.registerClient, element: <RegisterClientPage /> },
          {
            path: ROUTES.registerProduct,
            element: <MaintenancePage moduleName="Produtos" />,
          },
          {
            element: <RequireRole roles={ADMIN_ROLES} />,
            children: [
              {
                path: ROUTES.registerDeliveryman,
                element: <RegisterDeliverymanPage />,
              },
            ],
          },
          {
            element: <LocationsLayout />,
            children: [
              { path: ROUTES.registerCities, element: <CitiesPage /> },
              {
                path: ROUTES.registerNeighborhoods,
                element: <NeighborhoodsPage />,
              },
            ],
          },
          { path: ROUTES.registerVehicle, element: <VehiclesPage /> },
          {
            path: ROUTES.registerOilChange,
            element: <RegisterOilChangePage />,
          },
          {
            path: ROUTES.registerFuelRefill,
            element: <RegisterFuelRefillPage />,
          },
          { path: ROUTES.oilChanges, element: <OilChangesPage /> },
          { path: ROUTES.fuelRefills, element: <FuelRefillsPage /> },
          { path: ROUTES.visualSettings, element: <VisualSettingsPage /> },
          {
            element: <RequireRole roles={FLEET_MANAGER_ROLES} />,
            children: [
              { path: ROUTES.fleetSettings, element: <FleetSettingsPage /> },
            ],
          },
          { path: ROUTES.chat, element: <ChatPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to={HOME_ROUTE} replace /> },
]);
