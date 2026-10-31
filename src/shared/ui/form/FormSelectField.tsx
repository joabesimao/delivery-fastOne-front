import { MenuItem } from "@mui/material";
import FormTextField, { type FormTextFieldProps } from "./FormTextField";

export interface SelectOption {
  value: string;
  label: string;
}

type FormSelectFieldProps = Omit<FormTextFieldProps, "select" | "children"> & {
  options: SelectOption[];
  placeholder?: string;
};

const FormSelectField = ({
  options,
  placeholder,
  ...props
}: FormSelectFieldProps) => (
  <FormTextField select {...props}>
    {placeholder && (
      <MenuItem value="" disabled>
        <em>{placeholder}</em>
      </MenuItem>
    )}
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </FormTextField>
);

export default FormSelectField;
