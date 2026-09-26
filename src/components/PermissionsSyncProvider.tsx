import { useEffect } from "react";
import { useAuth } from "@/hooks/globalState/auth/useAuth";
import { usePermissions } from "@/hooks/globalState/permissions/usePermissions";
import { useGetPermissions } from "@/hooks/modules/useGetPermissions";
import { ModuleEnumType } from "@/types/permissions";

export const PermissionsSyncProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const profileUser = useAuth((s) => s.profileUser);
  const profileVersion = useAuth((s) => s.profileVersion);
  const setPermissions = usePermissions((s) => s.setPermissions);
  const clearPermissions = usePermissions((s) => s.clearPermissions);

  const hasToken =
    typeof window !== "undefined" && localStorage.getItem("accessToken");

  const { data: apiPermissions = [], refetch } = useGetPermissions({
    roleId: profileUser?.roleId && hasToken ? profileUser.roleId : undefined,
  });

  useEffect(() => {
    if (profileUser?.roleId && hasToken) {
      refetch();
    } else if (!profileUser?.roleId) {
      clearPermissions();
    }
  }, [
    profileUser?.roleId,
    profileVersion,
    hasToken,
    refetch,
    clearPermissions,
  ]);

  useEffect(() => {
    if (apiPermissions && apiPermissions.length > 0) {
      const mapPermission = (perm: any): any => ({
        ...perm,
        module: perm.module as ModuleEnumType,
        actions: perm.actions?.map((action: any) => ({
          ...action,
        })),
        children: perm.children?.map(mapPermission),
      });

      const mappedPermissions = apiPermissions.map(mapPermission);
      setPermissions(mappedPermissions);
    }
  }, [apiPermissions, setPermissions]);

  return <>{children}</>;
};
