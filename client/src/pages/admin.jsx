import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const token = localStorage.getItem("freshmartToken");
    const userText = localStorage.getItem("freshmartUser");

    if (!token || !userText) {
      setError("Please log in as an administrator.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let user;

      try {
        user = JSON.parse(userText);
      } catch {
        throw new Error("Invalid login information. Please log in again.");
      }

      if (user.role !== "admin") {
        throw new Error("You do not have permission to view this dashboard.");
      }

      const [productResponse, orderResponse] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const productData = await productResponse.json();
      const orderData = await orderResponse.json();

      if (!productResponse.ok) {
        throw new Error(productData.message || "Unable to load products.");
      }

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Unable to load orders.");
      }

      if (!Array.isArray(productData) || !Array.isArray(orderData)) {
        throw new Error("The server returned invalid dashboard data.");
      }

      setProducts(productData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const activeOrders = orders.filter((order) => order.status !== "Cancelled");

  const orderValue = activeOrders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0,
  );

  const customerIds = new Set(
    orders
      .map((order) => {
        if (order.user && typeof order.user === "object") {
          return order.user._id;
        }

        return order.user;
      })
      .filter(Boolean)
      .map(String),
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "Placed" || order.status === "Processing",
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped",
  ).length;

  const stats = [
    {
      title: "Order Value",
      value: `₹${orderValue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      description: "Non-cancelled orders",
      icon: "bi-currency-rupee",
    },
    {
      title: "Total Orders",
      value: orders.length,
      description: "All recorded orders",
      icon: "bi-box-seam",
    },
    {
      title: "Customers",
      value: customerIds.size,
      description: "Customers who placed orders",
      icon: "bi-people",
    },
    {
      title: "Products",
      value: products.length,
      description: "Products in the catalog",
      icon: "bi-basket",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      description: "Placed or processing",
      icon: "bi-hourglass-split",
    },
    {
      title: "Shipped Orders",
      value: shippedOrders,
      description: "Orders marked as shipped",
      icon: "bi-truck",
    },
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />

      <main
        className="flex-grow-1 p-3 p-md-4"
        style={{
          marginLeft: "250px",
          minWidth: 0,
        }}
      >
        <nav className="navbar bg-white shadow-sm rounded-3 mb-4 px-3">
          <div className="container-fluid px-0 gap-3">
            <span className="navbar-brand fw-bold mb-0">
              FreshMart Admin Dashboard
            </span>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => loadDashboard(true)}
                disabled={loading || refreshing}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <Link to="/admin/products" className="btn btn-outline-success">
                <i className="bi bi-basket me-1"></i>
                Products
              </Link>

              <Link to="/admin/orders" className="btn btn-success">
                <i className="bi bi-box-seam me-1"></i>
                Orders
              </Link>
            </div>
          </div>
        </nav>

        <section className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="position-relative">
            <img
              src="/images/grocery-banner.png"
              alt="Fresh groceries"
              className="w-100"
              style={{
                height: "280px",
                objectFit: "cover",
              }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-start p-4"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55))",
              }}
            >
              <span className="badge text-bg-success mb-3">ADMIN PANEL</span>

              <h2 className="fw-bold">Welcome back to FreshMart!</h2>

              <p className="text-secondary mb-0">
                Manage your grocery products and customer orders from one place.
              </p>

              <div className="d-flex flex-wrap gap-2 mt-3">
                <Link
                  to="/admin/products"
                  className="btn btn-success rounded-pill px-4"
                >
                  Manage Products
                </Link>

                <Link
                  to="/admin/orders"
                  className="btn btn-outline-success rounded-pill px-4"
                >
                  View Orders
                </Link>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}

            {error.toLowerCase().includes("log in") && (
              <div className="mt-2">
                <Link to="/admin/login" className="alert-link">
                  Go to Admin Login
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-1">Dashboard Overview</h4>
            <p className="text-muted mb-0">A quick summary of your store.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading dashboard...</span>
            </div>

            <p className="mt-3 text-muted">Loading dashboard statistics...</p>
          </div>
        ) : !error ? (
          <div className="row g-3">
            {stats.map((stat) => (
              <div className="col-12 col-sm-6 col-xl-4" key={stat.title}>
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="text-muted mb-2">{stat.title}</p>

                        <h3 className="fw-bold mb-2 text-break">
                          {stat.value}
                        </h3>

                        <small className="text-secondary">
                          {stat.description}
                        </small>
                      </div>

                      <div
                        className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "48px",
                          height: "48px",
                        }}
                      >
                        <i className={`bi ${stat.icon} fs-4`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body text-center py-5">
              <i className="bi bi-bar-chart-line fs-1 text-muted"></i>

              <h5 className="mt-3">Dashboard unavailable</h5>

              <p className="text-muted">
                Fix the issue above and try loading the dashboard again.
              </p>

              <button
                type="button"
                className="btn btn-success"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
