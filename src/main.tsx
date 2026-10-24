import { createRoot } from "react-dom/client";
import "./index.css";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import NewDelivery from "./modules/deliveries/NewDelivery.tsx";
import FinishDelivery from "./modules/deliveries/FinishDelivery.tsx";
import DeliverymanReports from "./modules/deliveries/DeliverymanReports.tsx";
import DeliveryReports from "./modules/deliveries/DeliveryReports.tsx";
import DeliveryList from "./modules/deliveries/DeliveryList.tsx";
import DeliverymanList from "./modules/deliveries/DeliverymanList.tsx";
import DashboardPage from "./modules/dashboard/DashboardPage";
import ClientList from "./modules/dashboard/ClientList";
import ProductList from "./modules/dashboard/ProductList";
import RegisterClient from "./modules/registrations/client/RegisterClient.tsx";
import RegisterProduct from "./modules/registrations/product/RegisterProduct.tsx";
import RegisterDeliveryman from "./modules/registrations/deliveryman/RegisterDeliveryman.tsx";
import RegisterNeighborhoods from "./modules/registrations/neighborhoods/RegisterNeighborhoods.tsx";
import RegisterCities from "./modules/registrations/cities/RegisterCities.tsx";
import RegisterVehicle from "./modules/registrations/vehicle/RegisterVehicle.tsx";
import RegisterOilChange from "./modules/registrations/oilChange/RegisterOilChange.tsx";
import RegisterFuelRefill from "./modules/registrations/fuelRefill/RegisterFuelRefill.tsx";
import FuelRefillList from "./modules/registrations/fuelRefill/FuelRefillList.tsx";
import OilChangeList from "./modules/registrations/oilChange/OilChangeList.tsx";
import VisualSettings from "./modules/settings/visual/VisualSettings.tsx";
import FleetSettings from "./modules/settings/fleet/FleetSettings.tsx";
import App from "./App.tsx";
import LoginPage from "./modules/auth/LoginPage.tsx";
import ChatRealtime from "./modules/chat/ChatRealtime.tsx";
import UserList from "./modules/dashboard/UserList.tsx";

const HOME_ROUTE = "/dashboard";
const LOGIN_ROUTE = "/login";

const hasAccessToken = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("accessToken"));
};

const PublicEntry = () => {
  if (hasAccessToken()) {
    return <Navigate to={HOME_ROUTE} replace />;
  }

  return <LoginPage />;
};

const RequireAuth = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  if (!hasAccessToken()) {
    return <Navigate to={LOGIN_ROUTE} replace />;
  }

  if (roles && roles.length > 0) {
    const currentRole =
      typeof window !== "undefined" ? localStorage.getItem("currentUserRole") : null;

    if (!currentRole || !roles.includes(currentRole)) {
      return <Navigate to={HOME_ROUTE} replace />;
    }
  }

  return <App>{children}</App>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicEntry />,
  },
  {
    path: LOGIN_ROUTE,
    element: <PublicEntry />,
  },
  {
    path: "/dashboard",
    element: <RequireAuth><DashboardPage /></RequireAuth>,
  },
  {
    path: "/dashboard/relatorios",
    element: <RequireAuth><DashboardPage /></RequireAuth>,
  },
  {
    path: "/dashboard/clientes",
    element: <RequireAuth><ClientList /></RequireAuth>,
  },
  {
    path: "/dashboard/produtos",
    element: <RequireAuth><ProductList /></RequireAuth>,
  },
  {
    path: "/dashboard/usuarios",
    element: (
      <RequireAuth roles={["admin"]}>
        <UserList />
      </RequireAuth>
    ),
  },
  {
    path: "/realizar-entrega",
    element: <RequireAuth><NewDelivery /></RequireAuth>,
  },
  {
    path: "/finalizar-entrega",
    element: <RequireAuth><FinishDelivery /></RequireAuth>,
  },
  {
    path: "/relatorios-entregas",
    element: <RequireAuth><DeliveryReports /></RequireAuth>,
  },
  {
    path: "/relatorios-entregas/entregadores",
    element: <RequireAuth><DeliverymanReports /></RequireAuth>,
  },
  {
    path: "/listagem-entregas",
    element: <RequireAuth><DeliveryList /></RequireAuth>,
  },
  {
    path: "/listagem-entregadores",
    element: <RequireAuth><DeliverymanList /></RequireAuth>,
  },
  {
    path: "/cadastros/cliente",
    element: <RequireAuth><RegisterClient /></RequireAuth>,
  },
  {
    path: "/cadastros/produto",
    element: <RequireAuth><RegisterProduct /></RequireAuth>,
  },
  {
    path: "/cadastros/entregador",
    element: <RequireAuth><RegisterDeliveryman /></RequireAuth>,
  },
  {
    path: "/cadastros/bairros",
    element: <RequireAuth><RegisterNeighborhoods /></RequireAuth>,
  },
  {
    path: "/cadastros/cidades",
    element: <RequireAuth><RegisterCities /></RequireAuth>,
  },
  {
    path: "/cadastros/veiculo",
    element: <RequireAuth><RegisterVehicle /></RequireAuth>,
  },
  {
    path: "/cadastros/troca-oleo",
    element: <RequireAuth><RegisterOilChange /></RequireAuth>,
  },
  {
    path: "/cadastros/abastecimento",
    element: <RequireAuth><RegisterFuelRefill /></RequireAuth>,
  },
  {
    path: "/listagem-trocas-oleo",
    element: <RequireAuth><OilChangeList /></RequireAuth>,
  },
  {
    path: "/listagem-abastecimentos",
    element: <RequireAuth><FuelRefillList /></RequireAuth>,
  },
  {
    path: "/configuracoes/visuais",
    element: <RequireAuth><VisualSettings /></RequireAuth>,
  },
  {
    path: "/configuracoes/frota",
    element: <RequireAuth><FleetSettings /></RequireAuth>,
  },
  {
    path: "/chat",
    element: <RequireAuth><ChatRealtime /></RequireAuth>,
  },
  {
    path: "*",
    element: <Navigate to={HOME_ROUTE} replace />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
