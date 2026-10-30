import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    category: "",
    price: "",
    image: "",
    description: "",
    stock: "0",
    featured: false,
  };

  const [formData, setFormData] = useState(emptyForm);

  function getToken() {
    return localStorage.getItem("freshmartToken");
  }

  function getAuthHeaders(includeJson = false) {
    const headers = {};

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  function handleUnauthorized(status) {
    if (status === 401) {
      localStorage.removeItem("freshmartToken");
      localStorage.removeItem("freshmartUser");
      navigate("/admin/login", { replace: true });
      return true;
    }

    return false;
  }

  async function loadProducts() {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error("Failed to load products.");
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    setCategoriesLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error("Failed to load categories.");
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load categories. Please try again.");
    } finally {
      setCategoriesLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const filteredProducts = products.filter((product) => {
    const search = searchText.trim().toLowerCase();

    const categoryName =
      typeof product.category === "string"
        ? product.category
        : product.category?.name || "";

    return (
      (product.name || "").toLowerCase().includes(search) ||
      categoryName.toLowerCase().includes(search)
    );
  });

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startAddProduct() {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function startEditProduct(product) {
    const categoryName =
      typeof product.category === "string"
        ? product.category
        : product.category?.name || "";

    setEditingId(product._id);

    setFormData({
      name: product.name || "",
      category: categoryName,
      price: String(product.price ?? ""),
      image: product.image || "",
      description: product.description || "",
      stock: String(product.stock ?? 0),
      featured: Boolean(product.featured),
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!getToken()) {
      setError("Please sign in again to manage products.");
      navigate("/admin/login", { replace: true });
      return;
    }

    if (categoriesLoading) {
      setError("Please wait while categories are loading.");
      return;
    }

    if (categories.length === 0) {
      setError("Create a category before adding a product.");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      category: formData.category.trim(),
      image: formData.image.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    const selectedCategoryExists = categories.some(
      (category) => category.name === payload.category,
    );

    if (
      !payload.name ||
      !selectedCategoryExists ||
      !payload.image ||
      formData.price.trim() === "" ||
      !Number.isFinite(payload.price) ||
      payload.price < 0 ||
      formData.stock.trim() === "" ||
      !Number.isInteger(payload.stock) ||
      payload.stock < 0
    ) {
      setError(
        "Enter a valid product name, category, image, price, and whole-number stock quantity.",
      );
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (handleUnauthorized(response.status)) {
        return;
      }

      if (response.status === 403) {
        throw new Error("Your account does not have administrator permission.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to save product.");
      }

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product created successfully.",
      );

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);

      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    if (!getToken()) {
      setError("Please sign in again to manage products.");
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${product._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (handleUnauthorized(response.status)) {
        return;
      }

      if (response.status === 403) {
        throw new Error("Your account does not have administrator permission.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  }

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
            <h2 className="fw-bold mb-1">Products</h2>
            <p className="text-muted mb-0">
              Manage your FreshMart product inventory.
            </p>
          </div>

          <Link to="/admin" className="btn btn-outline-success">
            <i className="bi bi-arrow-left me-2"></i>
            Dashboard
          </Link>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <div className="row align-items-center g-3">
              <div className="col-md-6">
                <h5 className="mb-1">All Products</h5>
                <p className="text-muted mb-0">
                  {products.length} products in your database
                </p>
              </div>

              <div className="col-md-6">
                <div className="d-flex gap-2">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search products or categories"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                  />

                  <button
                    type="button"
                    className="btn btn-success text-nowrap"
                    onClick={startAddProduct}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        {showForm && (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                {editingId ? "Edit Product" : "Create Product"}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Product Name *</label>
                    <input
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Category *</label>

                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      disabled={categoriesLoading || categories.length === 0}
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Loading categories..."
                          : categories.length === 0
                            ? "No categories available"
                            : "Select a category"}
                      </option>

                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}

                      {formData.category &&
                        !categories.some(
                          (category) => category.name === formData.category,
                        ) && (
                          <option value={formData.category}>
                            {formData.category} (existing product)
                          </option>
                        )}
                    </select>

                    {categories.length === 0 && !categoriesLoading && (
                      <div className="form-text">
                        Add a category from the Categories page first.{" "}
                        <Link to="/admin/categories">Manage categories</Link>
                      </div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      className="form-control"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Stock Quantity *</label>
                    <input
                      className="form-control"
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Image Path or URL *</label>
                    <input
                      className="form-control"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="/images/products/product-img-1.jpg"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="featured"
                        id="featuredProduct"
                        checked={formData.featured}
                        onChange={handleInputChange}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="featuredProduct"
                      >
                        Mark as a featured product
                      </label>
                    </div>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={
                        saving || categoriesLoading || categories.length === 0
                      }
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                          ? "Save Changes"
                          : "Create Product"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={saving}
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData(emptyForm);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-4 mb-0">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="p-4 mb-0">No matching products found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{
                                width: "55px",
                                height: "55px",
                                objectFit: "contain",
                              }}
                            />

                            <span className="fw-semibold">{product.name}</span>
                          </div>
                        </td>

                        <td>
                          {typeof product.category === "string"
                            ? product.category
                            : product.category?.name || "—"}
                        </td>

                        <td>₹{product.price}</td>
                        <td>{product.stock ?? 0}</td>

                        <td>
                          {product.featured ? (
                            <span className="badge bg-success">Yes</span>
                          ) : (
                            <span className="badge bg-secondary">No</span>
                          )}
                        </td>

                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() => startEditProduct(product)}
                            >
                              <i className="bi bi-pencil"></i>
                              <span className="ms-1">Edit</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(product)}
                            >
                              <i className="bi bi-trash"></i>
                              <span className="ms-1">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminProducts;
