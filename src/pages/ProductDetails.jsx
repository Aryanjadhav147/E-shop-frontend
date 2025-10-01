import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "../style/productdetails.css"

function ProductDetails() {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product from backend
    fetch(`http://localhost:3200/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.product);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login first!");
      return;
    }
    addToCart({ ...product, user_id: user.id });
    alert(`${product.name} added to cart!`);
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="product-details-card">
<img src={`/${product.image}`} alt={product.name} />
        <div className="product-info">
          <h2>{product.name}</h2>
          {product.category && <p className="category">Category: {product.category}</p>}
          <p className="price">Price: ₹{product.price}</p>
          <p className="description">{product.description || "No description available."}</p>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
