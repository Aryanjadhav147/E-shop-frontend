// src/firebase/auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import  db  from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const auth = getAuth();

// Signup function
export const signup = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      createdAt: new Date(),
    });

    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Logout function
export const logout = async () => {
  await signOut(auth);
};
