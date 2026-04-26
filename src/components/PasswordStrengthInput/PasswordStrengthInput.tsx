import React, { useMemo } from "react";
import {
  Box,
  LinearProgress,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PatternInput from "../PatternInput";
import { SvgIcons } from "../SvgIcons";

interface PasswordStrengthInputProps {
  name: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string | false;
  showHelperText?: boolean;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  sx?: object;
  showStrengthIndicator?: boolean;
  showPasswordToggle?: boolean;
  size?: "small" | "medium";
  showLockIcon?: boolean;
}

const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, label: "", color: "" };

  const criteria = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&]/.test(password),
  ];

  const strength = criteria.filter(Boolean).length;

  const levels = [
    { max: 2, strength: 33, label: "Fraca", color: "#f44336" },
    { max: 4, strength: 66, label: "Média", color: "#ff9800" },
    { max: 6, strength: 100, label: "Forte", color: "#4caf50" },
  ];

  const level =
    levels.find((l) => strength <= l.max) || levels[levels.length - 1];

  return { strength: level.strength, label: level.label, color: level.color };
};

const PasswordStrengthInput: React.FC<PasswordStrengthInputProps> = ({
  name,
  label,
  placeholder = "Digite sua senha",
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  showHelperText = true,
  required = false,
  disabled = false,
  fullWidth = true,
  showStrengthIndicator = true,
  showPasswordToggle = true,
  showLockIcon = true,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(value || ""),
    [value],
  );

  const startAdornment = showLockIcon ? (
    <InputAdornment position="start">
      <img
        src={SvgIcons.LockIcon}
        alt="senha"
        style={{ width: "20px", height: "20px" }}
      />
    </InputAdornment>
  ) : undefined;

  const endAdornment = showPasswordToggle ? (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={() => setShowPassword(!showPassword)}
        edge="end"
        size="small"
        disabled={disabled}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : undefined;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <PatternInput
        name={name}
        label={label}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        error={error}
        helperText={helperText}
        showHelperText={showHelperText}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        InputProps={{
          startAdornment,
          endAdornment,
        }}
      />

      {showStrengthIndicator && value && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={passwordStrength.strength}
            sx={{
              height: 6,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: passwordStrength.color,
                borderRadius: 5,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: passwordStrength.color,
              fontWeight: 600,
              mt: 0.5,
              display: "block",
            }}
          >
            {passwordStrength.label}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthInput;
