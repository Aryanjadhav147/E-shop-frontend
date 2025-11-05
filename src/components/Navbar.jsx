import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import "../style/navbar.css";

function Navbar({ openCart }) {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="logo">E-Shop</div>

        {/* ✅ Hamburger Menu Button */}
        <button className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Links */}
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/products" onClick={closeMenu}>Products</Link></li>

          {/* Cart Button with Badge */}
          {user && (
            <li>
              <button className="cart-btn" onClick={() => { openCart(); closeMenu(); }}>
                Cart
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </button>
            </li>
          )}

          {user && <li><Link to="/orders" onClick={closeMenu}>Orders</Link></li>}
          {user && <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>}
          
          {/* ✅ Auth buttons moved inside nav-links for mobile */}
          {!user && <li><Link to="/login" onClick={closeMenu}>Login</Link></li>}
          {!user && <li><Link to="/signup" onClick={closeMenu}>Signup</Link></li>}
          {user && (
            <li className="mobile-only">
              <button className="logout-btn" onClick={() => { logout(); closeMenu(); }}>
                Logout
              </button>
            </li>
          )}
        </ul>

        {/* Auth Buttons - Desktop Only */}
        <div className="auth-buttons">
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/signup">Signup</Link>}
          {user && (
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </nav>
      
      {/* ✅ Overlay to close menu when clicking outside */}
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      ></div>
    </>
  );
}

export default Navbar;