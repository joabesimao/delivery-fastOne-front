import React from "react";
import { Box, Typography, IconButton, OutlinedInput } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useFormikContext, useField } from "formik";

interface CounterInputProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  sx?: object;
  readOnly?: boolean;
}

const CounterInputComponent: React.FC<CounterInputProps> = ({
  name,
  label,
  min = 0,
  max = 99,
  value: valueProp,
  onChange: onChangeProp,
  disabled = false,
  sx = {},
  readOnly = false,
}) => {
  const formik = (() => {
    try {
      return useFormikContext<any>();
    } catch {
      return undefined;
    }
  })();
  const isFormikContext = !!formik && !!name;
  const [field, , helpers] = isFormikContext
    ? useField<number>(name)
    : [null, null, null];

  const value = isFormikContext ? (field?.value ?? 0) : (valueProp ?? 0);
  const setValue = isFormikContext
    ? (val: number) => helpers?.setValue(val)
    : (onChangeProp ?? (() => {}));

  const handleDecrease = () => {
    if (value > min) setValue(value - 1);
  };

  const handleIncrease = () => {
    if (value < max) setValue(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= min && val <= max) {
      setValue(val);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #E3E4E6",
        borderRadius: "8px",
        padding: "8px 12px",
        width: "100%",
        ...sx,
      }}
    >
      <Typography
        sx={{
          flex: 1,
          color: "#373A43",
          fontWeight: 500,
          fontSize: "16px",
        }}
      >
        {label}
      </Typography>

      <IconButton
        size="small"
        onClick={handleDecrease}
        disabled={disabled || value <= min || readOnly}
        sx={{
          marginRight: 1,
          border: "1px solid #E3E4E6",
          borderRadius: "4px",
          height: "23px",
          width: "23px",
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <OutlinedInput
        type="number"
        value={value}
        size="small"
        onChange={handleInputChange}
        sx={{
          textAlign: "center",
          fontWeight: 500,
          fontSize: "16px",
          "& input": { textAlign: "center", p: 0 },
        }}
        inputProps={{
          min,
          max,
          style: { textAlign: "center", padding: 0 },
        }}
        slotProps={{
          input: {
            readOnly: readOnly,
          },
        }}
        disabled={disabled}
        name={name}
        onFocus={(e) => e.target.select()}
      />
      <IconButton
        size="small"
        onClick={handleIncrease}
        disabled={disabled || value >= max || readOnly}
        sx={{
          marginLeft: 1,
          border: "1px solid #E3E4E6",
          borderRadius: "4px",
          height: "23px",
          width: "23px",
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default CounterInputComponent;
