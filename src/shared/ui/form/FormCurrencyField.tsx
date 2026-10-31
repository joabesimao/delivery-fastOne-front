import { InputAdornment, Typography } from "@mui/material";
import { currencyInputMask } from "@/shared/lib/masks";
import FormTextField, { type FormTextFieldProps } from "./FormTextField";

type FormCurrencyFieldProps = Omit<FormTextFieldProps, "mask" | "slotProps">;

const FormCurrencyField = (props: FormCurrencyFieldProps) => (
  <FormTextField
    placeholder="0,00"
    {...props}
    mask={currencyInputMask}
    slotProps={{
      htmlInput: { inputMode: "numeric" },
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <Typography variant="body2" color="text.secondary">
              R$
            </Typography>
          </InputAdornment>
        ),
      },
    }}
  />
);

export default FormCurrencyField;
