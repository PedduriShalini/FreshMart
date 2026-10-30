import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // Restore the saved cart when the application starts.
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("freshmart-cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
      } catch (error) {
        console.error("Unable to restore cart:", error);
      }
    }

    return [];
  });

  // Save cart changes to the browser.
  useEffect(() => {
    localStorage.setItem("freshmart-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add a product or increase its quantity.
  function addToCart(product) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item._id === product._id,
      );

      if (existingItem) {
        return currentItems.map((item) => {
          if (item._id === product._id) {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }

          return item;
        });
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }

  // Increase product quantity.
  function increaseQuantity(productId) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item._id === productId) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }

        return item;
      }),
    );
  }

  // Decrease quantity and remove the product at zero.
  function decreaseQuantity(productId) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item._id === productId) {
            return {
              ...item,
              quantity: item.quantity - 1,
            };
          }

          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  }

  // Remove a product from the cart.
  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId),
    );
  }

  // Clear the cart after an order is successfully created.
  function clearCart() {
    setCartItems([]);
  }

  // Count all units in the cart.
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate the cart subtotal.
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
