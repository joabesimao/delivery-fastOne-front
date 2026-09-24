import React, { useState } from "react";
import { Box } from "@mui/material";
import AbastecimentoForm from "./AbastecimentoForm";
import ListaAbastecimento from "./ListaAbastecimento";

const CadastrarAbastecimento: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <AbastecimentoForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <ListaAbastecimento refreshKey={refreshKey} />
    </Box>
  );
};

export default CadastrarAbastecimento;
