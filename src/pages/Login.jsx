import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import database from "../data/database";

function AutenticBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src="/images/story-interior.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#2c1810]/85 via-[#3a2416]/70 to-[#1a0e0a]/90" />
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="absolute top-8 left-6 hidden sm:block">
        <span className="material-symbols-outlined text-[#d4a574]/70 text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          local_cafe
        </span>
      </div>
      <div className="absolute bottom-10 right-8 hidden md:block rotate-12">
        <span className="material-symbols-outlined text-[#d4a574]/60 text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          coffee
        </span>
      </div>

      <div className="absolute top-10 right-8 hidden md:block text-right">
        <p className="font-display-lg text-[#f5ebe0] text-[40px] leading-none uppercase tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Autentic&apos;s
        </p>
        <p className="font-label-bold uppercase text-[#d4a574] tracking-[0.3em] text-xs mt-1">
          Coffee &amp; Co
        </p>
      </div>

      <p className="absolute bottom-8 left-8 hidden sm:block font-label-bold uppercase text-[#f5ebe0]/80 tracking-[0.25em] text-xs">
        No pretense &bull; Just exceptional coffee
      </p>
    </div>
  );
}

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const success = login(username, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError("Username atau password salah");
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-gutter overflow-hidden">
      <AutenticBackground />
      <div className="relative z-10 w-full max-w-md bg-surface border-2 border-on-background neu-shadow p-8">
        <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background mb-2">
          Login
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Masuk untuk mengakses Fotobox
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div>
            <label className="font-label-bold text-label-bold uppercase text-on-background block mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-on-background p-3 font-body-md text-body-md bg-background outline-none focus:border-primary transition-colors"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="font-label-bold text-label-bold uppercase text-on-background block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-on-background p-3 font-body-md text-body-md bg-background outline-none focus:border-primary transition-colors"
              placeholder="Masukkan password"
              required
            />
          </div>

          {error && (
            <p className="font-body-md text-body-md text-error bg-error-container border-2 border-error p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-primary-container"
          >
            Masuk
          </button>
        </form>

        <p className="font-body-md text-body-md text-on-surface-variant mt-4 text-center">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary underline underline-offset-4 hover:text-primary-container transition-colors font-label-bold uppercase">
            Daftar
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center mt-4 font-body-md text-body-md text-primary underline underline-offset-4 hover:text-primary-container transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
