import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "../style/home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function Home() {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;


    fetch(`${API_URL}/rest/v1/products`, {
      method: "GET",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const products = data.slice(0, 6).map((p) => ({
          id: p.id,
          title: p.name,
          price: p.price,
          image: p.image,
          quantity: 1,
        }));
        setFeaturedProducts(products);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAddToCart = (product) => {
    if (!user) {
      alert("Please login first!");
      return;
    }
    addToCart({ ...product, user_id: user.id });
    alert(`${product.title} added successfully!`);
  };

  return (
    <div className="home">
      {/* Hero Carousel */}
      <section className="hero">
        <div
          id="heroCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3000"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="/images/slider-3.jpg"
                className="d-block w-100"
                alt="Slide 1"
              />
              <div className="carousel-caption d-none d-md-block">
                <h1>Welcome to E-Shop Electronics</h1>
                <p>
                  Your one-stop destination for premium gadgets and accessories
                  at unbeatable prices.
                </p>
                <Link to="/products" className="btn btn-slider">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="carousel-item">
              <img
                src="/images/slider-4.jpg"
                className="d-block w-100"
                alt="Slide 2"
              />
              <div className="carousel-caption d-none d-md-block">
                <h1>Immersive Sound Experience</h1>
                <p>
                  Discover our range of wireless headphones and speakers
                  designed for music lovers.
                </p>
                <Link to="/products" className="btn btn-slider">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="carousel-item">
              <img
                src="/images/slider-1.jpg"
                className="d-block w-100"
                alt="Slide 3"
              />
              <div className="carousel-caption d-none d-md-block">
                <h1>Stay Smart, Stay Connected</h1>
                <p>
                  Track fitness, manage calls, and explore the future with our
                  smartwatches and trackers.
                </p>
                <Link to="/products" className="btn btn-slider">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="carousel-item">
              <img
                src="/images/slider-2.jpg"
                className="d-block w-100"
                alt="Slide 4"
              />
              <div className="carousel-caption d-none d-md-block">
                <h1>Boost Your Productivity</h1>
                <p>
                  Find keyboards, mice, and accessories that make work and
                  gaming effortless.
                </p>
                <Link to="/products" className="btn btn-slider">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map((p) => (
            <div className="product-card" key={p.id}>
              <img src={p.image} alt={p.title} />
              <h3>{p.title}</h3>
              <p>₹{p.price}</p>
              <button onClick={() => handleAddToCart(p)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3>MyShop</h3>
            <p>
              Your one-stop shop for high-quality products. Fast shipping and
              secure payments guaranteed.
            </p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/contact">Contact Us</a>
              </li>
              <li>
                <a href="/blogs">Blogs</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Shop Now</h3>
            <ul>
              <li>
                <a href="/products">Collections</a>
              </li>
              <li>
                <a href="/products">Trending Products</a>
              </li>
              <li>
                <a href="/products">New Arrivals</a>
              </li>
              <li>
                <a href="/products">Featured Products</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Reach Us</h3>
            <p>📍 123, Main Street, Thane, India - 400601</p>
            <p>📞 +91 8928371059</p>
            <p>✉️ jadhavaryu24@gmail.com</p>
          </div>
        </div>
        <div className="footer-bottom">© 2025 - E-shop. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Home;
