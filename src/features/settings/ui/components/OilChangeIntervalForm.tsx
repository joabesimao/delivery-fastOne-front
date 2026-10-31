import { useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import SettingRow from "./SettingRow";

import { COLORS } from "@/shared/theme/colors";
interface OilChangeIntervalFormProps {
  initialIntervalKm: string;
  saving: boolean;
  onSave: (intervalKm: string) => void;
}

const OilChangeIntervalForm = ({
  initialIntervalKm,
  saving,
  onSave,
}: OilChangeIntervalFormProps) => {
  const [intervalKm, setIntervalKm] = useState(initialIntervalKm);

  return (
    <Stack spacing={3}>
      <SettingRow
        wrap
        icon={<BuildIcon sx={{ color: COLORS.brand, fontSize: 28 }} />}
        title="Intervalo de troca de óleo"
        description="Km utilizado para calcular a próxima troca em todos os veículos."
        action={
          <TextField
            size="small"
            type="number"
            slotProps={{ htmlInput: { min: 1 } }}
            value={intervalKm}
            onChange={(e) => setIntervalKm(e.target.value)}
            sx={{ width: 140 }}
            label="Km"
          />
        }
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() => onSave(intervalKm)}
          sx={{
            textTransform: "none",
            bgcolor: COLORS.brand,
            "&:hover": { bgcolor: COLORS.brandHover },
          }}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Stack>
  );
};

export default OilChangeIntervalForm;
