import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import TopBar from "./topbar";
import Footer from "./footer";
import SidebarProducts from "./sidebarforproducts";
import { useCart } from "../context/CartContext";

const categoryAliases = {
  "dairy, bread & eggs": ["dairy, bread & eggs", "dairy", "bread", "eggs"],
  "snacks & munchies": ["snacks & munchies", "snacks", "munchies"],
  "fruits & vegetables": [
    "fruits & vegetables",
    "fruits",
    "vegetables",
    "fruit",
    "veggies",
  ],
  "cold drinks & juices": [
    "cold drinks & juices",
    "cold drinks",
    "drinks",
    "juices",
    "beverages",
  ],
  "breakfast & instant food": [
    "breakfast & instant food",
    "breakfast",
    "instant food",
  ],
  "bakery & biscuits": ["bakery & biscuits", "bakery", "biscuits"],
  "chicken, meat & fish": [
    "chicken, meat & fish",
    "chicken",
    "meat",
    "fish",
    "seafood",
  ],
  "tea, coffee & drinks": ["tea, coffee & drinks", "tea", "coffee"],
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function matchesCategory(productCategory, selectedCategory) {
  const selected = normalize(selectedCategory);
  const product = normalize(productCategory);

  if (!selected) {
    return true;
  }

  const aliases = categoryAliases[selected] || [selected];

  return aliases.some((alias) => {
    const normalizedAlias = normalize(alias);

    return product === normalizedAlias || product.includes(normalizedAlias);
  });
}

function ShopProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [searchText, setSearchText] = useState("");
  const [selectedStore, setSelectedStore] = useState("All Stores");
  const [maxPrice, setMaxPrice] = useState(5000);

  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } =
    useCart();

  // Synchronize the selected category with the URL.
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  // Fetch products from the backend.
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5000/api/products");

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected product data received");
        }

        if (!cancelled) {
          setProducts(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading shop products:", err);
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCategoryChange(category) {
    setSelectedCategory(category);

    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  }

  function clearFilters() {
    setSelectedCategory("");
    setSearchText("");
    setSelectedStore("All Stores");
    setMaxPrice(5000);
    setSearchParams({});
  }

  const filteredProducts = useMemo(() => {
    const query = normalize(searchText);

    return products.filter((product) => {
      const productCategory = normalize(product.category);

      const categoryMatch = matchesCategory(productCategory, selectedCategory);

      const searchMatch =
        !query ||
        normalize(product.name).includes(query) ||
        productCategory.includes(query) ||
        normalize(product.description).includes(query);

      // Store filtering requires store/storeName data on products.
      const productStore = normalize(product.store || product.storeName);

      const storeMatch =
        selectedStore === "All Stores" ||
        productStore === normalize(selectedStore);

      const price = Number(product.price);
      const priceMatch = Number.isFinite(price) && price <= maxPrice;

      return categoryMatch && searchMatch && storeMatch && priceMatch;
    });
  }, [products, selectedCategory, searchText, selectedStore, maxPrice]);

  return (
    <>
      <TopBar />

      <div className="container mt-5">
        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <SidebarProducts
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              searchText={searchText}
              setSearchText={setSearchText}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          </div>

          <div className="col-12 col-lg-9">
            <div
              className="rounded p-4 p-md-5 mb-4"
              style={{ backgroundColor: "#f1f5f2" }}
            >
              <h2>Shop Products</h2>
              <p className="text-muted mb-0">
                Find your everyday essentials at FreshMart.
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <p className="mb-0">
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} Products found`}
              </p>

              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="alert alert-light border">
                No products match your filters. Try changing or clearing your
                filters.
              </div>
            )}

            {filteredProducts.map((product) => {
              const cartItem = cartItems.find(
                (item) => item._id === product._id,
              );

              const stock = Number(product.stock) || 0;

              return (
                <div className="card mb-4 p-3" key={product._id}>
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-sm-4 col-md-3 text-center">
                      <Link to={`/product?id=${product._id}`}>
                        <img
                          src={product.image}
                          className="img-fluid"
                          style={{
                            height: "170px",
                            width: "100%",
                            objectFit: "contain",
                          }}
                          alt={product.name || "Product"}
                        />
                      </Link>
                    </div>

                    <div className="col-12 col-sm-8 col-md-6">
                      <small className="text-muted">{product.category}</small>

                      <Link
                        to={`/product?id=${product._id}`}
                        className="text-decoration-none text-dark"
                      >
                        <h5 className="mt-2">{product.name}</h5>
                      </Link>

                      {product.description && (
                        <p className="text-muted mb-2">{product.description}</p>
                      )}

                      <h6 className="fw-bold">₹{product.price}</h6>

                      <small
                        className={stock > 0 ? "text-success" : "text-danger"}
                      >
                        {stock > 0 ? "In Stock" : "Out of Stock"}
                      </small>
                    </div>

                    <div className="col-12 col-md-3 text-md-end">
                      {!cartItem ? (
                        <button
                          type="button"
                          className="btn btn-success"
                          disabled={stock <= 0}
                          onClick={() => addToCart(product)}
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="d-flex justify-content-md-end align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => decreaseQuantity(product._id)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>

                          <span>{cartItem.quantity}</span>

                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={cartItem.quantity >= stock}
                            onClick={() => increaseQuantity(product._id)}
                            aria-label={`Increase ${product.name} quantity`}
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
      </div>

      <Footer />
    </>
  );
}

export default ShopProducts;
