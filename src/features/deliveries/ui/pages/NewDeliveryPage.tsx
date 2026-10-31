import { useNavigate } from "react-router-dom";
import CreateDeliveryOrder from "../components/CreateDeliveryOrder";

const NewDeliveryPage = () => {
  const navigate = useNavigate();
  return <CreateDeliveryOrder onClose={() => navigate(-1)} />;
};

export default NewDeliveryPage;
