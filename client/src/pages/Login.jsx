import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (!data.user || data.user.role !== "user" || !data.token) {
        throw new Error("Unable to log in with a customer account.");
      }

      // Store customer login separately from the admin session.
      localStorage.setItem("freshmartCustomerToken", data.token);
      localStorage.setItem("freshmartCustomer", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="container py-5">
        <div className="row justify-content-center align-items-center">
          <div className="col-12 col-md-9 col-lg-7 col-xl-6">
            <div className="signup-card">
              <div className="text-center mb-4">
                <Link to="/" className="signup-brand">
                  <i className="bi bi-basket2-fill me-2"></i>
                  FreshMart
                </Link>

                <h2 className="signup-title mt-3">Welcome back!</h2>

                <p className="signup-subtitle">
                  Log in to continue your FreshMart shopping.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label">
                    Email address
                  </label>

                  <input
                    type="email"
                    id="loginEmail"
                    className="form-control signup-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="loginPassword" className="form-label">
                    Password
                  </label>

                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPassword"
                    className="form-control signup-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    id="showLoginPassword"
                    className="form-check-input"
                    checked={showPassword}
                    onChange={(event) => setShowPassword(event.target.checked)}
                  />

                  <label
                    htmlFor="showLoginPassword"
                    className="form-check-label"
                  >
                    Show password
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn signup-button w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <p className="text-center signup-login mt-4 mb-0">
                Don't have an account?{" "}
                <Link to="/pages/signup">Create an account</Link>
              </p>

              <p className="text-center mt-3 mb-0">
                <Link to="/" className="signup-home-link">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to FreshMart
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
