import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import db from "../firebaseConfig";
import "../style/checkout.css";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    pincode: "",
    address: "",
    paymentMode: "",
  });

  const [loading, setLoading] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Your backend URL hosted on Render
  const backendURL = "https://e-shop-backend-icov.onrender.com";

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Razorpay payment
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
      console.log("📦 Backend response:", data);

      if (!response.ok || !data.id) {
        throw new Error(data.message || "Failed to create Razorpay order");
      }

      const options = {
        key: "rzp_test_RdfpsDLziP2e5n", // Razorpay test key
        amount: data.amount,
        currency: data.currency,
        name: "E-Shop",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response) {
          console.log("💳 Payment success:", response);

          try {
            const verifyRes = await fetch(`${backendURL}/api/payment/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();
            console.log("✅ Verify response:", verifyData);

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

  // Save order to Firestore
  const saveOrder = async (paymentDetails = null) => {
    const orderData = {
      user_id: user?.uid || user?.id,
      ...form,
      paymentDetails,
      status: "Pending",
      totalAmount: total,
      createdAt: Timestamp.now(),
      cart: cart.map((item) => ({
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
    if (!form.paymentMode) return alert("⚠️ Select a payment method!");
    if (!user) return alert("❌ You must be logged in!");

    if (form.paymentMode === "Online") await handleRazorpayPayment();
    else await saveOrder();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-summary">
        <h3>
          Total Amount: <span>₹{total}</span>
        </h3>
        <p>* Delivered in 3–5 days</p>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <h3>Basic Information</h3>

        <div className="form-row">
          <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input type="text" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />
        </div>

        <textarea name="address" placeholder="Full Address" value={form.address} onChange={handleChange} required></textarea>

        <h3>Payment Mode</h3>
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
            💳 Razorpay
          </button>
        </div>

        <button type="submit" className="place-order" disabled={loading}>
          {loading ? "Processing..." : form.paymentMode === "Online" ? "Pay Now" : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
