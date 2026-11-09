import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useConsumedLocationState = <T extends object>(): T | null => {
  const location = useLocation();
  const navigate = useNavigate();
  const [consumed] = useState(() => (location.state as T | null) ?? null);
  const hasState = location.state != null;

  useEffect(() => {
    if (!hasState) return;
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: null },
    );
  }, [hasState, location.pathname, location.search, location.hash, navigate]);

  return consumed;
};
