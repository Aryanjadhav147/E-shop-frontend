// src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as firebaseLogin } from "../firebase/auth.js"; // login from firebase
import { AuthContext } from "../context/AuthContext"; // ✅ import AuthContext
import "../style/login.css";

function Login() {
  const { login } = useContext(AuthContext); // ✅ get login function from context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await firebaseLogin(email, password); // call Firebase login
      if (result.success) {
        login(result.user); // ✅ update AuthContext
        alert("✅ Logged in successfully!");
        navigate("/"); // redirect to home
      } else {
        alert("❌ Login failed: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Something went wrong: " + err.message);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
