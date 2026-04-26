import React, { useState } from "react";
import {
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers/DateTimePicker";
import { InputLabel, Box, FormHelperText } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { ptBR } from "@mui/x-date-pickers/locales";
import { useFormikContext, getIn } from "formik";
import { SvgIcons } from "./SvgIcons";

const CustomCalendarIcon = () => (
  <img
    src={SvgIcons.IconCalendar}
    alt="calendar"
    style={{ width: "20px", height: "20px" }}
  />
);

interface DateTimePickerComponentProps extends Omit<
  DateTimePickerProps<any>,
  "onChange"
> {
  name: string;
  label: string;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: object;
  onBlur?: (e: any) => void;
  error?: boolean;
  helperText?: string | false;
  size?: "small" | "medium";
  showHelperText?: boolean;
  required?: boolean;
  onChange?: (date: Dayjs | null) => void;
  value?: Dayjs | null;
  hasFormik?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

const DateTimePickerComponent: React.FC<DateTimePickerComponentProps> = ({
  name,
  label,
  placeholder = "Selecione data e hora",
  fullWidth = true,
  sx = {},
  onBlur: onBlurProp,
  error: errorProp,
  helperText: helperTextProp,
  size = "small",
  showHelperText = true,
  required = false,
  onChange: onChangeProp,
  value: valueProp,
  hasFormik = true,
  readOnly = false,
  disabled = false,
  ...rest
}) => {
  const formik = (() => {
    if (!hasFormik) return undefined;
    try {
      return useFormikContext();
    } catch {
      return undefined;
    }
  })();
  const isFormikContext = !!formik && hasFormik;

  const getInitialValue = (): Dayjs | null => {
    if (valueProp !== undefined) return valueProp;
    if (!isFormikContext) return null;

    const raw = getIn(formik?.values, name);
    if (!raw) return null;

    return dayjs(raw);
  };

  const [internalValue, setInternalValue] = useState<Dayjs | null>(
    getInitialValue,
  );

  const handleChange = (value: any) => {
    const dayjsValue =
      value && dayjs.isDayjs(value) ? value : value ? dayjs(value) : null;
    setInternalValue(dayjsValue);

    if (onChangeProp) {
      onChangeProp(dayjsValue);
    } else if (isFormikContext) {
      formik.setFieldValue(name, dayjsValue ? dayjsValue.toISOString() : null);
    }
  };

  const handleBlur = () => {
    if (isFormikContext) {
      formik.setFieldTouched(name, true);
    }
    if (onBlurProp) {
      onBlurProp({ target: { name, value: internalValue } });
    }
  };

  const error = isFormikContext
    ? Boolean(getIn(formik?.touched, name) && getIn(formik?.errors, name))
    : errorProp;
  const helperText = isFormikContext
    ? (getIn(formik?.touched, name) && getIn(formik?.errors, name)) || ""
    : helperTextProp;

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="pt-br"
      localeText={
        ptBR.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <Box sx={{ width: fullWidth ? "100%" : "auto", ...sx }}>
        {label && (
          <InputLabel
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#181C32",
              mb: 0.5,
            }}
          >
            {label}
            {required && (
              <Box component="span" sx={{ color: "#F53B3B", ml: 0.5 }}>
                *
              </Box>
            )}
          </InputLabel>
        )}
        <DateTimePicker
          {...rest}
          value={internalValue}
          onChange={handleChange}
          format="DD/MM/YYYY HH:mm"
          readOnly={readOnly}
          disabled={disabled}
          slots={{
            openPickerIcon: CustomCalendarIcon,
          }}
          slotProps={{
            textField: {
              size,
              fullWidth,
              placeholder,
              error,
              required,
              onBlur: handleBlur,
              sx: {
                "& fieldset": {
                  borderRadius: "7px",
                  borderColor: !error ? "#C8CCD7 !important" : "#d42f2f",
                  height: size === "small" ? "42px" : "48px",
                },
                "&:hover fieldset": {
                  borderColor: "#C8CCD7 !important",
                },
                "&:focus-within fieldset": {
                  borderRadius: "7px",
                  borderColor: "#C8CCD7 !important",
                },
                "& input::placeholder": {
                  fontSize: "14px",
                },
                fontSize: "14px",
                ...sx,
              },
            },
          }}
        />
        {showHelperText && helperText && (
          <FormHelperText error={error} sx={{ ml: 1.75, mt: 0.5 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default DateTimePickerComponent;
