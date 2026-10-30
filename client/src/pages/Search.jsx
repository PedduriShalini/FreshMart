import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "../components/topbar";
import Footer from "../components/footer";
import { useCart } from "../context/CartContext";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } =
    useCart();

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load products");
        }
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error(err);
        setError("Unable to load products. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchText(searchParams.get("q") || "");
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const query = searchText.trim().toLowerCase();

    return (
      query === "" ||
      (product.name || "").toLowerCase().includes(query) ||
      (product.category || "").toLowerCase().includes(query)
    );
  });

  const suggestions = [
    "Milk",
    "Butter",
    "Bread",
    "Rice",
    "Coffee",
    "Snacks",
    "Eggs",
    "Chocolate",
  ];

  function handleSearch(event) {
    event.preventDefault();
    setSearchParams(searchText.trim() ? { q: searchText.trim() } : {});
  }

  function selectSuggestion(value) {
    setSearchText(value);
    setSearchParams({ q: value });
  }

  return (
    <>
      <TopBar />

      <main className="container py-4">
        <div className="mx-auto" style={{ maxWidth: "1100px" }}>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group input-group-lg">
              <input
                type="search"
                className="form-control"
                placeholder="Search for products"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                autoFocus
                aria-label="Search all products"
              />

              {searchText && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchText("");
                    setSearchParams({});
                  }}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              <button className="btn btn-success" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          <div className="d-flex flex-wrap gap-2 mb-4">
            {suggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                className="btn btn-outline-secondary rounded-pill"
                onClick={() => selectSuggestion(suggestion)}
              >
                <i className="bi bi-search me-2"></i>
                {suggestion}
              </button>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold">
              {searchText.trim()
                ? `Results for "${searchText.trim()}"`
                : "Explore Products"}
            </h5>

            {!loading && !error && (
              <small className="text-muted">
                {filteredProducts.length} products found
              </small>
            )}
          </div>

          {loading && <p>Loading products...</p>}

          {error && <p className="text-danger">{error}</p>}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-search fs-1 text-muted"></i>
              <h5 className="mt-3">No products found</h5>
              <p className="text-muted">
                Try another product name or select a suggestion.
              </p>
            </div>
          )}

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
            {filteredProducts.map((product) => {
              const cartItem = cartItems.find(
                (item) => item._id === product._id,
              );

              return (
                <div className="col" key={product._id}>
                  <div className="card h-100 p-3 product-card">
                    <Link
                      to={`/product?id=${product._id}`}
                      className="text-decoration-none text-dark"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="card-img-top"
                        style={{
                          height: "150px",
                          objectFit: "contain",
                        }}
                      />

                      <small className="text-muted">{product.category}</small>

                      <h6 className="mt-2">{product.name}</h6>
                    </Link>

                    <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                      <strong>₹{product.price}</strong>

                      {!cartItem ? (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => addToCart(product)}
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => decreaseQuantity(product._id)}
                            aria-label={`Decrease ${product.name}`}
                          >
                            −
                          </button>

                          <span>{cartItem.quantity}</span>

                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => increaseQuantity(product._id)}
                            aria-label={`Increase ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Search;
