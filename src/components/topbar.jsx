import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/topbar.css";

function TopBar({ searchText = "", setSearchText = () => {} }) {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  // Read the logged-in customer from localStorage
  let customer = null;

  try {
    const savedCustomer = localStorage.getItem("freshmartCustomer");

    if (savedCustomer) {
      customer = JSON.parse(savedCustomer);
    }
  } catch (error) {
    console.error("Unable to read customer session:", error);
  }

  // Search products
  function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  // Customer logout
  function handleLogout() {
    localStorage.removeItem("freshmartCustomerToken");
    localStorage.removeItem("freshmartCustomer");

    navigate("/login");
    window.location.reload();
  }

  return (
    <div className="topbar-wrapper">
      {/* Top announcement bar */}
      <div className="bg-light py-1 border-bottom topbar">
        <div className="container d-flex justify-content-between">
          <small>Super Value Deals - Save more with coupons</small>

          <span>English</span>
        </div>
      </div>

      {/* Logo, search and account */}
      <div className="py-3 border-bottom header">
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="text-decoration-none text-success"
            aria-label="FreshMart home"
          >
            <h4 className="fw-bold m-0 logo">FreshMart</h4>
          </Link>

          {/* Search */}
          <form
            className="d-flex flex-grow-1 search-box"
            onSubmit={handleSearch}
            role="search"
          >
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search for products"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="Search products"
            />

            <button
              type="submit"
              className="btn btn-outline-secondary"
              aria-label="Search"
            >
              <i className="bi bi-search"></i>
            </button>
          </form>

          {/* Account and cart */}
          <div className="d-flex gap-3 icons align-items-center">
            {/* Customer account dropdown */}
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Account menu"
              >
                <i className="bi bi-person"></i>

                <span className="small">{customer?.name || "Account"}</span>
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                {customer ? (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/my-orders">
                        <i className="bi bi-box-seam me-2"></i>
                        My Orders
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/cart">
                        <i className="bi bi-cart me-2"></i>
                        My Cart
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        type="button"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/login">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Customer Login
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/pages/signup">
                        <i className="bi bi-person-plus me-2"></i>
                        Create Account
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Cart icon and item count */}
            <Link
              to="/cart"
              className="text-dark position-relative"
              aria-label={`Shopping cart, ${cartCount} items`}
              style={{ textDecoration: "none" }}
            >
              <i className="bi bi-cart"></i>

              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                  style={{ fontSize: "10px" }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm nav-section">
        <div className="container">
          {/* All departments */}
          <button
            type="button"
            className="btn btn-success me-3"
            onClick={() => navigate("/shopproducts")}
          >
            <i className="bi bi-list me-1"></i>
            All Departments
          </button>

          {/* Mobile navigation toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#freshmart-menu"
            aria-controls="freshmart-menu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation links */}
          <div className="collapse navbar-collapse" id="freshmart-menu">
            <ul className="navbar-nav align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/shopproducts">
                  Shop
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/search">
                  Search Products
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/my-orders">
                  My Orders
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/cart">
                  Cart
                  {cartCount > 0 && (
                    <span className="badge bg-success ms-2">{cartCount}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default TopBar;
