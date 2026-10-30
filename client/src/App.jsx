import { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import TopBar from "./components/topbar";
import Carousel from "./components/carousel";
import Category from "./components/categories";
import Offers from "./components/offers";
import Products from "./components/products";
import BestSale from "./components/bestSales";
import Feature from "./components/features";
import Footer from "./components/footer";
import SupportChatbot from "./components/SupportChatbot";

// Admin pages
import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./pages/AdminRoute";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminCustomers from "./pages/AdminCustomers";
import AdminReviews from "./pages/AdminReviews";

// Customer pages and components
import SimpleSlider from "./components/particularproduct";
import ShopProduct from "./components/shopproducts";
import SignUp from "./pages/signup";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Search from "./pages/Search";
import MyOrders from "./pages/MyOrders";

// Home page
function Home() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchText, setSearchText] = useState("");

  return (
    <>
      <TopBar searchText={searchText} setSearchText={setSearchText} />

      <Carousel />

      <Category
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <Offers />

      <Products selectedCategory={selectedCategory} searchText={searchText} />

      <BestSale />
      <Feature />
      <Footer />
    </>
  );
}

// Shared layout for customer-facing pages
function CustomerLayout() {
  return (
    <>
      <Outlet />
      <SupportChatbot />
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Customer-facing pages with chatbot */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/pages/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product" element={<SimpleSlider />} />
        <Route path="/shopproducts" element={<ShopProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />

        <Route path="/my-orders" element={<MyOrders />} />
      </Route>

      {/* Admin login: no chatbot */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin pages: no chatbot */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
      </Route>
    </Routes>
  );
}

export default App;
