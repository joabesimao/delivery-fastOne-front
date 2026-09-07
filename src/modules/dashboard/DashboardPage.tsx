import type { SyntheticEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Stack, Tab, Tabs } from "@mui/material";
import DashboardIndex from "./DashboardIndex";
import RelatoriosDashboard from "./RelatoriosDashboard";

type DashboardTab = "geral" | "relatorios";

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab: DashboardTab =
    location.pathname === "/dashboard/relatorios" ? "relatorios" : "geral";

  const handleTabChange = (_: SyntheticEvent, value: DashboardTab) => {
    navigate(value === "relatorios" ? "/dashboard/relatorios" : "/dashboard");
  };

  return (
    <Stack spacing={2.5}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          minHeight: 40,
          "& .MuiTab-root": {
            minHeight: 40,
            textTransform: "none",
            fontWeight: 700,
            fontSize: 14,
          },
        }}
      >
        <Tab label="Visão Geral" value="geral" />
        <Tab label="Relatórios" value="relatorios" />
      </Tabs>

      {activeTab === "relatorios" ? <RelatoriosDashboard /> : <DashboardIndex />}
    </Stack>
  );
};

export default DashboardPage;
