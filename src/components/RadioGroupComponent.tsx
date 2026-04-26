import React from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  RadioGroupProps,
  FormControlLabelProps,
  RadioProps,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { FormikProps } from "formik";

type Option = {
  value: string | number | boolean;
  label: React.ReactNode;
};

interface GlobalRadioGroupProps extends Omit<RadioGroupProps, "onChange"> {
  options?: Option[];
  value: string | number | boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ) => void;
  row?: boolean;
  labelProps?: Partial<FormControlLabelProps>;
  radioProps?: Partial<RadioProps>;
  fullWidth?: boolean;
  label: string;
  name: string;
  size?: "small" | "medium";
  required?: boolean;
  formik?: FormikProps<any>;
  helperText?: string;
  error?: boolean;
  readOnly?: boolean;
}

const defaultOptions: Option[] = [
  { value: false, label: "Não" },
  { value: true, label: "Sim" },
];

export const RadioGroupComponent: React.FC<GlobalRadioGroupProps> = ({
  options = defaultOptions,
  name,
  label,
  value,
  onChange,
  row = true,
  labelProps = {},
  radioProps = {},
  fullWidth = false,
  size = "small",
  required = false,
  formik,
  helperText,
  error,
  readOnly = false,
  ...props
}) => {
  const fieldError =
    error !== undefined
      ? error
      : formik
        ? !!(formik.touched[name] && formik.errors[name])
        : false;
  const fieldHelperText =
    helperText !== undefined
      ? helperText
      : formik && formik.touched[name]
        ? (formik.errors[name] as string)
        : "";

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <InputLabel
        htmlFor={name}
        required={required}
        sx={{ marginBottom: "4px", fontWeight: "600", fontSize: "14px" }}
      >
        {label}
      </InputLabel>
      <RadioGroup
        id={name}
        row={row}
        value={value}
        onChange={readOnly ? undefined : onChange}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={String(option.value)}
            value={String(option.value)}
            control={
              <Radio
                size={size}
                sx={{
                  color: "#009FE3",
                  "&.Mui-checked": {
                    color: "#009FE3",
                  },
                  ...radioProps.sx,
                }}
                {...radioProps}
              />
            }
            label={option.label}
            sx={{
              color: "#646968",
              ...labelProps?.sx,
            }}
            {...labelProps}
          />
        ))}
      </RadioGroup>
      {(fieldHelperText || fieldError) && (
        <FormHelperText>{fieldHelperText}</FormHelperText>
      )}
    </div>
  );
};
