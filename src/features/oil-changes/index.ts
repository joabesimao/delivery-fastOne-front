export type { OilChange } from "./domain/oilChange";
export { oilChangeKeys } from "./application/oilChangeQueries";
export { parseIntervalKm } from "./domain/oilChangeConfig";
export {
  useOilChangeConfig,
  useSaveOilChangeConfig,
} from "./application/oilChangeConfigQueries";
