import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "../style/products.css";

// Product Card Component
function ProductCard({ product, handleAddToCart }) {
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img src={product.image} alt={product.name} />
        <h3>{product.name || product.title}</h3>
      </Link>
      {product.category && <p className="category">{product.category}</p>}
      <p className="price">₹{product.price}</p>
      <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
    </div>
  );
}

function Products() {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:3200/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // Auto-hide alert after 2 seconds
  useEffect(() => {
    if (!alertMsg) return;
    const timer = setTimeout(() => setAlertMsg(""), 2000);
    return () => clearTimeout(timer);
  }, [alertMsg]);

  const handleAddToCart = (product) => {
    if (!user) {
      alert("Please login first!");
      return;
    }
    addToCart({ ...product, user_id: user.id });
    alert(`${product.name} added successfully!`);
  };

  if (loading) return <p>Loading products...</p>;
  if (!products.length) return <p>No products available</p>;

  // Group products by category if available
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (

  <div className="products-page">
    {/* Toast Notification */}
    {alertMsg && (
      <div
        className={`toast ${
          alertMsg.includes("⚠️") ? "toast-warning" : "toast-success"
        }`}
      >
        {alertMsg}
      </div>
    )}

    {categories.length > 0
      ? categories.map((cat) => (
          <div key={cat} className="product-section">
            <h2>{cat}</h2>
            <div className="products-grid">
              {products
                .filter((p) => p.category === cat)
                .map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    handleAddToCart={handleAddToCart}
                  />
                ))}
            </div>
          </div>
        ))
      : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                handleAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
  </div>
);

}

export default Products;
