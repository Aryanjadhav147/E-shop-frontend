
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { firebaseLogin } from "../firebase/auth.js"; 
import { db } from "../firebaseConfig"; 

import { collection, query, where, getDocs } from "firebase/firestore";
import "../style/login.css";

function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
     
      const result = await firebaseLogin(email, password);
      if (!result.success) {
        alert("❌ Login failed: " + result.error);
        return;
      }

      const usersCol = collection(db, "users");
      const q = query(usersCol, where("email", "==", email));
      const userSnap = await getDocs(q);

      if (userSnap.empty) {
        alert("User not found in Firestore");
        return;
      }

      const userDoc = userSnap.docs[0];
      const userData = userDoc.data();


      login({
        id: userDoc.id,         
        email: result.user.email,
        username: userData.username,
        isAdmin: userData.isAdmin || false,
      });

      alert(" Logged in successfully!");
      navigate("/"); // redirect
    } catch (err) {
      console.error(err);
      alert("Something went wrong: " + err.message);
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
