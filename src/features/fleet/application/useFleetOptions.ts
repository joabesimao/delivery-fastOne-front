import { useMemo } from "react";
import { deliverymanFullName, useDeliverymen } from "@/features/deliverymen";
import { useVehicles, vehicleLabel } from "@/features/vehicles";
import type { SelectOption } from "@/shared/ui/form/FormSelectField";
import type { FleetRecord } from "../domain/fleetRecord";

export const useFleetOptions = () => {
  const { data: vehicles } = useVehicles();
  const { data: deliverymen } = useDeliverymen();

  return useMemo(() => {
    const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
      value: String(v.id),
      label: vehicleLabel(v),
    }));
    const deliverymanOptions: SelectOption[] = (deliverymen ?? []).map((d) => ({
      value: String(d.id),
      label: deliverymanFullName(d),
    }));
    const vehicleLabels = new Map(
      vehicleOptions.map((o) => [Number(o.value), o.label]),
    );
    const deliverymanLabels = new Map(
      deliverymanOptions.map((o) => [Number(o.value), o.label]),
    );

    return {
      vehicleOptions,
      deliverymanOptions,
      vehicleLabelOf: (record: FleetRecord) =>
        record.vehicle
          ? vehicleLabel(record.vehicle)
          : (vehicleLabels.get(record.vehicleId) ?? "—"),
      deliverymanLabelOf: (record: FleetRecord) =>
        record.deliveryman
          ? deliverymanFullName({
              id: record.deliverymanId,
              ...record.deliveryman,
            })
          : (deliverymanLabels.get(record.deliverymanId) ?? "—"),
    };
  }, [vehicles, deliverymen]);
};
