import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onCartOpen }) {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const showCommerce = !!user && user.role !== "admin" && !isLoginPage;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-background text-primary font-body-md text-body-md w-full sticky top-0 z-50 border-b-2 border-on-background">
      <div className="flex justify-between items-center w-full px-gutter py-4 max-w-7xl mx-auto">
        <Link
          to="/"
          className="font-display-lg text-display-lg md:text-display-lg tracking-tighter text-on-background uppercase hover:text-primary transition-colors duration-200"
        >
          AUTENTIC&apos;S
        </Link>
        <ul className="hidden md:flex items-center gap-lg">
          <li>
            <a
              href="/#menu"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
            >
              MENU
            </a>
          </li>
          <li>
            <a
              href="/#story"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
            >
              STORY
            </a>
          </li>
          {user && (
            <>
              <li>
                <Link
                  to="/orders"
                  className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
                >
                  PESANAN
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
                >
                  ULASAN
                </Link>
              </li>
              <li>
                <Link
                  to="/fotobox"
                  className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
                >
                  FOTOBOX
                </Link>
              </li>
              {user.role === "admin" && (
                <li>
                  <Link
                    to="/admin"
                    className="text-primary font-bold underline underline-offset-8 decoration-2 hover:text-primary transition-colors duration-200"
                  >
                    ADMIN
                  </Link>
                </li>
              )}
            </>
          )}
          <li>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1 border-2 border-on-background px-3 py-1 font-label-bold text-label-bold uppercase neu-shadow bg-surface hover:bg-surface-container transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                  {user.name}
                  <span className={`material-symbols-outlined text-lg transition-transform ${menuOpen ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border-2 border-on-background neu-shadow z-50">
                    <div className="px-4 py-2 border-b-2 border-on-background">
                      <p className="font-label-bold text-label-bold uppercase text-on-background truncate">{user.name}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant text-xs capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 font-label-bold text-label-bold uppercase text-on-background hover:bg-error-container hover:text-error transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-4 py-2 font-label-bold text-label-bold uppercase transition-all hover:bg-primary-container active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
        <div className="flex items-center gap-sm">
          {showCommerce && (
            <button
              onClick={onCartOpen}
              className="relative border-2 border-on-background p-2 neu-shadow active:translate-x-1 active:translate-y-1 active:shadow-none bg-surface"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shopping_cart
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-xs w-5 h-5 flex items-center justify-center border-2 border-on-background font-label-bold">
                  {totalItems}
                </span>
              )}
            </button>
          )}
          <button
            aria-label="Open Mobile Menu"
            className="md:hidden border-2 border-on-background p-2 neu-shadow active:translate-x-1 active:translate-y-1 active:shadow-none bg-surface"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              menu
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
