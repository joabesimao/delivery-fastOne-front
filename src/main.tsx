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
import RelatoriosEntregasGeral from "./modules/entregas/RelatoriosEntregasGeral.tsx";
import ListagemEntregas from "./modules/entregas/ListagemEntregas.tsx";
import ListaEntregadores from "./modules/entregas/ListaEntregadores.tsx";
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

// Fluxo de autenticação temporário para manter o sistema funcionando em demo.
// O token é persistido em localStorage para que as rotas protegidas e as
// requisições do cliente saibam que o usuário já entrou no sistema.
const TEMP_BYPASS_AUTH = true;
const TEMP_FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGZhc3RvbmUubG9jYWwiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjU3NzAwMDAsImV4cCI6OTk5OTk5OTk5OX0.test";
const HOME_ROUTE = "/dashboard/relatorios";
const LOGIN_ROUTE = "/login";

const ensureDemoSession = () => {
  if (typeof window === "undefined") return;

  if (TEMP_BYPASS_AUTH && !localStorage.getItem("accessToken")) {
    localStorage.setItem("accessToken", TEMP_FAKE_TOKEN);
    localStorage.setItem("currentUserEmail", "admin@fastone.local");
  }
};

const hasAccessToken = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("accessToken"));
};

ensureDemoSession();

const PublicEntry = () => {
  if (hasAccessToken()) {
    return <Navigate to={HOME_ROUTE} replace />;
  }

  return <LoginPage />;
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  if (!hasAccessToken()) {
    return <Navigate to={LOGIN_ROUTE} replace />;
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
    element: <RequireAuth><DashboardIndex /></RequireAuth>,
  },
  {
    path: "/dashboard/relatorios",
    element: <RequireAuth><RelatoriosDashboard /></RequireAuth>,
  },
  {
    path: "/dashboard/clientes",
    element: <RequireAuth><ListaClientes /></RequireAuth>,
  },
  {
    path: "/realizar-entrega",
    element: <RequireAuth><RealizarEntrega /></RequireAuth>,
  },
  {
    path: "/finalizar-entrega",
    element: <RequireAuth><FinalizarEntrega /></RequireAuth>,
  },
  {
    path: "/relatorios-entregas",
    element: <RequireAuth><RelatoriosEntregasGeral /></RequireAuth>,
  },
  {
    path: "/relatorios-entregas/entregadores",
    element: <RequireAuth><RelatoriosEntregas /></RequireAuth>,
  },
  {
    path: "/listagem-entregas",
    element: <RequireAuth><ListagemEntregas /></RequireAuth>,
  },
  {
    path: "/listagem-entregadores",
    element: <RequireAuth><ListaEntregadores /></RequireAuth>,
  },
  {
    path: "/cadastros/cliente",
    element: <RequireAuth><CadastrarCliente /></RequireAuth>,
  },
  {
    path: "/cadastros/entregador",
    element: <RequireAuth><CadastrarEntregador /></RequireAuth>,
  },
  {
    path: "/cadastros/bairros",
    element: <RequireAuth><CadastrarBairros /></RequireAuth>,
  },
  {
    path: "/cadastros/cidades",
    element: <RequireAuth><CadastrarCidades /></RequireAuth>,
  },
  {
    path: "/configuracoes/visuais",
    element: <RequireAuth><ConfiguracoesVisuais /></RequireAuth>,
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
