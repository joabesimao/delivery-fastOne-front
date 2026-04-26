import { useCallback, useMemo } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import type { LoadOptions } from "react-select-async-paginate";
import type {
  GroupBase,
  StylesConfig,
  SingleValue,
  MultiValue,
} from "react-select";
import {
  Box,
  InputLabel,
  FormHelperText,
  Tooltip,
  Button,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";

export interface InfiniteOption {
  id: string | number;
  name: string;
  [key: string]: any;
}

export interface PaginatedApiResponse<T = any> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

interface SelectOption {
  value: string | number;
  label: string;
  original: InfiniteOption;
}

const toSelectOption = (opt: InfiniteOption): SelectOption => ({
  value: opt.id,
  label: opt.name,
  original: opt,
});

const fromSelectOption = (opt: SelectOption): InfiniteOption => opt.original;

type Additional = { page: number };

const INITIAL_ADDITIONAL: Additional = { page: 1 };

interface InfiniteScrollSelectProps<T = any> {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: InfiniteOption | InfiniteOption[] | null;
  onChange: (value: InfiniteOption | InfiniteOption[] | null) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string | false;
  showHelperText?: boolean;
  disabled?: boolean;
  tooltip?: string;
  isMulti?: boolean;
  fetchOptions: (params: {
    search: string;
    page: number;
  }) => Promise<PaginatedApiResponse<T>>;
  mapOption: (item: T) => InfiniteOption;
  debounceTimeout?: number;
  showAddButton?: boolean;
  onAddButtonClick?: () => void;
  addButtonLabel?: string;
  fullWidth?: boolean;
  menuPortalTarget?: HTMLElement | null;
}

const InfiniteScrollSelect = <T = any,>({
  name,
  label,
  placeholder = "Selecione uma opção",
  required = false,
  value,
  onChange,
  onBlur,
  error = false,
  helperText,
  showHelperText = true,
  disabled = false,
  tooltip = "",
  isMulti = false,
  fetchOptions,
  mapOption,
  debounceTimeout = 300,
  showAddButton = false,
  onAddButtonClick,
  addButtonLabel = "Adicionar",
  fullWidth = true,
  menuPortalTarget,
}: InfiniteScrollSelectProps<T>) => {
  const loadOptions: LoadOptions<
    SelectOption,
    GroupBase<SelectOption>,
    Additional
  > = useCallback(
    async (inputValue, _loadedOptions, additional) => {
      const page = additional?.page ?? 1;
      try {
        const response = await fetchOptions({ search: inputValue, page });
        const options = response.data.map((item) =>
          toSelectOption(mapOption(item)),
        );
        return {
          options,
          hasMore: page < response.totalPages,
          additional: { page: page + 1 },
        };
      } catch {
        return { options: [], hasMore: false };
      }
    },
    [fetchOptions, mapOption],
  );

  const selectValue = isMulti
    ? Array.isArray(value)
      ? (value as InfiniteOption[]).map(toSelectOption)
      : []
    : value && !Array.isArray(value)
      ? toSelectOption(value as InfiniteOption)
      : null;

  const handleChange = useCallback(
    (selected: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
      if (isMulti) {
        const multi = selected as MultiValue<SelectOption>;
        onChange(multi ? multi.map(fromSelectOption) : []);
      } else {
        const single = selected as SingleValue<SelectOption>;
        onChange(single ? fromSelectOption(single) : null);
      }
    },
    [isMulti, onChange],
  );

  const styles = useMemo<
    StylesConfig<SelectOption, boolean, GroupBase<SelectOption>>
  >(() => {
    const borderColor = error ? "#d32f2f" : "#C8CCD7";
    return {
      control: (base, state) => ({
        ...base,
        minHeight: "37px",
        height: isMulti ? "auto" : "37px",
        borderRadius: "7px",
        borderColor: state.isFocused ? borderColor : borderColor,
        boxShadow: "none",
        "&:hover": { borderColor },
        fontSize: "14px",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "default",
      }),
      placeholder: (base) => ({
        ...base,
        fontSize: "14px",
        color: "#aaa",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "8px",
        zIndex: 9999,
        boxShadow:
          "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
      }),
      menuList: (base) => ({
        ...base,
        padding: "4px 0",
        maxHeight: "220px",
      }),
      option: (base, state) => ({
        ...base,
        fontSize: "14px",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        cursor: "pointer",
        backgroundColor: state.isSelected
          ? "rgba(25, 118, 210, 0.08)"
          : state.isFocused
            ? "rgba(0, 0, 0, 0.04)"
            : "transparent",
        color: "rgba(0, 0, 0, 0.87)",
        "&:active": { backgroundColor: "rgba(25, 118, 210, 0.16)" },
      }),
      input: (base) => ({
        ...base,
        fontSize: "14px",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        margin: 0,
        padding: 0,
      }),
      singleValue: (base) => ({
        ...base,
        fontSize: "14px",
        color: "rgba(0, 0, 0, 0.87)",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        borderRadius: "16px",
      }),
      multiValueLabel: (base) => ({
        ...base,
        fontSize: "13px",
        paddingLeft: "8px",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      }),
      multiValueRemove: (base) => ({
        ...base,
        borderRadius: "0 16px 16px 0",
        cursor: "pointer",
        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.15)", color: "inherit" },
      }),
      valueContainer: (base) => ({
        ...base,
        padding: isMulti ? "4px 8px" : "2px 8px",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "#C8CCD7",
        padding: "4px",
        "&:hover": { color: "#C8CCD7" },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "#C8CCD7",
        padding: "4px",
        "&:hover": { color: "#9e9e9e" },
      }),
      indicatorSeparator: () => ({ display: "none" }),
      loadingMessage: (base) => ({
        ...base,
        fontSize: "14px",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      }),
      noOptionsMessage: (base) => ({
        ...base,
        fontSize: "14px",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };
  }, [error, isMulti, disabled]);

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      {/* Label row */}
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
                sx={{ fontSize: 18, cursor: "pointer", color: "#BCBCBC" }}
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
              "&:hover": { bgcolor: "rgba(7, 167, 223, 0.08)" },
            }}
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>

      <AsyncPaginate
        inputId={name}
        value={selectValue}
        onChange={handleChange}
        loadOptions={loadOptions}
        isMulti={isMulti}
        isDisabled={disabled}
        placeholder={placeholder}
        debounceTimeout={debounceTimeout}
        additional={INITIAL_ADDITIONAL}
        styles={styles}
        onBlur={onBlur}
        menuPosition="fixed"
        menuPortalTarget={menuPortalTarget}
        loadingMessage={() => "Carregando..."}
        noOptionsMessage={() => "Nenhuma opção encontrada"}
        isClearable
      />

      {showHelperText && error && helperText && (
        <FormHelperText error sx={{ marginLeft: "14px", marginTop: "4px" }}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};

export default InfiniteScrollSelect;
