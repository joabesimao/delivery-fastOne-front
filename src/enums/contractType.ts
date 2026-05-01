export enum ContractTypeEnum {
  EFFECTIVE = "EFFECTIVE",
  TEMPORARY = "TEMPORARY",
  SUBSTITUTE = "SUBSTITUTE",
  OUTSOURCED = "OUTSOURCED",
  VOLUNTEER = "VOLUNTEER",
  INTERN = "INTERN",
}

export const contractTypeLabels: Record<ContractTypeEnum, string> = {
  [ContractTypeEnum.EFFECTIVE]: "Efetivo",
  [ContractTypeEnum.TEMPORARY]: "Temporário",
  [ContractTypeEnum.SUBSTITUTE]: "Substituto",
  [ContractTypeEnum.OUTSOURCED]: "Terceirizado",
  [ContractTypeEnum.VOLUNTEER]: "Voluntário",
  [ContractTypeEnum.INTERN]: "Estagiário",
};
