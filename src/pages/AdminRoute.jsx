import { Navigate, Outlet, useLocation } from "react-router-dom";

function AdminRoute() {
  const location = useLocation();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("freshmartUser") || "null");
  } catch {
    user = null;
  }

  const token = localStorage.getItem("freshmartToken");

  if (!token || user?.role !== "admin") {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}

export default AdminRoute;
