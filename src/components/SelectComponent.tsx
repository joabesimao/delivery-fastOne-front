import React, { useState, useCallback } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  SelectProps,
  IconButton,
  Box,
} from "@mui/material";
import { useField, useFormikContext } from "formik";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectComponentProps extends Omit<SelectProps, "value" | "error"> {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  fullWidth?: boolean;
  sx?: object;
  value?: any;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  error?: boolean;
  helperText?: string | false;
  size?: "small" | "medium";
  showHelperText?: boolean;
  required?: boolean;
  selectedLabel?: string;
  useFormik?: boolean;
  disableClearable?: boolean;
  hideMenuItems?: boolean;
}

const CustomExpandMoreIcon = () => (
  <ExpandMoreIcon sx={{ color: "#C8CCD7", width: "40px" }} />
);

const CustomExpandLessIcon = () => (
  <ExpandLessIcon sx={{ color: "#C8CCD7", width: "40px" }} />
);

const SelectComponent: React.FC<SelectComponentProps> = ({
  name,
  label,
  options,
  placeholder = "Selecione uma opção",
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
  selectedLabel,
  useFormik = true,
  disableClearable = false,
  hideMenuItems = true,
  ...props
}) => {
  const formik = useFormikContext();
  const isFormikContext = !!formik;
  const hasExternalControl =
    valueProp !== undefined || onChangeProp !== undefined;
  const [field, meta] = isFormikContext ? useField(name) : [null, null];
  const [isOpen, setIsOpen] = useState(false);

  const value = hasExternalControl
    ? valueProp
    : isFormikContext
      ? field?.value
      : valueProp;
  const onBlur = hasExternalControl
    ? onBlurProp
    : isFormikContext
      ? field?.onBlur
      : onBlurProp;
  const hasValue = Boolean(value);

  const selectPaddingRight =
    size === "small"
      ? hasValue
        ? "60px"
        : "40px"
      : hasValue
        ? "68px"
        : "48px";

  const clearIconRight = size === "small" ? "10px" : "12px";
  const handleChange = useCallback(
    (e: any) => {
      if (onChangeProp) {
        onChangeProp(e);
      } else if (isFormikContext && field?.onChange) {
        field.onChange(e);
      }
      setIsOpen(false);
    },
    [onChangeProp, isFormikContext, field],
  );

  const error = isFormikContext
    ? meta?.touched && Boolean(meta?.error)
    : errorProp;
  const helperText = isFormikContext ? meta?.error : helperTextProp;

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const syntheticEvent = {
      target: { value: "", name },
    } as any;
    handleChange(syntheticEvent);
  };

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <InputLabel
        htmlFor={name}
        required={required}
        sx={{ marginBottom: "4px", fontWeight: "600", fontSize: "14px" }}
      >
        {label}
      </InputLabel>
      <Box sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}>
        <Select
          id={name}
          name={name}
          value={value || ""}
          onChange={handleChange}
          onBlur={onBlur}
          displayEmpty
          fullWidth={fullWidth}
          size={size}
          required={required}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          error={error}
          IconComponent={isOpen ? CustomExpandLessIcon : CustomExpandMoreIcon}
          renderValue={(selected) => {
            if (!selected) {
              if (selectedLabel) {
                return selectedLabel;
              }

              return (
                <span style={{ color: "#A4A4A4", fontSize: "14px" }}>
                  {placeholder}
                </span>
              );
            }
            const optionLabel = options.find(
              (o) => o.value === selected,
            )?.label;

            if (optionLabel) {
              return optionLabel;
            }

            if (selectedLabel) {
              return selectedLabel;
            }

            return selected;
          }}
          sx={{
            borderRadius: "7px",
            fontSize: "14px",
            "& .MuiSelect-select": {
              paddingRight: selectPaddingRight,
            },
            "& fieldset": {
              borderRadius: "7px",
              borderColor: error ? "" : "#C8CCD7",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "" : "#C8CCD7",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "" : "#C8CCD7",
            },
            "& .MuiSelect-icon": {
              display: hasValue ? "none" : "block",
            },
            ...sx,
          }}
          {...props}
        >
          {hideMenuItems && (
            <MenuItem
              disabled
              value=""
              sx={{ color: "#A4A4A4", fontSize: "14px" }}
            >
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              sx={{ fontSize: "14px" }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {hasValue && !disableClearable && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              position: "absolute",
              right: clearIconRight,
              top: "50%",
              transform: "translateY(-50%)",
              width: "24px",
              height: "24px",
              padding: "5px",
              borderRadius: "4px",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "18px", color: "#7E8299" }} />
          </IconButton>
        )}
      </Box>
      {showHelperText && error && helperText && (
        <FormHelperText error sx={{ marginLeft: "14px", marginTop: "4px" }}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};

export default SelectComponent;
