import { Box, InputLabel, Typography } from "@mui/material";

interface FieldOnlyViewProps {
  label: string;
  value: string | number;
  direction?: "row" | "column";
  padding?: string;
}
export const FieldOnlyView = (props: FieldOnlyViewProps) => {
  const { label, value, direction = "row", padding } = props;

  return (
    <Box display="flex" flexDirection={direction} gap={padding || "5px"}>
      <InputLabel
        sx={{
          marginBottom: padding || "4px",
          fontWeight: "600",
          fontSize: "14px",
          color: "#3F4254",
        }}
      >
        {label}
      </InputLabel>
      <Typography variant="body2" color="#646968">
        {value}
      </Typography>
    </Box>
  );
};
