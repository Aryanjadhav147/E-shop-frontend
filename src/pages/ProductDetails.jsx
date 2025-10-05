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

  const handleBuyNow = () => {
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
    navigate('/checkout');
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
            <p className="category"> {product.category}</p>
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

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;