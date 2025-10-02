import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "../style/products.css";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebaseConfig";

// Product Card Component
function ProductCard({ product, handleAddToCart }) {
  // Prepend leading slash to match public folder path
  const imageUrl = product.image.startsWith("/")
    ? product.image
    : `/${product.image}`;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img src={imageUrl} alt={product.name || product.title} />
        <h3>{product.name || product.title}</h3>
      </Link>
      {product.category && <p className="category">{product.category}</p>}
      <p className="price">₹{product.price}</p>
      <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
    </div>
  );
}



function Products() {
  const { addToCart, toast } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const snapshot = await getDocs(productsCollection);
        const productsList = snapshot.docs.map((doc) => ({
  ...doc.data(),
  id: doc.id,  // put it last
  quantity: 1,
}));

        setProducts(productsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (!user) {
      alert("⚠️ Please login first!");
      return;
    }
    addToCart({ ...product, user_id: user.uid || user.id });
  };

  if (loading) return <p>Loading products...</p>;
  if (!products.length) return <p>No products available</p>;

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="products-page">
      {/* Toast Notification from CartContext */}
      {toast && <div className="toast">{toast}</div>}

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
