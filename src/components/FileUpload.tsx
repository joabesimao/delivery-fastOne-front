import React, { useEffect } from "react";
import { Box, Typography, InputLabel, IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SvgIcons from "./SvgIcons";

interface FileUploadProps {
  required?: boolean;
  name?: string;
  label?: string;
  accept?: string;
  helperText?: string;
  maxSizeMB?: number;
  onChange: (files: File[] | File | null) => void;
  value?: File[] | File | null;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  multiple?: boolean;
  maxFiles?: number;
  existingFiles?: { file_path: string; file_url?: string }[];
  onRemoveExistingFile?: (index: number) => void;
  error?: boolean;
  errorMessage?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  required = false,
  name,
  label = "Anexar documento",
  accept = ".pdf,.jpg,.jpeg,.png",
  helperText = "Formatos aceitos: PDF, JPG, JPEG, PNG (máx. 5MB)",
  maxSizeMB = 5,
  onChange,
  value,
  disabled = false,
  fullWidth = true,
  size = "small",
  multiple = false,
  maxFiles = 10,
  existingFiles = [],
  onRemoveExistingFile,
  error = false,
  errorMessage,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);

  useEffect(() => {
    if (multiple) {
      setFiles(Array.isArray(value) ? value : value ? [value] : []);
    }
  }, [value, multiple]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (multiple) {
      const currentFiles = Array.isArray(value) ? value : value ? [value] : [];

      if (currentFiles.length + selectedFiles.length > maxFiles) {
        alert(`Você pode adicionar no máximo ${maxFiles} arquivos`);
        return;
      }

      const validFiles = selectedFiles.filter((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(
            `O arquivo ${file.name} excede o tamanho máximo de ${maxSizeMB}MB`,
          );
          return false;
        }
        return true;
      });

      const newFiles = [...currentFiles, ...validFiles];
      onChange(newFiles);
    } else {
      const file = selectedFiles[0] || null;
      if (file && file.size > maxSizeMB * 1024 * 1024) {
        alert(`O arquivo deve ter no máximo ${maxSizeMB}MB`);
        onChange(null);
        return;
      }
      onChange(file);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (indexOrEvent: number | React.MouseEvent) => {
    if (multiple && typeof indexOrEvent === "number") {
      const currentFiles = Array.isArray(value) ? value : [];
      const newFiles = currentFiles.filter((_, i) => i !== indexOrEvent);
      onChange(newFiles.length > 0 ? newFiles : []);
    } else if (!multiple) {
      const e = indexOrEvent as React.MouseEvent;
      e.stopPropagation();
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const canAddMore = multiple
    ? files.length + existingFiles.length < maxFiles
    : !value;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <InputLabel
        htmlFor={name}
        required={required}
        sx={{
          marginBottom: "4px",
          fontWeight: "600",
          fontSize: "14px",
          color: error ? "#F53B3B" : "inherit",
        }}
      >
        {label}
      </InputLabel>
      <Box
        sx={{
          width: fullWidth ? "100%" : "auto",
          border: error ? "1px solid #F53B3B" : "1px solid #C8CCD7",
          borderRadius: "8px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          px: 2,
          py: size === "small" ? 1 : 2,
          cursor: disabled || !canAddMore ? "not-allowed" : "pointer",
          transition: "border-color 0.2s",
          opacity: !canAddMore ? 0.6 : 1,
          "&:hover": {
            borderColor: error ? "#F53B3B" : canAddMore ? "#C8CCD7" : undefined,
          },
          "&:focus-within": { borderColor: error ? "#F53B3B" : "#C8CCD7" },
        }}
        onClick={() => !disabled && canAddMore && inputRef.current?.click()}
      >
        <img
          src={SvgIcons.Upload}
          alt="upload"
          style={{ width: "18px", height: "18px", marginRight: "10px" }}
        />
        <Typography
          sx={{
            color: "#646968",
            flex: 1,
            fontWeight: "500",
            fontSize: "14px",
          }}
        >
          {multiple
            ? files.length + existingFiles.length > 0
              ? `${
                  files.length + existingFiles.length
                } arquivo(s) selecionado(s)`
              : "Selecionar arquivo"
            : value && !Array.isArray(value)
              ? value.name
              : "Selecionar arquivo"}
        </Typography>
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={disabled}
        />
      </Box>
      <Typography
        sx={{ color: error ? "#F53B3B" : "#A0A4A8", fontSize: "12px", mt: 0.5 }}
      >
        {error && errorMessage
          ? errorMessage
          : multiple
            ? `${helperText} (máx. ${maxFiles} arquivos)`
            : helperText}
      </Typography>

      {multiple && (files.length > 0 || existingFiles.length > 0) && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {existingFiles.map((file, index) => {
            const isImage = file.file_path.match(/\.(jpg|jpeg|png|gif)$/i);
            const previewUrl = isImage && file.file_url ? file.file_url : null;
            const extension = file.file_path.split(".").pop();
            const displayName = `Foto.${extension}`;

            return (
              <Stack
                key={`existing-${index}`}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  p: 1.5,
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                  backgroundColor: "#F9F9F9",
                }}
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #E0E0E0",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "4px",
                      border: "1px solid #E0E0E0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#E0E0E0",
                    }}
                  >
                    <Typography sx={{ fontSize: "10px", color: "#666" }}>
                      FILE
                    </Typography>
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#181C32",
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => {
                    if (onRemoveExistingFile) {
                      onRemoveExistingFile(index);
                      return;
                    }
                    const currentFiles = Array.isArray(value) ? value : [];
                    const newFiles = currentFiles.filter((_, i) => i !== index);
                    onChange(newFiles.length > 0 ? newFiles : []);
                  }}
                  size="small"
                  sx={{
                    color: "#'F53B3B",
                    "&:hover": { backgroundColor: "#F53B3B10" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            );
          })}
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const previewUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  p: 1.5,
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                  backgroundColor: "#F9F9F9",
                }}
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #E0E0E0",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "4px",
                      border: "1px solid #E0E0E0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#E0E0E0",
                    }}
                  >
                    <Typography sx={{ fontSize: "10px", color: "#666" }}>
                      FILE
                    </Typography>
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#181C32",
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#A0A4A8",
                    }}
                  >
                    tamanho: {Math.round(file.size / 1024)}kb
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => handleRemove(index)}
                  size="small"
                  sx={{
                    color: "#F53B3B",
                    "&:hover": {
                      backgroundColor: "#F53B3B10",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            );
          })}
        </Stack>
      )}

      {!multiple &&
        value &&
        !Array.isArray(value) &&
        value.type.startsWith("image/") && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: 2,
              p: 1.5,
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              backgroundColor: "#F9F9F9",
            }}
          >
            <Box
              component="img"
              src={URL.createObjectURL(value)}
              alt="Preview"
              sx={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid #E0E0E0",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#181C32",
                  mb: 0.5,
                }}
              >
                {value.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#A0A4A8",
                }}
              >
                tamanho: {Math.round(value.size / 1024)}kb
              </Typography>
            </Box>
            <IconButton
              onClick={handleRemove}
              size="small"
              sx={{
                color: "#F53B3B",
                "&:hover": {
                  backgroundColor: "#F53B3B10",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
    </Box>
  );
};

export default FileUpload;
