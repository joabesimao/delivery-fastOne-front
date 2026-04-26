import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { useFormik } from "formik";

interface Field {
  name: string;
  label: string;
  type?: string;
}

interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  fields: Field[];
  onSubmit: (values: Record<string, any>) => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  handleClose,
  title,
  fields,
  onSubmit,
}) => {
  const formik = useFormik({
    initialValues: fields.reduce(
      (acc, field) => {
        acc[field.name] = "";
        return acc;
      },
      {} as Record<string, string>,
    ),
    onSubmit,
  });

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          {fields.map((field) => (
            <TextField
              key={field.name}
              fullWidth
              margin="normal"
              label={field.label}
              type={field.type || "text"}
              name={field.name}
              value={formik.values[field.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched[field.name] && Boolean(formik.errors[field.name])
              }
              helperText={
                formik.touched[field.name] && formik.errors[field.name]
              }
            />
          ))}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button variant="contained" color="primary" type="submit">
              Enviar
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CustomModal;
