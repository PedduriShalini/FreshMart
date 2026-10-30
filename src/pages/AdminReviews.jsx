import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const statuses = ["All", "Pending", "Approved", "Rejected"];

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("freshmartToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const query =
        statusFilter === "All"
          ? ""
          : `?status=${encodeURIComponent(statusFilter)}`;

      const response = await fetch(`${API_URL}/api/reviews/admin/all${query}`, {
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
        throw new Error(data.message || "Unable to load reviews.");
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [navigate, statusFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function moderateReview(review, status) {
    const action = status === "Approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this review?`)) {
      return;
    }

    setUpdatingId(review._id);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("freshmartToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/api/reviews/admin/${review._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
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
        throw new Error(data.message || "Unable to update review.");
      }

      setMessage(data.message || `Review ${action}d successfully.`);
      await loadReviews();
    } catch (err) {
      setError(err.message || "Unable to update review.");
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = reviews.filter(
    (review) => review.status === "Pending",
  ).length;

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
            <h2 className="fw-bold mb-1">Reviews</h2>
            <p className="text-muted mb-0">
              Review customer feedback before publishing it.
            </p>
          </div>

          <Link to="/admin" className="btn btn-outline-success">
            <i className="bi bi-arrow-left me-2"></i>
            Dashboard
          </Link>
        </div>

        {message && (
          <div className="alert alert-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <p className="text-muted mb-2">Reviews shown</p>
                <h3 className="fw-bold mb-0">{reviews.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <p className="text-muted mb-2">Pending in this view</p>
                <h3 className="fw-bold mb-0">{pendingCount}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <p className="text-muted mb-2">Current filter</p>
                <h3 className="fw-bold mb-0">{statusFilter}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
              <h5 className="fw-bold mb-0">Customer Feedback</h5>

              <div className="d-flex gap-2 flex-wrap">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn-sm ${
                      statusFilter === status
                        ? "btn-success"
                        : "btn-outline-success"
                    }`}
                    onClick={() => {
                      setMessage("");
                      setStatusFilter(status);
                    }}
                  >
                    {status}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={loadReviews}
                  disabled={loading}
                  aria-label="Refresh reviews"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="p-4 mb-0">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="p-4 mb-0">No reviews found for this filter.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Customer</th>
                    <th>Product</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id}>
                      <td className="ps-4">
                        <div className="fw-semibold">
                          {review.user?.name || "Unknown customer"}
                        </div>
                        <small className="text-muted">
                          {review.user?.email || ""}
                        </small>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {review.product?.image && (
                            <img
                              src={review.product.image}
                              alt={review.product.name || "Product"}
                              style={{
                                width: "42px",
                                height: "42px",
                                objectFit: "contain",
                              }}
                            />
                          )}
                          <span>
                            {review.product?.name || "Product unavailable"}
                          </span>
                        </div>
                      </td>

                      <td className="text-nowrap">
                        <span className="text-warning">
                          {"★".repeat(review.rating)}
                        </span>
                        <span className="text-muted">
                          {"☆".repeat(5 - review.rating)}
                        </span>
                        <small className="ms-1">{review.rating}/5</small>
                      </td>

                      <td style={{ minWidth: "200px", maxWidth: "320px" }}>
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {review.comment}
                        </div>
                      </td>

                      <td>{formatDate(review.createdAt)}</td>

                      <td>
                        <span
                          className={`badge ${
                            review.status === "Approved"
                              ? "bg-success"
                              : review.status === "Rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {review.status}
                        </span>
                      </td>

                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          {review.status !== "Approved" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              disabled={updatingId === review._id}
                              onClick={() => moderateReview(review, "Approved")}
                            >
                              Approve
                            </button>
                          )}

                          {review.status !== "Rejected" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={updatingId === review._id}
                              onClick={() => moderateReview(review, "Rejected")}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminReviews;
