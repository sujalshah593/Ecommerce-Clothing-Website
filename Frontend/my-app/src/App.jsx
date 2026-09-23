import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuthCallback from "./pages/OAuthCallback";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import MensPage from "./pages/MensPage";
import ProductPage from "./pages/productPage";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import OrdersPage from "./pages/admin/OrdersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import UsersPage from "./pages/admin/UsersPage";
import AddProductPage from "./pages/admin/AddProductPage";
import DashboardPage from "./pages/admin/DashboardPage";
import InventoryPage from "./pages/admin/InventoryPage";
import BoysPage from "./pages/BoysPage";
import FavoritesPage from "./pages/FavoritesPage";
import PrivacyPolicyPage from "./pages/Privacy";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} pauseOnHover />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home key="home" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Mens"
          element={
            <ProtectedRoute>
              <MensPage key="mens" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Boys"
          element={
            <ProtectedRoute>
              <BoysPage key="boys" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorite"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* DEFAULT */}
          <Route index element={<DashboardPage />} />

          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="add-product" element={<AddProductPage />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
