import React, { useState, useMemo, useContext } from "react";
import {
  OutlinedInput,
  InputLabel,
  FormHelperText,
  OutlinedInputProps,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { FormikContext } from "formik";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface GlobalInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: object;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string | false;
  InputProps?: Partial<
    OutlinedInputProps & {
      startAdornment?: React.ReactNode;
      endAdornment?: React.ReactNode;
    }
  >;
  slotProps?: {
    input?: React.InputHTMLAttributes<HTMLInputElement>;
  };
  size?: "small" | "medium";
  showHelperText?: boolean;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  maxRows?: number;
  minRows?: number;
  rows?: number;
  readOnly?: boolean;
  maxLengthDefault?: number;
  minLengthDefault?: number;
  passwordToggle?: boolean;
  useFormik?: boolean;
}

const GlobalInput: React.FC<GlobalInputProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  fullWidth = true,
  sx = {},
  value: valueProp,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  error: errorProp,
  helperText: helperTextProp,
  size = "small",
  showHelperText = true,
  required = false,
  disabled = false,
  multiline = false,
  maxRows,
  minRows,
  rows,
  readOnly = false,
  minLengthDefault = 0,
  maxLengthDefault = 100,
  passwordToggle = true,
  useFormik = true,
  ...props
}) => {
  const formik = useFormik ? useContext(FormikContext) : null;
  const isFormikContext = useFormik && !!formik;
  const fieldProps = isFormikContext ? formik!.getFieldProps(name) : undefined;
  const fieldMeta = isFormikContext ? formik!.getFieldMeta(name) : undefined;

  const value =
    valueProp !== undefined
      ? valueProp
      : isFormikContext
        ? fieldProps?.value
        : "";
  const onChange =
    onChangeProp !== undefined
      ? onChangeProp
      : isFormikContext
        ? fieldProps?.onChange
        : undefined;
  const onBlur =
    onBlurProp !== undefined
      ? onBlurProp
      : isFormikContext
        ? fieldProps?.onBlur
        : undefined;
  const onFocus = onFocusProp;
  const error =
    errorProp !== undefined
      ? errorProp
      : isFormikContext
        ? fieldMeta?.touched && Boolean(fieldMeta?.error)
        : false;
  const helperText =
    helperTextProp !== undefined
      ? helperTextProp
      : isFormikContext
        ? (fieldMeta as any)?.error
        : "";

  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const togglePassword = () => setShowPassword((p) => !p);

  const startAdornment = props.InputProps?.startAdornment;
  const customEndAdornment = props.InputProps?.endAdornment;

  const passwordEndAdornment = useMemo(
    () =>
      isPassword && passwordToggle ? (
        <InputAdornment position="end">
          <IconButton
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onClick={disabled ? undefined : togglePassword}
            edge="end"
            tabIndex={-1}
            size="small"
            disabled={disabled}
            sx={disabled ? { cursor: "not-allowed", opacity: 0.5 } : undefined}
          >
            {showPassword ? (
              <VisibilityOff fontSize="small" />
            ) : (
              <Visibility fontSize="small" />
            )}
          </IconButton>
        </InputAdornment>
      ) : null,
    [isPassword, passwordToggle, showPassword, disabled],
  );

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <InputLabel
        required={required}
        htmlFor={name}
        sx={{
          marginBottom: "4px",
          fontWeight: "600",
          fontSize: "14px",
          "& .MuiInputLabel-asterisk": {
            color: "#6C757D",
          },
        }}
      >
        {label}
      </InputLabel>
      <OutlinedInput
        id={name}
        name={name}
        type={actualType}
        disabled={disabled}
        placeholder={disabled && isPassword ? "********" : placeholder}
        value={value !== undefined && value !== null ? value : ""}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        error={error}
        fullWidth={fullWidth}
        size={size}
        required={required}
        multiline={multiline}
        {...(multiline
          ? typeof minRows === "number" || typeof maxRows === "number"
            ? { minRows, maxRows }
            : typeof rows === "number"
              ? { rows }
              : {}
          : {})}
        sx={{
          borderRadius: "7px",
          "& fieldset": { borderRadius: "7px" },
          "&:focus-within fieldset": { borderRadius: "7px" },
          "& input::placeholder": {
            fontSize: "14px",
          },
          fontSize: "14px",
          ...(readOnly
            ? { "& input": { caretColor: "transparent", cursor: "default" } }
            : {}),
          ...sx,
        }}
        startAdornment={startAdornment as any}
        endAdornment={passwordEndAdornment || (customEndAdornment as any)}
        slotProps={{
          input: {
            readOnly: readOnly,
            maxLength: maxLengthDefault,
            minLength: minLengthDefault,
            ...(props.slotProps?.input || {}),
          } as any,
        }}
        inputProps={{
          "data-field": name,
        }}
        {...(props.InputProps || {})}
      />
      {showHelperText && error && helperText && (
        <FormHelperText error sx={{ marginLeft: "14px", marginTop: "4px" }}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};

export default GlobalInput;
