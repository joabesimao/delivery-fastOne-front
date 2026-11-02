import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import {
  parseIntervalKm,
  useOilChangeConfig,
  useSaveOilChangeConfig,
} from "@/features/oil-changes";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import { useToast } from "@/shared/ui/feedback/useToast";
import OilChangeIntervalForm from "../components/OilChangeIntervalForm";
import SettingsPanel from "../components/SettingsPanel";

const FleetSettingsPage = () => {
  const toast = useToast();
  const runWithFeedback = useActionFeedback();
  const configQuery = useOilChangeConfig();
  const saveConfig = useSaveOilChangeConfig();

  useEffect(() => {
    if (configQuery.isError) toast.error("Erro ao carregar configuração.");
  }, [configQuery.isError, toast]);

  const handleSave = (value: string) => {
    const intervalKm = parseIntervalKm(value);
    if (intervalKm === null) {
      toast.error("Informe um intervalo de km válido.");
      return;
    }
    void runWithFeedback(() => saveConfig.mutateAsync({ intervalKm }), {
      success: "Configuração salva com sucesso!",
      error: "Erro ao salvar configuração. Tente novamente.",
    });
  };

  return (
    <SettingsPanel title="Configurações de frota">
      {configQuery.isPending ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <OilChangeIntervalForm
          initialIntervalKm={String(configQuery.data?.intervalKm ?? "")}
          saving={saveConfig.isPending}
          onSave={handleSave}
        />
      )}
    </SettingsPanel>
  );
};

export default FleetSettingsPage;
