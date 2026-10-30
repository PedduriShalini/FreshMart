import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || data.user?.role !== "admin") {
        throw new Error("This account does not have administrator access.");
      }

      localStorage.setItem("freshmartToken", data.token);
      localStorage.setItem("freshmartUser", JSON.stringify(data.user));

      navigate("/admin", { replace: true });
    } catch (error) {
      setError(
        error.message || "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div
        className="card border-0 shadow-sm p-4 p-md-5"
        style={{ width: "100%", maxWidth: "440px", borderRadius: "16px" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-success">FreshMart</h2>
          <p className="text-muted mb-0">Administrator Login</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="adminEmail" className="form-label">
              Email address
            </label>
            <input
              id="adminEmail"
              type="email"
              className="form-control"
              placeholder="Enter your admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="adminPassword" className="form-label">
              Password
            </label>
            <input
              id="adminPassword"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-2"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-success text-decoration-none">
            <i className="bi bi-arrow-left me-2"></i>
            Back to FreshMart Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
