import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  // Example checkout settings. Adjust these to your business rules.
  const DELIVERY_CHARGE = 40;
  const FREE_DELIVERY_MINIMUM = 500;
  const GST_RATE = 0.05;

  const subtotal = Number(cartTotal) || 0;
  const deliveryCharge =
    subtotal === 0 || subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_CHARGE;
  const gst = subtotal * GST_RATE;
  const grandTotal = subtotal + deliveryCharge + gst;

  function handleCheckout() {
    if (cartItems.length === 0) {
      return;
    }

    navigate("/checkout");
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">My Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-cart3 display-3 text-muted"></i>

          <h4 className="mt-3">Your cart is empty</h4>

          <p className="text-muted">
            Add some products to your cart to get started.
          </p>

          <Link to="/" className="btn btn-success mt-2">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {cartItems.map((item) => (
              <div className="card p-3 mb-3" key={item._id}>
                <div className="row align-items-center g-3">
                  <div className="col-4 col-md-2">
                    <img
                      src={item.image || "/images/products/product-img-1.jpg"}
                      alt={item.name || "Product"}
                      className="img-fluid"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          "/images/products/product-img-1.jpg";
                      }}
                      style={{
                        height: "100px",
                        width: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <div className="col-8 col-md-4">
                    <h6 className="mb-1">{item.name}</h6>

                    <small className="text-muted">{item.category}</small>

                    <p className="mb-0 mt-2">
                      ₹{Number(item.price).toFixed(2)} each
                    </p>
                  </div>

                  <div className="col-7 col-md-3">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        aria-label={`Decrease ${item.name} quantity`}
                        disabled={item.quantity <= 1}
                        onClick={() => decreaseQuantity(item._id)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => increaseQuantity(item._id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-5 col-md-3 text-end">
                    <strong>
                      ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      className="btn btn-link text-danger d-block ms-auto p-0 mt-2"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-lg-4">
            <div className="card p-4">
              <h5 className="fw-bold mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2">
                <span>Total items</span>
                <span>{cartCount}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Delivery</span>
                <span>
                  {deliveryCharge === 0
                    ? "Free"
                    : `₹${deliveryCharge.toFixed(2)}`}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Estimated GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>

              {subtotal > 0 && subtotal < FREE_DELIVERY_MINIMUM && (
                <p className="small text-muted mb-3">
                  Add ₹{(FREE_DELIVERY_MINIMUM - subtotal).toFixed(2)} more for
                  free delivery.
                </p>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <strong>Estimated total</strong>
                <strong>₹{grandTotal.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>

              <Link to="/" className="btn btn-outline-success w-100 mt-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
