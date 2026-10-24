import React, { useState } from "react";
import { Box } from "@mui/material";
import CityForm from "./CityForm";
import CityList from "./CityList";

const RegisterCities: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <CityForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <CityList refreshKey={refreshKey} />
    </Box>
  );
};


export default RegisterCities;
