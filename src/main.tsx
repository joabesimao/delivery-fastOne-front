import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RealizarEntrega from "./modules/entregas/RealizarEntrega.tsx";
import FinalizarEntrega from "./modules/entregas/FinalizarEntrega.tsx";
import RelatoriosEntregas from "./modules/entregas/RelatoriosEntregas.tsx";
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
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
