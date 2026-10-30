import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState(EMPTY_ADDRESS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [addressMessage, setAddressMessage] = useState("");

  const subtotal = Number(cartTotal) || 0;
  const deliveryCharge = subtotal === 0 || subtotal >= 500 ? 0 : 40;
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.round((subtotal + deliveryCharge + gst) * 100) / 100;

  // Load the customer's saved delivery address.
  useEffect(() => {
    let isMounted = true;

    async function loadSavedAddress() {
      const token = localStorage.getItem("freshmartCustomerToken");

      // Allow the form to open, but require login when placing an order.
      if (!token) {
        let customerName = "";

        try {
          const customer = JSON.parse(
            localStorage.getItem("freshmartCustomer") || "null",
          );
          customerName = customer?.name || "";
        } catch {
          customerName = "";
        }

        if (isMounted) {
          setFormData({
            ...EMPTY_ADDRESS,
            name: customerName,
          });
          setAddressLoading(false);
        }

        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/address`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Your login session has expired. Please log in again.",
            );
          }

          throw new Error(data.message || "Unable to load your saved address.");
        }

        if (isMounted && data.address) {
          const hasSavedAddress = [
            data.address.phone,
            data.address.address,
            data.address.city,
            data.address.state,
            data.address.pincode,
          ].every((value) => Boolean(value?.trim()));

          setFormData({
            ...EMPTY_ADDRESS,
            ...data.address,
          });

          setAddressLoaded(hasSavedAddress);

          if (hasSavedAddress) {
            setAddressMessage("Your saved delivery address has been loaded.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load your saved address.");
        }
      } finally {
        if (isMounted) {
          setAddressLoading(false);
        }
      }
    }

    loadSavedAddress();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setAddressMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setAddressMessage("");

    if (loading) {
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const address = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
    };

    if (Object.values(address).some((value) => !value)) {
      setError("Please complete all delivery details.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    const token = localStorage.getItem("freshmartCustomerToken");

    if (!token) {
      setError(
        "Please log in with your customer account before placing an order.",
      );
      return;
    }

    try {
      setLoading(true);

      // Save the address first so it can be reused next time.
      const addressResponse = await fetch(`${API_URL}/api/auth/address`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });

      const addressData = await addressResponse.json();

      if (!addressResponse.ok) {
        throw new Error(
          addressData.message || "Unable to save your delivery address.",
        );
      }

      // Create the order using the existing order API.
      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          deliveryAddress: address,
          paymentMethod: "COD",
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        if (orderResponse.status === 401) {
          throw new Error(
            "Your login session may have expired. Please log in again.",
          );
        }

        throw new Error(orderData.message || "Unable to place your order.");
      }

      if (!orderData.order?._id) {
        throw new Error("The server did not return an order confirmation.");
      }

      clearCart();

      navigate(`/order-confirmation/${orderData.order._id}`, {
        state: { order: orderData.order },
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart3 display-3 text-muted"></i>
        <h3 className="mt-3">Your cart is empty</h3>
        <p className="text-muted">
          Add products before proceeding to checkout.
        </p>
        <Link to="/" className="btn btn-success">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container py-5">
        <Link to="/cart" className="text-success text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>
          Back to cart
        </Link>

        <h2 className="fw-bold mt-3">Checkout</h2>
        <p className="text-muted mb-4">
          Review your delivery details before placing your order.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">Delivery Information</h5>

                {addressLoading && (
                  <p className="text-muted" role="status">
                    Loading your saved address...
                  </p>
                )}

                {!addressLoading && addressLoaded && (
                  <div className="alert alert-success py-2">
                    <i className="bi bi-check-circle me-2"></i>
                    Saved delivery address loaded.
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}

                    {(error.toLowerCase().includes("log in") ||
                      error.toLowerCase().includes("session has expired")) && (
                      <div className="mt-2">
                        <Link to="/login">Go to customer login</Link>
                      </div>
                    )}
                  </div>
                )}

                {addressMessage && (
                  <div className="alert alert-info py-2" role="status">
                    {addressMessage}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Mobile number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    House number and street
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    autoComplete="street-address"
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      autoComplete="address-level2"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleChange}
                      autoComplete="address-level1"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="pincode" className="form-label">
                      PIN code
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      className="form-control"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      required
                    />
                  </div>
                </div>

                {addressLoaded && (
                  <p className="small text-muted mt-3 mb-0">
                    You can edit these details. Your changes will be saved when
                    you place your next order.
                  </p>
                )}

                <hr className="my-4" />

                <h5 className="fw-bold mb-3">Payment Method</h5>

                <div className="border rounded p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="COD"
                      defaultChecked
                      disabled
                    />
                    <label className="form-check-label" htmlFor="cod">
                      <strong>Cash on Delivery</strong>
                      <div className="small text-muted">
                        Pay when your order arrives.
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">Order Summary</h5>

                {cartItems.map((item) => (
                  <div
                    className="d-flex justify-content-between gap-3 mb-3"
                    key={item._id}
                  >
                    <div>
                      <div className="fw-medium">{item.name}</div>
                      <small className="text-muted">
                        Quantity: {item.quantity}
                      </small>
                    </div>
                    <span className="text-nowrap">
                      ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                ))}

                <hr />

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

                <hr />

                <div className="d-flex justify-content-between mb-4">
                  <strong>Estimated total</strong>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading || addressLoading}
                >
                  {loading
                    ? "Placing Order..."
                    : "Place Order — Cash on Delivery"}
                </button>

                <p className="small text-muted mt-3 mb-0">
                  Final prices and totals are calculated by the server.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
