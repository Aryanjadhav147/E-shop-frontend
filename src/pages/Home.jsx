import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "../style/home.css";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebaseConfig";

function Home() {
  const { addToCart, toast } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/slider-3.jpg",
      title: "Welcome to E-Shop Electronics",
      description: "Your one-stop destination for premium gadgets and accessories at unbeatable prices.",
    },
    {
      image: "/images/slider-4.jpg",
      title: "Immersive Sound Experience",
      description: "Discover our range of wireless headphones and speakers designed for music lovers.",
    },
    {
      image: "/images/slider-1.jpg",
      title: "Stay Smart, Stay Connected",
      description: "Track fitness, manage calls, and explore the future with our smartwatches and trackers.",
    },
    {
      image: "/images/slider-2.jpg",
      title: "Boost Your Productivity",
      description: "Find keyboards, mice, and accessories that make work and gaming effortless.",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          quantity: 1,
          image: doc.data().image?.startsWith("/")
            ? doc.data().image
            : `/${doc.data().image}`,
        }));
        setFeaturedProducts(products.slice(0, 8));
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleAddToCart = (product) => {
    if (!user) {
      alert("Please login first!");
      return;
    }
    addToCart({ ...product, user_id: user.uid || user.id });
    alert(`${product.name} added to cart!`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home">
      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Hero Slider */}
      <section className="hero">
        <div className="carousel">
          <div className="carousel-inner">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`carousel-item ${index === currentSlide ? "active" : ""}`}
              >
                <img src={slide.image} alt={slide.title} />
                <div className="carousel-caption">
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                  <Link to="/products" className="btn-slider">
                    <span>Shop Now</span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button onClick={prevSlide} className="carousel-control carousel-control-prev">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextSlide} className="carousel-control carousel-control-next">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slider Indicators */}
          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`carousel-indicator ${index === currentSlide ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Fast Delivery</h3>
                <p>Quick shipping worldwide</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Premium Quality</h3>
                <p>Only the best products</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Top Rated</h3>
                <p>5-star customer reviews</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="feature-content">
                <h3>Best Prices</h3>
                <p>Unbeatable deals daily</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <div className="featured-header">
          <h2>Featured Products</h2>
          <p>Discover our handpicked selection of premium electronics</p>
        </div>

        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-content">
                <h3>{product.name}</h3>
                <div className="product-meta">
                  <p className="product-price">₹{product.price}</p>
                  <div className="product-rating">
                    <svg viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.5</span>
                  </div>
                </div>
                <button onClick={() => handleAddToCart(product)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3 className="brand">E-Shop</h3>
            <p>Your one-stop shop for high-quality products. Fast shipping and secure payments guaranteed.</p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
<ul>
  <li><Link to="/">Home</Link></li>
  <li><Link to="/about">About Us</Link></li>
  <li><Link to="/contact">Contact Us</Link></li>
  <li><Link to="/blogs">Blogs</Link></li>
</ul>
          </div>
          <div className="footer-column">
            <h3>Shop Now</h3>
         <ul>
  <li><Link to="/products">Collections</Link></li>
  <li><Link to="/products">Trending Products</Link></li>
  <li><Link to="/products">New Arrivals</Link></li>
  <li><Link to="/products">Featured Products</Link></li>
</ul>
          </div>
          <div className="footer-column">
            <h3>Reach Us</h3>
            <p>123, Main Street, Thane, India - 400601</p>
            <p>+91 8928371059</p>
            <p>jadhavaryu24@gmail.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 E-Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;