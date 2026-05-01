export enum AccessibilityResourceEnum {
  HAS_HANDRAILS_AND_GUARDRAILS = "has_handrails_and_guardrails",
  HAS_ELEVATOR = "has_elevator",
  HAS_TACTILE_FLOORS = "has_tactile_floors",
  HAS_OPEN_SPAN_DOORS = "has_open_span_doors",
  HAS_RAMPS = "has_ramps",
  HAS_LIGHT_SIGNALING = "has_light_signaling",
  HAS_AUDIBLE_SIGNALING = "has_audible_signaling",
  HAS_TACTILE_SIGNALING = "has_tactile_signaling",
  HAS_VISUAL_SIGNALING = "has_visual_signaling",
}

export const AccessibilityResourceOptions = [
  {
    field: AccessibilityResourceEnum.HAS_HANDRAILS_AND_GUARDRAILS,
    label: "Corrimão e guarda-corpos",
  },
  {
    field: AccessibilityResourceEnum.HAS_ELEVATOR,
    label: "Elevador",
  },
  {
    field: AccessibilityResourceEnum.HAS_TACTILE_FLOORS,
    label: "Pisos táteis",
  },
  {
    field: AccessibilityResourceEnum.HAS_OPEN_SPAN_DOORS,
    label: "Portas com vão livre de no mínimo 80 cm",
  },
  {
    field: AccessibilityResourceEnum.HAS_RAMPS,
    label: "Rampas",
  },
  {
    field: AccessibilityResourceEnum.HAS_LIGHT_SIGNALING,
    label: "Sinalização/alarme luminoso",
  },
  {
    field: AccessibilityResourceEnum.HAS_AUDIBLE_SIGNALING,
    label: "Sinalização sonora",
  },
  {
    field: AccessibilityResourceEnum.HAS_TACTILE_SIGNALING,
    label: "Sinalização tátil (piso/paredes)",
  },
  {
    field: AccessibilityResourceEnum.HAS_VISUAL_SIGNALING,
    label: "Sinalização visual (piso/paredes)",
  },
];
