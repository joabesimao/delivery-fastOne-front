import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { HOME_ROUTE, ROUTES } from "@/shared/config/routes";
import PageLoader from "@/shared/ui/PageLoader";
import ProtectedLayout from "../layout/ProtectedLayout";
import { PublicOnlyRoute, RequireAuth, RequireRole } from "./guards";

const LoginPage = lazy(() => import("@/modules/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/modules/dashboard/DashboardPage"));
const ClientList = lazy(() => import("@/modules/dashboard/ClientList"));
const ProductList = lazy(() => import("@/modules/dashboard/ProductList"));
const UserList = lazy(() => import("@/modules/dashboard/UserList"));
const NewDelivery = lazy(() => import("@/modules/deliveries/NewDelivery"));
const FinishDelivery = lazy(() => import("@/modules/deliveries/FinishDelivery"));
const DeliveryReports = lazy(() => import("@/modules/deliveries/DeliveryReports"));
const DeliverymanReports = lazy(() => import("@/modules/deliveries/DeliverymanReports"));
const DeliveryList = lazy(() => import("@/modules/deliveries/DeliveryList"));
const DeliverymanList = lazy(() => import("@/modules/deliveries/DeliverymanList"));
const RegisterClientPage = lazy(() =>
  import("@/features/clients").then((m) => ({ default: m.RegisterClientPage })),
);
const RegisterProduct = lazy(() => import("@/modules/registrations/product/RegisterProduct"));
const RegisterDeliverymanPage = lazy(() =>
  import("@/features/deliverymen").then((m) => ({ default: m.RegisterDeliverymanPage })),
);
const NeighborhoodsPage = lazy(() =>
  import("@/features/neighborhoods").then((m) => ({ default: m.NeighborhoodsPage })),
);
const CitiesPage = lazy(() =>
  import("@/features/cities").then((m) => ({ default: m.CitiesPage })),
);
const VehiclesPage = lazy(() =>
  import("@/features/vehicles").then((m) => ({ default: m.VehiclesPage })),
);
const RegisterOilChange = lazy(
  () => import("@/modules/registrations/oilChange/RegisterOilChange"),
);
const RegisterFuelRefill = lazy(
  () => import("@/modules/registrations/fuelRefill/RegisterFuelRefill"),
);
const OilChangeList = lazy(() => import("@/modules/registrations/oilChange/OilChangeList"));
const FuelRefillList = lazy(() => import("@/modules/registrations/fuelRefill/FuelRefillList"));
const VisualSettings = lazy(() => import("@/modules/settings/visual/VisualSettings"));
const FleetSettings = lazy(() => import("@/modules/settings/fleet/FleetSettings"));
const ChatRealtime = lazy(() => import("@/modules/chat/ChatRealtime"));

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
          { path: ROUTES.clients, element: <ClientList /> },
          { path: ROUTES.products, element: <ProductList /> },
          {
            element: <RequireRole roles={ADMIN_ONLY} />,
            children: [{ path: ROUTES.users, element: <UserList /> }],
          },
          { path: ROUTES.newDelivery, element: <NewDelivery /> },
          { path: ROUTES.finishDelivery, element: <FinishDelivery /> },
          { path: ROUTES.deliveryReports, element: <DeliveryReports /> },
          { path: ROUTES.deliverymanReports, element: <DeliverymanReports /> },
          { path: ROUTES.deliveries, element: <DeliveryList /> },
          { path: ROUTES.deliverymen, element: <DeliverymanList /> },
          { path: ROUTES.registerClient, element: <RegisterClientPage /> },
          { path: ROUTES.registerProduct, element: <RegisterProduct /> },
          { path: ROUTES.registerDeliveryman, element: <RegisterDeliverymanPage /> },
          { path: ROUTES.registerNeighborhoods, element: <NeighborhoodsPage /> },
          { path: ROUTES.registerCities, element: <CitiesPage /> },
          { path: ROUTES.registerVehicle, element: <VehiclesPage /> },
          { path: ROUTES.registerOilChange, element: <RegisterOilChange /> },
          { path: ROUTES.registerFuelRefill, element: <RegisterFuelRefill /> },
          { path: ROUTES.oilChanges, element: <OilChangeList /> },
          { path: ROUTES.fuelRefills, element: <FuelRefillList /> },
          { path: ROUTES.visualSettings, element: <VisualSettings /> },
          { path: ROUTES.fleetSettings, element: <FleetSettings /> },
          { path: ROUTES.chat, element: <ChatRealtime /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to={HOME_ROUTE} replace /> },
]);
