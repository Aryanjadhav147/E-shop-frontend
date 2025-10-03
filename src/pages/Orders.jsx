import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../firebaseConfig";
import "../style/orders.css";

function Orders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        console.log("Current logged in user:", user); // Debug log

        const q = query(
          collection(db, "orders"),
          where("user_id", "==", user.id) // use id from context
        );

        const snapshot = await getDocs(q);
        const ordersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort orders by date (newest first) if timestamp exists
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
  }, [user]);

  // Calculate total for an order
  const calculateTotal = (cart) => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  };

  // Format date if timestamp exists
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "N/A";
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="orders-container">
        <h2>Your Orders</h2>
        <p>Loading your orders...</p>
      </div>
    );
  }

  // Render not logged in state
  if (!user) {
    return (
      <div className="orders-container">
        <h2>Your Orders</h2>
        <p>⚠️ Please login to view your orders.</p>
      </div>
    );
  }

  // Render no orders state
  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h2>Your Orders</h2>
        <p>No orders placed yet. Start shopping now!</p>
      </div>
    );
  }

  // Render orders list
  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      
      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <h3>Order ID: {order.id.substring(0, 8)}...</h3>

          {order.timestamp && (
            <p>
              <strong>Ordered on:</strong> {formatDate(order.timestamp)}
            </p>
          )}

          <p>
            Status: <strong>{order.status || "Processing"}</strong>
          </p>

          <p>
            Payment Mode: <strong>{order.paymentMode || "N/A"}</strong>
          </p>

          {order.paymentMode === "Online" && order.onlineMethod && (
            <p>
              Payment Method: <strong>{order.onlineMethod}</strong>
            </p>
          )}

          <p>
            Shipping Address: <strong>{order.address || "N/A"}</strong>
          </p>

          <h4>Products:</h4>
          <ul>
            {order.cart && order.cart.length > 0 ? (
              order.cart.map((item, index) => (
                <li key={index}>
                  <span>
                    <strong>{item.name || item.title || "Product"}</strong>
                  </span>
                  <span>
                    Qty: {item.quantity} × ₹{item.price} = ₹
                    {(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))
            ) : (
              <li>No products found</li>
            )}
          </ul>

          <h4>
            <span>Total Amount:</span>
            <span>₹{calculateTotal(order.cart).toFixed(2)}</span>
          </h4>
        </div>
      ))}
    </div>
  );
}

export default Orders;