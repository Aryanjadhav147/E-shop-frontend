import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // ✅ import useNavigate
import "../style/login.css" // optional: use same styling as Login page

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ confirm password
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ initialize navigate

  const handleSignup = async (e) => {
    e.preventDefault();

    // ✅ check if passwords match
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3200/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.user); // optional: auto-login after signup
        alert("🎉 Account created successfully!");
        navigate("/"); // ✅ redirect to home page
      } else {
        alert(data.error || "❌ Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSignup}>
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
