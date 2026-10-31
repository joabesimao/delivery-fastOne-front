export type { RegisteredClient } from "./domain/clientRegistration";
export type {
  ClientRegister,
  ClientRegisterAddress,
} from "./domain/clientRegister";
export { clientKeys, useClientRegisters } from "./application/clientQueries";
export { default as RegisterClientPage } from "./ui/pages/RegisterClientPage";
