import React from "react";
import "../styles/bestsale.css";

const categories = [
  "Dairy, Bread & Eggs",
  "Snacks & Munchies",
  "Fruits & Vegetables",
  "Cold Drinks & Juices",
  "Breakfast & Instant Food",
  "Bakery & Biscuits",
  "Chicken, Meat & Fish",
];

const stores = [
  "All Stores",
  "E-Grocery",
  "DMart",
  "FreshCart",
  "DealShare",
  "Blinkit",
  "BigBasket",
  "StoreFront",
  "Spencers",
  "Online Grocery",
];

function SidebarProducts({
  selectedCategory,
  setSelectedCategory,
  searchText,
  setSearchText,
  selectedStore,
  setSelectedStore,
  maxPrice,
  setMaxPrice,
}) {
  function handleStoreSearch(event) {
    event.preventDefault();
  }

  return (
    <>
      <h3 className="mb-4">Filter</h3>

      <h4 className="mb-3">Categories</h4>

      <ul className="list-group mb-4">
        {categories.map((category) => (
          <li key={category} className="list-group-item p-0">
            <button
              type="button"
              className={`btn w-100 text-start rounded-0 ${
                selectedCategory === category ? "btn-success" : "btn-light"
              }`}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category ? "" : category,
                )
              }
            >
              {category}
            </button>
          </li>
        ))}
      </ul>

      <h4 className="mb-3">Stores</h4>

      <form className="d-flex mb-3" onSubmit={handleStoreSearch}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search products"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          aria-label="Search products"
        />

        <button className="btn btn-outline-success" type="submit">
          Search
        </button>
      </form>

      <select
        className="form-select mb-4"
        value={selectedStore}
        onChange={(event) => setSelectedStore(event.target.value)}
        aria-label="Filter by store"
      >
        {stores.map((store) => (
          <option key={store} value={store}>
            {store}
          </option>
        ))}
      </select>

      <h4 className="mb-3">Maximum Price: ₹{maxPrice}</h4>

      <input
        type="range"
        className="form-range mb-2"
        min="0"
        max="5000"
        step="50"
        value={maxPrice}
        onChange={(event) => setMaxPrice(Number(event.target.value))}
        aria-label="Maximum product price"
      />

      <div className="d-flex justify-content-between small text-muted mb-4">
        <span>₹0</span>
        <span>₹5000</span>
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm mb-4"
        onClick={() => {
          setSelectedCategory("");
          setSearchText("");
          setSelectedStore("All Stores");
          setMaxPrice(5000);
        }}
      >
        Clear Filters
      </button>

      <div className="mt-4">
        <h4 className="mb-4">Daily Best Sells</h4>

        <div className="position-relative">
          <img
            src="/images/banner/banner-deal.jpg"
            className="img-fluid rounded bestsale-banner"
            alt="Fresh fruit offers"
          />

          <div className="position-absolute top-0 start-0 p-3 text-white">
            <h5>Fresh Fruits</h5>
            <p>Get Upto 25% Off</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SidebarProducts;
