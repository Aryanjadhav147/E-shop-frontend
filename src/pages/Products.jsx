import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "../style/products.css";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebaseConfig";

// Product Card Component
function ProductCard({ product, handleAddToCart, handleBuyNow }) {
  // Prepend leading slash to match public folder path
  const imageUrl = product.image?.startsWith("/")
    ? product.image
    : `/${product.image}`;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img 
          src={imageUrl} 
          alt={product.name || product.title}
          onError={(e) => {
            e.target.src = "/images/placeholder.png";
          }}
        />
        <h3>{product.name || product.title}</h3>
      </Link>
      <p className="price">₹{product.price?.toFixed(2) || "0.00"}</p>
      <div className="product-buttons">
        <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
          Add to Cart
        </button>
        <button className="buy-now-btn" onClick={() => handleBuyNow(product)}>
          Buy Now
        </button>
      </div>
    </div>
  );
}

function Products() {
  const { addToCart, toast } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Handle URL search parameters from navbar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query) {
      setSearchTerm(query);
      // Scroll to products section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const snapshot = await getDocs(productsCollection);
        const productsList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
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

  const handleAddToCart = (product) => {
    if (!user) {
      alert("⚠️ Please login first!");
      return;
    }
    addToCart({ ...product, user_id: user.uid || user.id });
  };

  const handleBuyNow = (product) => {
    if (!user) {
      alert("⚠️ Please login first!");
      return;
    }
    addToCart({ ...product, user_id: user.uid || user.id });
    navigate('/checkout');
  };

  // Get unique categories
  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Simple fuzzy match helper (checks if strings are similar)
  const isSimilar = (str1, str2) => {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    
    // Exact match
    if (str1 === str2) return true;
    
    // One contains the other
    if (str1.includes(str2) || str2.includes(str1)) return true;
    
    // Check Levenshtein distance for typos (max 2 character difference)
    if (Math.abs(str1.length - str2.length) > 2) return false;
    
    let distance = 0;
    const len1 = str1.length;
    const len2 = str2.length;
    
    for (let i = 0; i < Math.min(len1, len2); i++) {
      if (str1[i] !== str2[i]) distance++;
      if (distance > 2) return false;
    }
    
    distance += Math.abs(len1 - len2);
    return distance <= 2;
  };

  // Filter products based on search and category with flexible matching
  const filteredProducts = products.filter((product) => {
    if (searchTerm.trim() === "") {
      return selectedCategory === "All" || product.category === selectedCategory;
    }

    // Split search term into individual words
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    
    // Combine all searchable fields
    const productWords = [
      product.name?.toLowerCase() || "",
      product.title?.toLowerCase() || "",
      product.description?.toLowerCase() || "",
      product.category?.toLowerCase() || ""
    ].join(" ").split(/\s+/);

    // Check if ANY search word matches ANY product word (with fuzzy matching)
    const matchesSearch = searchWords.some(searchWord => 
      productWords.some(productWord => isSimilar(searchWord, productWord))
    );

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group products by category for display
  const categorizedProducts = {};
  if (selectedCategory === "All") {
    categories.slice(1).forEach((cat) => {
      categorizedProducts[cat] = filteredProducts.filter(
        (p) => p.category === cat
      );
    });
  } else {
    categorizedProducts[selectedCategory] = filteredProducts;
  }

  if (loading) {
    return (
      <div className="products-page">
        <p>Loading products...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="products-page">
        <p>No products available</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Search and Filter Section */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <p>No products match your search criteria.</p>
      ) : selectedCategory === "All" ? (
        // Display by categories
        Object.entries(categorizedProducts).map(
          ([category, categoryProducts]) =>
            categoryProducts.length > 0 && (
              <div key={category} className="product-section">
                <h2>{category}</h2>
                <div className="products-grid">
                  {categoryProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      handleAddToCart={handleAddToCart}
                      handleBuyNow={handleBuyNow}
                    />
                  ))}
                </div>
              </div>
            )
        )
      ) : (
        // Display filtered products
        <div className="product-section">
          <h2>{selectedCategory}</h2>
          <div className="products-grid">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                handleAddToCart={handleAddToCart}
                handleBuyNow={handleBuyNow}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;