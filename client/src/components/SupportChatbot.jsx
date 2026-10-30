import { useState } from "react";
import { Link } from "react-router-dom";

const quickQuestions = [
  "How do I track my order?",
  "How do I place an order?",
  "How can I find a product?",
  "How do I contact support?",
];

function getReply(message) {
  const text = message.toLowerCase();

  if (
    text.includes("track") ||
    text.includes("delivery") ||
    text.includes("order status")
  ) {
    return "You can track your order from My Orders. Open an order to check its status and available delivery details.";
  }

  if (
    text.includes("place an order") ||
    text.includes("checkout") ||
    text.includes("buy")
  ) {
    return "Browse products, add them to your cart, and open Checkout to enter your delivery address and place your order.";
  }

  if (text.includes("cart") || text.includes("add product")) {
    return "Open a product and select Add to Cart. You can review or update your items on the Cart page.";
  }

  if (
    text.includes("product") ||
    text.includes("price") ||
    text.includes("stock") ||
    text.includes("search")
  ) {
    return "You can browse products on the home page or use Search to find an item. Open a product to see its price and availability.";
  }

  if (
    text.includes("login") ||
    text.includes("account") ||
    text.includes("register") ||
    text.includes("sign up")
  ) {
    return "You can log in to your customer account or create a new account using the Login and Sign Up pages.";
  }

  if (text.includes("cancel")) {
    return "Open My Orders and check the order details. Cancellation availability depends on the order status and the options supported by FreshMart.";
  }

  if (
    text.includes("support") ||
    text.includes("contact") ||
    text.includes("help")
  ) {
    return "I'm the FreshMart virtual assistant. I can help with products, accounts, carts, checkout, and orders. For an issue I cannot resolve, please contact the FreshMart team through its available contact details.";
  }

  return "I'm not sure I understood that. Try asking about products, login, your cart, checkout, or order tracking.";
}

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! Welcome to FreshMart. How can I help you today?",
    },
  ]);

  function sendMessage(text = message) {
    const question = text.trim();

    if (!question) return;

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: question },
      { sender: "bot", text: getReply(question) },
    ]);

    setMessage("");
  }

  return (
    <>
      {isOpen && (
        <section className="fm-chat-window" aria-label="FreshMart support chat">
          <header className="fm-chat-header">
            <div>
              <strong>FreshMart Support</strong>
              <div className="fm-chat-status">Virtual assistant</div>
            </div>

            <button
              type="button"
              className="fm-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="fm-chat-messages" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`fm-chat-row ${
                  item.sender === "user" ? "fm-chat-user" : "fm-chat-bot"
                }`}
              >
                <div className="fm-chat-bubble">{item.text}</div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="fm-chat-quick-questions">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div className="fm-chat-links">
              <Link to="/search" onClick={() => setIsOpen(false)}>
                Search products
              </Link>
              <Link to="/my-orders" onClick={() => setIsOpen(false)}>
                My Orders
              </Link>
            </div>
          </div>

          <form
            className="fm-chat-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask FreshMart..."
              aria-label="Type your message"
              maxLength={500}
            />

            <button type="submit" disabled={!message.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="fm-chat-launcher"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? "×" : "☏"}
        {!isOpen && <span>Support</span>}
      </button>

      <style>{`
        .fm-chat-launcher {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 54px;
          padding: 0 20px;
          border: none;
          border-radius: 30px;
          background: #198754;
          color: white;
          font-size: 18px;
          font-weight: 600;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        .fm-chat-window {
          position: fixed;
          right: 24px;
          bottom: 92px;
          z-index: 1050;
          display: flex;
          flex-direction: column;
          width: min(360px, calc(100vw - 32px));
          height: min(500px, calc(100dvh - 130px));
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        }

        .fm-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #198754;
          color: white;
        }

        .fm-chat-status {
          margin-top: 3px;
          font-size: 12px;
          opacity: 0.9;
        }

        .fm-chat-close {
          border: none;
          background: transparent;
          color: white;
          font-size: 28px;
          cursor: pointer;
        }

        .fm-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
        }

        .fm-chat-row {
          display: flex;
          margin-bottom: 12px;
        }

        .fm-chat-user {
          justify-content: flex-end;
        }

        .fm-chat-bubble {
          max-width: 88%;
          padding: 10px 12px;
          border-radius: 14px;
          background: #f0f2f0;
          color: #212529;
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .fm-chat-user .fm-chat-bubble {
          background: #198754;
          color: white;
        }

        .fm-chat-quick-questions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
          margin: 10px 0 16px;
        }

        .fm-chat-quick-questions button {
          padding: 7px 10px;
          border: 1px solid #198754;
          border-radius: 16px;
          background: white;
          color: #146c43;
          font-size: 12px;
          text-align: left;
          cursor: pointer;
        }

        .fm-chat-links {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 12px;
          font-size: 13px;
        }

        .fm-chat-links a {
          color: #198754;
        }

        .fm-chat-input-area {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .fm-chat-input-area input {
          min-width: 0;
          flex: 1;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 20px;
          outline-color: #198754;
        }

        .fm-chat-input-area button {
          padding: 8px 13px;
          border: none;
          border-radius: 20px;
          background: #198754;
          color: white;
          cursor: pointer;
        }

        .fm-chat-input-area button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .fm-chat-launcher {
            right: 16px;
            bottom: 16px;
          }

          .fm-chat-window {
            right: 16px;
            bottom: 82px;
          }
        }
      `}</style>
    </>
  );
}
