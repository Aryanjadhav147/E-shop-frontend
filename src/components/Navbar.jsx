import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import "../style/navbar.css";

function Navbar({ openCart }) {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">E-Shop</div>

      {/* Links */}
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>

        {user && (
          <li>
            <button className="cart-btn" onClick={openCart} data-count={totalItems}>
               Cart
            </button>
          </li>
        )}
<li><Link to="/profile">profile</Link></li>
        {user && <li><Link to="/orders">Orders</Link></li>}

      </ul>

      {/* Auth Buttons */}
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
  );
}

export default Navbar;
