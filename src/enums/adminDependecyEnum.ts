export enum AdminDependecyEnumType {
  FEDERAL = "FEDERAL",
  STATE = "STATE",
  MUNICIPAL = "MUNICIPAL",
  PRIVATE = "PRIVATE",
}
export const adminDependecyEnum: Record<AdminDependecyEnumType, string> = {
  [AdminDependecyEnumType.FEDERAL]: "Federal",
  [AdminDependecyEnumType.STATE]: "Estadual",
  [AdminDependecyEnumType.MUNICIPAL]: "Municipal",
  [AdminDependecyEnumType.PRIVATE]: "Privada",
};
