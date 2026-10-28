import { Box, CircularProgress } from "@mui/material";

const PageLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
    <CircularProgress />
  </Box>
);

export default PageLoader;
