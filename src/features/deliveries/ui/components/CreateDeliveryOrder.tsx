import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useClientRegisters } from "@/features/clients";
import { deliverymanFullName, useDeliverymen } from "@/features/deliverymen";
import { ROUTES } from "@/shared/config/routes";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import {
  toCreateDeliveryInput,
  toPreloadedOrderClient,
  type DeliveryOrderClient,
  type DeliveryOrderFormValues,
  type PreloadedDeliveryClient,
} from "../../domain/deliveryOrder";
import { useCreateDelivery } from "../../application/deliveryQueries";
import { useDeliverySheetPrinter } from "../../application/useDeliverySheetPrinter";
import DeliveryOrderForm from "./DeliveryOrderForm";
import DeliverySheetDocument from "./DeliverySheetDocument";
import DeliverySheetOptions from "./DeliverySheetOptions";

interface CreateDeliveryOrderProps {
  embedded?: boolean;
  preloadedClient?: PreloadedDeliveryClient | null;
  onClose?: () => void;
}

const CreateDeliveryOrder = ({
  embedded = false,
  preloadedClient = null,
  onClose,
}: CreateDeliveryOrderProps) => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();
  const registersQuery = useClientRegisters();
  const deliverymen = useDeliverymen().data;
  const createDelivery = useCreateDelivery();
  const {
    sheetRef,
    sheet,
    format,
    setFormat,
    skipPreview,
    setSkipPreview,
    print,
  } = useDeliverySheetPrinter();

  const initialClient = useMemo(
    () => toPreloadedOrderClient(preloadedClient),
    [preloadedClient],
  );
  const deliverymanOptions = useMemo(
    () =>
      (deliverymen ?? []).map((d) => ({
        value: String(d.id),
        label: deliverymanFullName(d),
      })),
    [deliverymen],
  );

  const handleSubmit = (
    values: DeliveryOrderFormValues,
    client: DeliveryOrderClient,
  ) =>
    runWithFeedback(
      async () => {
        const input = toCreateDeliveryInput(values, client.registerId);
        const { id } = await createDelivery.mutateAsync(input);
        await print({
          orderId: id,
          createdAt: new Date().toISOString(),
          client,
          quantity: input.quantity,
          amount: input.amount,
        });
      },
      {
        success: "Pedido criado com sucesso!",
        error: "Erro ao criar pedido. Tente novamente.",
      },
    );

  const goToRegisterClient = () => navigate(ROUTES.registerClient);

  const form = (
    <DeliveryOrderForm
      initialClient={initialClient}
      registers={registersQuery.data ?? []}
      registersLoading={registersQuery.isPending}
      deliverymanOptions={deliverymanOptions}
      onSubmit={handleSubmit}
      sheetOptions={
        <DeliverySheetOptions
          format={format}
          onFormatChange={setFormat}
          skipPreview={skipPreview}
          onSkipPreviewChange={setSkipPreview}
        />
      }
    />
  );

  return (
    <>
      {embedded ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon fontSize="small" />}
              onClick={goToRegisterClient}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 12.5,
              }}
            >
              Cadastrar novo cliente
            </Button>
          </Box>
          {form}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            maxWidth: 960,
            mx: "auto",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={goToRegisterClient}
              sx={{
                bgcolor: "#0ea5e9",
                "&:hover": { bgcolor: "#0284c7" },
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Cadastrar cliente
            </Button>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "text.primary" }}
            >
              Novo pedido de entrega
            </Typography>
            {onClose ? (
              <IconButton onClick={onClose} size="small" aria-label="fechar">
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : (
              <Box sx={{ width: 40 }} />
            )}
          </Box>
          <Divider sx={{ mb: 4 }} />
          {form}
        </Paper>
      )}

      {sheet && (
        <DeliverySheetDocument ref={sheetRef} sheet={sheet} format={format} />
      )}
    </>
  );
};

export default CreateDeliveryOrder;
