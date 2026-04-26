import React, { useState, useMemo } from "react";
import {
  Stack,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Popover,
  Box,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatDate } from "@/helpers/formatDate";
import DateRangePickerComponent from "./DateRangePickerComponent";
import { FaFilter } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

interface FilterWithDateRangeProps {
  label?: string;
  placeholder?: string;
  onChange?: (startDate: Date | null, endDate: Date | null) => void;
  fullWidth?: boolean;
  size?: "small" | "medium";
  startName?: string;
  endName?: string;
  valueStart?: Date | null;
  valueEnd?: Date | null;
}

const FilterWithDateRange: React.FC<FilterWithDateRangeProps> = ({
  label = "Período",
  placeholder = "Período",
  onChange,
  fullWidth = true,
  size = "small",
  startName = "filterStartDate",
  endName = "filterEndDate",
  valueStart,
  valueEnd,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(valueStart ?? null);
  const [endDate, setEndDate] = useState<Date | null>(valueEnd ?? null);
  const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(
    valueStart ?? null,
  );
  const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(
    valueEnd ?? null,
  );

  // Atualiza datas se props mudarem
  React.useEffect(() => {
    if (valueStart !== undefined) {
      setStartDate(valueStart);
      setAppliedStartDate(valueStart);
    }
    if (valueEnd !== undefined) {
      setEndDate(valueEnd);
      setAppliedEndDate(valueEnd);
    }
  }, [valueStart, valueEnd]);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setStartDate(appliedStartDate);
    setEndDate(appliedEndDate);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setStartDate(appliedStartDate);
    setEndDate(appliedEndDate);
    setAnchorEl(null);
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleApply = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    onChange?.(startDate, endDate);
    handleClose();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    onChange?.(null, null);
  };

  const displayValue = useMemo(() => {
    if (!appliedStartDate && !appliedEndDate) return "";
    if (appliedStartDate && !appliedEndDate)
      return `${formatDate(appliedStartDate)} - `;
    if (!appliedStartDate && appliedEndDate)
      return ` - ${formatDate(appliedEndDate)}`;
    return `${formatDate(appliedStartDate)} - ${formatDate(appliedEndDate)}`;
  }, [appliedStartDate, appliedEndDate]);

  const hasValue = !!appliedStartDate || !!appliedEndDate;

  return (
    <Stack width={fullWidth ? "100%" : "auto"}>
      <OutlinedInput
        size={size}
        readOnly
        value={displayValue}
        placeholder={placeholder}
        fullWidth={fullWidth}
        onClick={handleClick}
        sx={{
          borderRadius: "7px",
          cursor: "pointer",
          fontSize: "14px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#C8CCD7",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#C8CCD7",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#C8CCD7",
          },
        }}
        startAdornment={
          <InputAdornment position="start">
            <FaFilter style={{ color: "#9E9E9E", fontSize: 20 }} />
          </InputAdornment>
        }
        endAdornment={
          hasValue ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  width: 24,
                  height: 24,
                  padding: "4px",
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              {!open ? (
                <IoIosArrowDown style={{ color: "#9E9E9E", fontSize: 20 }} />
              ) : (
                <IoIosArrowUp style={{ color: "#9E9E9E", fontSize: 20 }} />
              )}
            </InputAdornment>
          )
        }
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: "8px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
              minWidth: anchorEl?.offsetWidth || 300,
            },
          },
        }}
      >
        <Box>
          <DateRangePickerComponent
            startName={startName}
            endName={endName}
            label={label}
            valueStart={startDate}
            valueEnd={endDate}
            onChange={handleDateChange}
            fullWidth
            placeholderRange="Selecione o período"
            startPlaceholder="Data inicial"
            endPlaceholder="Data final"
            showHelperText={false}
          />
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            <Button variant="cancel" size="small" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="confirm" size="small" onClick={handleApply}>
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Stack>
  );
};

export default FilterWithDateRange;
