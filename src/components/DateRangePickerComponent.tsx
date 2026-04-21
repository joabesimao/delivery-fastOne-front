import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  Stack,
  InputLabel,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useField, useFormikContext } from "formik";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SvgIcons } from "../components/SvgIcons";
import CloseIcon from "@mui/icons-material/Close";
import { formatDate } from "@/helpers/formatDate";
const CustomCalendarIcon = () => (
  <img
    src={SvgIcons.IconCalendar}
    alt="calendar"
    style={{ width: 20, height: 20 }}
  />
);

interface DateRangePickerComponentProps {
  startName: string;
  endName: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  format?: string;
  onChange?: (start: Date | null, end: Date | null) => void;
  onBlur?: () => void;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  errorStart?: boolean;
  errorEnd?: boolean;
  helperStart?: string | false;
  helperEnd?: string | false;
  showHelperText?: boolean;
  sx?: any;
  startPlaceholder?: string;
  endPlaceholder?: string;
  placeholderRange?: string;
  valueStart?: string | Date | null;
  valueEnd?: string | Date | null;
  allowClear?: boolean;
  maxSchoolDays?: number;
  isSchoolDay?: (date: Date) => boolean;
}

const parseDateOnlyLocal = (raw: any): Date | null => {
  if (!raw) return null;
  if (raw instanceof Date)
    return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
  if (typeof raw === "string") {
    const datePart = raw.includes("T") ? raw.slice(0, 10) : raw;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
    const [y, m, d] = datePart.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return null;
};
const formatLocalDate = (d: Date | null) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "";

const DateRangePickerComponent: React.FC<DateRangePickerComponentProps> = ({
  startName,
  endName,
  label = "Período",
  required = false,
  fullWidth = true,
  size = "small",
  format = "dd/MM/yyyy",
  onChange,
  onBlur,
  minDate,
  maxDate,
  disablePast,
  disableFuture,
  errorStart,
  errorEnd,
  helperStart,
  helperEnd,
  showHelperText = true,
  sx = {},
  startPlaceholder = "Data inicial",
  endPlaceholder = "Data final",
  placeholderRange = "Selecione o período",
  valueStart,
  valueEnd,
  allowClear = true,
  maxSchoolDays,
  isSchoolDay,
}) => {
  const formik = (() => {
    try {
      return useFormikContext<any>();
    } catch {
      return undefined;
    }
  })();
  const isFormik = !!formik;
  const [startField, startMeta] = isFormik ? useField(startName) : [null, null];
  const [endField, endMeta] = isFormik ? useField(endName) : [null, null];

  const hasExternalStart = valueStart !== undefined;
  const hasExternalEnd = valueEnd !== undefined;

  const startValue: Date | null = useMemo(() => {
    if (hasExternalStart) return parseDateOnlyLocal(valueStart);
    return isFormik && startField?.value
      ? parseDateOnlyLocal(startField.value)
      : null;
  }, [hasExternalStart, valueStart, isFormik, startField?.value]);

  const endValue: Date | null = useMemo(() => {
    if (hasExternalEnd) return parseDateOnlyLocal(valueEnd);
    return isFormik && endField?.value
      ? parseDateOnlyLocal(endField.value)
      : null;
  }, [hasExternalEnd, valueEnd, isFormik, endField?.value]);

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [chainMode, setChainMode] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const derivedErrorStart = isFormik
    ? !!(startMeta?.touched && startMeta?.error)
    : errorStart;
  const derivedErrorEnd = isFormik
    ? !!(endMeta?.touched && endMeta?.error)
    : errorEnd;
  const derivedHelperStart = isFormik
    ? startMeta?.touched && startMeta?.error
    : helperStart;
  const derivedHelperEnd = isFormik
    ? endMeta?.touched && endMeta?.error
    : helperEnd;

  const combinedHelper =
    (derivedErrorStart && derivedHelperStart) ||
    (derivedErrorEnd && derivedHelperEnd) ||
    "";

  const rangeIncomplete =
    required && (!!startValue !== true || !!endValue !== true);
  const rangeTouched = isFormik
    ? startMeta?.touched || endMeta?.touched || false
    : true;
  const showRangeError = rangeIncomplete && rangeTouched;

  const finalError = errorStart && errorEnd;
  const finalHelperText = showRangeError
    ? "Período obrigatório"
    : combinedHelper;

  const setFormikValue = useCallback(
    (field: string, date: Date | null) => {
      if (!isFormik) return;
      formik.setFieldValue(field, formatLocalDate(date));
      formik.setFieldTouched(field, true, true);
    },
    [formik, isFormik],
  );

  const markTouchedBoth = useCallback(() => {
    if (isFormik) {
      formik.setFieldTouched(startName, true, true);
      formik.setFieldTouched(endName, true, true);
    }
    onBlur?.();
  }, [isFormik, formik, startName, endName, onBlur]);

  // helper: strip time (00:00 local)
  const dateOnly = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const MAX_SCAN_DAYS = 366;

  const endMaxDate = useMemo(() => {
    if (!maxSchoolDays || !isSchoolDay || !startValue) return undefined;

    let count = 0;
    let cursor = new Date(startValue); // start date-only already

    for (let i = 0; i < MAX_SCAN_DAYS && count < maxSchoolDays; i++) {
      if (isSchoolDay(cursor)) {
        count++;
        if (count === maxSchoolDays) {
          return dateOnly(cursor); // ensure date-only
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return undefined;
  }, [maxSchoolDays, isSchoolDay, startValue]);

  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "object" && typeof value.toDate === "function")
      return value.toDate();
    return null;
  };

  const handleStartChange = (value: any, _context?: any) => {
    const date = toDate(value);
    setFormikValue(startName, date);
    if (date && endValue && endValue < date) {
      setFormikValue(endName, null);
    }
    if (!date) {
      setFormikValue(endName, null);
      setOpenStart(false);
      setOpenEnd(false);
      setChainMode(false);
      onChange?.(null, null);
      return;
    }
    setOpenStart(false);
    setTimeout(() => {
      if (chainMode) setOpenEnd(true);
    }, 40);
    onChange?.(date, endValue || null);
  };

  const handleEndChange = (value: any, _context?: any) => {
    const date = toDate(value);
    let finalEnd = date;
    let finalStart = startValue;
    if (finalEnd && finalStart && finalEnd < finalStart) {
      finalStart = finalEnd;
      setFormikValue(startName, finalStart);
    }
    setFormikValue(endName, finalEnd);
    setOpenEnd(false);
    setChainMode(false);
    markTouchedBoth();
    onChange?.(finalStart || null, finalEnd || null);
  };

  const handleClear = () => {
    if (isFormik) {
      setFormikValue(startName, null);
      setFormikValue(endName, null);
    }
    onChange?.(null, null);
    setOpenStart(false);
    setOpenEnd(false);
    setChainMode(false);
  };

  const endShouldDisableDate = useCallback(
    (pickerDay: any) => {
      const d = toDate(pickerDay);
      if (!d) return false;
      const d0 = dateOnly(d);
      const start0 = startValue ? dateOnly(startValue) : undefined;
      const end0 = endMaxDate ? dateOnly(endMaxDate) : undefined;
      if (start0 && d0 < start0) return true;
      if (end0 && d0 > end0) return true;
      return false;
    },
    [startValue, endMaxDate],
  );

  const hasAnyValue = !!startValue || !!endValue;
  const showClearButton = allowClear && hasAnyValue;

  const displayValue = useMemo(() => {
    if (!startValue && !endValue) return "";
    if (startValue && !endValue) return `${formatDate(startValue)} - `;
    return `${formatDate(startValue)} - ${formatDate(endValue)}`;
  }, [startValue, endValue]);

  const openFlow = () => {
    setChainMode(true);
    if (!startValue) {
      setOpenStart(true);
      return;
    }
    setOpenStart(true);
  };

  return (
    <Stack
      ref={anchorRef}
      width={fullWidth ? "100%" : "auto"}
      spacing={0.5}
      sx={{ position: "relative", ...sx }}
    >
      <InputLabel
        required={required}
        sx={{
          fontWeight: 600,
          fontSize: "14px",
          mb: "4px",
          "& .MuiInputLabel-asterisk": { color: "#6C757D" },
        }}
      >
        {label}
      </InputLabel>

      <OutlinedInput
        size={size}
        readOnly
        value={displayValue}
        placeholder={placeholderRange}
        error={finalError}
        fullWidth={fullWidth}
        sx={{
          borderRadius: "7px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: finalError ? "" : "#C8CCD7",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: finalError ? "" : "#C8CCD7",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: finalError ? "" : "#C8CCD7",
          },
          cursor: "pointer",
          fontSize: "14px",
          minHeight: 40,
        }}
        onClick={openFlow}
        endAdornment={
          <InputAdornment position="end" sx={{ gap: "0px" }}>
            {showClearButton && (
              <IconButton
                sx={{
                  width: 30,
                  height: 30,
                }}
                aria-label="Limpar período"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            <IconButton
              sx={{
                width: 30,
                height: 30,
              }}
              aria-label="Selecionar período"
              onClick={(e) => {
                e.stopPropagation();
                openFlow();
              }}
            >
              <CustomCalendarIcon />
            </IconButton>
          </InputAdornment>
        }
      />

      <DatePicker
        open={openStart}
        value={startValue}
        onOpen={() => setOpenStart(true)}
        onClose={() => {
          setOpenStart(false);
          if (chainMode && startValue) {
            setTimeout(() => {
              if (!openEnd) setOpenEnd(true);
            }, 40);
          }
          if (!startValue) {
            setChainMode(false);
            markTouchedBoth();
          }
        }}
        onChange={handleStartChange}
        format={format}
        minDate={minDate}
        maxDate={maxDate}
        disablePast={disablePast}
        disableFuture={disableFuture}
        desktopModeMediaQuery="(min-width:0px)"
        localeText={{
          toolbarTitle: startPlaceholder,
          cancelButtonLabel: "Cancelar",
          okButtonLabel: "Confirmar",
        }}
        slots={{
          openPickerIcon: CustomCalendarIcon,
        }}
        slotProps={{
          popper: { anchorEl: anchorRef.current },
          textField: { sx: { display: "none" } },
          openPickerButton: { sx: { display: "none" } },
        }}
      />

      <DatePicker
        open={openEnd}
        value={endValue}
        onOpen={() => setOpenEnd(true)}
        onClose={() => {
          setOpenEnd(false);
          setChainMode(false);
          markTouchedBoth();
        }}
        onChange={handleEndChange}
        format={format}
        minDate={startValue || minDate}
        maxDate={endMaxDate ? dateOnly(endMaxDate) : maxDate}
        shouldDisableDate={endMaxDate ? endShouldDisableDate : undefined}
        disablePast={disablePast}
        disableFuture={disableFuture}
        desktopModeMediaQuery="(min-width:0px)"
        localeText={{
          toolbarTitle: endPlaceholder,
          cancelButtonLabel: "Cancelar",
          okButtonLabel: "Confirmar",
        }}
        slots={{
          openPickerIcon: CustomCalendarIcon,
        }}
        slotProps={{
          popper: { anchorEl: anchorRef.current },
          textField: { sx: { display: "none" } },
          openPickerButton: { sx: { display: "none" } },
        }}
      />

      {showHelperText && finalError && finalHelperText && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {finalHelperText}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default DateRangePickerComponent;
