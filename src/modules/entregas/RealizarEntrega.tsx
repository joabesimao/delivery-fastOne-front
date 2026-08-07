import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EntregaForm from "./EntregaForm";

interface ClientData {
  name: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    neighborhood: string;
    numberHouse: string;
    reference: string;
    city: string;
  };
}

interface PreloadedData {
  clientId: number;
  clientData: ClientData;
}

const RealizarEntrega: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedData = (location.state as { clientData?: PreloadedData })?.clientData || null;

  return (
    <div>
      <EntregaForm 
        onClose={() => navigate(-1)} 
        preloadedClientData={preloadedData?.clientData}
        preloadedClientId={preloadedData?.clientId}
      />
    </div>
  );
};

export default RealizarEntrega;
