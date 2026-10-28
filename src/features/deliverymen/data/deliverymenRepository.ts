import httpClient from "@/shared/api/httpClient";
import type { DeliverymanSummary } from "../domain/deliveryman";

export const deliverymenRepository = {
  async list(): Promise<DeliverymanSummary[]> {
    const { data } = await httpClient.get<DeliverymanSummary[]>("/deliveryman");
    return Array.isArray(data) ? data : [];
  },
};
