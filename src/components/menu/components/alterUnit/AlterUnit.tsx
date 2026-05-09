import { useState, useRef } from "react";
import ModalConfirm from "@/components/modalConfirm";
import { Stack } from "@mui/system";
import { useAuth } from "@/hooks/globalState/auth/useAuth";
import { RoleEnum } from "@/hooks/globalState/auth/roles";
import { useNavigate } from "react-router-dom";
import { useTitle } from "@/hooks/globalState/titleHeader/useTitle";
import AutocompleteComponent, {
  Option,
} from "@/components/AutocompleteComponent";
import { useUnitRoles } from "@/hooks/users/useUnitRoles";
import { Formik, Form } from "formik";
import { useToast } from "@/hooks/useToast";
import { getUsersMe } from "@/hooks/users/useUsersMe";
import { useListPublicSchools } from "@/hooks/schools/useListPublicSchools";
import { useQueryClient } from "@tanstack/react-query";

import * as Yup from "yup";
interface AlterUnitProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  unit_id: string;
  unit_name: string;
  profile_id: string;
}

const validationSchema = (isSuperAdminOrAdmin: boolean) =>
  Yup.object({
    unit_id: !isSuperAdminOrAdmin
      ? Yup.string().required("Unidade é obrigatória")
      : Yup.string().notRequired(),

    profile_id: !isSuperAdminOrAdmin
      ? Yup.string().required(
          "Perfil é obrigatório, primeiro selecione a unidade",
        )
      : Yup.string().notRequired(),
  });

const AlterUnit = ({ open, onClose }: AlterUnitProps) => {
  const user = useAuth((s) => s.user);
  const { setUser } = useAuth.getState();
  const profileCurrent = useAuth((s) => s.profileUser);
  const isSuperAdminOrAdmin =
    profileCurrent?.is_root ||
    user?.userRole?.find(
      (item) =>
        item?.role?.slug === RoleEnum.SUPER_ADMIN ||
        item?.role?.slug === RoleEnum.ADMIN,
    );
  const loginWithUnit = useAuth((s) => s.loginWithUnit);
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    data: unitRoles,
    isLoading: isLoadingUnitRoles,
    isError: isErrorUnitRoles,
  } = useUnitRoles({ id: user?.id ? Number(user.id) : null });

  const {
    data: unitPublic = [],
    isLoading: loadingUnitsPublic,
    isError: isErrorUnitPublic,
  } = useListPublicSchools({ includeUnitOne: true });
  const setProfileUser = useAuth((s) => s.setProfileUser);
  const navigateRouter = useNavigate();

  const formikRef = useRef<any>(null);
  const initiaListRoles = loginWithUnit.hasUnit
    ? unitRoles?.data?.units?.find(
        (unit: any) => unit?.id === loginWithUnit?.unit,
      )?.roles
    : [];

  const [selectedUnitRoles, setSelectedUnitRoles] =
    useState<Option[]>(initiaListRoles);

  const handleAlterPerfil = async (values: FormValues) => {
    try {
      const roleSelected = selectedUnitRoles.find(
        (role) => role.id === Number(values.profile_id),
      );
      localStorage.setItem("unit_id", values?.unit_id);

      const response = await getUsersMe({
        unit: Number(values.unit_id) || null,
      });

      setUser(response?.data);
      const setLoginWithUnit = useAuth.getState().setLoginWithUnit;
      const unitFromResponse = response?.data?.unit;
      const unitFromRole = values.unit_id
        ? response?.data?.userRole?.find(
            (ur: any) => String(ur?.unit?.id) === String(values.unit_id),
          )?.unit
        : null;
      const effectiveUnit = unitFromResponse || unitFromRole || null;
      setLoginWithUnit({
        hasUnit: !!effectiveUnit?.id,
        unit: effectiveUnit?.id || null,
        name: effectiveUnit?.name || values.unit_name || "",
      });

      if (roleSelected) {
        const profileUserLocal = {
          roleId: roleSelected?.id as number,
          roleName: roleSelected?.name,
          slug: roleSelected?.slug as RoleEnum,
          is_root: roleSelected?.is_root ?? false,
        };
        setProfileUser(profileUserLocal as any);
        const landing = useAuth.getState().getDefaultLanding?.();
        if (landing) {
          useTitle.getState().setMenuTitle(landing.title);
          navigateRouter(landing.path);
        }
      } else if (isSuperAdminOrAdmin && profileCurrent) {
        setProfileUser({ ...profileCurrent });
        const landing = useAuth.getState().getDefaultLanding?.();
        if (landing) {
          useTitle.getState().setMenuTitle(landing.title);
          navigateRouter(landing.path);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["unit"] });
      onClose();
    } catch {
      toast.error("Erro ao alterar perfil");
    }
  };

  const initialValues: FormValues = {
    unit_id: loginWithUnit?.unit?.toString() || "",
    profile_id: profileCurrent?.roleId?.toString() || "",
    unit_name: loginWithUnit?.name?.toString() || "",
  };

  return (
    <>
      <ModalConfirm
        open={open}
        handleClose={() => {
          setSelectedUnitRoles(initiaListRoles);
          onClose();
        }}
        title="Alterar Unidade"
        handleConfirm={() => {
          if (formikRef.current) {
            formikRef.current.submitForm();
          }
        }}
        children={
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema(!!isSuperAdminOrAdmin)}
            onSubmit={handleAlterPerfil}
          >
            {({ setFieldValue }) => {
              const unitOptions =
                unitRoles?.data?.units?.map((un: any) => ({
                  id: un?.id,
                  name: un?.name,
                  roles: un?.roles ?? [],
                })) || [];

              return (
                <Form>
                  <Stack spacing={1}>
                    <AutocompleteComponent
                      required={!!isSuperAdminOrAdmin}
                      hasFormik={true}
                      name="unit_id"
                      label="Unidade"
                      placeholder="Selecione a unidade"
                      options={isSuperAdminOrAdmin ? unitPublic : unitOptions}
                      loading={
                        isSuperAdminOrAdmin
                          ? !isErrorUnitPublic && loadingUnitsPublic
                          : !isErrorUnitRoles && isLoadingUnitRoles
                      }
                      onChange={(_, value: any) => {
                        if (value && !Array.isArray(value)) {
                          setFieldValue("unit_id", value.id.toString());
                          setSelectedUnitRoles(value?.roles || []);
                          setFieldValue("profile_id", "");
                          setFieldValue("unit_name", value.name);
                        } else {
                          setFieldValue("unit_id", "");
                          setFieldValue("unit_name", "");
                          setSelectedUnitRoles([]);
                          setFieldValue("profile_id", "");
                        }
                      }}
                    />
                    <Stack display={isSuperAdminOrAdmin ? "none" : "flex"}>
                      <AutocompleteComponent
                        required={!!isSuperAdminOrAdmin}
                        hasFormik={true}
                        name="profile_id"
                        label="Selecione o perfil"
                        placeholder="Selecione um perfil"
                        options={selectedUnitRoles || []}
                        loading={false}
                        onChange={(_, value: any) => {
                          if (value && !Array.isArray(value)) {
                            setFieldValue("profile_id", value.id.toString());
                          } else {
                            setFieldValue("profile_id", "");
                          }
                        }}
                      />
                    </Stack>
                  </Stack>
                </Form>
              );
            }}
          </Formik>
        }
      />
    </>
  );
};
export default AlterUnit;
