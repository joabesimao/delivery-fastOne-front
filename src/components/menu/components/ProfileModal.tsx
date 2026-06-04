import { FC, memo, useCallback, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Button,
  Divider,
  Chip,
  IconButton,
  darken,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import Delete from "@mui/icons-material/Delete";
import PasswordStrengthInput from "@/components/PasswordStrengthInput/PasswordStrengthInput";

import { ProfileUser, User } from "@/hooks/globalState/auth/useAuth";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEditUser } from "@/hooks/users/useEditUser";
import { useUploadUserPhoto } from "@/hooks/users/useUploadUserPhoto";
import { useToast } from "@/hooks/useToast";
import { extractApiErrorMessage } from "@/helpers/extractApiErrorMessage";
import { parseDateOnlyLocal } from "@/helpers/formatDate";
import { isValidPhone, phoneMask, stripPhone } from "@/helpers/masks";
import GlobalInput from "@/components/InputComponent";
import DatePickerComponent from "@/components/DatePickerComponent";

export interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  profileUser: ProfileUser | null;
  setUser: (user: Partial<User>, partial?: boolean) => void;
}

interface SidebarProps {
  user: User | null;
  profileUser: ProfileUser | null;
  onUploadClick: () => void;
  onRemoveClick?: () => void;
  preview: string | null;
  showRemoveButton: boolean;
  photoMarkedForRemoval: boolean;
}

