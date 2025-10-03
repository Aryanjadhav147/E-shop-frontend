import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import db from "../firebaseConfig";
import "../style/productdetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }

        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          // Ensure image path is correct
          if (productData.image && !productData.image.startsWith("/")) {
            productData.image = `/${productData.image}`;
          }
          setProduct(productData);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      alert("⚠️ Please login first!");
      return;
    }
    if (!product) return;

    addToCart({ 
      ...product, 
      quantity: quantity,
      user_id: user.uid || user.id 
    });
    alert(`✅ ${product.name} (${quantity}) added to cart!`);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-details-container">
        <p>Loading product details...</p>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="product-details-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p>❌ Product not found.</p>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-details-card">
        <img 
          src={product.image} 
          alt={product.name}
          onError={(e) => {
            e.target.src = "/images/placeholder.png";
          }}
        />
        
        <div className="product-info">
          <h2>{product.name}</h2>

          {product.category && (
            <p className="category">📂 {product.category}</p>
          )}

          <p className="price">₹{product.price?.toFixed(2) || "0.00"}</p>

          <p className="description">
            {product.description || "No description available for this product."}
          </p>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={decrementQuantity}>−</button>
              <span>{quantity}</span>
              <button onClick={incrementQuantity}>+</button>
            </div>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;