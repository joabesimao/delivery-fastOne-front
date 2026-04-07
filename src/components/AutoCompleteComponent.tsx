import React, { useState, useMemo, useCallback } from "react";
import {
  Autocomplete,
  TextField,
  InputLabel,
  FormHelperText,
  Tooltip,
  Button,
  Box,
} from "@mui/material";
import { useField, useFormikContext } from "formik";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from "@mui/material/CircularProgress";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";

export interface Option {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface AutocompleteComponentProps {
  name: string;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: object;
  sxInputLabel?: object;
  value?: Option | Option[] | null;
  onChange?: (
    event: React.SyntheticEvent,
    value: Option | Option[] | null
  ) => void;
  onBlur?: (e: any) => void;
  error?: boolean;
  helperText?: string | false;
  size?: "small" | "medium";
  showHelperText?: boolean;
  required?: boolean;
  startAdornment?: React.ReactNode;
  options: Option[];
  multiple?: boolean;
  valueAsId?: boolean;
  loading?: boolean;
  disabled?: boolean;
  tooltip?: string;
  readOnly?: boolean;
  getOptionLabel?: (option: any) => string;
  hasFormik?: boolean; 
  disableClearable?: boolean;
  clearOnEscape?: boolean;
  showAddButton?: boolean;
  onAddButtonClick?: () => void;
  addButtonLabel?: string;
}

const CustomExpandMoreIcon = () => <ExpandMoreIcon sx={{ color: "#C8CCD7" }} />;

const CustomExpandLessIcon = () => <ExpandLessIcon sx={{ color: "#C8CCD7" }} />;

const AutocompleteComponent: React.FC<AutocompleteComponentProps> = ({
  name,
  label,
  placeholder = "Selecione uma opção",
  fullWidth = true,
  sx = {},
  sxInputLabel = {},
  value: valueProp,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  error: errorProp,
  helperText: helperTextProp,
  size = "small",
  showHelperText = true,
  required = false,
  startAdornment,
  options,
  multiple = false,
  valueAsId = false,
  loading,
  disabled = false,
  tooltip = "",
  readOnly = false,
  hasFormik = true,
  disableClearable,
  clearOnEscape,
  showAddButton = false,
  onAddButtonClick,
  addButtonLabel = "Adicionar",
  ...props
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formik = hasFormik ? useFormikContext() : undefined;
  const isFormikContext = !!formik;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [field, meta] = isFormikContext ? useField(name) : [null, null];

  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => {
    if (valueProp !== undefined) return valueProp;
    if (!isFormikContext) return null;
    
    if (multiple) {
      return options.filter((option) =>
        Array.isArray(field?.value)
          ? field.value.includes(option.id.toString())
          : []
      );
    }
    return options.find((option) => option.id.toString() === field?.value) || null;
  }, [valueProp, isFormikContext, multiple, options, field?.value]);

  const handleChange = useCallback((
    event: React.SyntheticEvent,
    newValue: Option | Option[] | null
  ) => {
    if (onChangeProp) {
      onChangeProp(event, newValue);
    } else if (isFormikContext) {
      if (multiple) {
        field?.onChange({
          target: {
            name,
            value: (newValue as Option[])?.map((v) => v.id.toString()) || [],
          },
        });
      } else {
        field?.onChange({
          target: {
            name,
            value: (newValue as Option)?.id.toString() || "",
          },
        });
      }
    }
  }, [onChangeProp, isFormikContext, multiple, field, name]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    if (isFormikContext) {
      formik.setFieldTouched(name, true);
    }
    if (onBlurProp) {
      onBlurProp(event);
    }
  }, [isFormikContext, formik, name, onBlurProp]);

  const error = isFormikContext
    ? meta?.touched && Boolean(meta?.error)
    : errorProp;
  const helperText = isFormikContext ? meta?.error : helperTextProp;

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "4px" }}>
        <InputLabel
          htmlFor={name}
          required={required}
          sx={{
            margin: 0,
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            "& .MuiInputLabel-asterisk": {
              marginLeft: "-4px",
              color: "#6C757D",
            },
            ...sxInputLabel,
          }}
        >
          {label}
          {tooltip && (
            <Tooltip
              title={
                <span style={{ color: "#525252", fontSize: 113 }}>{tooltip}</span>
              }
              placement="right"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#fff",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    maxWidth: 320,
                    p: 1.2,
                  },
                },
              }}
            >
              <InfoIcon
                sx={{
                  fontSize: 18,
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  color: "#BCBCBC",
                }}
              />
            </Tooltip>
          )}
        </InputLabel>
        {showAddButton && onAddButtonClick && (
          <Button
            variant="text"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddButtonClick}
            sx={{
              fontSize: "12px",
              textTransform: "none",
              color: "#07A7DF",
              "&:hover": {
                bgcolor: "rgba(7, 167, 223, 0.08)",
              },
            }}
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>
      <Autocomplete
        id={name}
        options={options}
        loading={loading}
        readOnly={readOnly}
        disabled={disabled}
        value={value}
        multiple={multiple}
        limitTags={2}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => {
          return option.id?.toString() === value.id?.toString();
        }}
        getOptionLabel={
          props.getOptionLabel || ((option: Option) => option.name)
        }
        getOptionDisabled={(option) => !!option.disabled}
        disableClearable={disableClearable}
        clearOnEscape={clearOnEscape}
        renderInput={(params) => {
          const shouldShowPlaceholder = multiple
            ? !value || (Array.isArray(value) && value.length === 0)
            : !value;

          const combinedStartAdornment = startAdornment ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "10px",
                  marginRight: "8px",
                }}
              >
                {startAdornment}
              </div>
              {params.InputProps.startAdornment}
            </>
          ) : (
            params.InputProps.startAdornment
          );

          return (
            <TextField
              {...params}
              placeholder={shouldShowPlaceholder ? placeholder : ""}
              error={error}
              required={required}
              onBlur={handleBlur}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: combinedStartAdornment,
                  sx: {
                    paddingLeft: startAdornment ? "0px" : undefined,
                  },
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                },
              }}
            />
          );
        }}
        noOptionsText="Nenhuma opção encontrada"
        fullWidth={fullWidth}
        size={size}
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        popupIcon={isOpen ? <CustomExpandLessIcon /> : <CustomExpandMoreIcon />}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '7px',
            fontSize: '14px',
            '& fieldset': {
              borderRadius: '7px',
              borderColor: error ? '' : '#C8CCD7',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? '' : '#C8CCD7',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? '' : '#C8CCD7',
            },
          },
          '& .MuiAutocomplete-endAdornment': {
            top: '50%',
            transform: 'translateY(-50%)',
          },
          '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
            p: 0,
            m: 0,
            width: 25,
            height: 25,
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
            '& .MuiSvgIcon-root': {
              width: 25,
              height: 25,
            },
          },
          '& .MuiAutocomplete-clearIndicator': {
            width: 25,
            height: 25,
            '& .MuiSvgIcon-root': {
              width: 20,
              height: 20,
            },
          },
          '& .MuiAutocomplete-popupIndicator': {
            transform: 'none',
          },
          '& .MuiAutocomplete-popupIndicatorOpen': {
            transform: 'none',
          },
          '& .MuiInputBase-input::placeholder': {
            fontSize: '14px',
          },
          ...sx,
        }}
        {...props}
      />
      {showHelperText && error && helperText && (
        <FormHelperText error sx={{ marginLeft: "14px", marginTop: "4px" }}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};

export default AutocompleteComponent;