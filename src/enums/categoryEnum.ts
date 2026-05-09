export enum CategoryEnumType {
  PUBLIC = "public",
  PRIVATE = "private",
}
export const categoryTypeLabels: Record<CategoryEnumType, string> = {
  [CategoryEnumType.PUBLIC]: "Pública",
  [CategoryEnumType.PRIVATE]: "Privada",
};
