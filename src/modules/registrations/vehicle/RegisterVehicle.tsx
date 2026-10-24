import React, { useState } from "react";
import { Box } from "@mui/material";
import VehicleForm from "./VehicleForm";
import VehicleList from "./VehicleList";

const RegisterVehicle: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <VehicleForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <VehicleList refreshKey={refreshKey} />
    </Box>
  );
};

export default RegisterVehicle;
