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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        console.log("Current user in context:", user); // debug
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("user_id", "==", user.id)); // use user.id
        const snapshot = await getDocs(q);
        const ordersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by timestamp if available (newest first)
        ordersList.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return 0;
        });

        setOrders(ordersList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Calculate total for an order
  const calculateOrderTotal = (orderCart) => {
    if (!orderCart || !Array.isArray(orderCart)) return 0;
    return orderCart.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
      0
    );
  };

  // Format date if timestamp exists
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (err) {
      return null;
    }
  };

  return (
    <div className="user-profile-container">
      {/* Profile Card */}
      <div className="profile-card">
        <img
          src={user?.photoURL || "/images/default-avatar.png"}
          // alt={user?.displayName || user?.email || "User"}
          className="profile-pic"
          onError={(e) => {
            e.target.src = "/images/default-avatar.png";
          }}
        />
        <h2>{user?.displayName || "User"}</h2>
        <p>{user?.email || "No email provided"}</p>
        <p>{user?.phoneNumber || "Not provided"}</p>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* User Details */}
      <div className="user-details">
        {/* Recent Orders Section */}
        <section className="user-orders">
          <h3>Recent Orders</h3>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders placed yet. Start shopping now!</p>
          ) : (
            <ul>
              {orders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <strong>Order ID:</strong> {order.id.substring(0, 12)}...
                  <br />
                  {order.timestamp && (
                    <>
                      <strong>Date:</strong> {formatDate(order.timestamp)}
                      <br />
                    </>
                  )}
                  <strong>Status:</strong> {order.status || "Processing"}
                  <br />
                  <strong>Total Items:</strong> {order.cart?.length || 0}
                  <br />
                  <strong>Total Amount:</strong> ₹
                  {calculateOrderTotal(order.cart).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Cart Summary Section */}
        <section className="user-cart-summary">
          <h3>Cart Summary</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty. Add some products!</p>
          ) : (
            <p>Total items in cart: {cart.length}</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserProfile;