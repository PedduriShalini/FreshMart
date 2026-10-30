import React from "react";
import { Link } from "react-router-dom";
import "../styles/offers.css";

function Offers() {
  return (
    <div className="container mt-5">
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card border-0 rounded-4 overflow-hidden offer-card">
            <img
              src="/images/grocery-banner.png"
              className="offer-img"
              alt="Fresh fruits and vegetables offer"
            />

            <div className="card-img-overlay d-flex flex-column justify-content-center align-items-start ps-4">
              <h4>Fruits & Vegetables</h4>
              <p>Get Up to 30% Off</p>

              <Link
                to="/shopproducts?category=Fruits%20%26%20Vegetables"
                className="btn btn-dark px-3"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 rounded-4 overflow-hidden offer-card">
            <img
              src="/images/grocery-banner-2.jpg"
              className="offer-img"
              alt="Freshly baked buns offer"
            />

            <div className="card-img-overlay d-flex flex-column justify-content-center align-items-start ps-4">
              <h4>Freshly Baked Buns</h4>
              <p>Get Up to 25% Off</p>

              <Link
                to="/shopproducts?category=Bakery%20%26%20Biscuits"
                className="btn btn-dark px-3"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Offers;
