// src/pages/UserProfile.jsx
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import db from "../firebaseConfig";
import "../style/userprofile.css";

function UserProfile() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        const ordersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <img
          src={user.photoURL || "/images/default-avatar.png"}
          alt={user.displayName || user.email}
          className="profile-pic"
        />
        <h2>{user.displayName || "User"}</h2>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phoneNumber || "Not provided"}</p>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="user-details">
        <section className="user-orders">
          <h3>Recent Orders</h3>
          {orders.length === 0 ? (
            <p>No orders placed yet.</p>
          ) : (
            <ul>
              {orders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <strong>Order ID:</strong> {order.id} <br />
                  <strong>Status:</strong> {order.status} <br />
                  <strong>Total Items:</strong> {order.cart?.length || 0} <br />
                  <strong>Total Amount:</strong> ₹
                  {order.cart?.reduce((acc, item) => acc + item.price * item.quantity, 0)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="user-cart-summary">
          <h3>Cart Summary</h3>
          <p>Total items in cart: {cart.length}</p>
        </section>
      </div>
    </div>
  );
}

export default UserProfile;
