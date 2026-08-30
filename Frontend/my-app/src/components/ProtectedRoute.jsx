import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TruckLoader from "./TruckLoader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return  <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <TruckLoader />
      </div> 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
