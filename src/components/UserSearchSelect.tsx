import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import InfiniteScrollAutocomplete from "./InfiniteScrollAutocomplete";
import { useInfiniteListUsers } from "@/hooks/users/useInfiniteListUsers";

export interface UserOption {
  id: string | number;
  name: string;
  email?: string;
  [key: string]: any;
}

interface UserSearchSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: UserOption | null;
  onChange?: (value: UserOption | null) => void;
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
  role_id?: number | string;
  limit?: number;
  disableClearable?: boolean;
  onSearchChange?: (searchTerm: string) => void;
  debounceTime?: number;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  name,
  label,
  placeholder = "Digite para buscar usuário...",
  value,
  onChange,
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
  role_id,
  limit = 10,
  disableClearable = false,
  onSearchChange,
  debounceTime = 500,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (onSearchChange) {
        onSearchChange(searchTerm);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceTime, onSearchChange]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
  } = useInfiniteListUsers(
    {
      limit,
      role_id,
      name: debouncedSearchTerm || undefined,
    },
    {
      enabled: isOpen,
    },
  );

  const transformData = (rawData: any): UserOption[] => {
    if (!rawData?.pages) return [];
    return rawData.pages.flatMap((page: any) =>
      (page.data || []).map((user: any) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
      })),
    );
  };

  const renderOptionContent = (option: UserOption) => (
    <>
      <Box sx={{ fontWeight: 500 }}>{option.name}</Box>
      {option.email && (
        <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          {option.email}
        </Box>
      )}
    </>
  );

  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string,
    reason: string,
  ) => {
    if (reason === "input") {
      setSearchTerm(newInputValue);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <InfiniteScrollAutocomplete<UserOption>
      name={name}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onInputChange={handleInputChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      size={size}
      showHelperText={showHelperText}
      required={required}
      disabled={disabled}
      tooltip={tooltip}
      readOnly={readOnly}
      fullWidth={fullWidth}
      sx={sx}
      sxInputLabel={sxInputLabel}
      disableClearable={disableClearable}
      data={data}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetching={isFetching}
      isLoading={isLoading}
      onOpen={handleOpen}
      onClose={handleClose}
      getOptionLabel={(option) => option.name}
      getOptionKey={(option) => option.id}
      renderOptionContent={renderOptionContent}
      transformData={transformData}
      noOptionsText={
        searchTerm && !isFetching
          ? "Nenhum usuário encontrado"
          : "Digite para buscar"
      }
      loadingText="Carregando usuários..."
    />
  );
};

export default UserSearchSelect;
