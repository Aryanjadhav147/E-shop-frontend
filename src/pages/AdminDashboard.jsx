import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/admin.css";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use environment variable for backend URL
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3200";

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.isAdmin) return;

      try {
        const res = await fetch(
          `${BASE_URL}/api/admin/orders?userId=${encodeURIComponent(user.id)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, BASE_URL]);

  if (!user) return <p>⚠️ Please login to view this page.</p>;
  if (!user.isAdmin) return <p>⚠️ You must be logged in as admin to view this page.</p>;
  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="admin-dashboard">
      <h2>All Orders</h2>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Address</th>
              <th>Payment Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user_id}</td>
                <td>{order.product_id}</td>
                <td>{order.quantity}</td>
                <td>{order.address}</td>
                <td>{order.payment_method}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
