import type { ChangeEvent } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import { useField } from "formik";
import FieldLabel from "./FieldLabel";

export type FormTextFieldProps = Omit<
  TextFieldProps,
  "name" | "value" | "error" | "label" | "onChange"
> & {
  name: string;
  label?: string;
  mask?: (value: string) => string;
  touchOnChange?: (value: string) => boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const FormTextField = ({
  name,
  label,
  mask,
  touchOnChange,
  onChange,
  helperText,
  ...props
}: FormTextFieldProps) => {
  const [field, meta, helpers] = useField<string>(name);
  const showError = Boolean(meta.touched && meta.error);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = mask ? mask(event.target.value) : event.target.value;
    void helpers.setValue(value);
    if (touchOnChange?.(value)) void helpers.setTouched(true, false);
    onChange?.(event);
  };

  return (
    <>
      {label && <FieldLabel label={label} />}
      <TextField
        fullWidth
        size="small"
        {...props}
        name={name}
        value={field.value}
        onChange={handleChange}
        onBlur={field.onBlur}
        error={showError}
        helperText={showError ? meta.error : helperText}
      />
    </>
  );
};

export default FormTextField;
