import React, { useState } from "react";
import { Box } from "@mui/material";
import BairrosForm from "./BairrosForm";
import ListaBairros from "./ListaBairros";

const CadastrarBairros: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <BairrosForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <ListaBairros refreshKey={refreshKey} />
    </Box>
  );
};

export default CadastrarBairros;
