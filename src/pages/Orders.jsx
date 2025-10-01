import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/orders.css"
function Orders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:3200/orders/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        }
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
    <div key={order.order_id} className="order-item">
      <h3>{order.product_name}</h3> {/* product name */}
      <p>Price: ₹{order.product_price}</p> {/* product price */}
      <p>Quantity: {order.quantity}</p>
      <p>Status: {order.status}</p>
    </div>
  ))}
</div>

  );
}

export default Orders;
