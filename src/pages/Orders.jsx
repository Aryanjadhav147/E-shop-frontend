import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/orders.css"

function Orders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Supabase query: orders where user_id = current user
    fetch(`${API_URL}/rest/v1/orders?user_id=eq.${user.id}`, {
      method: "GET",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data || []); // Supabase returns array
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <p>Please login to see your orders.</p>;
  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>You have not placed any orders yet.</p>;

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="order-item">
          <h3>{order.product_name}</h3>
          <p>Price: ₹{order.product_price}</p>
          <p>Quantity: {order.quantity}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
}

export default Orders;
