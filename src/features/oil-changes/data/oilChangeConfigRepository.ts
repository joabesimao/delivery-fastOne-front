import httpClient from "@/shared/api/httpClient";
import type { OilChangeConfig } from "../domain/oilChangeConfig";

export const oilChangeConfigRepository = {
  async get(): Promise<OilChangeConfig | null> {
    const { data } = await httpClient.get<OilChangeConfig | null>(
      "/oil-change-config",
    );
    return data ?? null;
  },

  async save(config: OilChangeConfig): Promise<void> {
    await httpClient.put("/oil-change-config", config);
  },
};
