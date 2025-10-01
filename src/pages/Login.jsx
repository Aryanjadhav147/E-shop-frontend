import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate
import "../style/login.css"

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ initialize navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3200/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.user);
        alert("✅ Logged in successfully!");
        navigate("/"); // ✅ redirect to home page
      } else {
        alert(data.error || "❌ Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
