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
    if (!user) return;

    const fetchOrders = async () => {
      try {
        // Query orders for the logged-in user
        const q = query(collection(db, "orders"), where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) return <p>⚠️ Please login to view your orders.</p>;
  if (loading) return <p>Loading your orders...</p>;
  if (orders.length === 0) return <p>No orders placed yet.</p>;

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <h3>Order ID: {order.id}</h3>
          <p>Status: <strong>{order.status}</strong></p>
          <p>Payment Mode: {order.paymentMode}</p>
          {order.paymentMode === "Online" && <p>Method: {order.onlineMethod}</p>}
          <p>Shipping Address: {order.address}</p>
          <h4>Products:</h4>
          <ul>
            {order.cart?.map((item, index) => (
              <li key={index}>
                {item.name} - Qty: {item.quantity} - ₹{item.price * item.quantity}
              </li>
            ))}
          </ul>
          <h4>
            Total: ₹
            {order.cart?.reduce((acc, item) => acc + item.price * item.quantity, 0)}
          </h4>
        </div>
      ))}
    </div>
  );
}

export default Orders;
