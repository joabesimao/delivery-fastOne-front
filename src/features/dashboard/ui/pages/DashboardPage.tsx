import { useLocation, useNavigate } from "react-router-dom";
import { Stack, Tab, Tabs } from "@mui/material";
import { ROUTES } from "@/shared/config/routes";
import DashboardOverview from "../components/DashboardOverview";
import DashboardReports from "../components/DashboardReports";

type DashboardTab = "geral" | "relatorios";

const TAB_ROUTES: Record<DashboardTab, string> = {
  geral: ROUTES.dashboard,
  relatorios: ROUTES.dashboardReports,
};

const DashboardPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeTab: DashboardTab =
    pathname === ROUTES.dashboardReports ? "relatorios" : "geral";

  return (
    <Stack spacing={2.5}>
      <Tabs
        value={activeTab}
        onChange={(_, value: DashboardTab) => navigate(TAB_ROUTES[value])}
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

      {activeTab === "relatorios" ? (
        <DashboardReports />
      ) : (
        <DashboardOverview />
      )}
    </Stack>
  );
};

export default DashboardPage;
