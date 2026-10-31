import { Box, Grid, Stack, Typography } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

const LoginBrandPanel = () => (
  <Grid
    size={{ xs: 12, md: 5 }}
    sx={{
      p: { xs: 3, sm: 4, md: 5 },
      bgcolor: "primary.main",
      color: "primary.contrastText",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: { md: 680 },
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 32%), radial-gradient(circle at bottom left, rgba(14,165,233,0.22), transparent 26%)",
      }}
    />
    <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255,255,255,0.16)",
          }}
        >
          <LocalShippingOutlinedIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            FastOne Delivery
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.86 }}>
            Modern operations cockpit
          </Typography>
        </Box>
      </Stack>
    </Stack>
  </Grid>
);

export default LoginBrandPanel;
