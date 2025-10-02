import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/cart.css";

function Cart({ onClose }) {
  const { cart, updateQuantity, removeFromCart, clearCart, toast } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (!user) {
      alert("⚠️ Please login first to proceed!");
      return;
    }
    if (cart.length === 0) {
      alert("⚠️ Cart is empty!");
      return;
    }
    navigate("/checkout"); // Navigate to the Checkout page
    onClose(); // close cart sidebar if needed
  };

  return (
    <div className="cart-container">
      <button className="close-cart-btn" onClick={onClose}>×</button>
      <h2>Shopping Cart</h2>

      {toast && <div className="toast">{toast}</div>}

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name || item.title} />
              <div>
                <h4>{item.name || item.title}</h4>
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
          <button className="place-order-btn" onClick={handleProceedToCheckout}>
            Proceed to Checkout →
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
