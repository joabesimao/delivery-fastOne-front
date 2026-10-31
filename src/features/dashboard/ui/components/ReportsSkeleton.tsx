import { Card, CardContent, Grid, Skeleton } from "@mui/material";

const ReportsSkeleton = () => (
  <Grid container spacing={2.5}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={`stat-${index}`}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="rounded" height={42} sx={{ my: 2 }} />
            <Skeleton variant="text" width="75%" />
          </CardContent>
        </Card>
      </Grid>
    ))}
    {Array.from({ length: 3 }).map((_, index) => (
      <Grid size={{ xs: 12, lg: 4 }} key={`chart-${index}`}>
        <Card sx={{ height: 340 }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton
              variant="circular"
              width={220}
              height={220}
              sx={{ mx: "auto", my: 3 }}
            />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default ReportsSkeleton;
