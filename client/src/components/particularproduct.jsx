import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import TopBar from "./topbar";
import Footer from "./footer";
import { useCart } from "../context/CartContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function StarRating({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating || 0)));

  return (
    <span className="text-warning" aria-label={`${safeRating} out of 5 stars`}>
      {"★".repeat(safeRating)}
      <span className="text-secondary">{"☆".repeat(5 - safeRating)}</span>
    </span>
  );
}

export default function SimpleSlider() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!productId) {
        setProduct(null);
        setError("Please select a product to view its details.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setProduct(null);
      setQuantity(1);
      setCartMessage("");

      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`);

        if (!response.ok) {
          throw new Error("Product not found.");
        }

        const data = await response.json();

        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading product:", err);
          setError("Unable to load this product. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function loadReviews() {
    if (!productId) return;

    setReviewsLoading(true);
    setReviewsError("");

    try {
      const response = await fetch(
        `${API_URL}/api/reviews/product/${productId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reviews.");
      }

      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) {
      setReviewsError(err.message || "Unable to load reviews.");
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
    // Reload public reviews when the selected product changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewError("");
    setReviewMessage("");

    const token = localStorage.getItem("freshmartCustomerToken");

    if (!token) {
      setReviewError(
        "Please log in with your customer account to submit a review.",
      );
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setReviewError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (comment.trim().length < 3 || comment.trim().length > 1000) {
      setReviewError("Your review must be between 3 and 1000 characters.");
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("freshmartCustomerToken");
        localStorage.removeItem("freshmartCustomer");
        throw new Error("Your session expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit review.");
      }

      setReviewMessage(
        data.message || "Review submitted and awaiting admin approval.",
      );
      setComment("");
      setRating(5);
    } catch (err) {
      setReviewError(err.message || "Unable to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  function handleAddToCart() {
    if (!product || product.stock <= 0) return;

    const stock = Number(product.stock) || 0;
    const quantityToAdd = Math.min(quantity, stock);

    for (let i = 0; i < quantityToAdd; i++) {
      addToCart(product);
    }

    setCartMessage(`${quantityToAdd} ${product.name} added to your cart.`);
  }

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="container py-5">
          <p>Loading product details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <TopBar />
        <div className="container py-5 text-center">
          <h4>Product unavailable</h4>
          <p className="text-muted">
            {error || "We couldn't find this product."}
          </p>
          <Link to="/search" className="btn btn-success">
            Search Products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBar />

      <div className="container mt-5">
        <div className="row align-items-start">
          {/* One image per product */}
          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-white">
              <img
                src={product.image}
                className="w-100 rounded"
                style={{
                  height: "500px",
                  objectFit: "contain",
                }}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.alt = `${product.name} image unavailable`;
                }}
              />
            </div>
          </div>

          <div className="col-md-6 ps-md-5 mt-4 mt-md-0">
            <p className="text-success fw-bold">{product.category}</p>

            <h1 className="fw-bold display-5">{product.name}</h1>

            <div className="d-flex align-items-center gap-2 mt-3">
              <span className="fw-bold fs-1">₹{product.price}</span>
            </div>

            {totalReviews > 0 && (
              <div className="mt-2">
                <StarRating rating={averageRating} />
                <span className="text-muted ms-2">
                  {averageRating.toFixed(1)} ({totalReviews} reviews)
                </span>
              </div>
            )}

            <p className="text-muted mt-3">
              {product.description ||
                "Fresh quality products for your everyday needs."}
            </p>

            <div className="d-flex align-items-center gap-3 mt-4 flex-wrap">
              <div className="border rounded d-flex align-items-center px-2 py-1">
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setQuantity((previous) => (previous > 1 ? previous - 1 : 1))
                  }
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  −
                </button>

                <span className="px-2 fw-bold">{quantity}</span>

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setQuantity((previous) =>
                      Math.min(previous + 1, Number(product.stock) || 1),
                    )
                  }
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stock || product.stock <= 0}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-success px-4 py-2 fw-bold"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <i className="bi bi-cart-plus me-2"></i>
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>

            {cartMessage && (
              <div className="alert alert-success mt-3" role="status">
                {cartMessage} <Link to="/cart">View cart</Link>
              </div>
            )}

            <div className="text-muted fw-bold mt-4">
              <p>Product ID: {product._id}</p>
              <p>
                Availability:{" "}
                {product.stock > 0 ? "In Stock" : "Currently unavailable"}
              </p>
              <p>Category: {product.category}</p>
              <p>Shipping: Delivery details will be confirmed at checkout.</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <ul className="nav nav-tabs mb-4">
            {[
              { id: "details", label: "Product Details" },
              { id: "information", label: "Information" },
              { id: "reviews", label: "Reviews" },
              { id: "seller", label: "Seller Info" },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  type="button"
                  className={`nav-link fw-bold ${
                    activeTab === tab.id ? "active text-success" : "text-dark"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {activeTab === "details" && (
            <div>
              <h3>Product Details</h3>
              <p>
                {product.description ||
                  `${product.name} is available at FreshMart for your everyday shopping needs.`}
              </p>

              <h6>Storage Tips</h6>
              <p>Follow the storage instructions on the product packaging.</p>

              <h6>Category</h6>
              <p>{product.category}</p>

              <h6>Price</h6>
              <p>₹{product.price}</p>

              <h6>Disclaimer</h6>
              <p>
                Product images are illustrative. Packaging may vary from the
                actual item.
              </p>
            </div>
          )}

          {activeTab === "information" && (
            <div>
              <h3>Product Information</h3>
              <p>
                {product.description ||
                  "No additional information is available for this product yet."}
              </p>
              <p>Available stock: {product.stock ?? 0}</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="mb-1">Customer Reviews</h3>

                  {totalReviews > 0 ? (
                    <p className="text-muted mb-0">
                      <StarRating rating={averageRating} />
                      <span className="ms-2">
                        {averageRating.toFixed(1)} out of 5 · {totalReviews}{" "}
                        approved review{totalReviews === 1 ? "" : "s"}
                      </span>
                    </p>
                  ) : (
                    <p className="text-muted mb-0">
                      No approved reviews yet. Be the first to share feedback
                      after purchasing this product.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={loadReviews}
                  disabled={reviewsLoading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
              </div>

              {reviewsError && (
                <div className="alert alert-danger" role="alert">
                  {reviewsError}
                </div>
              )}

              {reviewsLoading ? (
                <p>Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="border rounded-3 p-4 text-center mb-4">
                  <i className="bi bi-chat-square-text fs-2 text-muted"></i>
                  <p className="text-muted mt-2 mb-0">
                    Approved customer reviews will appear here.
                  </p>
                </div>
              ) : (
                <div className="mb-5">
                  {reviews.map((review) => (
                    <div
                      key={review.id || review._id}
                      className="border-bottom py-3"
                    >
                      <div className="d-flex justify-content-between flex-wrap gap-2">
                        <strong>{review.customerName}</strong>
                        <small className="text-muted">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </small>
                      </div>

                      <div className="my-2">
                        <StarRating rating={review.rating} />
                      </div>

                      <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-2">Write a Review</h4>
                  <p className="text-muted">
                    Reviews are checked by our team before they are published.
                    You must have a delivered order containing this product.
                  </p>

                  {reviewMessage && (
                    <div className="alert alert-success" role="status">
                      {reviewMessage}
                    </div>
                  )}

                  {reviewError && (
                    <div className="alert alert-danger" role="alert">
                      {reviewError}
                      {reviewError.toLowerCase().includes("log in") && (
                        <>
                          {" "}
                          <Link to="/login">Log in</Link>
                        </>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Your Rating
                      </label>

                      <div className="d-flex gap-2 align-items-center">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            className="btn p-0 border-0"
                            onClick={() => setRating(value)}
                            aria-label={`Rate ${value} out of 5`}
                            aria-pressed={rating === value}
                            style={{
                              color: value <= rating ? "#f0ad00" : "#b8b8b8",
                              fontSize: "2rem",
                              lineHeight: 1,
                            }}
                          >
                            ★
                          </button>
                        ))}

                        <span className="text-muted ms-2">{rating}/5</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="reviewComment"
                        className="form-label fw-semibold"
                      >
                        Your Review
                      </label>

                      <textarea
                        id="reviewComment"
                        className="form-control"
                        rows="4"
                        minLength={3}
                        maxLength={1000}
                        placeholder="Tell us about your experience..."
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        required
                      />

                      <small className="text-muted">
                        {comment.length}/1000 characters
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={submittingReview}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seller" && (
            <div>
              <h3>Seller Information</h3>
              <p>Sold through FreshMart.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
