import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { asset } from "../lib/asset";

function AutenticBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={asset("/images/story-interior.jpg")}
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
    </div>
  );
}

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
      window.scrollTo(0, 0);
    }
  }, [user, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (username.trim().length < 3) {
      setError("Username minimal 3 karakter");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    const result = register({ username: username.trim(), password, name: name.trim(), email: email.trim() });
    if (result.ok) {
      navigate("/", { replace: true });
      window.scrollTo(0, 0);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-gutter overflow-hidden py-8">
      <AutenticBackground />
      <div className="relative z-10 w-full max-w-md bg-surface border-2 border-on-background neu-shadow p-8">
        <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background mb-2">
          Daftar
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Buat akun untuk pesan & pakai Fotobox
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div>
            <label className="font-label-bold text-label-bold uppercase text-on-background block mb-1">
              Nama
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-on-background p-3 font-body-md text-body-md bg-background outline-none focus:border-primary transition-colors"
              placeholder="Nama lengkap"
              required
            />
          </div>

          <div>
            <label className="font-label-bold text-label-bold uppercase text-on-background block mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-on-background p-3 font-body-md text-body-md bg-background outline-none focus:border-primary transition-colors"
              placeholder="Pilih username"
              required
            />
          </div>

          <div>
            <label className="font-label-bold text-label-bold uppercase text-on-background block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-on-background p-3 font-body-md text-body-md bg-background outline-none focus:border-primary transition-colors"
              placeholder="email@contoh.com"
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
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div>
            <label className="font-label-bold text-label-bold uppercase text-on-background block mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border-2 border-on-background p-3 font-body-md text-body-md bg-background outline-none focus:border-primary transition-colors"
              placeholder="Ulangi password"
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
            Daftar
          </button>
        </form>

        <p className="font-body-md text-body-md text-on-surface-variant mt-4 text-center">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary underline underline-offset-4 hover:text-primary-container transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
