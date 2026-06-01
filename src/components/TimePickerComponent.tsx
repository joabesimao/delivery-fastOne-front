import React, { useState } from "react";
import { useField, useFormikContext } from "formik";
import {
  InputLabel,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import type { MobileTimePickerProps } from "@mui/x-date-pickers/MobileTimePicker";
import TimeIcon from "@mui/icons-material/AccessTime";
import { ptBR } from "@mui/x-date-pickers/locales";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";

interface GlobalTimePickerProps {
  name: string;
  label: string;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: object;
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string | false;
  size?: "small" | "medium";
  showHelperText?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  disableAmPm?: boolean;
  TimePickerProps?: Partial<MobileTimePickerProps<any>>;
  minTime?: Date | string;
  startTime?: Date | string;
}

const TimePickerComponent: React.FC<GlobalTimePickerProps> = ({
  name,
  label,
  placeholder,
  fullWidth = true,
  sx = {},
  value: valueProp,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  error: errorProp,
  helperText: helperTextProp,
  size = "small",
  showHelperText = true,
  required = false,
  disabled = false,
  readOnly = false,
  disableAmPm = false,
  TimePickerProps = {},
  minTime: minTimeProp,
  startTime: startTimeProp,
}) => {
  const formik = (() => {
    try {
      return useFormikContext();
    } catch {
      return undefined;
    }
  })();
  const isFormikContext = !!formik;
  const [field, meta] = isFormikContext ? useField(name) : [null, null];
  const [open, setOpen] = useState(false);
  const value =
    valueProp !== undefined
      ? valueProp
      : isFormikContext
        ? field?.value
          ? dayjs(field.value)
          : null
        : null;

  const handleChange = (value: any, _?: any) => {
    let dayjsValue: Dayjs | null = dayjs.isDayjs(value)
      ? value
      : value
        ? dayjs(value)
        : null;
    if (onChangeProp) {
      onChangeProp(dayjsValue);
    } else if (isFormikContext) {
      formik.setFieldValue(name, dayjsValue ? dayjsValue.toISOString() : null);
    }
  };

  const handleAccept = (value: any, _?: any) => {
    let dayjsValue: Dayjs | null = dayjs.isDayjs(value)
      ? value
      : value
        ? dayjs(value)
        : null;
    if (onChangeProp) {
      onChangeProp(dayjsValue);
    } else if (isFormikContext) {
      formik.setFieldValue(name, dayjsValue ? dayjsValue.toISOString() : null);
    }
    setOpen(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlurProp) {
      onBlurProp(e);
    } else if (isFormikContext && field?.onBlur) {
      field.onBlur(e);
    }
  };

  const error =
    errorProp !== undefined
      ? errorProp
      : isFormikContext
        ? meta?.touched && Boolean(meta?.error)
        : false;

  const helperText =
    helperTextProp !== undefined
      ? helperTextProp
      : isFormikContext
        ? meta?.error
        : "";

  const normalizedMinTime = React.useMemo<Dayjs | undefined>(() => {
    const source = startTimeProp ?? minTimeProp;
    if (!source) return undefined;

    const fromDate = (d: Date) => dayjs(d);
    const fromString = (s: string) => {
      const str = s.trim();
      const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(str);
      if (m) {
        const h = parseInt(m[1], 10);
        const mi = parseInt(m[2], 10);
        const se = m[3] ? parseInt(m[3], 10) : 0;
        return dayjs().hour(h).minute(mi).second(se).millisecond(0);
      }
      const parsed = dayjs(str);
      return parsed.isValid() ? parsed : undefined;
    };

    if (source instanceof Date) return fromDate(source);
    if (typeof source === "string") return fromString(source);
    return undefined;
  }, [startTimeProp, minTimeProp]);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="pt-br"
      localeText={
        ptBR.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <div style={{ width: fullWidth ? "100%" : "auto" }}>
        <InputLabel
          required={required}
          htmlFor={name}
          sx={{ marginBottom: "4px", fontWeight: "600", fontSize: "14px" }}
        >
          {label}
        </InputLabel>
        <MobileTimePicker
          value={value}
          onChange={handleChange}
          onAccept={handleAccept}
          onClose={() => {
            setOpen(false);
            const event = {
              target: { name },
            } as React.FocusEvent<HTMLInputElement>;
            handleBlur(event);
          }}
          onOpen={() => setOpen(true)}
          open={open}
          disabled={disabled}
          readOnly={readOnly}
          minTime={normalizedMinTime}
          shouldDisableTime={(timeValue, view) => {
            if (!normalizedMinTime) return false;
            const minH = normalizedMinTime.hour();
            const minM = normalizedMinTime.minute();
            const minS = normalizedMinTime.second();
            const currentHour = value ? value.hour() : undefined;

            if (view === "hours") {
              const hour =
                typeof timeValue === "number"
                  ? timeValue
                  : dayjs(timeValue).hour();
              return hour < minH;
            }
            if (view === "minutes") {
              if (currentHour !== undefined && currentHour < minH) return true;
              if (currentHour !== undefined && currentHour === minH) {
                const minute =
                  typeof timeValue === "number"
                    ? timeValue
                    : dayjs(timeValue).minute();
                return minute < minM;
              }
              return false;
            }
            if (view === "seconds") {
              if (currentHour !== undefined && currentHour < minH) return true;
              if (currentHour !== undefined && currentHour === minH) {
                const currentMin = value ? value.minute() : undefined;
                if (currentMin !== undefined && currentMin < minM) return true;
                if (currentMin !== undefined && currentMin === minM) {
                  const second =
                    typeof timeValue === "number"
                      ? timeValue
                      : dayjs(timeValue).second();
                  return second < minS;
                }
              }
              return false;
            }
            return false;
          }}
          slotProps={{
            textField: {
              id: name,
              name,
              placeholder: disabled ? "--:--" : placeholder,
              fullWidth,
              size,
              required,
              error: error,
              sx: {
                borderRadius: "7px",

                "& fieldset": {
                  borderRadius: "7px",
                  borderColor: "#C8CCD7",
                },
                "&:hover fieldset": { borderColor: "#C8CCD7 !important" },
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
              inputProps: {
                readOnly: readOnly || disabled,
              },
              InputProps: {
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      "& .MuiSvgIcon-root": {
                        color: "#b9bcba !important",
                        width: 24,
                        height: 24,
                      },
                    }}
                  >
                    <TimeIcon
                      sx={{
                        cursor:
                          disabled || readOnly ? "not-allowed" : "pointer",
                        width: 24,
                        height: 24,
                      }}
                      onClick={() => !disabled && !readOnly && setOpen(true)}
                    />
                  </InputAdornment>
                ),
              },
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
              onFocus: () => undefined,
            } as TextFieldProps,
          }}
          format={disableAmPm ? "HH:mm" : "hh:mm A"}
          ampm={!disableAmPm}
          {...(() => {
            const { openTo, view, ...rest } = TimePickerProps || {};
            const props: any = { ...rest };
            if (typeof openTo === "string") props.openTo = openTo;
            if (typeof view === "string") props.view = view;
            return props;
          })()}
        />
        {showHelperText && error && helperText && (
          <FormHelperText error sx={{ marginLeft: "14px", marginTop: "4px" }}>
            {helperText}
          </FormHelperText>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default TimePickerComponent;
