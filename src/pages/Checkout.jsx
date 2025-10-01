import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
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
    onlineMethod: "",
    paymentDetails: "",
  });

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.paymentMode) {
      alert("⚠️ Please select a payment method!");
      return;
    }

    if (!user) {
      alert("❌ You must be logged in to place an order!");
      return;
    }

    const API_URL = process.env.REACT_APP_BACKEND_URL; // your Supabase endpoint
    const API_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY; // your Supabase anon key

    const cartItems = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          user_id: user.id,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          pincode: form.pincode,
          address: form.address,
          paymentMode: form.paymentMode,
          onlineMethod: form.onlineMethod,
          paymentDetails: form.paymentDetails,
          cart: cartItems,
          status: "Pending",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Order placed successfully!");
        clearCart();
        navigate("/orders");
      } else {
        console.error(data);
        alert("❌ Error placing order: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error. Please try again later.");
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="checkout-summary">
        <h3>
          Item Total Amount : <span>₹{total}</span>
        </h3>
        <p>* Items will be delivered in 3 - 5 days.</p>
        <p>* Tax and other charges are included.</p>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <h3>Basic Information</h3>

        <div className="form-row">
          <input
            type="text"
            name="fullName"
            placeholder="Enter Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Enter Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <input
            type="email"
            name="email"
            placeholder="Enter Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="pincode"
            placeholder="Enter Pincode"
            value={form.pincode}
            onChange={handleChange}
            required
          />
        </div>

        <textarea
          name="address"
          placeholder="Enter Full Address"
          value={form.address}
          onChange={handleChange}
          required
        ></textarea>

        <h3>Select Payment Mode:</h3>
        <div className="payment-options">
          <button
            type="button"
            className={form.paymentMode === "COD" ? "active" : ""}
            onClick={() =>
              setForm({ ...form, paymentMode: "COD", onlineMethod: "", paymentDetails: "" })
            }
          >
            Cash on Delivery
          </button>
          <button
            type="button"
            className={form.paymentMode === "Online" ? "active" : ""}
            onClick={() => setForm({ ...form, paymentMode: "Online" })}
          >
            Online Payment
          </button>
        </div>

        {form.paymentMode === "Online" && (
          <div className="online-payment-section">
            <h4>Select Online Method:</h4>
            <select
              name="onlineMethod"
              value={form.onlineMethod}
              onChange={handleChange}
              required
            >
              <option value="">-- Select --</option>
              <option value="UPI">UPI</option>
              <option value="NetBanking">Net Banking</option>
              <option value="Card">Credit/Debit Card</option>
            </select>

            {form.onlineMethod && (
              <input
                type="text"
                name="paymentDetails"
                placeholder={
                  form.onlineMethod === "UPI"
                    ? "Enter UPI ID"
                    : form.onlineMethod === "NetBanking"
                    ? "Enter Account Number"
                    : "Enter Card Number"
                }
                value={form.paymentDetails}
                onChange={handleChange}
                required
              />
            )}
          </div>
        )}

        <button type="submit" className="place-order">
          Place Order
        </button>
      </form>
    </div>
  );
}

export default Checkout;
