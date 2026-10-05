import { useContext } from "react";
import { NotificationsContext } from "../context/NotificationsContext";

const useNotifications = () => useContext(NotificationsContext);

export default useNotifications;
