import type { ReactNode } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import type { DistributionItem } from "../../domain/deliveryDistribution";
import DonutChart from "./DonutChart";

interface DistributionCardProps {
  title: string;
  subtitle: ReactNode;
  data: DistributionItem[];
}

const DistributionCard = ({ title, subtitle, data }: DistributionCardProps) => (
  <Card sx={{ height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
      <DonutChart data={data} height={300} />
    </CardContent>
  </Card>
);

export default DistributionCard;
