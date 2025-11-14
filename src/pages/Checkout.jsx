import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import db from "../firebaseConfig";
import "../style/checkout.css";

function Checkout() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // BUY NOW PRODUCT (comes from Home / Product page)
  const buyNowProduct = location.state?.buyNowProduct || null;
  
  // State to track Buy Now product quantity (since it's not in cart)
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);

  // FINAL CART (either BuyNow OR normal cart)
  const finalCart = buyNowProduct 
    ? [{ ...buyNowProduct, quantity: buyNowQuantity }] 
    : cart;
  const total = finalCart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    pincode: "",
    address: "",
    paymentMode: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle quantity increase
  const handleIncreaseQuantity = (item) => {
    console.log("Increasing quantity for:", item.id);
    if (buyNowProduct) {
      setBuyNowQuantity(prev => prev + 1);
    } else {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      console.log("Decreasing quantity for:", item.id);
      if (buyNowProduct) {
        setBuyNowQuantity(prev => prev - 1);
      } else {
        updateQuantity(item.id, item.quantity - 1);
      }
    } else {
      alert("Minimum quantity is 1. Use remove button to delete item.");
    }
  };

  // Handle remove item
  const handleRemoveItem = (item) => {
    console.log("Removing item:", item.id);
    
    if (buyNowProduct) {
      if (window.confirm(`Cancel this order?`)) {
        navigate(-1); // Go back since there's only one Buy Now item
      }
      return;
    }
    
    if (window.confirm(`Remove ${item.name} from cart?`)) {
      removeFromCart(item.id);
      
      // If cart becomes empty after removal, go back
      if (finalCart.length === 1) {
        // alert("Cart is empty! Redirecting to products...");
        navigate("/products");
      }
    }
  };

  const backendURL = "https://e-shop-backend-icov.onrender.com";

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("❌ Razorpay SDK failed to load.");
      return;
    }

    try {
      setLoading(true);
      console.log("🚀 Creating order for amount:", total);

      const response = await fetch(`${backendURL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      const data = await response.json();

      if (!response.ok || !data.id) {
        throw new Error(data.message || "Failed to create Razorpay order");
      }

      const options = {
        key: "rzp_test_RdfpsDLziP2e5n",
        amount: data.amount,
        currency: data.currency,
        name: "E-Shop",
        description: "Order Payment",
        order_id: data.id,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              `${backendURL}/api/payment/verify-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              await saveOrder({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (err) {
            console.error("❌ Verification Error:", err);
          }
        },

        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },

        notes: {
          address: form.address,
          pincode: form.pincode,
        },

        theme: { color: "#f8d57e" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("❌ Error creating order:", err);
      alert("❌ Failed to create Razorpay order. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  const saveOrder = async (paymentDetails = null) => {
    const orderData = {
      user_id: user?.uid || user?.id,
      ...form,
      paymentDetails,
      status: "Pending",
      totalAmount: total,
      createdAt: Timestamp.now(),

      cart: finalCart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      alert("✅ Order placed successfully!");

      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error("❌ Firestore Error:", err);
      alert("❌ Could not save order. Try again later.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (finalCart.length === 0) {
      alert("⚠️ Your cart is empty!");
      return;
    }
    
    if (!form.paymentMode)
      return alert("⚠️ Select a payment method!");

    if (!user)
      return alert("❌ You must be logged in!");

    if (form.paymentMode === "Online") await handleRazorpayPayment();
    else await saveOrder();
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="checkout-container">
      <button className="back-btn" onClick={handleBack}>
        ← Back
      </button>

      <h2>Checkout</h2>

      {/* Order Items Section */}
      <div className="order-items-section">
        <div className="section-header">
          <h3>Order Items ({finalCart.length})</h3>
          <Link to="/products" className="add-more-link">
            + Add More Items
          </Link>
        </div>

        <div className="cart-items-list">
          {finalCart.map((item, index) => (
            <div key={index} className="checkout-item">
              <img 
                src={item.image} 
                alt={item.name}
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                }}
              />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p className="item-price">₹{item.price}</p>
                
                {/* Quantity Controls */}
                <div className="quantity-controls">
                  <button 
                    type="button"
                    onClick={() => handleDecreaseQuantity(item)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    type="button"
                    onClick={() => handleIncreaseQuantity(item)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="item-actions">
                <div className="item-total">
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button 
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item)}
                  title="Remove item"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Subtotal ({finalCart.length} items):</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Charges:</span>
          <span className="free">FREE</span>
        </div>
        <div className="summary-row total-row">
          <span>Total Amount:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <p className="delivery-note">* Delivered in 3–5 business days</p>
      </div>

      {/* Checkout Form */}
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h3>Shipping Information</h3>

        <div className="form-row">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
            required
          />
        </div>

        <textarea
          name="address"
          placeholder="Full Address (House No, Street, Locality, City, State)"
          value={form.address}
          onChange={handleChange}
          rows="3"
          required
        ></textarea>

        <h3>Payment Method</h3>
        <div className="payment-options">
          <button
            type="button"
            className={form.paymentMode === "COD" ? "active" : ""}
            onClick={() => setForm({ ...form, paymentMode: "COD" })}
          >
            💵 Cash on Delivery
          </button>

          <button
            type="button"
            className={form.paymentMode === "Online" ? "active" : ""}
            onClick={() => setForm({ ...form, paymentMode: "Online" })}
          >
            💳 Pay with Razorpay
          </button>
        </div>

        <button type="submit" className="place-order" disabled={loading || finalCart.length === 0}>
          {loading
            ? "Processing..."
            : form.paymentMode === "Online"
            ? "Pay Now"
            : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;