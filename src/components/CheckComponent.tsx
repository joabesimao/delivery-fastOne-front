import React from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
} from "@mui/material";
import { useFormikContext, getIn } from "formik";
import type { FormControlLabelProps } from "@mui/material";

type Option = {
  value: string | number | boolean;
  label: React.ReactNode;
};

interface CheckComponentProps {
  name: string;
  label?: string;
  options?: Option[];
  value?: any;
  onChange?: (value: any) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  formik?: any;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  labelCheck?: React.ReactNode | string;
  labelProps?: Partial<FormControlLabelProps>;
  row?: boolean;
  readOnly?: boolean;
}

const CheckComponent: React.FC<CheckComponentProps> = ({
  name,
  label,
  options,
  value: valueProp,
  onChange: onChangeProp,
  error: errorProp,
  helperText: helperTextProp,
  formik,
  disabled = false,
  labelCheck,
  fullWidth,
  row = true,
  readOnly = false,
  labelProps = {},
}) => {
  const formikContext = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useFormikContext<any>();
    } catch {
      return undefined;
    }
  })();
  const isFormik = !!formik || !!formikContext;
  const formikBag = formik || formikContext;

  const setValue =
    onChangeProp !== undefined
      ? onChangeProp
      : isFormik
        ? (val: any) => formikBag.setFieldValue(name, val)
        : () => {};

  const fieldValue = isFormik ? getIn(formikBag.values, name) : valueProp;
  const fieldError =
    errorProp !== undefined
      ? errorProp
      : isFormik && getIn(formikBag.touched, name)
        ? !!getIn(formikBag.errors, name)
        : false;
  const fieldHelperText =
    helperTextProp !== undefined
      ? helperTextProp
      : isFormik && getIn(formikBag.touched, name)
        ? getIn(formikBag.errors, name)
        : "";

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.checked);
  };

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <InputLabel
        htmlFor={name}
        sx={{ marginBottom: "4px", fontWeight: "600", fontSize: "14px" }}
      >
        {label}
      </InputLabel>
      <FormGroup row={row}>
        {options ? (
          options.map((option) => (
            <FormControlLabel
              key={String(option.value)}
              control={
                <Checkbox
                  checked={!!(fieldValue && fieldValue[String(option.value)])}
                  onChange={() => {
                    if (
                      typeof fieldValue === "object" &&
                      fieldValue !== null &&
                      !readOnly
                    ) {
                      setValue({
                        [String(option.value)]:
                          !fieldValue[String(option.value)],
                      });
                    }
                  }}
                  disabled={disabled}
                  sx={{
                    color: "#009FE3",
                    "&.Mui-checked": { color: "#009FE3" },
                  }}
                />
              }
              label={option.label}
              sx={{ color: "#646968" }}
            />
          ))
        ) : (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!fieldValue}
                onChange={readOnly ? undefined : handleSingleChange}
                disabled={disabled}
                sx={{
                  color: fieldError ? "#d32f2f" : "#009FE3",
                  "&.Mui-checked": {
                    color: fieldError ? "#d32f2f" : "#009FE3",
                  },
                  pt: "0px",
                  pb: "0px",
                  mt: "0px",
                  mb: "0px",
                }}
              />
            }
            label={labelCheck || label}
            sx={{ color: "#646968", ...labelProps.sx }}
          />
        )}
      </FormGroup>
      {fieldHelperText && (
        <FormHelperText
          sx={{
            color: "#d32f2f",
            fontSize: "0.75rem",
            fontWeight: 400,
            lineHeight: 1.66,
            letterSpacing: "0.03333em",
            margin: "3px 14px 0 14px",
          }}
        >
          {fieldHelperText}
        </FormHelperText>
      )}
    </div>
  );
};

export default CheckComponent;
