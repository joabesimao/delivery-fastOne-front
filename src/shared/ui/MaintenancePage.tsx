import { Box } from "@mui/material";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import EmptyState from "./EmptyState";

interface MaintenancePageProps {
  moduleName: string;
}

const MaintenancePage = ({ moduleName }: MaintenancePageProps) => (
  <Box sx={{ p: { xs: 2, md: 3 } }}>
    <EmptyState
      icon={<ConstructionOutlinedIcon fontSize="large" />}
      title={`Módulo ${moduleName} em manutenção`}
      description="Este módulo está temporariamente indisponível. Tente novamente mais tarde."
    />
  </Box>
);

export default MaintenancePage;
