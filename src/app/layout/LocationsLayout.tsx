import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Stack } from "@mui/material";
import { ROUTES } from "@/shared/config/routes";
import PageLoader from "@/shared/ui/PageLoader";
import RouteTabs, { type RouteTab } from "@/shared/ui/navigation/RouteTabs";

const LOCATION_TABS: readonly RouteTab[] = [
  { label: "Cidades", path: ROUTES.registerCities },
  { label: "Bairros", path: ROUTES.registerNeighborhoods },
];

const LocationsLayout = () => (
  <Stack spacing={2.5}>
    <RouteTabs tabs={LOCATION_TABS} />
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </Stack>
);

export default LocationsLayout;
