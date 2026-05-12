import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import TopBar from "./topbar";
import Footer from "./footer";

export default function SimpleSlider() {

  const images = [
    "/images/products/product-single-img-1.jpg",
    "/images/products/product-single-img-2.jpg",
    "/images/products/product-single-img-3.jpg",
    "/images/products/product-single-img-4.jpg",
  ];

  const [activeImage, setActiveImage] = useState(0);

  const [activeTab, setActiveTab] = useState("details");

  return (
    <>
      <TopBar />

      <div className="container mt-5">

        <div className="row">

          <div className="col-md-6">

            <div className="mb-3">
              <img
                src={images[activeImage]}
                className="w-100 rounded"
                style={{
                  height: "500px",
                  objectFit: "cover"
                }}
                alt="product"
              />
            </div>

            <Swiper spaceBetween={10} slidesPerView={4}>
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img}
                    alt="thumbnail"
                    onClick={() => setActiveImage(index)}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border:
                        activeImage === index
                          ? "2px solid blue"
                          : "2px solid gray",
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

          </div>

          <div className="col-md-6 ps-md-5 mt-4 mt-md-0">

            <p className="text-success fw-bold">
              Bakery Biscuits
            </p>

            <h1 className="fw-bold display-4">
              Napolitanke Ljesnjak
            </h1>

            <div className="d-flex align-items-center gap-2 mt-3">

              <span className="fw-bold fs-1">
                $32
              </span>

              <del className="text-muted fs-4">
                $35
              </del>

              <span className="text-danger fw-bold">
                26% Off
              </span>

            </div>

            <div className="d-flex gap-3 mt-4">

              <button className="btn btn-outline-secondary">
                250g
              </button>

              <button className="btn btn-outline-secondary">
                500g
              </button>

              <button className="btn btn-outline-secondary">
                1kg
              </button>

            </div>

            <div className="d-flex align-items-center gap-3 mt-4">

              <div className="border rounded d-flex align-items-center px-2 py-1">

                <button className="btn">
                  -
                </button>

                <span className="px-2 fw-bold">
                  1
                </span>

                <button className="btn">
                  +
                </button>

              </div>

              <button className="btn btn-success px-4 py-2 fw-bold">
                Add to Cart
              </button>

            </div>

            <div className="text-muted fw-bold mt-4">

              <p>
                Product Code: FBB00255
              </p>

              <p>
                Availability: In Stock
              </p>

              <p>
                Type: Fruits
              </p>

              <p>
                Shipping: 01 day shipping. Free pickup today
              </p>

            </div>

          </div>

        </div>

        <div className="mt-5">

          <ul className="nav nav-tabs mb-4">

            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${
                  activeTab === "details"
                    ? "active text-success"
                    : "text-dark"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Product Details
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${
                  activeTab === "information"
                    ? "active text-success"
                    : "text-dark"
                }`}
                onClick={() => setActiveTab("information")}
              >
                Information
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${
                  activeTab === "reviews"
                    ? "active text-success"
                    : "text-dark"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${
                  activeTab === "seller"
                    ? "active text-success"
                    : "text-dark"
                }`}
                onClick={() => setActiveTab("seller")}
              >
                Seller Info
              </button>
            </li>

          </ul>

          {activeTab === "details" && (
            <div>

              <h3>
                Nutrient Value & Benefits
              </h3>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Nisi, tellus iaculis urna bibendum in lacus.
              </p>

              <h6>
                Storage Tips
              </h6>

              <p>
                Store in a cool and dry place away from sunlight.
              </p>

              <h6>
                Unit
              </h6>

              <p>
                3 units
              </p>

              <h6>
                Seller
              </h6>

              <p>
                DMart Pvt. LTD
              </p>

              <h6>
                Disclaimer
              </h6>

              <p>
                Image shown is a representation and may slightly vary
                from the actual product.
              </p>

            </div>
          )}

          {activeTab === "information" && (
            <div>

              <h3>
                Product Information
              </h3>

              <p>
                This product is made with premium ingredients and
                high quality materials.
              </p>

            </div>
          )}

          {activeTab === "reviews" && (
            <div>

              <h3>
                Customer Reviews
              </h3>

              <p>
                ★★★★☆ 4.5 Ratings
              </p>

            </div>
          )}

          {activeTab === "seller" && (
            <div>

              <h3>
                Seller Information
              </h3>

              <p>
                Sold by DMart Pvt. LTD
              </p>

            </div>
          )}

        </div>

      </div>
      <Footer/>
    </>
  );
}