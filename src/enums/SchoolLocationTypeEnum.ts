export enum SchoolLocationTypeEnum {
  NOT_APPLICABLE = "not_applicable",
  INDIGENOUS_LAND = "indigenous_land",
  SETTLEMENT_AREA = "settlement_area",
  TRADITIONAL_COMMUNITIES_AREA = "traditional_communities_area",
  QUILOMBO_REMAINS_AREA = "quilombo_remains_area",
}

export const SchoolLocationTypeOptions = [
  {
    field: SchoolLocationTypeEnum.NOT_APPLICABLE,
    label: "Não se aplica",
  },
  {
    field: SchoolLocationTypeEnum.INDIGENOUS_LAND,
    label: "Terra Indígena",
  },
  {
    field: SchoolLocationTypeEnum.SETTLEMENT_AREA,
    label: "Área de assentamento",
  },
  {
    field: SchoolLocationTypeEnum.TRADITIONAL_COMMUNITIES_AREA,
    label: "Área povos/comun. tradicionais",
  },
  {
    field: SchoolLocationTypeEnum.QUILOMBO_REMAINS_AREA,
    label: "Área remanescente de quilombo",
  },
];
