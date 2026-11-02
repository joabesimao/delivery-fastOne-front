import { useState } from "react";
import { Button, Stack } from "@mui/material";
import useThemeMode from "@/shared/theme/useThemeMode";
import SettingRow from "../components/SettingRow";
import SettingsPanel from "../components/SettingsPanel";
import ThemeModeDialog from "../components/ThemeModeDialog";
import ThemeModeIcon from "../components/ThemeModeIcon";

import { COLORS } from "@/shared/theme/colors";
const VisualSettingsPage = () => {
  const { mode, toggleMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const dark = mode === "dark";

  return (
    <>
      <SettingsPanel title="Configurações visuais">
        <Stack spacing={3}>
          <SettingRow
            icon={<ThemeModeIcon dark={dark} size={28} />}
            title="Tema do sistema"
            description={dark ? "Modo escuro ativado" : "Modo claro ativado"}
            action={
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpen(true)}
                sx={{
                  textTransform: "none",
                  borderColor: COLORS.brand,
                  color: COLORS.brand,
                  "&:hover": { bgcolor: COLORS.brandSoft },
                }}
              >
                Alterar
              </Button>
            }
          />
        </Stack>
      </SettingsPanel>
      <ThemeModeDialog
        open={open}
        dark={dark}
        onToggle={toggleMode}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default VisualSettingsPage;
