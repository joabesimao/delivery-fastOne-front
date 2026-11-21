import { session } from "@/shared/session/session";
import { isDeliveryman } from "../domain/credentials";

export const endDeliverymanWebSession = (): boolean => {
  if (!isDeliveryman(session.getUser().role)) return false;
  session.clear();
  return true;
};
