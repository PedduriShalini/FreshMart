import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/products.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FALLBACK_IMAGE = "/images/products/product-img-1.jpg";

function Products({ selectedCategory = "", searchText = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } =
    useCart();

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error("Failed to load products.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid product data received.");
        }

        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);

        if (isMounted) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const search = (searchText || "").trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const category =
      typeof product.category === "string"
        ? product.category
        : product.category?.name || "";

    const matchesCategory = !selectedCategory || category === selectedCategory;

    const matchesSearch =
      !search ||
      (product.name || "").toLowerCase().includes(search) ||
      category.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <section
      className="container py-5 freshmart-products"
      id="featured-products"
    >
      <div className="products-heading mb-4">
        <h2 className="fw-bold">
          {selectedCategory
            ? selectedCategory
            : search
              ? "Search Results"
              : "Featured Products"}
        </h2>

        <p className="text-muted">
          {selectedCategory
            ? `Explore our ${selectedCategory.toLowerCase()} collection.`
            : "Discover fresh picks for your everyday needs."}
        </p>

        {search && (
          <p className="mb-2">
            Searching for: <strong>{searchText.trim()}</strong>
          </p>
        )}

        {!loading && !error && (
          <small className="text-muted">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found
          </small>
        )}
      </div>

      {loading && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-success" aria-hidden="true" />
          <p className="text-muted mt-2">Loading products...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-warning" role="alert">
          {error}
          <button
            type="button"
            className="btn btn-sm btn-outline-success ms-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-basket3 display-4 text-muted" />
          <h5 className="mt-3">No products found</h5>
          <p className="text-muted">
            Try another search or choose a different category.
          </p>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const cartItem = cartItems.find((item) => item._id === product._id);

            const category =
              typeof product.category === "string"
                ? product.category
                : product.category?.name || "";

            return (
              <article className="product-card" key={product._id}>
                <Link
                  to={`/product?id=${product._id}`}
                  className="product-details-link"
                  aria-label={`View ${product.name} details`}
                >
                  <div className="product-image-container">
                    <img
                      src={product.image || FALLBACK_IMAGE}
                      className="product-image"
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <div className="product-information">
                    <small className="product-category">{category}</small>

                    <h3 className="product-title" title={product.name}>
                      {product.name}
                    </h3>
                  </div>
                </Link>

                <div className="product-card-bottom">
                  <strong className="product-price">
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                  </strong>

                  {!cartItem ? (
                    <button
                      type="button"
                      className="btn btn-success btn-sm product-add-button"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <i className="bi bi-plus-lg me-1" />
                      Add
                    </button>
                  ) : (
                    <div className="product-quantity-controls">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => decreaseQuantity(product._id)}
                        aria-label={`Decrease ${product.name} quantity`}
                      >
                        −
                      </button>

                      <span aria-live="polite">{cartItem.quantity}</span>

                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => increaseQuantity(product._id)}
                        aria-label={`Increase ${product.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Products;
