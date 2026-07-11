import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RealizarEntrega from "./modules/entregas/RealizarEntrega.tsx";
import FinalizarEntrega from "./modules/entregas/FinalizarEntrega.tsx";
import RelatoriosEntregas from "./modules/entregas/RelatoriosEntregas.tsx";
import DashboardIndex from "./modules/dashboard/DashboardIndex";
import RelatoriosDashboard from "./modules/dashboard/RelatoriosDashboard";
import ListaClientes from "./modules/dashboard/ListaClientes";
import CadastrarCliente from "./modules/cadastros/cliente/CadastrarCliente.tsx";
import CadastrarEntregador from "./modules/cadastros/entregador/CadastrarEntregador.tsx";
import CadastrarBairros from "./modules/cadastros/bairros/CadastrarBairros.tsx";
import CadastrarCidades from "./modules/cadastros/cidades/CadastrarCidades.tsx";
import ConfiguracoesVisuais from "./modules/configuracoes/visuais/ConfiguracoesVisuais.tsx";
import App from "./App.tsx";
import LoginPage from "./modules/auth/LoginPage.tsx";
import ChatRealtime from "./modules/chat/ChatRealtime.tsx";

const hasAccessToken = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("accessToken"));
};

const PublicEntry = () => {
  if (hasAccessToken()) {
    return <Navigate to="/dashboard/relatorios" replace />;
  }

  return <LoginPage />;
};

const RequireAuth = () => {
  if (!hasAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  return <App />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicEntry />,
  },
  {
    path: "/login",
    element: <PublicEntry />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardIndex />,
      },
      {
        path: "/dashboard/relatorios",
        element: <RelatoriosDashboard />,
      },
      {
        path: "/dashboard/clientes",
        element: <ListaClientes />,
      },
      {
        path: "/realizar-entrega",
        element: <RealizarEntrega />,
      },
      {
        path: "/finalizar-entrega",
        element: <FinalizarEntrega />,
      },
      {
        path: "/relatorios-entregas",
        element: <RelatoriosEntregas />,
      },
      {
        path: "/cadastros/cliente",
        element: <CadastrarCliente />,
      },
      {
        path: "/cadastros/entregador",
        element: <CadastrarEntregador />,
      },
      {
        path: "/cadastros/bairros",
        element: <CadastrarBairros />,
      },
      {
        path: "/cadastros/cidades",
        element: <CadastrarCidades />,
      },
      {
        path: "/configuracoes/visuais",
        element: <ConfiguracoesVisuais />,
      },
      {
        path: "/chat",
        element: <ChatRealtime />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
