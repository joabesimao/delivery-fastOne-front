import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Stack, InputLabel, FormHelperText } from "@mui/material";
import { debounce as muiDebounce } from "@mui/material/utils";

export interface ColorPickerComponentProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (color: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  fullWidth?: boolean;
  height?: number;
  randomOnInit?: boolean;
  disabled?: boolean;
  sx?: any;
  debounceDelay?: number;
  error?: boolean;
  helperText?: string;
  showHelperText?: boolean;
}

const generateRandomColor = () => {
  const letters = "3456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
};

// Nova função de validação de cor hex
const isValidHexColor = (val?: string | null) =>
  typeof val === "string" &&
  /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(val.trim());

const ColorPickerComponent: React.FC<ColorPickerComponentProps> = ({
  label = "Cor",
  name,
  value,
  onChange,
  onBlur,
  required = false,
  fullWidth = true,
  height = 35,
  randomOnInit = true,
  disabled = false,
  sx = {},
  debounceDelay = 0,
  error = false,
  helperText,
  showHelperText = true,
}) => {
  const didInitRef = useRef(false);

  const [internalColor, setInternalColor] = useState<string>(
    isValidHexColor(value) ? (value as string) : "#509CDB",
  );

  const darkenColor = useCallback((hex: string, amount = 0.18) => {
    if (!hex || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4))
      return hex;
    let r: number, g: number, b: number;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
    return (
      "#" +
      [r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }, []);

  useEffect(() => {
    if (!didInitRef.current) {
      if (isValidHexColor(value)) {
        setInternalColor(value as string);
      } else if (randomOnInit) {
        const rnd = generateRandomColor();
        setInternalColor(rnd);
        onChange?.(rnd);
      } 
      didInitRef.current = true;
      return;
    }

    if (isValidHexColor(value) && value !== internalColor) {
      setInternalColor(value as string);
    }
  }, [value, randomOnInit, internalColor, onChange]);

  const darkerBorder = darkenColor(
    isValidHexColor(internalColor) ? internalColor : "#509CDB",
  );
  const borderColor = error ? "#d32f2f" : internalColor;
  const hoverBorderColor = error ? "#b71c1c" : darkerBorder;

  const emitChange = useCallback(
    (newColor: string) => {
      if (!isValidHexColor(newColor)) return; // não aceita valor inválido
      setInternalColor(newColor);
      onChange?.(newColor);
    },
    [onChange],
  );

  const debouncedEmit = useCallback(
    // eslint-disable-next-line react-hooks/use-memo
    debounceDelay > 0 ? muiDebounce(emitChange, debounceDelay) : emitChange,
    [emitChange, debounceDelay],
  );

  return (
    <Stack width={fullWidth ? "100%" : "auto"}>
      {label && (
        <InputLabel
          htmlFor={name}
          required={required}
          sx={{
            marginBottom: "4px",
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            "& .MuiInputLabel-asterisk": {
              marginLeft: "-4px",
              color: "#6C757D",
            },
          }}
        >
          {label}
        </InputLabel>
      )}
      <Box
        sx={{
          width: "100%",
          height: `${height}px`,
          borderRadius: "4px",
          overflow: "hidden",
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          border: `1px solid ${borderColor}`,
          transition: "border-color 0.15s ease",
          "&:hover": !disabled
            ? { border: `1px solid ${hoverBorderColor}` }
            : {},
          ...sx,
        }}
      >
        <input
          id={name}
          name={name}
          type="color"
          disabled={disabled}
          value={internalColor}
          onChange={(e) => {
            const val = e.target.value;
            // Garante somente cores válidas antes de propagar
            if (debounceDelay > 0) {
              if (isValidHexColor(val)) debouncedEmit(val);
            } else {
              emitChange(val);
            }
          }}
          onBlur={onBlur}
          style={{
            width: "150%",
            height: "150%",
            position: "absolute",
            top: "-25%",
            left: "-25%",
            padding: 0,
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: "transparent",
          }}
        />
      </Box>
      {showHelperText && error && helperText && (
        <FormHelperText error sx={{ marginLeft: "0px", marginTop: "4px" }}>
          {helperText}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default ColorPickerComponent;
