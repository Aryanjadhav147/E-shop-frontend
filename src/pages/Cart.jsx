import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import db from "../firebaseConfig";
import "../style/cart.css";

function Cart({ onClose }) {
  const { cart, updateQuantity, removeFromCart, clearCart, toast } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [ordersCount, setOrdersCount] = useState(0);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Fetch user's past orders to display count if cart is empty
  useEffect(() => {
    if (!user) return;

    const fetchOrdersCount = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("user_id", "==", user.id));
        const snapshot = await getDocs(q);
        setOrdersCount(snapshot.size);
      } catch (err) {
        console.error("Error fetching orders count:", err);
      }
    };

    fetchOrdersCount();
  }, [user]);

  const handleProceedToCheckout = () => {
    if (!user) {
      alert("⚠️ Please login first to proceed!");
      return;
    }
    if (cart.length === 0) {
      alert("⚠️ Cart is empty!");
      return;
    }
    navigate("/checkout");
    onClose();
  };

  // Display count logic
  const displayCount = cart.length > 0 ? cart.length : ordersCount > 0 ? 1 : 0;

  return (
    <div className="cart-container">
      <button className="close-cart-btn" onClick={onClose} aria-label="Close cart">
        ×
      </button>
      
      <h2>Shopping Cart</h2>
      <p>Total items: {displayCount > 0}</p>

      {toast && <div className="toast">{toast}</div>}

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items-wrapper">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name || item.title} />
                <div>
                  <h4>{item.name || item.title}</h4>
                  <p>₹{item.price}</p>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="delete-btn" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3>Total: ₹{total.toFixed(2)}</h3>
          
          <button className="place-order-btn" onClick={handleProceedToCheckout}>
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;