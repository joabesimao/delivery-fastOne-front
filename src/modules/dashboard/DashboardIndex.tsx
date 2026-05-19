import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const DashboardIndex: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" gutterBottom>
        Painel com indicadores gerais das entregas.
      </Typography>

      <Button variant="contained" component={Link} to="/dashboard/relatorios">
        Ir para Relatórios
      </Button>
    </Box>
  );
};

export default DashboardIndex;
