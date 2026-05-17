import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RealizarEntrega from "./modules/entregas/RealizarEntrega.tsx";
import FinalizarEntrega from "./modules/entregas/FinalizarEntrega.tsx";
import RelatoriosEntregas from "./modules/entregas/RelatoriosEntregas.tsx";
import CadastrarCliente from "./modules/cadastros/cliente/CadastrarCliente.tsx";
import CadastrarEntregador from "./modules/cadastros/entregador/CadastrarEntregador.tsx";
import CadastrarBairros from "./modules/cadastros/bairros/CadastrarBairros.tsx";
import CadastrarCidades from "./modules/cadastros/cidades/CadastrarCidades.tsx";
import App from "./App.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
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
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
