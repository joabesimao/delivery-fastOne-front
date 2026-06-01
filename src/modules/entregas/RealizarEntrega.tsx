import React from "react";
import { useNavigate } from "react-router-dom";
import EntregaForm from "./EntregaForm";

const RealizarEntrega: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <EntregaForm onClose={() => navigate(-1)} />
    </div>
  );
};

export default RealizarEntrega;
