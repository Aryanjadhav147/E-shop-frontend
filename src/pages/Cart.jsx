import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";  // ✅ for redirect
import "../style/cart.css";

function Cart({ onClose }) {
  const { cart, updateQuantity, removeFromCart, clearCart, toast } = useContext(CartContext);
  const [step, setStep] = useState("cart"); // cart → address → payment → success
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const navigate = useNavigate(); // ✅ initialize navigation

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToAddress = () => {
    if (cart.length === 0) {
      alert("⚠️ Cart is empty!");
      return;
    }
    setStep("address");
  };

  const handleProceedToPayment = () => {
    if (!address.trim()) {
      alert("⚠️ Please enter your address!");
      return;
    }
    setStep("payment");
  };

  const handleConfirmOrder = async () => {
    if (!paymentMethod) {
      alert("⚠️ Please select a payment method!");
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL; // Supabase URL
      const API_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY; // Supabase anon key

      // Save each cart item in Supabase
      for (const item of cart) {
        await fetch(`${API_URL}/rest/v1/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
            Prefer: "return=representation", // optional: returns the inserted row
          },
          body: JSON.stringify({
            user_id: item.user_id,
            product_id: item.id,
            quantity: item.quantity,
            address,
            paymentMethod,
            status: "Pending", // default status
          }),
        });
      }

      clearCart();       // ✅ empty cart after placing order
      setStep("success");

      setTimeout(() => {
        onClose();          // close cart modal/drawer
        navigate("/orders"); // ✅ redirect to Orders page
      }, 1500);

    } catch (err) {
      console.error("Error placing order:", err);
      alert("⚠️ Failed to place order!");
    }
  };

  return (
    <div className="cart-container">
      <button className="close-cart-btn" onClick={onClose}>×</button>
      <h2>Checkout</h2>

      {toast && <div className="toast">{toast}</div>}

      {/* Step 1: Cart */}
      {step === "cart" && (
        <>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p>₹{item.price}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="delete-btn" onClick={() => removeFromCart(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
              <h3>Total: ₹{total.toFixed(2)}</h3>
              <button className="place-order-btn" onClick={handleProceedToAddress}>
                Proceed to Checkout →
              </button>
            </>
          )}
        </>
      )}

      {/* Step 2: Address */}
      {step === "address" && (
        <div className="address-form">
          <h3>Shipping Address</h3>
          <textarea
            rows="4"
            placeholder="Enter your full address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="checkout-buttons">
            <button onClick={() => setStep("cart")}>← Back</button>
            <button onClick={handleProceedToPayment}>Proceed to Payment →</button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === "payment" && (
        <div className="payment-options">
          <h3>Select Payment Method</h3>
          {["Credit/Debit Card", "Net Banking", "UPI", "Cash on Delivery"].map(method => (
            <label key={method}>
              <input
                type="radio"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              {method}
            </label>
          ))}

          <div className="checkout-buttons">
            <button onClick={() => setStep("address")}>← Back</button>
            <button className="place-order-btn" onClick={handleConfirmOrder}>
              Confirm Order ✅
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === "success" && (
        <div className="success-message">
          <h3>🎉 Order Placed Successfully!</h3>
          <p>Redirecting to Orders...</p>
        </div>
      )}
    </div>
  );
}

export default Cart;
