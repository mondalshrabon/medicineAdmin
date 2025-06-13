import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AdminAuthForm from "./component/adminForm";
import CategoryManager from "./component/admin";
import CategoryLoad from "./component/adminload";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./index.css"
// Auth Guard Component
function ProtectedRoute({ element }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <CategoryLoad />;
  return user ? element : <Navigate to="/login" />;
}

function PublicOnlyRoute({ element }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <CategoryLoad />;
  return !user ? element : <Navigate to="/admin" />;
}

// Create router
const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicOnlyRoute element={<AdminAuthForm />} />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute element={<CategoryManager />} />,
  },
  {
    path: "*",
    element: <Navigate to="/login" />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
