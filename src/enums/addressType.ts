export enum AddressType {
  STREET = "STREET",
  AVENUE = "AVENUE",
  LANE = "LANE",
  HIGHWAY = "HIGHWAY",
  BOULEVARD = "BOULEVARD",
}
export const addressTypeLabels: Record<AddressType, string> = {
  [AddressType.STREET]: "Rua",
  [AddressType.AVENUE]: "Avenida",
  [AddressType.LANE]: "Travessa",
  [AddressType.HIGHWAY]: "Rodovia",
  [AddressType.BOULEVARD]: "Alameda",
};
