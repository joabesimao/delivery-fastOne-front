import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Stack,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useField, useFormikContext } from "formik";

interface HoursRangeComponentProps {
  startName: string;
  endName: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  valueStart?: string | null;
  valueEnd?: string | null;
  onChange?: (start: string | null, end: string | null) => void;
  onBlur?: () => void;
  errorStart?: boolean;
  errorEnd?: boolean;
  helperStart?: string | false;
  helperEnd?: string | false;
  showHelperText?: boolean;
  allowClear?: boolean;
  minHour?: string;
  maxHour?: string;
  sx?: any;
}

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const toDate = (v?: string | null) => {
  if (!v || !HHMM.test(v)) return null;
  const [h, m] = v.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};
const toStr = (d: Date | null) =>
  d
    ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    : "";
const isAfter = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getTime() > b.getTime();

const HoursRangeComponent: React.FC<HoursRangeComponentProps> = ({
  startName,
  endName,
  label = "Horário",
  required = false,
  fullWidth = true,
  size = "small",
  valueStart,
  valueEnd,
  onChange,
  onBlur,
  errorStart,
  errorEnd,
  helperStart,
  helperEnd,
  showHelperText = true,
  allowClear = true,
  minHour,
  maxHour,
  sx = {},
}) => {
  // Formik (opcional)
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

  // Valores atuais
  const startVal = useMemo(
    () =>
      toDate(
        valueStart !== undefined ? valueStart : (startField as any)?.value,
      ),
    [valueStart, (startField as any)?.value],
  );
  const endVal = useMemo(
    () => toDate(valueEnd !== undefined ? valueEnd : (endField as any)?.value),
    [valueEnd, (endField as any)?.value],
  );

  // Estados de abertura
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  // Controle para abrir sempre o segundo após aceitar o primeiro
  const [openEndPending, setOpenEndPending] = useState(false);

  // Drafts (rascunho até confirmar)
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);

  // Efeito: abre segundo quando pending
  useEffect(() => {
    if (!openStart && openEndPending) {
      setDraftEnd(endVal);
      setOpenEnd(true);
      setOpenEndPending(false);
    }
  }, [openStart, openEndPending, endVal]);

  // Erros / helpers
  const dErrStart = isFormik
    ? !!(startMeta as any)?.touched && !!(startMeta as any)?.error
    : !!errorStart;
  const dErrEnd = isFormik
    ? !!(endMeta as any)?.touched && !!(endMeta as any)?.error
    : !!errorEnd;
  const dHelpStart = isFormik
    ? (startMeta as any)?.touched && (startMeta as any)?.error
    : helperStart;
  const dHelpEnd = isFormik
    ? (endMeta as any)?.touched && (endMeta as any)?.error
    : helperEnd;
  const incompleteRequired =
    required && ((startVal && !endVal) || (!startVal && endVal));
  const anyError = dErrStart || dErrEnd || incompleteRequired;
  const mergedHelper =
    (dErrStart && dHelpStart) ||
    (dErrEnd && dHelpEnd) ||
    (incompleteRequired && "Intervalo incompleto") ||
    "";

  const setFieldVal = useCallback(
    (field: string, date: Date | null) => {
      if (isFormik) {
        formik!.setFieldValue(field, date ? toStr(date) : "");
        formik!.setFieldTouched(field, true, true);
      }
    },
    [formik, isFormik],
  );

  const commitNotify = (s: Date | null, e: Date | null) => {
    onChange?.(s ? toStr(s) : null, e ? toStr(e) : null);
    onBlur?.();
  };

  const openFlow = () => {
    setDraftStart(startVal);
    setOpenStart(true);
  };

  const acceptStart = (d: Date | null) => {
    const finalStart = d || draftStart || startVal || null;
    let finalEnd = endVal;
    if (finalStart && finalEnd && isAfter(finalStart, finalEnd)) {
      finalEnd = null;
      setFieldVal(endName, null);
    }
    setFieldVal(startName, finalStart);
    setOpenStart(false);
    // sempre agenda abertura do segundo se houver horário inicial
    if (finalStart) setOpenEndPending(true);
    commitNotify(finalStart, finalEnd);
  };

  const acceptEnd = (d: Date | null) => {
    let finalEnd = d || draftEnd || endVal || null;
    let finalStart = startVal || draftStart || null;
    if (finalEnd && finalStart && isAfter(finalStart, finalEnd)) {
      finalStart = finalEnd;
      setFieldVal(startName, finalStart);
    }
    setFieldVal(endName, finalEnd);
    setOpenEnd(false);
    setOpenEndPending(false);
    commitNotify(finalStart, finalEnd);
  };

  const clearAll = () => {
    if (isFormik) {
      formik!.setFieldValue(startName, "");
      formik!.setFieldValue(endName, "");
      formik!.setFieldTouched(startName, true, true);
      formik!.setFieldTouched(endName, true, true);
    }
    onChange?.(null, null);
    setDraftStart(null);
    setDraftEnd(null);
    setOpenStart(false);
    setOpenEnd(false);
    setOpenEndPending(false);
  };

  const displayValue = useMemo(() => {
    if (!startVal && !endVal) return "";
    if (startVal && !endVal) return `${toStr(startVal)} - `;
    return `${toStr(startVal)} - ${toStr(endVal)}`;
  }, [startVal, endVal]);

  const minTime = useMemo(() => toDate(minHour || ""), [minHour]);
  const maxTime = useMemo(() => toDate(maxHour || ""), [maxHour]);

  // Toolbar simples reutilizável
  const RangeToolbar = ({
    title,
    onClose,
  }: {
    title: string;
    onClose: () => void;
  }) => (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, pt: 1.5, pb: 1 }}
    >
      <Typography fontSize={14} fontWeight={600} color="#181C32">
        {title}
      </Typography>
      <IconButton size="small" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  );

  return (
    <Stack spacing={0.5} sx={{ width: fullWidth ? "100%" : "auto", ...sx }}>
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
        placeholder="HH:mm - HH:mm"
        error={!!anyError}
        fullWidth={fullWidth}
        onClick={openFlow}
        sx={{
          borderRadius: "7px",
          cursor: "pointer",
          fontSize: "14px",
          minHeight: 40,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: anyError ? "" : "#C8CCD7",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: anyError ? "" : "#C8CCD7",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: anyError ? "" : "#C8CCD7",
          },
          pr: 0.5,
        }}
        endAdornment={
          <InputAdornment position="end" sx={{ gap: 0.5 }}>
            {allowClear && (startVal || endVal) && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                sx={{ width: 30, height: 30 }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openFlow();
              }}
              sx={{ width: 30, height: 30 }}
            >
              <AccessTimeIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </InputAdornment>
        }
      />

      {/* Picker Início */}
      <MobileTimePicker
        open={openStart}
        value={draftStart}
        onOpen={() => {
          setDraftStart(startVal);
          setOpenStart(true);
        }}
        onClose={() => {
          setOpenStart(false);
          if (!startVal) setOpenEndPending(false);
        }}
        onChange={(d) =>
          setDraftStart(
            d
              ? typeof (d as any).toDate === "function"
                ? (d as any).toDate()
                : d
              : null,
          )
        }
        onAccept={(d) =>
          acceptStart(
            d
              ? typeof (d as any).toDate === "function"
                ? (d as any).toDate()
                : d
              : null,
          )
        }
        ampm={false}
        minutesStep={5}
        minTime={minTime || undefined}
        maxTime={maxTime || undefined}
        localeText={{
          cancelButtonLabel: "Cancelar",
          okButtonLabel: "Confirmar",
        }}
        slots={{
          toolbar: () => (
            <RangeToolbar
              title={`${label} - início`}
              onClose={() => {
                setOpenStart(false);
                if (!startVal) setOpenEndPending(false);
              }}
            />
          ),
        }}
        slotProps={{
          actionBar: { actions: ["cancel", "accept"] },
          textField: { sx: { display: "none" } },
        }}
      />

      {/* Picker Fim */}
      <MobileTimePicker
        open={openEnd}
        value={draftEnd}
        onOpen={() => {
          setDraftEnd(endVal);
          setOpenEnd(true);
        }}
        onClose={() => {
          setOpenEnd(false);
          setOpenEndPending(false);
        }}
        onChange={(d) =>
          setDraftEnd(
            d
              ? typeof (d as any).toDate === "function"
                ? (d as any).toDate()
                : d
              : null,
          )
        }
        onAccept={(d) =>
          acceptEnd(
            d
              ? typeof (d as any).toDate === "function"
                ? (d as any).toDate()
                : d
              : null,
          )
        }
        ampm={false}
        minutesStep={5}
        minTime={startVal || minTime || undefined}
        maxTime={maxTime || undefined}
        localeText={{
          cancelButtonLabel: "Cancelar",
          okButtonLabel: "Confirmar",
        }}
        slots={{
          toolbar: () => (
            <RangeToolbar
              title={`${label} - fim`}
              onClose={() => {
                setOpenEnd(false);
                setOpenEndPending(false);
              }}
            />
          ),
        }}
        slotProps={{
          actionBar: { actions: ["cancel", "accept"] },
          textField: { sx: { display: "none" } },
        }}
      />

      {showHelperText && anyError && mergedHelper && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {mergedHelper}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default HoursRangeComponent;
