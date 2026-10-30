import React from "react";
import "../styles/footer.css";

function Footer(){
  return(
    <div className="footer-wrapper">

      <div className="bg-light pt-5 pb-3">
        <div className="container">
          <div className="row">

            <div className="col-md-2">
              <h6 className="fw-bold">Categories</h6>
              <p>Vegetables & Fruits</p>
              <p>Breakfast & instant food</p>
              <p>Bakery & Biscuits</p>
              <p>Atta, rice & dal</p>
              <p>Sauces & spreads</p>
              <p>Organic & gourmet</p>
              <p>Baby care</p>
              <p>Cleaning essentials</p>
              <p>Personal care</p>
            </div>

            <div className="col-md-2">
              <h6 className="fw-bold">&nbsp;</h6>
              <p>Dairy, bread & eggs</p>
              <p>Cold drinks & juices</p>
              <p>Tea, coffee & drinks</p>
              <p>Masala, oil & more</p>
              <p>Chicken, meat & fish</p>
              <p>Paan corner</p>
              <p>Pharma & wellness</p>
              <p>Home & office</p>
              <p>Pet care</p>
            </div>

            <div className="col-md-2">
              <h6 className="fw-bold">Get to know us</h6>
              <p>Company</p>
              <p>About</p>
              <p>Blog</p>
              <p>Help Center</p>
              <p>Our Value</p>
            </div>

            <div className="col-md-2">
              <h6 className="fw-bold">For Consumers</h6>
              <p>Payments</p>
              <p>Shipping</p>
              <p>Returns</p>
              <p>FAQ</p>
              <p>Shop Checkout</p>
            </div>

            <div className="col-md-2">
              <h6 className="fw-bold">Become a Shopper</h6>
              <p>Shopper Opportunities</p>
              <p>Become a Shopper</p>
              <p>Earnings</p>
              <p>Ideas & Guides</p>
              <p>New Retailers</p>
            </div>

            <div className="col-md-2">
              <h6 className="fw-bold">Freshcart programs</h6>
              <p>Freshcart programs</p>
              <p>Gift Cards</p>
              <p>Promos & Coupons</p>
              <p>Freshcart Ads</p>
              <p>Careers</p>
            </div>

          </div>
        </div>
      </div>

      <div className="bg-light border-top py-3">
        <div className="container d-flex justify-content-between align-items-center flex-wrap footer-middle">

          <div>
            <span className="fw-bold me-3">Payment Partners</span>
            <img src="images/payment/amazonpay.svg" className="payment-icon" />
            <img src="images/payment/paypal.svg" className="payment-icon" />
            <img src="images/payment/visa.svg" className="payment-icon" />
          </div>

          <div className="d-flex align-items-center">
            <span className="me-3">Get deliveries with FreshCart</span>
            <img src="images/appbutton/appstore-btn.svg" className="appstore-btn" />
            <img src="images/appbutton/googleplay-btn.svg" className="googleplay-btn" />
          </div>

        </div>
      </div>

      <div className="bg-light border-top py-3">
        <div className="container d-flex justify-content-between align-items-center flex-wrap footer-bottom">

          <p className="mb-0">© 2026 FreshCart. Powered by Codescandy</p>

          <div className="social-icons">
            <span className="me-2">Follow us on</span>
            <i className="bi bi-facebook me-2"></i>
            <i className="bi bi-twitter me-2"></i>
            <i className="bi bi-instagram"></i>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Footer;