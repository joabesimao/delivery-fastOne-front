import React, { useState } from "react";
import { Box } from "@mui/material";
import CidadesForm from "./CidadesForm";
import ListaCidades from "./ListaCidades";

const CadastrarCidades: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <CidadesForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <ListaCidades refreshKey={refreshKey} />
    </Box>
  );
};

export default CadastrarCidades;
