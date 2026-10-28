import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import NotificationsProvider from "@/modules/notifications/NotificationsProvider";
import PageLoader from "@/shared/ui/PageLoader";
import AppShell from "./AppShell";

const ProtectedLayout = () => (
  <NotificationsProvider>
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  </NotificationsProvider>
);

export default ProtectedLayout;
