import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { NotificationsRoot } from "@/features/notifications";
import PageLoader from "@/shared/ui/PageLoader";
import AppShell from "./AppShell";

const ProtectedLayout = () => (
  <NotificationsRoot>
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  </NotificationsRoot>
);

export default ProtectedLayout;
