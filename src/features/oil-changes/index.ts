export type { OilChange } from "./domain/oilChange";
export { oilChangeKeys } from "./application/oilChangeQueries";
export { default as OilChangesPage } from "./ui/pages/OilChangesPage";
export { default as RegisterOilChangePage } from "./ui/pages/RegisterOilChangePage";
export { parseIntervalKm } from "./domain/oilChangeConfig";
export {
  useOilChangeConfig,
  useSaveOilChangeConfig,
} from "./application/oilChangeConfigQueries";
