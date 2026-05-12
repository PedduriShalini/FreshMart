import React from "react";
import "../styles/bestsale.css";

function SidebarProducts() {

  return (
    <>

      <h3 className="mb-4">
        Filter
      </h3>

      <h4 className="mb-3">
        Categories
      </h4>

      <ul className="list-group mb-4">

        <li className="list-group-item">
          Dairy, Bread & Eggs
        </li>

        <li className="list-group-item">
          Snacks & Munchies
        </li>

        <li className="list-group-item">
          Fruits & Vegetables
        </li>

        <li className="list-group-item">
          Cold Drinks & Juices
        </li>

        <li className="list-group-item">
          Breakfast & Instant Food
        </li>

        <li className="list-group-item">
          Bakery & Biscuits
        </li>

        <li className="list-group-item">
          Chicken, Meat & Fish
        </li>

      </ul>

      <h4 className="mb-3">
        Stores
      </h4>

      <form className="d-flex mb-3" role="search">

        <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
        />

        <button
          className="btn btn-outline-success"
          type="submit"
        >
          Search
        </button>

      </form>

      <select className="form-select mb-4">

        <option>E-Grocery</option>
        <option>DMart</option>
        <option>FreshCart</option>
        <option>DealShare</option>
        <option>Blinkit</option>
        <option>BigBasket</option>
        <option>StoreFront</option>
        <option>Spencers</option>
        <option>Online Grocery</option>

      </select>

      <h4 className="mb-3">
        Price
      </h4>

      <input
        type="range"
        className="form-range mb-4"
      />

    

      <div className="mt-5">

        <h4 className="mb-4">
          Daily Best Sells
        </h4>

        <div className="position-relative">

           <img 
              src="images/banner/banner-deal.jpg"
              className="img-fluid rounded w-10 h-10 bestsale-banner"
            />

          <div className="position-absolute top-0 start-0 p-3 text-white">

            <h5>
              Fresh Fruits
            </h5>

            <p>
              Get Upto 25% Off
            </p>

            <button className="btn btn-success">
              Shop Now →
            </button>

          </div>

        </div>

      </div>

    </>
  );
}

export default SidebarProducts;