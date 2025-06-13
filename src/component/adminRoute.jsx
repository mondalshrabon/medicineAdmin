import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function AdminRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || !user.email.endsWith("@admin.com")) {
        navigate("/admin-auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return children;
}