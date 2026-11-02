import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ThemeModeIcon from "./ThemeModeIcon";
import ThemeSwitch from "./ThemeSwitch";

import { COLORS } from "@/shared/theme/colors";
interface ThemeModeDialogProps {
  open: boolean;
  dark: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const ThemeModeDialog = ({
  open,
  dark,
  onToggle,
  onClose,
}: ThemeModeDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: { borderRadius: 3, minWidth: 360, bgcolor: "background.paper" },
    }}
  >
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pb: 1,
        fontWeight: 700,
        color: "text.primary",
      }}
    >
      Tema
      <IconButton size="small" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    <Divider />

    <DialogContent sx={{ pt: 3, pb: 3 }}>
      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 200,
            height: 120,
            borderRadius: 2,
            border: "2px solid",
            borderColor: dark ? COLORS.brand : "#C4C9D4",
            bgcolor: dark ? "#121212" : "#F4F6F8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            transition: "all 0.3s ease",
          }}
        >
          <ThemeModeIcon dark={dark} size={40} />
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ color: dark ? "#E2E4E9" : "#1A1D23" }}
          >
            {dark ? "Modo escuro" : "Modo claro"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            p: 2,
            borderRadius: 2,
            bgcolor: dark ? "rgba(67,97,238,0.08)" : "#F4F6F8",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeModeIcon dark={false} size={20} />
            <Typography variant="body2" fontWeight={500} color="text.primary">
              Claro
            </Typography>
          </Stack>
          <FormControlLabel
            control={
              <ThemeSwitch
                checked={dark}
                onChange={onToggle}
                inputProps={{ "aria-label": "alternar tema" }}
              />
            }
            label=""
            sx={{ m: 0 }}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={500} color="text.primary">
              Escuro
            </Typography>
            <ThemeModeIcon dark size={20} />
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary" textAlign="center">
          A preferência é salva automaticamente no seu navegador.
        </Typography>
      </Stack>
    </DialogContent>
  </Dialog>
);

export default ThemeModeDialog;
