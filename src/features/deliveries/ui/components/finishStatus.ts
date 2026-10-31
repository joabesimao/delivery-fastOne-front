import type { DeliveryStatus } from "../../domain/delivery";

export const FINISH_STATUS_LABEL: Record<DeliveryStatus, string> = {
  actived: "Ativo",
  delivered: "Em entrega",
  finished: "Finalizado",
};

export const FINISH_STATUS_COLOR: Record<
  DeliveryStatus,
  { bg: string; darkBg: string; text: string; darkText: string; border: string }
> = {
  actived: {
    bg: "#E8ECFF",
    darkBg: "rgba(67,97,238,0.15)",
    text: "#4361EE",
    darkText: "#818cf8",
    border: "#C7D2FE",
  },
  delivered: {
    bg: "#FFF7E6",
    darkBg: "rgba(217,119,6,0.15)",
    text: "#D97706",
    darkText: "#fbbf24",
    border: "#FDE68A",
  },
  finished: {
    bg: "#ECFDF5",
    darkBg: "rgba(5,150,105,0.15)",
    text: "#059669",
    darkText: "#34d399",
    border: "#A7F3D0",
  },
};

export const FINISH_STATUS_OPTIONS = (
  Object.keys(FINISH_STATUS_LABEL) as DeliveryStatus[]
).map((value) => ({ value, label: FINISH_STATUS_LABEL[value] }));
