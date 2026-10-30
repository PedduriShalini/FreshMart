import React from "react";
import "../styles/feature.css";

function Feature(){
  return(
<div className="container mt-5">
  <div className="row text-center">

    <div className="col-md-3 col-sm-6 mb-4 feature-item">
      <img src="images/icons/clock.svg" className="feature-icon" />
      <h5 className="mt-3">10 minute grocery now</h5>
      <p className="text-muted">
        Get your order delivered to your doorstep at the earliest from FreshCart pickup stores near you.
      </p>
    </div>

    <div className="col-md-3 col-sm-6 mb-4 feature-item">
      <img src="images/icons/gift.svg" className="feature-icon" />
      <h5 className="mt-3">Best Prices & Offers</h5>
      <p className="text-muted">
        Cheaper prices than your local supermarket, great cashback offers to top it off.
      </p>
    </div>

    <div className="col-md-3 col-sm-6 mb-4 feature-item">
      <img src="images/icons/package.svg" className="feature-icon" />
      <h5 className="mt-3">Wide Assortment</h5>
      <p className="text-muted">
        Choose from 5000+ products across food, personal care, and household categories.
      </p>
    </div>

    <div className="col-md-3 col-sm-6 mb-4 feature-item">
      <img src="images/icons/refresh-cw.svg" className="feature-icon" />
      <h5 className="mt-3">Easy Returns</h5>
      <p className="text-muted">
        Not satisfied? Return at doorstep & get refund within hours. No questions asked.
      </p>
    </div>

  </div>
</div>
);
}

export default Feature;