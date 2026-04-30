import { Box } from "@mui/material";

// eslint-disable-next-line react-refresh/only-export-components
export enum TabKeys {
  GENERAL_DATA = "GENERAL_DATA",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  PHYSICAL_DEPENDENCY = "PHYSICAL_DEPENDENCY",
  EQUIPMENT_CHARACTERISTICS = "EQUIPMENT_CHARACTERISTICS",
  CENSUS_DATA = "CENSUS_DATA",
  MODALITIES = "MODALITIES",
  AUTHORIZATION = "AUTHORIZATION",
  ATTACHMENTS_OBSERVATIONS = "ATTACHMENTS_OBSERVATIONS",
  FUNCTION_MAC = "FUNCTION_MAC"
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: TabKeys;
  value: TabKeys;
}

export function CustomTabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pl: { xs: 0, sm: 3 }, pr: { xs: 0, sm: 3 }, pb: { xs: 0, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}