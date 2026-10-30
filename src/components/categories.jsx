import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/category.css";

const API_URL = "http://localhost:5000/api/categories";

function Category({ selectedCategory = "", setSelectedCategory = () => {} }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load categories.");
        }

        const data = await response.json();

        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            "Could not load categories. Please check whether the server is running.",
          );
        }

        console.error("Error fetching categories:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleCategoryClick(categoryName) {
    setSelectedCategory(categoryName);

    // Bring the customer to the product section on the homepage.
    if (window.location.pathname !== "/") {
      navigate("/");
    }

    setTimeout(() => {
      document.getElementById("featured-products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function handleAllCategories() {
    setSelectedCategory("");

    if (window.location.pathname !== "/") {
      navigate("/");
    }

    setTimeout(() => {
      document.getElementById("featured-products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  return (
    <section className="container category-wrapper">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-4">
        <div>
          <h3 className="mb-1">Featured Categories</h3>
          <p className="text-muted mb-0">
            Explore everyday essentials at FreshMart.
          </p>
        </div>

        <button
          type="button"
          className={`btn btn-sm ${
            selectedCategory === "" ? "btn-success" : "btn-outline-success"
          }`}
          onClick={handleAllCategories}
          aria-pressed={selectedCategory === ""}
        >
          All Categories
        </button>
      </div>

      {loading && (
        <p className="text-muted py-3" role="status">
          Loading categories...
        </p>
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

      {!loading && !error && categories.length === 0 && (
        <p className="text-muted py-3">No categories available yet.</p>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="category-list">
          {categories.map((item) => {
            const isSelected = selectedCategory === item.name;

            return (
              <button
                type="button"
                className={`card text-center p-3 category-card ${
                  isSelected ? "selected" : ""
                }`}
                key={item._id || item.name}
                onClick={() => handleCategoryClick(item.name)}
                aria-pressed={isSelected}
              >
                <img
                  src={item.image}
                  className="category-img"
                  alt={item.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />

                <span className="mt-2 category-name">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Category;
