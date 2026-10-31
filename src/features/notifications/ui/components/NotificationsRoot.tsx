import type { ReactNode } from "react";
import NotificationsProvider from "../../application/NotificationsProvider";
import NotificationToast from "./NotificationToast";

const NotificationsRoot = ({ children }: { children: ReactNode }) => (
  <NotificationsProvider>
    {children}
    <NotificationToast />
  </NotificationsProvider>
);

export default NotificationsRoot;
