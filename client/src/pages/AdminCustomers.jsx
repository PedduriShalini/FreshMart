import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("freshmartToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("freshmartToken");
        localStorage.removeItem("freshmartUser");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (response.status === 403) {
        throw new Error("Your account does not have administrator permission.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load customers.");
      }

      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function viewOrders(customer) {
    setSelectedCustomer(customer);
    setOrders([]);
    setOrdersError("");
    setOrdersLoading(true);

    try {
      const token = localStorage.getItem("freshmartToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/customers/${customer.id}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("freshmartToken");
        localStorage.removeItem("freshmartUser");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (response.status === 403) {
        throw new Error("Your account does not have administrator permission.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load order history.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err.message || "Unable to load order history.");
    } finally {
      setOrdersLoading(false);
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const search = searchText.trim().toLowerCase();

    return (
      (customer.name || "").toLowerCase().includes(search) ||
      (customer.email || "").toLowerCase().includes(search)
    );
  });

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orderCount,
    0,
  );

  const totalOrderValue = customers.reduce(
    (sum, customer) => sum + customer.totalOrderValue,
    0,
  );

  return (
    <div className="d-flex">
      <Sidebar />

      <main
        className="p-4"
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          minHeight: "100vh",
          backgroundColor: "#fff",
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Customers</h2>
            <p className="text-muted mb-0">
              View registered customers and their order summaries.
            </p>
          </div>

          <Link to="/admin" className="btn btn-outline-success">
            <i className="bi bi-arrow-left me-2"></i>
            Dashboard
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Registered Customers</div>
                <h3 className="fw-bold mb-0">{customers.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Total Orders</div>
                <h3 className="fw-bold mb-0">{totalOrders}</h3>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <div className="text-muted mb-2">Total Order Value</div>
                <h3 className="fw-bold mb-0">
                  {formatCurrency(totalOrderValue)}
                </h3>
                <small className="text-muted">Includes cancelled orders</small>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
              <div>
                <h5 className="fw-bold mb-1">Customer Directory</h5>
                <p className="text-muted mb-0">
                  {filteredCustomers.length} customer
                  {filteredCustomers.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="d-flex gap-2">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search name or email"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />

                <button
                  type="button"
                  className="btn btn-outline-success text-nowrap"
                  onClick={loadCustomers}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="p-4 mb-0">Loading customers...</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="p-4 mb-0">No customers found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Customer</th>
                    <th>Registered</th>
                    <th>Orders</th>
                    <th>Order Value</th>
                    <th>Delivered</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="ps-4">
                        <div className="fw-semibold">{customer.name}</div>
                        <small className="text-muted">{customer.email}</small>
                      </td>

                      <td>{formatDate(customer.registeredAt)}</td>
                      <td>{customer.orderCount}</td>
                      <td>{formatCurrency(customer.totalOrderValue)}</td>
                      <td>{customer.deliveredOrders}</td>

                      <td className="text-end pe-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() => viewOrders(customer)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          View Orders
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="card border-0 shadow-sm rounded-4 mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h5 className="fw-bold mb-1">Order History</h5>
                  <p className="text-muted mb-0">
                    {selectedCustomer.name} · {selectedCustomer.email}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setOrders([]);
                    setOrdersError("");
                  }}
                >
                  Close
                </button>
              </div>

              {ordersError && (
                <div className="alert alert-danger">{ordersError}</div>
              )}

              {ordersLoading ? (
                <p>Loading order history...</p>
              ) : orders.length === 0 && !ordersError ? (
                <p className="text-muted mb-0">
                  This customer has not placed any orders.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Order Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>{formatDate(order.createdAt)}</td>

                          <td>
                            {order.items
                              .map((item) => `${item.name} × ${item.quantity}`)
                              .join(", ")}
                          </td>

                          <td>{formatCurrency(order.totalAmount)}</td>

                          <td>
                            <span className="badge bg-light text-dark border">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminCustomers;
