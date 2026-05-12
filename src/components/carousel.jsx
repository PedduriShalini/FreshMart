import React from "react";
import "../styles/carousel.css";

function Carousel(){
  return(
    
<div id="carouselExampleCaptions" className="carousel slide custom-carousel" data-bs-ride="carousel" data-bs-interval="2500">

    <div className="carousel-indicators">
    <button type="button" data-bs-slide-to="0" className="active"></button>
    <button type="button" data-bs-slide-to="1"></button>
  </div>

  <div className="carousel-inner">

    <div className="carousel-item active">
      <img src="images/slide-1.jpg" className="d-block w-100=" />

      <div className="carousel-caption text-start custom-caption">
        <button className="btn btn-warning">Opening Sale Discount 50%</button>
        <h1>SuperMarket For Fresh Grocery</h1>
        <p className="caption-text">
          Introduced a new model for online grocery shopping and convenient home delivery.
        </p>
        <button className="btn btn-dark">Shop Now</button>
      </div>
    </div>

    <div className="carousel-item">
      <img src="images/slide-2.jpg" className="d-block w-100" />

      <div className="carousel-caption text-start custom-caption">
        <button className="btn btn-warning">Free Shipping - orders over $100</button>
        <h1>Free Shipping on orders above $100</h1>
        <p className="caption-text">
          Free Shipping to First-Time Customers Only.
        </p>
        <button className="btn btn-secondary">Shop Now</button>
      </div>
    </div>

  </div>

  <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
    <span className="carousel-control-prev-icon"></span>
  </button>

  <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
    <span className="carousel-control-next-icon"></span>
  </button>

</div>
  );
}

export default Carousel;