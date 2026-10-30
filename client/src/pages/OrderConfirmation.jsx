import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DELIVERY_STEPS = [
  { status: "Placed", label: "Order confirmed", icon: "bi-receipt" },
  {
    status: "Processing",
    label: "Preparing your groceries",
    icon: "bi-basket",
  },
  {
    status: "Shipped",
    label: "Out for delivery",
    icon: "bi-truck",
  },
  {
    status: "Delivered",
    label: "Delivered",
    icon: "bi-check-circle",
  },
];

function OrderConfirmation() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchOrder = useCallback(
    async (isRefresh = false) => {
      const token = localStorage.getItem("freshmartCustomerToken");

      if (!token) {
        setError("Please log in to view your order.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error("Unexpected server response. Please try again.");
        }

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Your login session has expired. Please log in again.",
            );
          }

          throw new Error(data.message || "Unable to load your order.");
        }

        const orders = Array.isArray(data)
          ? data
          : Array.isArray(data.orders)
            ? data.orders
            : [];

        const foundOrder = orders.find((item) => item._id === orderId);

        if (!foundOrder) {
          throw new Error("Order not found in your account.");
        }

        setOrder(foundOrder);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message || "Unable to load your order.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    fetchOrder();

    const refreshInterval = setInterval(() => {
      fetchOrder(true);
    }, 30000);

    const clockInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(clockInterval);
    };
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading order...</span>
        </div>
        <p className="mt-3">Loading your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    const needsLogin =
      error.toLowerCase().includes("log in") ||
      error.toLowerCase().includes("login session");

    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-circle display-3 text-warning"></i>
        <h3 className="mt-3">Unable to display order</h3>
        <p className="text-muted">
          {error || "Order details are unavailable."}
        </p>

        {needsLogin ? (
          <Link to="/login" className="btn btn-success">
            Customer Login
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-success"
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
          >
            Try Again
          </button>
        )}

        <Link to="/my-orders" className="btn btn-outline-success ms-2">
          My Orders
        </Link>
      </div>
    );
  }

  const address = order.deliveryAddress || {};
  const rider = order.rider || {};

  const estimatedDate = order.estimatedDeliveryAt
    ? new Date(order.estimatedDeliveryAt)
    : null;

  const validEstimatedDate =
    estimatedDate && !Number.isNaN(estimatedDate.getTime());

  const minutesRemaining = validEstimatedDate
    ? Math.ceil((estimatedDate.getTime() - currentTime) / 60000)
    : null;

  const cancelled = order.status === "Cancelled";
  const delivered = order.status === "Delivered";
  const riderAssigned = Boolean(rider.name && rider.phone);

  const currentStep = DELIVERY_STEPS.findIndex(
    (step) => step.status === order.status,
  );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <i
                className={`bi ${
                  cancelled
                    ? "bi-x-circle-fill text-danger"
                    : "bi-check-circle-fill text-success"
                } display-2`}
              ></i>

              <h2 className="fw-bold mt-3">
                {cancelled ? "Order cancelled" : "Your FreshMart order"}
              </h2>

              <p className="text-muted">
                {cancelled
                  ? "This order has been cancelled."
                  : delivered
                    ? "Your groceries have been delivered. Thank you for shopping with us!"
                    : "Track your order and view your delivery details."}
              </p>
            </div>

            <div
              className={`alert ${
                cancelled
                  ? "alert-danger"
                  : delivered
                    ? "alert-success"
                    : "alert-success"
              }`}
            >
              <div className="text-break">
                <strong>Order ID:</strong> {order._id}
              </div>

              <div className="mt-1">
                <strong>Status:</strong> {order.status}
              </div>

              <div className="mt-1">
                <strong>Payment:</strong> Cash on Delivery
              </div>
            </div>

            {!cancelled && (
              <section className="border rounded-4 p-3 p-md-4 mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-geo-alt me-2 text-success"></i>
                    Delivery Tracking
                  </h5>

                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={() => fetchOrder(true)}
                    disabled={refreshing}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {validEstimatedDate ? (
                  <div className="bg-light rounded-3 p-3 mb-4">
                    <div className="text-muted small">Estimated delivery</div>

                    <div className="fs-5 fw-bold mt-1">
                      {estimatedDate.toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>

                    {delivered ? (
                      <div className="text-success small mt-2">
                        Order delivered
                        {order.deliveredAt
                          ? ` at ${new Date(
                              order.deliveredAt,
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "."}
                      </div>
                    ) : minutesRemaining > 0 ? (
                      <div className="text-success small mt-2">
                        Approximately {minutesRemaining} minute
                        {minutesRemaining === 1 ? "" : "s"} until the estimated
                        arrival time.
                      </div>
                    ) : (
                      <div className="text-warning small mt-2">
                        The estimated arrival time has passed. Please refresh
                        for the latest order status.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-light border">
                    <i className="bi bi-clock me-2"></i>
                    Your delivery estimate has not been set yet.
                  </div>
                )}

                <div className="d-flex flex-column gap-3">
                  {DELIVERY_STEPS.map((step, index) => {
                    const isComplete = currentStep >= 0 && index < currentStep;

                    const isCurrent = index === currentStep;

                    return (
                      <div
                        className="d-flex align-items-start gap-3"
                        key={step.status}
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                            isComplete || isCurrent
                              ? "bg-success text-white"
                              : "bg-light text-secondary"
                          }`}
                          style={{
                            width: "42px",
                            height: "42px",
                          }}
                        >
                          <i className={`bi ${step.icon}`}></i>
                        </div>

                        <div className="pt-1">
                          <div
                            className={`fw-semibold ${
                              isCurrent ? "text-success" : ""
                            }`}
                          >
                            {step.label}
                          </div>

                          <small className="text-muted">
                            {isCurrent
                              ? "Current status"
                              : isComplete
                                ? "Completed"
                                : "Awaiting this stage"}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <hr />

                <h6 className="fw-bold mb-3">
                  <i className="bi bi-person-badge me-2 text-success"></i>
                  Delivery Partner
                </h6>

                {riderAssigned ? (
                  <div className="bg-light rounded-3 p-3">
                    <div className="fw-bold fs-5">{rider.name}</div>

                    <div className="text-muted small mt-1">
                      Delivery partner assigned
                    </div>

                    <div className="mt-3">
                      <a
                        href={`tel:${rider.phone}`}
                        className="btn btn-outline-success btn-sm"
                      >
                        <i className="bi bi-telephone me-2"></i>
                        Call {rider.phone}
                      </a>
                    </div>

                    {rider.vehicleNumber && (
                      <div className="mt-3 small">
                        <strong>Vehicle number:</strong> {rider.vehicleNumber}
                      </div>
                    )}

                    {rider.assignedAt && (
                      <div className="text-muted small mt-2">
                        Assigned on{" "}
                        {new Date(rider.assignedAt).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-light border mb-0">
                    <i className="bi bi-person-plus me-2"></i>A delivery partner
                    has not been assigned yet. Their details will appear here
                    when available.
                  </div>
                )}

                <p className="text-muted small mt-3 mb-0">
                  Last updated:{" "}
                  {lastUpdated
                    ? lastUpdated.toLocaleTimeString("en-IN")
                    : "Not available"}
                  . Delivery information refreshes periodically. Live GPS
                  tracking is not currently available.
                </p>
              </section>
            )}

            <h5 className="fw-bold mt-3 mb-3">Items ordered</h5>

            {(order.items || []).map((item, index) => (
              <div
                className="d-flex justify-content-between gap-3 mb-3"
                key={`${item.product || item.name}-${index}`}
              >
                <div>
                  <div>{item.name}</div>
                  <small className="text-muted">
                    Quantity: {item.quantity}
                  </small>
                </div>

                <strong className="text-nowrap">
                  ₹
                  {(
                    Number(item.price || 0) * Number(item.quantity || 0)
                  ).toFixed(2)}
                </strong>
              </div>
            ))}

            <hr />

            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Delivery</span>
              <span>₹{Number(order.deliveryCharge || 0).toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <span>Tax</span>
              <span>₹{Number(order.tax || 0).toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between fs-5">
              <strong>Total to pay</strong>
              <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
            </div>

            <hr className="my-4" />

            <h5 className="fw-bold mb-3">Delivery address</h5>

            <p className="mb-1">{address.name}</p>
            <p className="mb-1">{address.phone}</p>

            <p className="text-muted">
              {[address.address, address.city, address.state, address.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
              <Link
                to="/my-orders"
                className="btn btn-outline-success flex-fill"
              >
                <i className="bi bi-receipt me-2"></i>
                My Orders
              </Link>

              <Link to="/" className="btn btn-success flex-fill">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
