export enum InternetAccessEnum {
  IS_NO_INTERNET = "is_no_internet",
  IS_BROADBAND_INTERNET = "is_broadband_internet",
  FOR_ADMINISTRATIVE_USE = "for_administrative_use",
  FOR_COMMUNITY_USE = "for_community_use",
  FOR_STUDENT_USE = "for_student_use",
  FOR_USE_IN_TEACHING = "for_use_in_teaching",
}

export const InternetAccessOptions = [
  {
    field: InternetAccessEnum.IS_NO_INTERNET,
    label: "Não possui acesso à internet",
  },
  {
    field: InternetAccessEnum.IS_BROADBAND_INTERNET,
    label: "Internet banda larga",
  },
  {
    field: InternetAccessEnum.FOR_ADMINISTRATIVE_USE,
    label: "Para uso administrativo",
  },
  {
    field: InternetAccessEnum.FOR_COMMUNITY_USE,
    label: "Para uso da comunidade",
  },
  {
    field: InternetAccessEnum.FOR_STUDENT_USE,
    label: "Para uso dos alunos",
  },
  {
    field: InternetAccessEnum.FOR_USE_IN_TEACHING,
    label: "Para uso no processo de ensino e aprendizagem",
  },
];
