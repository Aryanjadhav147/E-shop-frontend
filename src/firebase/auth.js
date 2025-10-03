// src/firebase/auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../firebaseConfig"; 
import { doc, setDoc } from "firebase/firestore";

const auth = getAuth();

export const firebaseSignup = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      isAdmin: false,        
      createdAt: new Date(),
    });

    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};


export const firebaseLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};


export const firebaseLogout = async () => {
  await signOut(auth);
};
