import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductsPage from "./pages/ProductsPage";
import AdminProducts from "./pages/AdminProducts";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import CartPage from "./pages/CartPage";
 import CheckoutPage from "./pages/CheckoutPage"
import OrderPage from "./pages/OrderPage"
import MyOrdersPage from "./pages/MyOrdersPage"
import AdminOrders from "./pages/AdminOrders"
import PickupPage from "./pages/PickupPage"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      



<Route element={<RequireAuth />}>
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/orders" element={<MyOrdersPage />} />
  <Route path="/orders/:id" element={<OrderPage />} />
  <Route element={<RequireAdmin />}>
    <Route path="/admin/products" element={<AdminProducts />} />
    <Route path="/admin/orders" element={<AdminOrders />} />
    <Route path="/admin/pickup" element={<PickupPage />} />
<Route path="/admin/pickup/:code" element={<PickupPage />} />
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
    <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: "12px", fontSize: "14px", fontWeight: 500 },
          className: "dark:!bg-slate-800 dark:!text-slate-100",
        }}
      />
    </>
  );
}

export default App;
