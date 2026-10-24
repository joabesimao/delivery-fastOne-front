import React, { useState } from "react";
import { Box } from "@mui/material";
import NeighborhoodForm from "./NeighborhoodForm";
import NeighborhoodList from "./NeighborhoodList";

const RegisterNeighborhoods: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <NeighborhoodForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <NeighborhoodList refreshKey={refreshKey} />
    </Box>
  );
};

export default RegisterNeighborhoods;
