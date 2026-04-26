import React from "react";
import {
  DatePicker,
  type DatePickerProps,
} from "@mui/x-date-pickers/DatePicker";
import { InputLabel, Box, Tooltip } from "@mui/material";
import { useFormikContext, getIn } from "formik";
import { SvgIcons } from "./SvgIcons";
import {
  PickersDay,
  type PickersDayProps,
} from "@mui/x-date-pickers/PickersDay";
import { useListEventsCalendarByYearByMouth } from "@/hooks/calendar/calendarUnit/useListEventsCalendarByYearByMouth";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

const CustomCalendarIcon = () => (
  <img
    src={SvgIcons.IconCalendar}
    alt="calendar"
    style={{ width: "20px", height: "20px" }}
  />
);

interface DatePickerComponentProps extends Omit<
  DatePickerProps<any>,
  "shouldDisableDate" | "onChange"
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
  startDate?: Date | string;
  shouldDisableDate?: (date: Date) => boolean;
  highlightMarks?: Array<{ date: Date | string; color: string }>;
  showEvents?: boolean;
  autoOpenOnInputClick?: boolean;
  onChange?: (date: Date | null, context?: any) => void;
  hasFormik?: boolean;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  name,
  label,
  placeholder = "Selecione uma data",
  fullWidth = true,
  sx = {},
  onBlur: onBlurProp,
  error: errorProp,
  helperText: helperTextProp,
  size = "small",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showHelperText = true,
  required = false,
  format = "dd/MM/yyyy",
  views = ["year", "month", "day"],
  readOnly = false,
  startDate: startDateProp,
  shouldDisableDate,
  highlightMarks,
  showEvents,
  autoOpenOnInputClick = false,
  onChange: onChangeProp,
  value: valueProp,
  hasFormik = true,
  ...rest
}) => {
  const formik = (() => {
    if (!hasFormik) return undefined;
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useFormikContext<any>();
    } catch {
      return undefined;
    }
  })();
  const isFormikContext = !!formik && hasFormik;

  const parseYMDLocal = (str?: any): Date | null => {
    if (!str || typeof str !== "string") return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return new Date(y, mo - 1, d, 0, 0, 0, 0);
  };

  const parseISOLocal = (str?: any): Date | null => {
    if (!str || typeof str !== "string") return null;
    const dateStr = str.includes("T") ? str.split("T")[0] : str;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return new Date(y, mo - 1, d, 0, 0, 0, 0);
  };
  const toYMDLocal = (d: Date | null): string => {
    if (!d) return "";
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  };
  const extractDate = (value: any): Date | null =>
    value instanceof Date
      ? value
      : value && typeof value === "object" && typeof value.toDate === "function"
        ? value.toDate()
        : null;

  const getInitialFromFormik = (): Date | null => {
    if (!isFormikContext) return null;
    const raw = getIn(formik?.values, name);
    if (!raw) return null;
    if (typeof raw === "number") {
      return new Date(raw, 0, 1);
    }
    if (typeof raw === "string" && /^\d{4}$/.test(raw)) {
      return new Date(Number(raw), 0, 1);
    }
    if (raw instanceof Date) {
      return raw;
    }
    return parseISOLocal(raw) || parseYMDLocal(raw);
  };

  const [internalValue, setInternalValue] = useState<Date | null>(() => {
    if (isFormikContext) return getInitialFromFormik();
    if (valueProp) {
      if (valueProp instanceof Date) return valueProp;
      if (typeof valueProp === "string")
        return parseISOLocal(valueProp) || parseYMDLocal(valueProp);
    }
    return null;
  });

  useEffect(() => {
    if (isFormikContext) {
      const newValue = getInitialFromFormik();
      setInternalValue(newValue);
    } else if (valueProp !== undefined) {
      if (valueProp instanceof Date) {
        setInternalValue(valueProp);
      } else if (typeof valueProp === "string") {
        setInternalValue(parseISOLocal(valueProp) || parseYMDLocal(valueProp));
      } else if (valueProp === null) {
        setInternalValue(null);
      }
    }
  }, [isFormikContext, getIn(formik?.values, name), valueProp]);

  const [calendarOpen, setCalendarOpen] = useState(false);

  const shouldFetchEvents = !!showEvents && calendarOpen;

  const [eventMarks, setEventMarks] = useState<
    Array<{ date: string; color: string }>
  >([]);
  const [calendarMonth, setCalendarMonth] = useState<number | null>(null);
  const [calendarYear, setCalendarYear] = useState<number | null>(null);

  const { data: calendarData } = useListEventsCalendarByYearByMouth(
    shouldFetchEvents
      ? {
          year: calendarYear,
          month: calendarMonth,
        }
      : { year: null, month: null },
  );

  React.useEffect(() => {
    if (!shouldFetchEvents || !calendarData) {
      setEventMarks([]);
      return;
    }
    const events = (calendarData?.data?.EventDay ??
      calendarData?.EventDay ??
      calendarData ??
      []) as Array<any>;
    const marksMap: Record<string, { color: string; title: string }> = {};
    const isoToYMD = (raw: any): string => {
      if (!raw) return "";
      const s = typeof raw === "string" ? raw : String(raw);
      const part = s.includes("T") ? s.slice(0, 10) : s;
      return /^\d{4}-\d{2}-\d{2}$/.test(part)
        ? part
        : dayjs(part).format("YYYY-MM-DD");
    };
    events.forEach((evt) => {
      if (evt?.typeEvent?.is_school_day === false) {
        const color = evt?.typeEvent?.color_code || "#FF4043";
        const title = evt?.title || "";
        const startYmd = isoToYMD(evt?.start_date);
        const endYmd = isoToYMD(evt?.end_date ?? evt?.start_date);

        const start = dayjs(startYmd, "YYYY-MM-DD");
        const end = dayjs(endYmd, "YYYY-MM-DD");
        const daysDiff = end.diff(start, "day");
        if (daysDiff >= 0) {
          Array.from({ length: daysDiff + 1 }).forEach((_, i) => {
            const date = start.add(i, "day").format("YYYY-MM-DD");
            marksMap[date] = { color, title };
          });
        }
      }
    });
    setEventMarks(
      Object.entries(marksMap).map(([date, { color, title }]) => ({
        date,
        color,
        title,
      })),
    );
  }, [calendarData, shouldFetchEvents]);

  const handleMonthChange = React.useCallback(
    (date: any) => {
      if (!showEvents) return;
      let d = date;
      if (d && typeof d.toDate === "function") d = d.toDate();
      if (d instanceof Date) {
        setCalendarMonth(d.getMonth() + 1);
        setCalendarYear(d.getFullYear());
      }
    },
    [showEvents],
  );

  React.useEffect(() => {
    if (!shouldFetchEvents) return;
    let baseDate: Date | null = null;
    if (internalValue) baseDate = internalValue;
    else baseDate = new Date();
    setCalendarMonth(baseDate.getMonth() + 1);
    setCalendarYear(baseDate.getFullYear());
  }, [shouldFetchEvents]);

  const marksMap = React.useMemo(() => {
    const map: Record<string, { color: string; title?: string }> = {};
    (highlightMarks || eventMarks || []).forEach((mark: any) => {
      const date = mark.date;
      const color = mark.color;
      const title = mark.title;
      const d =
        date instanceof Date
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate())
          : parseYMDLocal(date) || null;
      const key = d ? toYMDLocal(d) : "";
      if (key) map[key] = { color, title };
    });
    return map;
  }, [highlightMarks, eventMarks]);

  const CustomMarkedDay = (dayProps: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = dayProps;
    const d: Date | null =
      day instanceof Date
        ? day
        : day && typeof (day as any).toDate === "function"
          ? (day as any).toDate()
          : null;
    const key = d
      ? toYMDLocal(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
      : "";
    const mark = key ? marksMap[key] : undefined;
    const color = mark?.color;
    const title = mark?.title;

    return (
      <Box position="relative" display="inline-flex">
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
        />
        {!outsideCurrentMonth && color && (
          <Tooltip title={title || ""} arrow>
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: color,
                pointerEvents: "auto",
                zIndex: 2,
                display: "inline-block",
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  const handleChange = (value: any, context: any) => {
    let dateValue: Date | null = null;

    if (value) {
      if (value instanceof Date) {
        dateValue = value;
      } else if (
        typeof value === "object" &&
        typeof value.toDate === "function"
      ) {
        dateValue = value.toDate();
      }
    }

    setInternalValue(dateValue);

    if (isFormikContext) {
      const isYearOnly =
        Array.isArray(views) && views.length === 1 && views[0] === "year";
      if (isYearOnly) {
        if (dateValue && !context?.validationError) {
          formik.setFieldValue(name, dateValue.getFullYear());
        } else if (!dateValue) {
          formik.setFieldValue(name, null);
        }
      } else {
        formik.setFieldValue(name, dateValue);
      }
    }

    if (onChangeProp) {
      onChangeProp(dateValue, context);
    }
  };

  const handleBlur = () => {
    if (isFormikContext) {
      const date = extractDate(internalValue);
      if (date) {
        const isYearOnly =
          Array.isArray(views) && views.length === 1 && views[0] === "year";

        if (isYearOnly) {
          formik.setFieldValue(name, date.getFullYear());
        } else {
          formik.setFieldValue(name, toYMDLocal(date));
        }
      }
      formik.setFieldTouched(name, true, true);
    }

    if (onBlurProp) {
      onBlurProp(null);
    }
  };

  const error = isFormikContext
    ? Boolean(formik?.touched?.[name] && formik?.errors?.[name])
    : errorProp;
  const helperText = isFormikContext
    ? (formik?.touched?.[name] && formik?.errors?.[name]) || ""
    : helperTextProp;

  const composedShouldDisableDate = React.useCallback(
    (pickerDay: any) => {
      const d =
        pickerDay instanceof Date
          ? pickerDay
          : typeof pickerDay?.toDate === "function"
            ? pickerDay.toDate()
            : null;

      if (!d) return false;

      // Desabilitar datas anteriores ao startDate se fornecido
      if (startDateProp) {
        const startDate =
          startDateProp instanceof Date
            ? startDateProp
            : new Date(startDateProp);

        // Normalizar ambas as datas para meia-noite para comparação apenas de dia
        const pickerDayNormalized = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
        );
        const startDateNormalized = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
        );

        if (pickerDayNormalized < startDateNormalized) {
          return true;
        }
      }

      // Aplicar validação customizada se fornecida
      if (shouldDisableDate) {
        return shouldDisableDate(d);
      }

      return false;
    },
    [shouldDisableDate, startDateProp],
  );

  const handleInputClick = () => {
    if (autoOpenOnInputClick) {
      setCalendarOpen(true);
    }
    if (formik) {
      formik.setFieldTouched(name, true, true);
    }
  };

  return (
    <div style={{ width: fullWidth ? "100%" : "auto", position: "relative" }}>
      <InputLabel
        htmlFor={name}
        required={required}
        sx={{ marginBottom: "4px", fontWeight: "600", fontSize: "14px" }}
      >
        {label}
      </InputLabel>
      <DatePicker
        {...rest}
        readOnly={readOnly}
        format={format}
        value={internalValue}
        onChange={handleChange}
        views={views}
        open={calendarOpen}
        onOpen={() => setCalendarOpen(true)}
        onClose={() => setCalendarOpen(false)}
        desktopModeMediaQuery="(min-width:0px)"
        localeText={{
          toolbarTitle: label,
          cancelButtonLabel: "Cancelar",
          okButtonLabel: "Confirmar",
        }}
        shouldDisableDate={composedShouldDisableDate}
        slots={{
          openPickerIcon: CustomCalendarIcon,
          day: CustomMarkedDay,
        }}
        onMonthChange={shouldFetchEvents ? handleMonthChange : undefined}
        slotProps={{
          openPickerButton: {
            size: "small",
            disableRipple: true,
            disableFocusRipple: true,
            sx: {
              p: 0,
              mr: 0,
              width: 24,
              height: 24,
              borderRadius: 6,
              "& .MuiSvgIcon-root, & img": { width: 14, height: 14 },
            },
          },
          textField: {
            size: size,
            placeholder: placeholder,
            required: required,
            error: error,
            fullWidth: fullWidth,
            onBlur: handleBlur,
            onClick: handleInputClick,
            helperText:
              error && helperText
                ? typeof helperText === "string"
                  ? helperText
                  : Array.isArray(helperText)
                    ? helperText.join(", ")
                    : typeof helperText === "object" && helperText !== null
                      ? JSON.stringify(helperText)
                      : ""
                : "",
            sx: {
              "& fieldset": {
                borderRadius: "7px",
                borderColor: !error ? "#C8CCD7 !important" : "#d42f2f",
                height: size === "small" ? "42px" : "48px",
              },
              "&:hover fieldset": { borderColor: "#C8CCD7 !important" },
              "&:focus-within fieldset": {
                borderRadius: "7px",
                borderColor: "#C8CCD7 !important",
              },
              "& input::placeholder": {
                fontSize: "14px",
              },
              "& .MuiInputAdornment-root .MuiButtonBase-root": {
                width: 24,
                height: 24,
                p: 0,
                borderRadius: 6,
              },
              fontSize: "14px",
              ...sx,
            },
          },
        }}
      />
    </div>
  );
};

export default DatePickerComponent;
