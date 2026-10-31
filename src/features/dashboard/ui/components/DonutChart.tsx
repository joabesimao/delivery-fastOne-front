import { Box, useTheme } from "@mui/material";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import {
  sumValues,
  type DistributionItem,
} from "../../domain/deliveryDistribution";

const COLORS = [
  "#4361EE",
  "#17D6A3",
  "#FFC107",
  "#FF6B6B",
  "#6C5CE7",
  "#07A7DF",
  "#A0A0A0",
];

const RADIAN = Math.PI / 180;

const makePercentLabel =
  (fill: string) =>
  ({ cx, cy, midAngle, outerRadius, percent }: PieLabelRenderProps) => {
    if (
      !percent ||
      midAngle == null ||
      cx == null ||
      cy == null ||
      outerRadius == null
    ) {
      return null;
    }
    const radius = Number(outerRadius) + 18;
    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={fill}
        textAnchor={x > Number(cx) ? "start" : "end"}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

interface DonutChartProps {
  data: DistributionItem[];
  height?: number;
}

const DonutChart = ({ data, height = 300 }: DonutChartProps) => {
  const theme = useTheme();
  const total = sumValues(data);

  if (!data.length) {
    return (
      <Box
        sx={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        Nenhum dado disponível
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 24, right: 32, bottom: 24, left: 32 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          label={makePercentLabel(theme.palette.text.primary)}
          labelLine={{ stroke: theme.palette.divider }}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            [
              `${value as number} (${total > 0 ? (((value as number) / total) * 100).toFixed(1) : 0}%)`,
              "Entregas",
            ] as [string, string]
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
