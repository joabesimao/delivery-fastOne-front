export enum ActionEnum {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  UPDATE_STATUS = "update_status",
  PRIOR_AUTHORIZATION = "prior_authorization",
  UPDATE_DEFAULT_VALUES = "update_default_values",
  CREATE_RECEIVE_TRANSFER = "create_receive_transfer",
  CREATE_TRANSFER = "create_transfer",
}

export const actionLabels: Record<ActionEnum, string> = {
  [ActionEnum.CREATE]: "Cadastrar",
  [ActionEnum.READ]: "Visualizar",
  [ActionEnum.UPDATE]: "Editar",
  [ActionEnum.DELETE]: "Excluir",
  [ActionEnum.UPDATE_STATUS]: "Alterar status",
  [ActionEnum.PRIOR_AUTHORIZATION]: "Autorização prévia",
  [ActionEnum.UPDATE_DEFAULT_VALUES]: "Alterar valor padrão",
  [ActionEnum.CREATE_RECEIVE_TRANSFER]: "Receber transferência",
  [ActionEnum.CREATE_TRANSFER]: "Criar transferência",
};
