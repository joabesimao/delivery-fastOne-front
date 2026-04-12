import { Box, Typography } from "@mui/material";
import { useCallback } from "react";
import { IoMdAlert } from "react-icons/io";
import { MdCloudUpload } from "react-icons/md";
import { useDropzone } from "react-dropzone";
import { Button } from "@mui/material";

const ImportFile = ({
  setSelectedFile,
  selectedFile,
}: {
  setSelectedFile: (file: File | null) => void;
  selectedFile: File | null;
}) => {
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
  });
  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #07A7DF",
          borderRadius: 3,
          p: {
            xs: 2,
            sm: 8,
          },
          textAlign: "center",
          cursor: "pointer",
          bgcolor: isDragActive ? "#E6F0FA" : "#F7FAFE",
          "&:hover": {
            bgcolor: "#F1F5FB",
          },
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            bgcolor: "#E6F0FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 0.5,
          }}
        >
          <MdCloudUpload size={30} color="#07A7DF" />
        </Box>
        <Box sx={{ mb: 0.5 }}>
          <Typography sx={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            Arraste e solte o arquivo aqui ou clique para selecionar
          </Typography>
        </Box>
        <Box sx={{ color: "#6C757D", fontSize: 13, mb: 1 }}>
          <Typography sx={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            Formatos suportados:{" "}
            <span style={{ color: "#07A7DF", fontWeight: "bold" }}>
              .csv ou .xlsx
            </span>
          </Typography>
        </Box>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#E0E0E0",
            color: "#000",
            textTransform: "none",
            px: 4,
            mb: 2,
          }}
        >
          {selectedFile ? "Alterar Arquivo" : "Selecionar Arquivo"}
        </Button>
        {selectedFile && (
          <Box sx={{ mt: 0.3, fontSize: 13 }}>
            <Typography sx={{ wordBreak: "break-word", whiteSpace: "normal" }}>
              Arquivo selecionado:{" "}
              <span style={{ fontWeight: "bold" }}>{selectedFile.name}</span>
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          mt: 1,
          p: 2,
          borderRadius: 2,
          bgcolor: "#ECF4FC",
          color: "#07A7DF",
          fontSize: 13,
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <IoMdAlert size={20} color="#07A7DF" style={{ flexShrink: 0 }} />
        <Typography
          sx={{ wordBreak: "break-word", whiteSpace: "normal", flex: 1 }}
        >
          {" "}
          Certifique-se de que o arquivo segue o modelo padrão de importação
          para evitar erros de processamento.
        </Typography>
      </Box>
    </>
  );
};

export default ImportFile;
