import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { HOME_ROUTE, ROUTES } from "@/shared/config/routes";
import PageLoader from "@/shared/ui/PageLoader";
import ProtectedLayout from "../layout/ProtectedLayout";
import { PublicOnlyRoute, RequireAuth, RequireRole } from "./guards";

const LoginPage = lazy(() =>
  import("@/features/auth").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const ClientsPage = lazy(() =>
  import("@/features/clients").then((m) => ({ default: m.ClientsPage })),
);
const ProductsPage = lazy(() =>
  import("@/features/products").then((m) => ({ default: m.ProductsPage })),
);
const UsersPage = lazy(() =>
  import("@/features/users").then((m) => ({ default: m.UsersPage })),
);
const DeliveriesPage = lazy(() =>
  import("@/features/deliveries").then((m) => ({ default: m.DeliveriesPage })),
);
const NewDeliveryPage = lazy(() =>
  import("@/features/deliveries").then((m) => ({ default: m.NewDeliveryPage })),
);
const FinishDeliveryPage = lazy(() =>
  import("@/features/deliveries").then((m) => ({
    default: m.FinishDeliveryPage,
  })),
);
const DeliveryReportsPage = lazy(() =>
  import("@/features/deliveries").then((m) => ({
    default: m.DeliveryReportsPage,
  })),
);
const DeliverymanRankingPage = lazy(() =>
  import("@/features/deliveries").then((m) => ({
    default: m.DeliverymanRankingPage,
  })),
);
const DeliverymenPage = lazy(() =>
  import("@/features/deliverymen").then((m) => ({
    default: m.DeliverymenPage,
  })),
);
const RegisterClientPage = lazy(() =>
  import("@/features/clients").then((m) => ({ default: m.RegisterClientPage })),
);
const RegisterProductPage = lazy(() =>
  import("@/features/products").then((m) => ({
    default: m.RegisterProductPage,
  })),
);
const RegisterDeliverymanPage = lazy(() =>
  import("@/features/deliverymen").then((m) => ({
    default: m.RegisterDeliverymanPage,
  })),
);
const NeighborhoodsPage = lazy(() =>
  import("@/features/neighborhoods").then((m) => ({
    default: m.NeighborhoodsPage,
  })),
);
const CitiesPage = lazy(() =>
  import("@/features/cities").then((m) => ({ default: m.CitiesPage })),
);
const VehiclesPage = lazy(() =>
  import("@/features/vehicles").then((m) => ({ default: m.VehiclesPage })),
);
const RegisterOilChangePage = lazy(() =>
  import("@/features/oil-changes").then((m) => ({
    default: m.RegisterOilChangePage,
  })),
);
const RegisterFuelRefillPage = lazy(() =>
  import("@/features/fuel-refills").then((m) => ({
    default: m.RegisterFuelRefillPage,
  })),
);
const OilChangesPage = lazy(() =>
  import("@/features/oil-changes").then((m) => ({ default: m.OilChangesPage })),
);
const FuelRefillsPage = lazy(() =>
  import("@/features/fuel-refills").then((m) => ({
    default: m.FuelRefillsPage,
  })),
);
const VisualSettingsPage = lazy(() =>
  import("@/features/settings").then((m) => ({
    default: m.VisualSettingsPage,
  })),
);
const FleetSettingsPage = lazy(() =>
  import("@/features/settings").then((m) => ({ default: m.FleetSettingsPage })),
);
const ChatPage = lazy(() =>
  import("@/features/chat").then((m) => ({ default: m.ChatPage })),
);

const ADMIN_ONLY = ["admin"] as const;

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
          { path: ROUTES.products, element: <ProductsPage /> },
          {
            element: <RequireRole roles={ADMIN_ONLY} />,
            children: [{ path: ROUTES.users, element: <UsersPage /> }],
          },
          { path: ROUTES.newDelivery, element: <NewDeliveryPage /> },
          { path: ROUTES.finishDelivery, element: <FinishDeliveryPage /> },
          { path: ROUTES.deliveryReports, element: <DeliveryReportsPage /> },
          {
            path: ROUTES.deliverymanReports,
            element: <DeliverymanRankingPage />,
          },
          { path: ROUTES.deliveries, element: <DeliveriesPage /> },
          { path: ROUTES.deliverymen, element: <DeliverymenPage /> },
          { path: ROUTES.registerClient, element: <RegisterClientPage /> },
          { path: ROUTES.registerProduct, element: <RegisterProductPage /> },
          {
            path: ROUTES.registerDeliveryman,
            element: <RegisterDeliverymanPage />,
          },
          {
            path: ROUTES.registerNeighborhoods,
            element: <NeighborhoodsPage />,
          },
          { path: ROUTES.registerCities, element: <CitiesPage /> },
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
          { path: ROUTES.fleetSettings, element: <FleetSettingsPage /> },
          { path: ROUTES.chat, element: <ChatPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to={HOME_ROUTE} replace /> },
]);
