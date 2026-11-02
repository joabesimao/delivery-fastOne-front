import type { Ref } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { formatCurrency } from "@/shared/lib/format/currency";
import type {
  DeliverySheet,
  DeliverySheetFormat,
} from "../../domain/deliverySheet";
import { deliverySheetConfig } from "../../application/deliverySheetConfig";

import { COLORS } from "@/shared/theme/colors";
interface DeliverySheetDocumentProps {
  ref: Ref<HTMLDivElement>;
  sheet: DeliverySheet;
  format: DeliverySheetFormat;
}

const SHEET_WIDTH: Record<DeliverySheetFormat, string> = {
  a4: "794px",
  thermal80: "302px",
  thermal58: "219px",
};

const NOTES_LINE =
  "_________________________________________________________________________________";

const SIGNATURES = [
  "Assinatura do entregador",
  "Assinatura do cliente",
  "Data e hora do recebimento",
];

const DeliverySheetDocument = ({
  ref,
  sheet,
  format,
}: DeliverySheetDocumentProps) => {
  const isA4 = format === "a4";
  const { client } = sheet;
  const highlights = [
    { label: "Pedido", value: `#${sheet.orderId ?? "-"}` },
    { label: "Quantidade", value: sheet.quantity },
    { label: "Valor", value: formatCurrency(sheet.amount) },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        width: SHEET_WIDTH[format],
        position: "fixed",
        left: "-99999px",
        top: 0,
        bgcolor: COLORS.white,
        color: "#111",
        p: isA4 ? 4 : 1.5,
        border: "1px solid #d0d0d0",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: isA4 ? "inherit" : "11px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #111",
          pb: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: isA4 ? 24 : 15,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {deliverySheetConfig.companyName}
          </Typography>
          {deliverySheetConfig.companyDocument && (
            <Typography sx={{ fontSize: 11, color: "#444" }}>
              Documento: {deliverySheetConfig.companyDocument}
            </Typography>
          )}
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: isA4 ? 20 : 12, fontWeight: 700 }}>
            FOLHA DE ENTREGA
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#444" }}>
            Emitido em {new Date(sheet.createdAt).toLocaleString("pt-BR")}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={1.2} sx={{ mb: 2 }}>
        {highlights.map((item) => (
          <Grid key={item.label} size={{ xs: 4 }}>
            <Box sx={{ border: "1px solid #111", p: 1.2, minHeight: 62 }}>
              <Typography sx={{ fontSize: 10, color: "#555", mb: 0.3 }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: isA4 ? 18 : 13, fontWeight: 700 }}>
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ border: "1px solid #111", p: 1.5, mb: 1.5 }}>
        <Typography sx={{ fontSize: 11, color: "#555", mb: 0.6 }}>
          Cliente
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.3 }}>
          {client.name}
        </Typography>
        <Typography sx={{ fontSize: 12 }}>Telefone: {client.phone}</Typography>
      </Box>

      <Box sx={{ border: "1px solid #111", p: 1.5, mb: 1.5 }}>
        <Typography sx={{ fontSize: 11, color: "#555", mb: 0.6 }}>
          Endereço de entrega
        </Typography>
        <Typography sx={{ fontSize: 12, mb: 0.3 }}>
          {client.address.street}, {client.address.numberHouse}
        </Typography>
        <Typography sx={{ fontSize: 12, mb: 0.3 }}>
          {client.address.neighborhood} - {client.address.city}
        </Typography>
        <Typography sx={{ fontSize: 12 }}>
          Referência: {client.address.reference || "Sem referência"}
        </Typography>
      </Box>

      <Box
        sx={{
          border: "1px solid #111",
          p: 1.5,
          mb: 2.5,
          minHeight: isA4 ? 72 : 56,
        }}
      >
        <Typography sx={{ fontSize: 11, color: "#555", mb: 0.6 }}>
          Observações da entrega
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#777" }}>
          {NOTES_LINE}
        </Typography>
        {isA4 && (
          <Typography sx={{ fontSize: 12, color: "#777" }}>
            {NOTES_LINE}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mt: isA4 ? 7 : 3,
          gap: 1,
        }}
      >
        {SIGNATURES.map((label) => (
          <Box
            key={label}
            sx={{ width: "31%", borderTop: "1px solid #111", pt: 0.8 }}
          >
            <Typography variant="caption">{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DeliverySheetDocument;
