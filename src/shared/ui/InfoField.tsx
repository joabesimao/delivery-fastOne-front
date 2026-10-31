import { Box, Typography } from "@mui/material";

interface InfoFieldProps {
  label: string;
  value: string;
}

const InfoField = ({ label, value }: InfoFieldProps) => (
  <Box>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} sx={{ color: "text.primary" }}>
      {value}
    </Typography>
  </Box>
);

export default InfoField;
