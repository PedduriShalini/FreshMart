import React from "react";
import TopBar from "./topbar";
import Footer from "./footer";
import SidebarProducts from "./sidebarforproducts";

function ShopProducts() {

  const products = [
    { name: "Haldiram's Sev Bhujia", category:"Snack & Munchies", price: 18, img: "/images/products/product-img-1.jpg" },
    { name: "NutriChoice Digestive", category:"Bakery & Biscuits", price: 24, img: "/images/products/product-img-2.jpg" },
    { name: "Cadbury 5 Star Chocolate", category:"Bakery & Biscuits", price: 32, img: "/images/products/product-img-3.jpg" },
    { name: "Onion Flavour Potato", category:"Snack & Munchies", price: 3, img: "/images/products/product-img-4.jpg" },
    { name: "Salted Instant Popcorn", category:"Instant Food", price: 13, img: "/images/products/product-img-5.jpg" },
    { name: "Blueberry Greek Yogurt", category:"Dairy, Bread & Eggs", price: 18, img: "/images/products/product-img-6.jpg" },
    { name: "Britannia Cheese Slices", category:"Dairy, Bread & Eggs", price: 24, img: "/images/products/product-img-7.jpg" },
    { name: "Kellogg's Original Cereals", category:"Instant Food", price: 32, img: "/images/products/product-img-8.jpg" },
    { name: "Slurrp Millet Chocolate", category:"Snack & Munchies", price: 3, img: "/images/products/product-img-9.jpg" },
    { name: "Amul Butter - 500 g", category:"Dairy, Bread & Eggs", price: 13, img: "/images/products/product-img-10.jpg" }
  ];

  return (
    <>
      <TopBar />

      <div className="container mt-5">

        <div className="row">

          <div className="col-md-3">
            <SidebarProducts />
          </div>

          <div className="col-md-9">

            <div
              className="rounded p-5 mb-4"
              style={{ backgroundColor: "#f1f5f2" }}
            >
              <h2>Snacks & Munchies</h2>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">

              <p>10 Products found</p>


            </div>

            
            {products.map((item, index) => (

              <div className="card mb-4 p-3" key={index}>

                <div className="row align-items-center">

                  <div className="col-md-3 text-center">

                    <img
                      src={item.img}
                      className="img-fluid"
                      style={{
                        height: "170px",
                        objectFit: "contain"
                      }}
                    />

                  </div>

                  <div className="col-md-6">

                    <small className="text-muted">
                      {item.category}
                    </small>

                    <h5 className="mt-2">
                      {item.name}
                    </h5>

                

                    <h6>
                      ${item.price}
                    </h6>

                  </div>

                  <div className="col-md-3 text-end">

                    <button className="btn btn-success">
                      + Add
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default ShopProducts;