const validationSchema = Yup.object({
  nickname: Yup.string()
    .max(50, "O apelido deve ter no máximo 50 caracteres")
    .required("Apelido é obrigatório"),

  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),

  phone: Yup.string()
    .test(
      "phone-length",
      "Telefone inválido",
      (value) => isValidPhone(value ?? ""),
    )
    .required("Telefone é obrigatório"),

  password: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .notRequired(),

  old_password: Yup.string().when("password", {
    is: (password?: string) => Boolean(password),
    then: (schema) =>
      schema.required("A senha atual é obrigatória para alterar a senha"),
    otherwise: (schema) => schema.notRequired(),
  }),

  confirmNewPassword: Yup.string().when("password", {
    is: (password?: string) => Boolean(password),
    then: (schema) =>
      schema
        .required("Confirmação de senha é obrigatória")
        .oneOf([Yup.ref("password")], "As senhas devem ser iguais"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

interface FormValues {
  nickname: string;
  email: string;
  phone: string;
  old_password: string;
  password: string;
  confirmNewPassword: string;
  birthdate: Date | null;
}

const Sidebar: FC<SidebarProps> = memo(
  ({
    user,
    profileUser,
    onUploadClick,
    onRemoveClick,
    preview,
    showRemoveButton,
    photoMarkedForRemoval,
  }) => (
    <Stack
      spacing={2}
      alignItems="center"
      sx={{
        width: { xs: "100%", md: 260 },
        borderRight: { md: "1px solid" },
        borderColor: "divider",
        pr: { md: 3 },
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        Foto de Perfil
      </Typography>

      <Box sx={{ position: "relative" }}>
        <Avatar
          src={photoMarkedForRemoval ? "" : preview || user?.profilePath || ""}
          sx={{ width: 130, height: 130, bgcolor: "grey.300" }}
        />
      </Box>
      <Box gap={"5px"} display="flex" alignItems="center">
        <Tooltip title="Atualizar foto">
          <Button
            variant="contained"
            size="small"
            onClick={onUploadClick}
            startIcon={<CameraAltOutlinedIcon />}
            sx={{
              bgcolor: "#07A7DF",
              color: "#fff",
              "&:hover": {
                bgcolor: darken("#07A7DF", 0.1),
              },
            }}
          >
            Atualizar foto
          </Button>
        </Tooltip>
        {showRemoveButton && (
          <Tooltip title="Remover foto">
            <IconButton
              size="small"
              onClick={onRemoveClick}
              sx={{
                bgcolor: "#F33434FF",
                color: "#fff",
                width: 30,
                height: 30,
                padding: 2.3,
                "&:hover": {
                  bgcolor: "error.dark",
                },
              }}
            >
              <Delete sx={{ fontSize: 10 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" align="center">
        Permitido JPG, GIF ou PNG. Max 1MB.
      </Typography>
      <Stack spacing={1} alignItems="center">
        <Typography fontWeight={600}>{user?.name || ""}</Typography>
        <Typography variant="body2" color="text.secondary">
          {profileUser?.roleName || "Usuário"}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          STATUS
        </Typography>
        <Chip label="Ativo" color="success" size="small" />
      </Stack>
    </Stack>
  ),
);

Sidebar.displayName = "Sidebar";

const ProfileModal: FC<ProfileModalProps> = ({
  open,
  onClose,
  user,
  profileUser,
  setUser,
}) => {
  const toast = useToast();
  const { mutateAsync, isPending } = useEditUser();
  const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } =
    useUploadUserPhoto();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);

  const isLoading = isPending || isUploadingPhoto;

  const phone = user?.phone ? phoneMask(user.phone) : "";

  const handleOpenFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        toast.error("Nenhum arquivo selecionado");
        return;
      }

      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        toast.error("Formato inválido. Use JPG, PNG ou GIF.");
        return;
      }

      if (file.size > 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 1MB.");
        return;
      }

      setPendingPhotoFile(file);
      setPhotoMarkedForRemoval(false);
      setPreview(URL.createObjectURL(file));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [toast],
  );

  const handleFileRemove = useCallback(() => {
    setPendingPhotoFile(null);
    setPreview(null);
    setPhotoMarkedForRemoval(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const initialValues: FormValues = {
    nickname: user?.nickname || "",
    email: user?.email || "",
    phone: phone || "",
    old_password: "",
    password: "",
    confirmNewPassword: "",
    birthdate: parseDateOnlyLocal(user?.birthdate) || null,
  };

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setPendingPhotoFile(null);
      setPreview(null);
      setPhotoMarkedForRemoval(false);
      onClose();
    }
  }, [isLoading, onClose]);

  const handleSubmit = useCallback(
    async (values: FormValues): Promise<void> => {
      if (!user?.id) {
        toast.error("Usuário não encontrado");
        return;
      }

      try {
        const payload: Record<string, any> = {
          nickname: values.nickname || null,
          email: values.email,
          phone: stripPhone(values.phone),
        };

        if (values.password && values.password.trim()) {
          payload.old_password = values.old_password;
          payload.password = values.password;
        }

        if (
          payload.nickname === user.nickname &&
          payload.email === user.email &&
          payload.phone === user.phone &&
          !payload.password &&
          !pendingPhotoFile &&
          !photoMarkedForRemoval
        ) {
          toast.info("Nenhuma alteração detectada");
          return;
        }

        const updatedUser = await mutateAsync({
          payload,
          id: user.id,
        });

        if (pendingPhotoFile) {
          try {
            const response = await uploadPhoto({
              file: pendingPhotoFile,
              id: user.id,
            });
            updatedUser.data.profilePath = response.data.profilePath;
            toast.success("Foto do perfil atualizada!");
          } catch (error) {
            const messageError = extractApiErrorMessage(
              error,
              "Erro ao enviar foto:",
            );
            toast.warning(
              `Dados atualizados, mas houve erro ao enviar a foto. ${messageError}`,
            );
          }
        } else if (photoMarkedForRemoval && user.profilePath) {
          try {
            await uploadPhoto({ file: new File([], ""), id: user.id });
            updatedUser.data.profilePath = "";
            toast.success("Foto do perfil removida!");
          } catch (error) {
            const messageError = extractApiErrorMessage(
              error,
              "Erro ao remover foto:",
            );
            toast.warning(
              `Dados atualizados, mas houve erro ao remover a foto. ${messageError}`,
            );
          }
        }

        toast.success("Perfil atualizado com sucesso!");
        setUser(updatedUser.data, true);
        handleClose();
      } catch (error) {
        const errorMessage = extractApiErrorMessage(error);
        toast.error(errorMessage || "Erro ao atualizar perfil");
      }
    },
    [
      user,
      mutateAsync,
      toast,
      handleClose,
      setUser,
      pendingPhotoFile,
      photoMarkedForRemoval,
      uploadPhoto,
    ],
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="profile-dialog-title"
      aria-describedby="profile-dialog-description"
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle
        id="profile-dialog-title"
        fontWeight={600}
        textAlign="center"
      >
        Editar Perfil
      </DialogTitle>
      <Divider />
      <DialogContent id="profile-dialog-description">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/png, image/jpeg, image/gif"
          onChange={handleFileChange}
        />

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                <Sidebar
                  user={user}
                  profileUser={profileUser}
                  onUploadClick={handleOpenFilePicker}
                  onRemoveClick={handleFileRemove}
                  preview={preview}
                  showRemoveButton={
                    !!(preview || (user?.profilePath && !photoMarkedForRemoval))
                  }
                  photoMarkedForRemoval={photoMarkedForRemoval}
                />

                <Stack spacing={3} flex={1}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Informações Básicas
                      </Typography>
                    </Stack>

                    <GlobalInput
                      name="nickname"
                      label="Apelido (Nome de exibição)"
                      value={values.nickname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nickname && Boolean(errors.nickname)}
                      fullWidth
                      placeholder={user?.name || ""}
                      helperText={
                        errors.nickname && touched.nickname
                          ? errors.nickname
                          : "Como você gostaria de ser chamado na plataforma"
                      }
                    />

                    <GlobalInput
                      name="email"
                      label="Endereço de E-mail"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      fullWidth
                    />

                    <GlobalInput
                      name="phone"
                      label="Telefone"
                      placeholder="(11) 12345-6789"
                      value={values.phone}
                      onChange={(e) =>
                        setFieldValue("phone", phoneMask(e.target.value))
                      }
                      onBlur={handleBlur}
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                      fullWidth
                    />

                    <DatePickerComponent
                      name="birthdate"
                      label="Data de Nascimento"
                      placeholder="Selecione a data"
                      views={["year", "month", "day"]}
                      format="dd/MM/yyyy"
                      disabled
                    />
                  </Stack>

                  <Divider />

                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center">
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Segurança da Conta
                      </Typography>
                    </Stack>

                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      Alterar Senha
                    </Typography>

                    <PasswordStrengthInput
                      name="old_password"
                      label="Senha Atual"
                      value={values.old_password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.old_password && Boolean(errors.old_password)
                      }
                      helperText={touched.old_password && errors.old_password}
                      showStrengthIndicator={false}
                      fullWidth
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <PasswordStrengthInput
                        name="password"
                        label="Nova Senha"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        fullWidth
                      />

                      <PasswordStrengthInput
                        name="confirmNewPassword"
                        label="Confirmar Nova Senha"
                        value={values.confirmNewPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.confirmNewPassword &&
                          Boolean(errors.confirmNewPassword)
                        }
                        helperText={
                          touched.confirmNewPassword &&
                          errors.confirmNewPassword
                        }
                        showStrengthIndicator={false}
                        fullWidth
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="center"
                      spacing={2}
                      pt={2}
                    >
                      <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                          bgcolor: "#D9D9D9",
                          color: "#6C757D",
                          "&:hover": {
                            bgcolor: "#c4c4c4",
                          },
                        }}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                          bgcolor: "#07A7DF",
                          color: "#fff",
                          "&:hover": {
                            bgcolor: darken("#07A7DF", 0.1),
                          },
                          minWidth: 160,
                        }}
                      >
                        {isLoading ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CircularProgress size={18} color="inherit" />
                            <Typography>Salvando...</Typography>
                          </Stack>
                        ) : (
                          "Salvar Alterações"
                        )}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ProfileModal);
