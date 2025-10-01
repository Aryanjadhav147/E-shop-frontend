import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";   // ✅ Import Checkout
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";


function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Router>
      <Navbar openCart={() => setIsCartOpen(true)} />
      {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/checkout" element={<Checkout />} /> {/* ✅ Added Checkout */}
        <Route path="/about" element={<About />} />
<Route path="/blogs" element={<Blogs />} />
<Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
