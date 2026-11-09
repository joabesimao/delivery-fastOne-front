import { useLocation } from "react-router-dom";
import { Stack } from "@mui/material";
import { ROUTES } from "@/shared/config/routes";
import RouteTabs, { type RouteTab } from "@/shared/ui/navigation/RouteTabs";
import DashboardOverview from "../components/DashboardOverview";
import DashboardReports from "../components/DashboardReports";

const DASHBOARD_TABS: readonly RouteTab[] = [
  { label: "Visão Geral", path: ROUTES.dashboard },
  { label: "Relatórios", path: ROUTES.dashboardReports },
];

const DashboardPage = () => {
  const { pathname } = useLocation();

  return (
    <Stack spacing={2.5}>
      <RouteTabs tabs={DASHBOARD_TABS} />
      {pathname === ROUTES.dashboardReports ? (
        <DashboardReports />
      ) : (
        <DashboardOverview />
      )}
    </Stack>
  );
};

export default DashboardPage;
