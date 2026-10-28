import { Typography } from "@mui/material";

const FieldLabel = ({ label }: { label: string }) => (
  <Typography
    variant="body2"
    fontWeight={500}
    sx={{ mb: 0.5, color: "text.secondary" }}
  >
    {label}
  </Typography>
);

export default FieldLabel;
