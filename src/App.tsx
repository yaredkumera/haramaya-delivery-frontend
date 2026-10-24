import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductsPage from "./pages/ProductsPage";
import AdminProducts from "./pages/AdminProducts";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import CartPage from "./pages/CartPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/cart" element={<CartPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireAdmin />}>
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>
      </Route>
      <Route
        path="/login"
        element={
          <Login
            onForgotPassword={() => console.log("go to forgot password page")}
            onGoogleSignIn={() => console.log("start Google sign-in")}
          />
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<p className="p-6">Page not found</p>} />
    </Routes>
  );
}

export default App;
