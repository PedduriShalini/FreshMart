import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const STATUSES = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

function toLocalInputValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

function buildForms(orders) {
  const forms = {};

  orders.forEach((order) => {
    forms[order._id] = {
      estimatedDeliveryAt: toLocalInputValue(order.estimatedDeliveryAt),
      riderName: order.rider?.name || "",
      riderPhone: order.rider?.phone || "",
      vehicleNumber: order.rider?.vehicleNumber || "",
    };
  });

  return forms;
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deliveryForms, setDeliveryForms] = useState({});

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("freshmartToken");
    const userText = localStorage.getItem("freshmartUser");

    setLoading(true);
    setError("");
    setSuccess("");

    if (!token || !userText) {
      setError("Please log in as an administrator.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userText);

      if (user.role !== "admin") {
        throw new Error("Administrator access required.");
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid orders response.");
      }

      setOrders(data);
      setDeliveryForms(buildForms(data));
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function changeDeliveryField(orderId, field, value) {
    setDeliveryForms((previous) => ({
      ...previous,
      [orderId]: {
        ...previous[orderId],
        [field]: value,
      },
    }));
  }

  async function updateStatus(orderId, status) {
    const token = localStorage.getItem("freshmartToken");

    if (!token) {
      setError("Please log in as an administrator.");
      return;
    }

    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order status.");
      }

      setOrders((previous) =>
        previous.map((order) => (order._id === orderId ? data.order : order)),
      );

      setSuccess("Order status updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update order status.");
      await fetchOrders();
    } finally {
      setUpdatingId("");
    }
  }

  async function saveDelivery(orderId) {
    const token = localStorage.getItem("freshmartToken");
    const form = deliveryForms[orderId];

    if (!token) {
      setError("Please log in as an administrator.");
      return;
    }

    if (!form) return;

    const hasRiderDetails =
      form.riderName.trim() ||
      form.riderPhone.trim() ||
      form.vehicleNumber.trim();

    if (
      hasRiderDetails &&
      (!form.riderName.trim() || !/^[6-9]\d{9}$/.test(form.riderPhone.trim()))
    ) {
      setError(
        "Enter the rider's name and a valid 10-digit Indian mobile number.",
      );
      setSuccess("");
      return;
    }

    let estimatedDeliveryAt = "";

    if (form.estimatedDeliveryAt) {
      const date = new Date(form.estimatedDeliveryAt);

      if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
        setError("Choose a future estimated delivery date and time.");
        setSuccess("");
        return;
      }

      estimatedDeliveryAt = date.toISOString();
    }

    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/delivery`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estimatedDeliveryAt,
            rider: {
              name: form.riderName.trim(),
              phone: form.riderPhone.trim(),
              vehicleNumber: form.vehicleNumber.trim(),
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save delivery details.");
      }

      setOrders((previous) =>
        previous.map((order) => (order._id === orderId ? data.order : order)),
      );

      setDeliveryForms((previous) => ({
        ...previous,
        [orderId]: {
          estimatedDeliveryAt: toLocalInputValue(
            data.order.estimatedDeliveryAt,
          ),
          riderName: data.order.rider?.name || "",
          riderPhone: data.order.rider?.phone || "",
          vehicleNumber: data.order.rider?.vehicleNumber || "",
        },
      }));

      setSuccess("Delivery details saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save delivery details.");
    } finally {
      setUpdatingId("");
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-success"
          role="status"
          aria-label="Loading"
        />
        <p className="mt-3">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold">Manage Orders</h2>
          <p className="text-muted">
            Manage order status, delivery time and riders.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={fetchOrders}
            disabled={Boolean(updatingId)}
          >
            Refresh
          </button>

          <Link to="/admin" className="btn btn-success">
            Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <h4>No orders found</h4>
          <p className="text-muted">New customer orders will appear here.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => {
            const form = deliveryForms[order._id] || {};
            const busy = updatingId === order._id;
            const completed = ["Cancelled", "Delivered"].includes(order.status);

            return (
              <div className="card border-0 shadow-sm" key={order._id}>
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between gap-3">
                    <div>
                      <h5 className="fw-bold">Order #{order._id.slice(-8)}</h5>

                      <small className="text-muted">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-IN")
                          : "Date unavailable"}
                      </small>

                      <div className="mt-2">
                        Customer: {order.user?.name || "Customer"}
                      </div>

                      <small className="text-muted">
                        {order.user?.email || ""}
                      </small>
                    </div>

                    <div className="text-end">
                      <h5 className="fw-bold">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </h5>

                      <span
                        className={`badge ${
                          order.status === "Cancelled"
                            ? "bg-danger"
                            : order.status === "Delivered"
                              ? "bg-success"
                              : "bg-primary"
                        }`}
                      >
                        {order.status}
                      </span>

                      <div className="small text-muted mt-1">
                        Cash on Delivery
                      </div>
                    </div>
                  </div>

                  <hr />

                  <h6 className="fw-bold">Items</h6>

                  {(order.items || []).map((item, index) => (
                    <div
                      className="d-flex justify-content-between mb-2"
                      key={`${order._id}-${item.product || index}`}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <span>
                        ₹
                        {(Number(item.price) * Number(item.quantity)).toFixed(
                          2,
                        )}
                      </span>
                    </div>
                  ))}

                  <hr />

                  <h6 className="fw-bold">Delivery Address</h6>

                  <p className="mb-1">{order.deliveryAddress?.name}</p>

                  <p className="mb-1">{order.deliveryAddress?.phone}</p>

                  <p className="text-muted">
                    {order.deliveryAddress?.address},{" "}
                    {order.deliveryAddress?.city},{" "}
                    {order.deliveryAddress?.state} -{" "}
                    {order.deliveryAddress?.pincode}
                  </p>

                  <hr />

                  <h6 className="fw-bold">Order Status</h6>

                  <select
                    className="form-select mb-4"
                    aria-label={`Status for order ${order._id}`}
                    value={order.status}
                    disabled={busy || completed || Boolean(updatingId)}
                    onChange={(event) =>
                      updateStatus(order._id, event.target.value)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <div className="border rounded-3 p-3 bg-light">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-truck me-2" />
                      Delivery Management
                    </h6>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label
                          className="form-label"
                          htmlFor={`delivery-time-${order._id}`}
                        >
                          Estimated Delivery Date &amp; Time
                        </label>

                        <input
                          id={`delivery-time-${order._id}`}
                          type="datetime-local"
                          className="form-control"
                          min={toLocalInputValue(new Date())}
                          value={form.estimatedDeliveryAt || ""}
                          disabled={completed || busy}
                          onChange={(event) =>
                            changeDeliveryField(
                              order._id,
                              "estimatedDeliveryAt",
                              event.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label
                          className="form-label"
                          htmlFor={`rider-name-${order._id}`}
                        >
                          Rider Name
                        </label>

                        <input
                          id={`rider-name-${order._id}`}
                          type="text"
                          className="form-control"
                          placeholder="Enter delivery partner name"
                          value={form.riderName || ""}
                          disabled={completed || busy}
                          onChange={(event) =>
                            changeDeliveryField(
                              order._id,
                              "riderName",
                              event.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label
                          className="form-label"
                          htmlFor={`rider-phone-${order._id}`}
                        >
                          Rider Phone
                        </label>

                        <input
                          id={`rider-phone-${order._id}`}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          className="form-control"
                          placeholder="10-digit mobile number"
                          value={form.riderPhone || ""}
                          disabled={completed || busy}
                          onChange={(event) =>
                            changeDeliveryField(
                              order._id,
                              "riderPhone",
                              event.target.value.replace(/\D/g, ""),
                            )
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label
                          className="form-label"
                          htmlFor={`vehicle-${order._id}`}
                        >
                          Vehicle Number (Optional)
                        </label>

                        <input
                          id={`vehicle-${order._id}`}
                          type="text"
                          className="form-control"
                          placeholder="TS 09 AB 1234"
                          value={form.vehicleNumber || ""}
                          disabled={completed || busy}
                          onChange={(event) =>
                            changeDeliveryField(
                              order._id,
                              "vehicleNumber",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-success mt-3"
                      disabled={completed || Boolean(updatingId)}
                      onClick={() => saveDelivery(order._id)}
                    >
                      {busy ? "Saving..." : "Save Delivery Details"}
                    </button>

                    {order.estimatedDeliveryAt && (
                      <p className="small text-muted mt-3 mb-1">
                        Estimated delivery:{" "}
                        {new Date(order.estimatedDeliveryAt).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    )}

                    {order.rider?.assignedAt && (
                      <p className="small text-muted mb-0">
                        Rider assigned:{" "}
                        {new Date(order.rider.assignedAt).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
