import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import StorySection from "./components/StorySection";
import ProcessSection from "./components/ProcessSection";
import ReviewsSection from "./components/ReviewsSection";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Fotobox from "./pages/Fotobox";
import AdminDashboard from "./pages/AdminDashboard";
import UserOrders from "./pages/UserOrders";
import Payment from "./pages/Payment";
import Reviews from "./pages/Reviews";

function HomePage({ onCartOpen }) {
  return (
    <>
      <main className="flex-grow">
        <Hero />
        <MenuSection />
        <StorySection />
        <ProcessSection />
        <ReviewsSection />
      </main>
    </>
  );
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<HomePage onCartOpen={setCartOpen} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/fotobox"
            element={
              <ProtectedRoute>
                <Fotobox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <UserOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:orderId"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
        />
      </CartProvider>
    </AuthProvider>
  );
}
