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
    const API_URL = process.env.REACT_APP_BACKEND_URL; // Supabase URL
    const API_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY; // Supabase anon key

    // Supabase REST query for a single product
    fetch(`${API_URL}/rest/v1/products?id=eq.${id}`, {
      method: "GET",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setProduct(data[0]); // Supabase returns an array
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
        <img src={product.image} alt={product.name} />
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
