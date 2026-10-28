import { Typography } from "@mui/material";

const FormSectionTitle = ({ title }: { title: string }) => (
  <Typography
    variant="subtitle1"
    fontWeight={700}
    sx={{ color: "text.primary", mb: 2 }}
  >
    {title}
  </Typography>
);

export default FormSectionTitle;
