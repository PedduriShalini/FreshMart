import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
};

function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");

  function getToken() {
    return localStorage.getItem("freshmartToken");
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

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load categories.");
      }

      if (!Array.isArray(data)) {
        throw new Error("The server returned an invalid category list.");
      }

      setCategories(data);
    } catch (err) {
      setError(err.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function startAdd() {
    setEditingId("");
    setForm(EMPTY_FORM);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEdit(category) {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const token = getToken();

    if (!token) {
      setError("Please log in as an administrator.");
      navigate("/admin/login", { replace: true });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    };

    if (!payload.name) {
      setError("Enter a category name.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${API_URL}/api/categories/${editingId}`
        : `${API_URL}/api/categories`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (handleUnauthorized(response.status)) return;

      if (!response.ok) {
        throw new Error(data.message || "Unable to save category.");
      }

      setMessage(
        editingId
          ? "Category updated successfully."
          : "Category created successfully.",
      );

      setShowForm(false);
      setEditingId("");
      setForm(EMPTY_FORM);

      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(`Delete the "${category.name}" category?`);

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setError("Please log in as an administrator.");
      navigate("/admin/login", { replace: true });
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/categories/${category._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (handleUnauthorized(response.status)) return;

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete category.");
      }

      setMessage(data.message || "Category deleted successfully.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to delete category.");
    }
  }

  const filteredCategories = categories.filter((category) => {
    const search = searchText.trim().toLowerCase();

    return (
      category.name.toLowerCase().includes(search) ||
      (category.description || "").toLowerCase().includes(search)
    );
  });

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
            <h2 className="fw-bold mb-1">Categories</h2>
            <p className="text-muted mb-0">
              Organize your FreshMart grocery products.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/admin" className="btn btn-outline-success">
              <i className="bi bi-arrow-left me-2" />
              Dashboard
            </Link>

            <button
              type="button"
              className="btn btn-success"
              onClick={startAdd}
            >
              <i className="bi bi-plus-lg me-1" />
              Add Category
            </button>
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

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <div className="row align-items-center g-3">
              <div className="col-md-6">
                <h5 className="mb-1">All Categories</h5>
                <p className="text-muted mb-0">
                  {categories.length} categories in your database
                </p>
              </div>

              <div className="col-md-6">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search categories..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                {editingId ? "Edit Category" : "Create Category"}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="categoryName" className="form-label">
                      Category Name *
                    </label>
                    <input
                      id="categoryName"
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      maxLength={60}
                      placeholder="Example: Dairy"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="categoryImage" className="form-label">
                      Image Path or URL (optional)
                    </label>
                    <input
                      id="categoryImage"
                      className="form-control"
                      name="image"
                      value={form.image}
                      onChange={handleInputChange}
                      placeholder="/images/categories/dairy.jpg"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="categoryDescription" className="form-label">
                      Description (optional)
                    </label>
                    <textarea
                      id="categoryDescription"
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      maxLength={250}
                      rows={3}
                      placeholder="Describe this grocery category"
                    />
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                          ? "Save Changes"
                          : "Create Category"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={saving}
                      onClick={() => {
                        setShowForm(false);
                        setEditingId("");
                        setForm(EMPTY_FORM);
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
              <p className="p-4 mb-0">Loading categories...</p>
            ) : filteredCategories.length === 0 ? (
              <div className="p-4 text-center">
                <i className="bi bi-grid display-5 text-muted" />
                <h5 className="mt-3">No categories found</h5>
                <p className="text-muted mb-0">
                  Add a category or try another search.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Category</th>
                      <th>Description</th>
                      <th>Created</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt=""
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                                style={{
                                  width: 48,
                                  height: 48,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: 48, height: 48 }}
                              >
                                <i className="bi bi-grid text-success fs-4" />
                              </div>
                            )}

                            <span className="fw-semibold">{category.name}</span>
                          </div>
                        </td>

                        <td className="text-muted">
                          {category.description || "—"}
                        </td>

                        <td>
                          {category.createdAt
                            ? new Date(category.createdAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}
                        </td>

                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() => startEdit(category)}
                            >
                              <i className="bi bi-pencil me-1" />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(category)}
                            >
                              <i className="bi bi-trash me-1" />
                              Delete
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

export default AdminCategories;
