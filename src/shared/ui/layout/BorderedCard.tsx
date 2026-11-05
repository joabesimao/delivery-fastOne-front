import { Card, type CardProps } from "@mui/material";

const BorderedCard = ({ sx, ...props }: CardProps) => (
  <Card
    {...props}
    sx={[
      { borderRadius: 3, border: 1, borderColor: "divider" },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);

export default BorderedCard;
