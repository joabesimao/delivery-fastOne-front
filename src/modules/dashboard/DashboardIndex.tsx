import { Link } from "react-router-dom";
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

const DashboardIndex = () => {
  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard operacional"
        description="Centralize ações, relatórios e atalhos administrativos em um layout limpo e responsivo."
        actions={
          <Button component={Link} to="/dashboard/relatorios" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
            Abrir relatórios
          </Button>
        }
        icon={<DashboardOutlinedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Fluxo de entregas" value="Atual" description="Monitoramento em tempo real do painel" icon={<LocalShippingOutlinedIcon fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Relatórios" value="Centralizados" description="Indicadores e análises consolidadas" icon={<ListAltOutlinedIcon fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Cadastros" value="Organizados" description="Clientes, bairros, cidades e entregadores" icon={<SettingsOutlinedIcon fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="UX" value="Responsiva" description="Experiência fluida em desktop, tablet e mobile" icon={<DashboardOutlinedIcon fontSize="small" />} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {[
          {
            title: "Relatórios de entregas",
            description: "Acompanhe distribuição por bairro, cidade e status geral das entregas.",
            href: "/dashboard/relatorios",
          },
          {
            title: "Clientes",
            description: "Gerencie cadastro, status e ações rápidas sobre a base de clientes.",
            href: "/dashboard/clientes",
          },
          {
            title: "Realizar entrega",
            description: "Abra o fluxo operacional para criar uma nova entrega rapidamente.",
            href: "/realizar-entrega",
          },
        ].map((item) => (
          <Grid size={{ xs: 12, md: 4 }} key={item.title}>
            <Card sx={{ height: "100%", transition: "transform 180ms ease", "&:hover": { transform: "translateY(-2px)" } }}>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
                <Stack spacing={1} sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Stack>
                <Button component={Link} to={item.href} variant="outlined" fullWidth>
                  Abrir
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardIndex;
