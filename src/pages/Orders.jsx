import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; // ✅ added updateDoc, doc
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
        const q = query(collection(db, "orders"), where("user_id", "==", user.id));
        const snapshot = await getDocs(q);
        const ordersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        ordersList.sort((a, b) => {
          if (a.timestamp && b.timestamp) return b.timestamp - a.timestamp;
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

  // ✅ Function to cancel order
  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "Cancelled" });

      // Update local state so it updates instantly
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );

      alert("Order has been cancelled successfully.");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel the order. Try again.");
    }
  };

  const calculateTotal = (cart) => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  };

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

  if (loading) {
    return (
      <div className="orders-container">
        <h2>Your Orders</h2>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-container">
        <h2>Your Orders</h2>
        <p>⚠️ Please login to view your orders.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h2>Your Orders</h2>
        <p>No orders placed yet. Start shopping now!</p>
      </div>
    );
  }

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

          {/* ✅ Cancel button - only show if order not already cancelled */}
          {order.status !== "Cancelled" && (
            <button
              className="cancel-btn"
              onClick={() => handleCancelOrder(order.id)}
            >
              Cancel Order
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Orders;
