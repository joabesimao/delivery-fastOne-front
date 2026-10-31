import {
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import FieldLabel from "@/shared/ui/form/FieldLabel";
import {
  DELIVERY_SHEET_FORMATS,
  type DeliverySheetFormat,
} from "../../domain/deliverySheet";

interface DeliverySheetOptionsProps {
  format: DeliverySheetFormat;
  onFormatChange: (format: DeliverySheetFormat) => void;
  skipPreview: boolean;
  onSkipPreviewChange: (skip: boolean) => void;
}

const DeliverySheetOptions = ({
  format,
  onFormatChange,
  skipPreview,
  onSkipPreviewChange,
}: DeliverySheetOptionsProps) => (
  <>
    <Grid container spacing={2} sx={{ mb: 1.5 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldLabel label="Formato da folha" />
        <TextField
          select
          size="small"
          fullWidth
          value={format}
          onChange={(event) =>
            onFormatChange(event.target.value as DeliverySheetFormat)
          }
        >
          {DELIVERY_SHEET_FORMATS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
    <FormControlLabel
      sx={{ mb: 1 }}
      control={
        <Checkbox
          size="small"
          checked={skipPreview}
          onChange={(event) => onSkipPreviewChange(event.target.checked)}
        />
      }
      label="Não mostrar novamente (imprimir folha direto)"
    />
  </>
);

export default DeliverySheetOptions;
