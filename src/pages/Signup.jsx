import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { firebaseSignup } from "../firebase/auth.js";  // ✅ correct import

import "../style/login.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    try {
      // ✅ call the correct function
      const result = await firebaseSignup(email, password, username);
      if (result.success) {
        alert("🎉 Account created successfully!");
        navigate("/login");
      } else {
        alert("❌ Signup failed: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong: " + err.message);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSignup}>
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
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
