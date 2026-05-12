import React from "react";
import "../styles/products.css";
import { Link } from "react-router-dom";
function Products() {

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
    <div className="container mt-5">
      <h3 className="mb-4">Popular Products</h3>

      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
        {products.map((item, index) => (
          <div className="col" key={index}>
            <div className="card p-3 h-100 d-flex flex-column product-card">
               <Link to="/shopproducts">
              <img 
                src={item.img}
                alt={item.name}
                className="card-img-top product-img"
              />
              </Link>

              <small className="text-muted mt-2">{item.category}</small>

              <p className="mt-2 mb-1 text-truncate">{item.name}</p>

              <div className="d-flex justify-content-between align-items-center mt-auto">
                <span>${item.price}</span>
                <button className="btn btn-success btn-sm">+ Add</button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;