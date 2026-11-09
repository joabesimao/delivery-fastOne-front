import { Tab, Tabs } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

export interface RouteTab {
  label: string;
  path: string;
}

interface RouteTabsProps {
  tabs: readonly RouteTab[];
}

const TABS_SX = {
  minHeight: 40,
  "& .MuiTab-root": {
    minHeight: 40,
    textTransform: "none",
    fontWeight: 700,
    fontSize: 14,
  },
};

const RouteTabs = ({ tabs }: RouteTabsProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active =
    tabs.find((tab) => tab.path === pathname)?.path ?? tabs[0]?.path ?? false;

  return (
    <Tabs
      value={active}
      onChange={(_, path: string) => navigate(path)}
      sx={TABS_SX}
    >
      {tabs.map((tab) => (
        <Tab key={tab.path} label={tab.label} value={tab.path} />
      ))}
    </Tabs>
  );
};

export default RouteTabs;
