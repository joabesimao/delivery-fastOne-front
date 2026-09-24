import React, { useState } from "react";
import { Box } from "@mui/material";
import TrocaOleoForm from "./TrocaOleoForm";
import ListaTrocaOleo from "./ListaTrocaOleo";

const CadastrarTrocaOleo: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <TrocaOleoForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <ListaTrocaOleo refreshKey={refreshKey} />
    </Box>
  );
};

export default CadastrarTrocaOleo;
