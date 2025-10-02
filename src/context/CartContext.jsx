import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");

  // Load cart from localStorage if logged in
  useEffect(() => {
    if (user) {
      const storedCart = localStorage.getItem(`cart_${user.uid || user.id}`);
      if (storedCart) setCart(JSON.parse(storedCart));
    } else {
      setCart([]);
    }
  }, [user]);

  // Save cart to localStorage
  useEffect(() => {
    if (user) localStorage.setItem(`cart_${user.uid || user.id}`, JSON.stringify(cart));
  }, [cart, user]);

  const addToCart = (product) => {
    if (!user) {
      alert("⚠️ Please login first!");
      return;
    }

    const exists = cart.find((item) => item.id === product.id);
    const productWithUser = { ...product, quantity: 1, user_id: user.uid || user.id };

    if (exists) {
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, productWithUser]);
    }

    setToast(`${product.name || product.title} added to cart!`);
    setTimeout(() => setToast(""), 2000);
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity: qty } : item)));
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, toast }}>
      {children}
    </CartContext.Provider>
  );
};
