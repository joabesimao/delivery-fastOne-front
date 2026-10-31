import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { closeRealtimeSocket } from "@/shared/realtime/realtimeSocket";
import { session } from "@/shared/session/session";

export const useLogout = () => {
  const navigate = useNavigate();
  return () => {
    closeRealtimeSocket();
    session.clear();
    navigate(ROUTES.login, { replace: true });
  };
};
