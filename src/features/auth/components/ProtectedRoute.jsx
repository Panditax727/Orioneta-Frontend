import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../session";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!getSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
