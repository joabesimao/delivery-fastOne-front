import React, { useState } from "react";
import { Box } from "@mui/material";
import VeiculoForm from "./VeiculoForm";
import ListaVeiculos from "./ListaVeiculos";

const CadastrarVeiculo: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <VeiculoForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <ListaVeiculos refreshKey={refreshKey} />
    </Box>
  );
};

export default CadastrarVeiculo;
