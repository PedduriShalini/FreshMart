import React from "react";
import { Link } from "react-router-dom";
import "../styles/bestsale.css";

function BestSale(){
  return(
    <div className="container mt-5">
      <h3 className="mb-4">Daily Best Sells</h3>

      <div className="row g-3">

        <div className="col-md-3">
          <div className="position-relative h-100">

            <img 
              src="images/banner/banner-deal.jpg"
              className="img-fluid rounded w-100 h-100 bestsale-banner"
            />

            <div className="position-absolute top-0 start-0 p-3 text-white">

              <h5>100% Organic Coffee Beans.</h5>
              <p>Get the best deal before close.</p>
              <Link to="/product"><button className="btn btn-success">Shop Now →</button></Link>
            </div>

          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100 p-3 bestsale-card">
            <img src="images/products/product-img-11.jpg" className="card-img-top" />
            <p className="text-muted mt-2">Tea, Coffee & Drinks</p>
            <h6>Roasted Ground Coffee</h6>
            <p>$13 <del className="text-muted">$18</del></p>
            <button className="btn btn-success">+ Add to Cart</button>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100 p-3 bestsale-card">
            <img src="images/products/product-img-12.jpg" className="card-img-top" />
            <p className="text-muted mt-2">Fruits & Vegetables</p>
            <h6>Crushed Tomatoes</h6>
            <p>$13 <del className="text-muted">$18</del></p>
            <button className="btn btn-success">+ Add to Cart</button>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100 p-3 bestsale-card">
            <img src="images/products/product-img-13.jpg" className="card-img-top" />
            <p className="text-muted mt-2">Fruits & Vegetables</p>
            <h6>Golden Pineapple</h6>
            <p>$13 <del className="text-muted">$18</del></p>
            <button className="btn btn-success">+ Add to Cart</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BestSale;