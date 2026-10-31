import { Box, Grid } from "@mui/material";
import InfoField from "@/shared/ui/InfoField";
import type { DeliveryOrderClient } from "../../domain/deliveryOrder";

const SelectedClientCard = ({ client }: { client: DeliveryOrderClient }) => {
  const { address } = client;
  const fields = [
    { label: "Nome", value: client.name, size: 6 },
    { label: "Telefone", value: client.phone, size: 6 },
    {
      label: "Endereço",
      value: `${address.street}, ${address.numberHouse}`,
      size: 6,
    },
    {
      label: "Bairro / Cidade",
      value: `${address.neighborhood} - ${address.city}`,
      size: 6,
    },
    {
      label: "Referência",
      value: address.reference || "Sem referência",
      size: 12,
    },
  ];

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid key={field.label} size={{ xs: 12, sm: field.size }}>
            <InfoField label={field.label} value={field.value} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SelectedClientCard;
