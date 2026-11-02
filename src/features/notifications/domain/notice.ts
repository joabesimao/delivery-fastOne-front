import { ROLE_OPTIONS, type UserRole } from "@/features/users";

export const NOTICE_TITLE_MAX = 191;
export const NOTICE_BODY_MAX = 2000;

export interface NoticeFormValues {
  title: string;
  body: string;
  roles: UserRole[];
  unitStoreId: string;
}

export interface BroadcastNoticePayload {
  title: string;
  body: string;
  roles?: UserRole[];
  unitStoreId?: number;
}

export type NoticeFormErrors = Partial<Record<keyof NoticeFormValues, string>>;

export const EMPTY_NOTICE: NoticeFormValues = {
  title: "",
  body: "",
  roles: [],
  unitStoreId: "",
};

export const validateNotice = (values: NoticeFormValues): NoticeFormErrors => {
  const errors: NoticeFormErrors = {};
  const title = values.title.trim();
  const body = values.body.trim();
  if (!title) errors.title = "Informe o título.";
  else if (title.length > NOTICE_TITLE_MAX)
    errors.title = `Máximo de ${NOTICE_TITLE_MAX} caracteres.`;
  if (!body) errors.body = "Escreva a mensagem.";
  else if (body.length > NOTICE_BODY_MAX)
    errors.body = `Máximo de ${NOTICE_BODY_MAX} caracteres.`;
  return errors;
};

export const toBroadcastPayload = (
  values: NoticeFormValues,
): BroadcastNoticePayload => ({
  title: values.title.trim(),
  body: values.body.trim(),
  roles: values.roles.length ? values.roles : undefined,
  unitStoreId: values.unitStoreId ? Number(values.unitStoreId) : undefined,
});

export const roleLabel = (role: UserRole): string =>
  ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;

export const noticeSentFeedback = (
  recipients: number,
): { message: string; severity: "success" | "info" } =>
  recipients > 0
    ? {
        message: `Aviso enviado para ${recipients} ${recipients === 1 ? "usuário" : "usuários"}.`,
        severity: "success",
      }
    : {
        message: "Nenhum usuário corresponde aos filtros escolhidos.",
        severity: "info",
      };
