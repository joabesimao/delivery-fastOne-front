import { useSearchParams } from "react-router-dom";

const useFiltrosFrota = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const vehicleId = searchParams.get("vehicleId") ?? "";
  const deliverymanId = searchParams.get("deliverymanId") ?? "";

  const setFilter = (key: "vehicleId" | "deliverymanId", value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  return {
    vehicleId,
    deliverymanId,
    hasFilters: Boolean(vehicleId || deliverymanId),
    params: {
      ...(vehicleId && { vehicleId }),
      ...(deliverymanId && { deliverymanId }),
    },
    setVehicleId: (value: string) => setFilter("vehicleId", value),
    setDeliverymanId: (value: string) => setFilter("deliverymanId", value),
    clear: () => setSearchParams({}, { replace: true }),
  };
};

export default useFiltrosFrota;
