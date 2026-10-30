import { useRef, type ChangeEvent } from "react";
import { Box, Button, IconButton, Paper, Stack } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { validateProductImageFile } from "../../domain/product";

interface ProductImagePickerProps {
  preview: string | null;
  onSelect: (dataUrl: string, mimeType: string) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}

const ProductImagePicker = ({
  preview,
  onSelect,
  onRemove,
  onError,
}: ProductImagePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const invalidReason = validateProductImageFile(file);
    if (invalidReason) {
      onError(invalidReason);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onSelect(reader.result, file.type);
    };
    reader.onerror = () => onError("Falha ao ler a imagem.");
    reader.readAsDataURL(file);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
      {preview && (
        <Paper
          variant="outlined"
          sx={{
            position: "relative",
            width: 120,
            height: 120,
            borderRadius: 2,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={preview}
            alt="Pré-visualização do produto"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}
      <Button
        variant="outlined"
        size="small"
        startIcon={<PhotoCameraOutlinedIcon />}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? "Alterar imagem" : "Adicionar imagem"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </Stack>
  );
};

export default ProductImagePicker;
