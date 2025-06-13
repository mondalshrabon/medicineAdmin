import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const toggleMode = () => {
    setError("");
    setEmail("");
    setPassword("");
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.endsWith("@admin.com")) {
      return setError("Only admin emails allowed (e.g. admin@admin.com)");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      if (isLogin) {
       const LoginAccount =  await signInWithEmailAndPassword(auth, email, password);
       console.log(LoginAccount)
        alert("✅ Admin logged in!");
      } else {
      const createAccount = await createUserWithEmailAndPassword(auth, email, password);
      console.log(createAccount)
        alert("✅ Admin account created!");
      }

      // Clear form on success
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        textAlign: "center",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial",
      }}
    >
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        {isLogin ? "🔐 Admin Login" : "📝 Admin Sign Up"}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Strong Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        {error && (
          <p style={{ color: "red", margin: "10px 0", fontWeight: "bold" }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: "#2ecc71",
            color: "white",
            padding: "12px 20px",
            fontSize: "16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
            marginTop: "10px",
          }}
        >
          {isLogin ? "Login" : "Create Admin"}
        </button>
      </form>

      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span
          onClick={toggleMode}
          style={{
            color: "#27ae60",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Click here
        </span>
      </p>
    </div>
  );
}