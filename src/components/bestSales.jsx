import React from "react";
import { Link } from "react-router-dom";
import "../styles/bestsale.css";

function BestSale() {
  const bestProducts = [
    {
      name: "Roasted Ground Coffee",
      category: "Tea, Coffee & Drinks",
      price: 130,
      oldPrice: 180,
      image: "/images/products/product-img-11.jpg",
    },
    {
      name: "Crushed Tomatoes",
      category: "Vegetables",
      price: 130,
      oldPrice: 180,
      image: "/images/products/product-img-12.jpg",
    },
    {
      name: "Golden Pineapple",
      category: "Fruits",
      price: 130,
      oldPrice: 180,
      image: "/images/products/product-img-13.jpg",
    },
  ];

  return (
    <section className="container mt-5 mb-5 bestsale-section">
      <h3 className="mb-4 fw-semibold">Daily Best Sells</h3>

      <div className="row g-3 align-items-stretch">
        {/* Promotional banner */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bestsale-banner-wrapper">
            <img
              src="/images/banner/banner-deal.jpg"
              className="bestsale-banner"
              alt="Coffee beans promotional offer"
            />

            <div className="bestsale-banner-content">
              <h5>100% Organic Coffee Beans</h5>
              <p>Get the best deal before close.</p>

              <Link
                to={`/shopproducts?category=${encodeURIComponent(
                  "Tea, Coffee & Drinks",
                )}`}
                className="btn btn-success"
              >
                Shop Now →
              </Link>
            </div>
          </div>
        </div>

        {/* Best-selling product cards */}
        {bestProducts.map((product) => (
          <div className="col-12 col-sm-6 col-lg-3" key={product.name}>
            <div className="card bestsale-card">
              <Link
                to={`/shopproducts?category=${encodeURIComponent(
                  product.category,
                )}`}
                className="bestsale-image-wrapper"
                aria-label={`Browse ${product.category}`}
              >
                <img
                  src={product.image}
                  className="bestsale-product-image"
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              <div className="card-body">
                <p className="text-muted small mb-2">{product.category}</p>

                <h6 className="fw-semibold">{product.name}</h6>

                <p className="mb-3">
                  <span className="fw-bold">₹{product.price}</span>{" "}
                  <del className="text-muted">₹{product.oldPrice}</del>
                </p>

                <Link
                  to={`/shopproducts?category=${encodeURIComponent(
                    product.category,
                  )}`}
                  className="btn btn-success w-100"
                >
                  Browse Category
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BestSale;
