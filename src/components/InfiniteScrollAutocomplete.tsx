import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Autocomplete,
  TextField,
  InputLabel,
  FormHelperText,
  Tooltip,
  CircularProgress,
  Box,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export interface InfiniteScrollOption {
  id: string | number;
  [key: string]: any;
}

interface InfiniteScrollAutocompleteProps<T extends InfiniteScrollOption> {
  name: string;
  label?: string;
  placeholder?: string;
  value?: T | null;
  onChange?: (value: T | null) => void;
  onInputChange?: (
    event: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string | false;
  size?: "small" | "medium";
  showHelperText?: boolean;
  required?: boolean;
  disabled?: boolean;
  tooltip?: string;
  readOnly?: boolean;
  fullWidth?: boolean;
  sx?: object;
  sxInputLabel?: object;
  disableClearable?: boolean;

  // Props para controle de dados infinitos
  data?: any;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
  onOpen?: () => void;
  onClose?: () => void;

  // Props para personalização
  getOptionLabel: (option: T) => string;
  getOptionKey?: (option: T) => string | number;
  renderOptionContent?: (option: T) => React.ReactNode;
  transformData?: (rawData: any) => T[];
  noOptionsText?: string;
  loadingText?: string;
}

const CustomExpandMoreIcon = () => <ExpandMoreIcon sx={{ color: "#C8CCD7" }} />;
const CustomExpandLessIcon = () => <ExpandLessIcon sx={{ color: "#C8CCD7" }} />;

function InfiniteScrollAutocomplete<T extends InfiniteScrollOption>({
  name,
  label,
  placeholder = "Digite para buscar...",
  value,
  onChange,
  onInputChange,
  onBlur,
  error = false,
  helperText,
  size = "small",
  showHelperText = true,
  required = false,
  disabled = false,
  tooltip = "",
  readOnly = false,
  fullWidth = true,
  sx = {},
  sxInputLabel = {},
  disableClearable = false,

  // Props de dados
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  isLoading,
  onOpen,
  onClose,

  // Props de personalização
  getOptionLabel,
  getOptionKey,
  renderOptionContent,
  transformData,
  noOptionsText = "Nenhum resultado encontrado",
  loadingText = "Carregando...",
}: InfiniteScrollAutocompleteProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Transformar os dados usando a função fornecida ou retornar array vazio
  const options: T[] = useMemo(() => {
    if (!data) return [];

    if (transformData) {
      return transformData(data);
    }

    // Se não houver transformData, assume que data.pages existe (padrão React Query infinite)
    if (data.pages) {
      return data.pages.flatMap((page: any) => page.data || []);
    }

    return [];
  }, [data, transformData]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (
        target.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetching &&
        fetchNextPage
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isFetching],
  );

  useEffect(() => {
    if (!isOpen || !options.length) return;

    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, isOpen, options.length]);

  const handleChange = (_event: React.SyntheticEvent, newValue: T | null) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string,
    reason: string,
  ) => {
    if (onInputChange) {
      onInputChange(event, newInputValue, reason);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const defaultGetOptionKey = (option: T) => option.id;
  const optionKeyGetter = getOptionKey || defaultGetOptionKey;

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "4px",
        }}
      >
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
                <span style={{ color: "#525252", fontSize: 13 }}>
                  {tooltip}
                </span>
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
      </Box>
      <Autocomplete
        id={name}
        options={options}
        loading={isLoading || isFetching}
        readOnly={readOnly}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onBlur={handleBlur}
        open={isOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        isOptionEqualToValue={(option, value) => {
          return (
            optionKeyGetter(option)?.toString() ===
            optionKeyGetter(value)?.toString()
          );
        }}
        getOptionLabel={getOptionLabel}
        disableClearable={disableClearable}
        filterOptions={(x) => x}
        renderOption={(props, option, state) => {
          const isLast = state.index === options.length - 1;
          const key = optionKeyGetter(option);

          return (
            <li {...props} key={key}>
              <Box sx={{ width: "100%" }}>
                {renderOptionContent ? (
                  renderOptionContent(option)
                ) : (
                  <Box sx={{ fontWeight: 500 }}>{getOptionLabel(option)}</Box>
                )}
              </Box>
              {isLast && <div ref={observerTarget} style={{ height: "1px" }} />}
            </li>
          );
        }}
        ListboxProps={{
          style: { maxHeight: "300px" },
        }}
        renderInput={(params) => {
          const shouldShowPlaceholder = !value;

          return (
            <TextField
              {...params}
              placeholder={shouldShowPlaceholder ? placeholder : ""}
              error={error}
              required={required}
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {(isLoading || isFetching || isFetchingNextPage) && (
                        <CircularProgress color="inherit" size={18} />
                      )}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                },
              }}
            />
          );
        }}
        noOptionsText={noOptionsText}
        loadingText={loadingText}
        fullWidth={fullWidth}
        size={size}
        popupIcon={isOpen ? <CustomExpandLessIcon /> : <CustomExpandMoreIcon />}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "7px",
            fontSize: "14px",
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
          },
          "& .MuiAutocomplete-endAdornment": {
            top: "50%",
            transform: "translateY(-50%)",
          },
          "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator":
            {
              p: 0,
              m: 0,
              width: 25,
              height: 25,
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
              "& .MuiSvgIcon-root": {
                width: 25,
                height: 25,
              },
            },
          "& .MuiAutocomplete-clearIndicator": {
            width: 25,
            height: 25,
            "& .MuiSvgIcon-root": {
              width: 20,
              height: 20,
            },
          },
          "& .MuiAutocomplete-popupIndicator": {
            transform: "none",
          },
          "& .MuiAutocomplete-popupIndicatorOpen": {
            transform: "none",
          },
          "& .MuiInputBase-input::placeholder": {
            fontSize: "14px",
          },
          ...sx,
        }}
      />
      {showHelperText && error && helperText && (
        <FormHelperText error sx={{ marginLeft: "14px", marginTop: "4px" }}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
}

export default InfiniteScrollAutocomplete;
