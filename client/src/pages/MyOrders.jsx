import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelError, setCancelError] = useState("");

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("freshmartCustomerToken");

    if (!token) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The orders API returned an unexpected response. Check that your backend is running.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your login session may have expired. Please log in again.",
          );
        }

        throw new Error(data.message || "Unable to load your orders.");
      }

      const receivedOrders = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : null;

      if (!receivedOrders) {
        throw new Error("The server returned an invalid orders list.");
      }

      setOrders(receivedOrders);
    } catch (err) {
      console.error("Failed to load FreshMart orders:", err);
      setError(
        err.message || "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function cancelOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("freshmartCustomerToken");

    if (!token) {
      setCancelError("Please log in again to cancel your order.");
      setCancelMessage("");
      return;
    }

    setCancellingOrderId(orderId);
    setCancelMessage("");
    setCancelError("");

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The server returned an unexpected response. Please try again.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel this order.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: data.order.status }
            : order,
        ),
      );

      setCancelMessage(
        data.message || "Your order has been cancelled successfully.",
      );
    } catch (err) {
      console.error("Cancel order error:", err);
      setCancelError(err.message || "Unable to cancel your order.");
    } finally {
      setCancellingOrderId("");
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
        <p className="mt-3">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    const needsLogin =
      error.toLowerCase().includes("log in") ||
      error.toLowerCase().includes("login session");

    return (
      <div className="container py-5 text-center">
        <i className="bi bi-receipt display-3 text-muted"></i>
        <h3 className="mt-3">Your orders</h3>
        <p className="text-danger">{error}</p>

        {needsLogin ? (
          <Link to="/login" className="btn btn-success">
            Customer Login
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={fetchOrders}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Orders</h2>
          <p className="text-muted mb-0">
            View your FreshMart purchases and order status.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={fetchOrders}
            disabled={loading || Boolean(cancellingOrderId)}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh Orders
          </button>

          <Link to="/" className="btn btn-outline-success">
            Continue Shopping
          </Link>
        </div>
      </div>

      {cancelMessage && (
        <div className="alert alert-success" role="status">
          <i className="bi bi-check-circle me-2"></i>
          {cancelMessage}
        </div>
      )}

      {cancelError && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {cancelError}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-3 text-muted"></i>
          <h4 className="mt-3">No orders yet</h4>
          <p className="text-muted">
            Your orders will appear here after you place one.
          </p>
          <Link to="/" className="btn btn-success">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => {
            const canCancel = ["Placed", "Processing"].includes(order.status);

            const statusClass =
              order.status === "Cancelled"
                ? "bg-danger"
                : order.status === "Delivered"
                  ? "bg-success"
                  : order.status === "Shipped"
                    ? "bg-primary"
                    : "bg-warning text-dark";

            return (
              <div className="card border-0 shadow-sm" key={order._id}>
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                    <div>
                      <small className="text-muted">Order ID</small>
                      <div className="fw-semibold text-break">{order._id}</div>
                      <small className="text-muted">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-IN")
                          : "Date unavailable"}
                      </small>
                    </div>

                    <div className="text-md-end">
                      <span className={`badge ${statusClass}`}>
                        {order.status}
                      </span>
                      <div className="fw-bold fs-5 mt-2">
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <hr />

                  {(order.items || []).map((item, index) => (
                    <div
                      className="d-flex justify-content-between gap-3 mb-2"
                      key={`${item.product || item.name}-${index}`}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-nowrap">
                        ₹
                        {(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="small text-muted mt-3">
                    Payment:{" "}
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod || "Not specified"}
                  </div>

                  <div className="small text-muted mt-1">
                    Delivery to:{" "}
                    {[order.deliveryAddress?.city, order.deliveryAddress?.state]
                      .filter(Boolean)
                      .join(", ") || "Address unavailable"}
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <Link
                      to={`/order-confirmation/${order._id}`}
                      className="btn btn-outline-success btn-sm"
                      state={{ order }}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Order Details
                    </Link>

                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => cancelOrder(order._id)}
                        disabled={Boolean(cancellingOrderId)}
                      >
                        {cancellingOrderId === order._id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              aria-hidden="true"
                            ></span>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-x-circle me-1"></i>
                            Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {order.status === "Cancelled" && (
                    <p className="text-danger small mt-3 mb-0">
                      <i className="bi bi-info-circle me-1"></i>
                      This order has been cancelled.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
