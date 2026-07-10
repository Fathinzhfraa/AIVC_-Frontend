import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import TEMPLATES, { LAYOUTS, FILTERS } from "../data/templates";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../data/orderStore";
import { saveFotobox } from "../data/fotoboxStore";
import FotoboxGallery from "../components/FotoboxGallery";

const STEPS = [
  { id: "layout", label: "Layout", num: 1 },
  { id: "shoot", label: "Foto", num: 2 },
  { id: "preview", label: "Hasil", num: 3 },
];

const cellW = 640;
const cellH = 480;

const TEMPLATE_PADS = {
  default: { top: 60, right: 60, bottom: 90, left: 60 },
  espresso: { top: 60, right: 60, bottom: 110, left: 60 },
  cream: { top: 70, right: 70, bottom: 70, left: 70 },
  signature: { top: 70, right: 60, bottom: 100, left: 60 },
  original: { top: 60, right: 60, bottom: 90, left: 60 },
  retro70: { top: 70, right: 60, bottom: 110, left: 60 },
  vhs: { top: 70, right: 60, bottom: 90, left: 60 },
  newspaper: { top: 150, right: 55, bottom: 110, left: 55 },
  magazine: { top: 130, right: 100, bottom: 120, left: 55 },
  scrapbook: { top: 90, right: 60, bottom: 110, left: 60 },
};

function StepIndicator({ current }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-label-bold text-label-bold transition-all duration-300 ${
                i <= idx
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface-variant border-on-surface-variant"
              }`}
            >
              {i < idx ? (
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              ) : (
                s.num
              )}
            </div>
            <span
              className={`font-label-bold text-label-bold uppercase hidden sm:inline transition-colors duration-300 ${
                i <= idx ? "text-on-background" : "text-on-surface-variant"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-10 sm:w-16 h-0.5 mx-2 transition-colors duration-300 ${
                i < idx ? "bg-primary" : "bg-surface-container-high"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function LayoutGrid({ layoutId }) {
  const l = LAYOUTS.find((x) => x.id === layoutId);
  if (!l) return null;
  const total = l.cols * l.rows;
  return (
    <div
      className="grid gap-1 p-3"
      style={{ gridTemplateColumns: `repeat(${l.cols}, 1fr)` }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] rounded-sm bg-primary/20 border border-primary/40"
        />
      ))}
    </div>
  );
}

function TemplatePicker({ selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {TEMPLATES.map((t) => {
        const active = selectedId === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={`border-2 p-4 text-center transition-all duration-200 ${
              active
                ? "border-on-background shadow-[4px_4px_0px_0px_#000] -translate-y-0.5"
                : "border-on-surface-variant bg-background hover:border-on-background hover:shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5"
            }`}
          >
            <div
              className="w-full h-8 rounded-sm mb-2 border border-on-background"
              style={{ backgroundColor: t.bgColor }}
            />
            <span
              className={`font-label-bold text-label-bold uppercase block ${
                active ? "text-on-background" : "text-on-surface-variant"
              }`}
            >
              {t.name}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant block leading-tight">
              {t.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FilterPicker({ selectedId, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = selectedId === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className={`border-2 px-3 py-2 font-label-bold text-label-bold uppercase transition-all duration-200 ${
              active
                ? "border-on-background bg-primary text-on-primary shadow-[3px_3px_0px_0px_#000] -translate-y-0.5"
                : "border-on-surface-variant bg-background text-on-surface-variant hover:border-on-background hover:-translate-y-0.5"
            }`}
          >
            {f.name}
          </button>
        );
      })}
    </div>
  );
}

export default function Fotobox() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const offscreenRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const [step, setStep] = useState("layout");
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [timerSec, setTimerSec] = useState(3);
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const [waNumber, setWaNumber] = useState("");
  const [waSent, setWaSent] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";
  const hasOrder = user && getUserOrders(user.id).length > 0;

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices tidak didukung");
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(s);
      setCameraOn(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError("Kamera tidak dapat diakses. Pastikan izin kamera diberikan atau gunakan upload sebagai alternatif.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraOn(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  function chooseLayout(layout) {
    setSelectedLayout(layout);
    setPhotos([]);
    setCurrentSlot(0);
    setStep("shoot");
  }

  function startCapture() {
    if (countdownRef.current) return;
    if (!timerSec) {
      capturePhoto();
      return;
    }
    let n = timerSec;
    setCountdown(n);
    countdownRef.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = offscreenRef.current;
    if (!video || !canvas) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const targetRatio = cellW / cellH;
    let sx, sy, sw, sh;
    if (vw / vh > targetRatio) {
      sh = vh;
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      sw = vw;
      sh = vw / targetRatio;
      sx = 0;
      sy = (vh - sh) / 2;
    }
    canvas.width = cellW;
    canvas.height = cellH;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.filter = selectedFilter.css;
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, -cellW, 0, cellW, cellH);
    ctx.restore();
    addPhoto(canvas.toDataURL("image/png"));
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = offscreenRef.current;
        const targetRatio = cellW / cellH;
        let sx, sy, sw, sh;
        if (img.width / img.height > targetRatio) {
          sh = img.height;
          sw = img.height * targetRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          sw = img.width;
          sh = img.width / targetRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }
        canvas.width = cellW;
        canvas.height = cellH;
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.filter = selectedFilter.css;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cellW, cellH);
        ctx.restore();
        addPhoto(canvas.toDataURL("image/png"));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function addPhoto(dataUrl) {
    const next = [...photos, dataUrl];
    setPhotos(next);
    const total = selectedLayout.cols * selectedLayout.rows;
    if (next.length >= total) {
      stopCamera();
      setStep("preview");
    } else {
      setCurrentSlot(next.length);
    }
  }

  function deletePhoto(index) {
    const next = photos.filter((_, i) => i !== index);
    setPhotos(next);
    setCurrentSlot(next.length);
    if (next.length === 0) {
      setStep("shoot");
    }
  }

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  async function renderComposite(canvas) {
    const layout = selectedLayout;
    const t = selectedTemplate;
    if (!layout || !t || photos.length === 0) return;

    const gap = 16;
    const pad = TEMPLATE_PADS[t.id] || TEMPLATE_PADS.default;
    const innerW = layout.cols * cellW + (layout.cols - 1) * gap;
    const innerH = layout.rows * cellH + (layout.rows - 1) * gap;
    const w = innerW + pad.left + pad.right;
    const h = innerH + pad.top + pad.bottom;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    drawTemplate(ctx, w, h, t, pad);

    const images = await Promise.all(photos.map((dataUrl) => loadImage(dataUrl)));

    images.forEach((img, i) => {
      const col = i % layout.cols;
      const row = Math.floor(i / layout.cols);
      const x = pad.left + col * (cellW + gap);
      const y = pad.top + row * (cellH + gap);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cellW, cellH);
      ctx.clip();
      ctx.drawImage(img, x, y, cellW, cellH);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, cellW, cellH);
      ctx.restore();
    });
  }

  useEffect(() => {
    if (step === "preview" && previewRef.current && photos.length > 0) {
      renderComposite(previewRef.current);
    }
  }, [step, selectedTemplate, photos]);

  function resetAll() {
    stopCamera();
    setPhotos([]);
    setCurrentSlot(0);
    setStep("layout");
    setSelectedLayout(null);
    setWaNumber("");
    setWaSent(false);
    setSaveStatus("idle");
    setError("");
  }

  async function buildCompositeDataUrl() {
    const canvas = document.createElement("canvas");
    await renderComposite(canvas);
    return canvas.toDataURL("image/png");
  }

  async function downloadResult() {
    const dataUrl = await buildCompositeDataUrl();
    const link = document.createElement("a");
    link.download = `fotobox-${selectedTemplate.id}-${selectedLayout.id}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function saveToServer(extra = {}) {
    setSaveStatus("saving");
    try {
      const image = await buildCompositeDataUrl();
      await saveFotobox({
        userId: user.id,
        userName: user.name || user.username,
        template: selectedTemplate.id,
        layout: selectedLayout.id,
        filter: selectedFilter.id,
        image,
        ...extra,
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  function normalizePhone(num) {
    let n = num.replace(/\D/g, "");
    if (n.startsWith("0")) n = "62" + n.slice(1);
    else if (!n.startsWith("62")) n = "62" + n;
    return n;
  }

  async function sendWhatsApp() {
    const digits = waNumber.replace(/\D/g, "");
    if (digits.length < 8) {
      setError("Masukkan nomor WhatsApp yang valid.");
      return;
    }
    setError("");
    const phone = normalizePhone(waNumber);
    await saveToServer({ whatsapp: phone });
    const text = encodeURIComponent(
      "Halo! Ini hasil fotobox Autentic's aku. Makasih sudah mampir! ☕"
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    setWaSent(true);
  }

  const totalSlots = selectedLayout ? selectedLayout.cols * selectedLayout.rows : 0;

  if (isAdmin) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-surface-container py-6 md:py-10">
        <div className="max-w-5xl mx-auto px-gutter">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_library
            </span>
            <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background">
              Galeri Fotobox
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Semua fotobox dari seluruh pengguna
            </p>
          </div>
          <FotoboxGallery isAdmin />
        </div>
      </div>
    );
  }

  if (!hasOrder) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto px-gutter text-center">
          <div className="bg-error-container border-2 border-error text-error p-6 neu-shadow">
            <span className="material-symbols-outlined text-[56px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <h2 className="font-headline-sm text-headline-sm uppercase mt-2 mb-2">Belum Bisa Pakai Fotobox</h2>
            <p className="font-body-md text-body-md">
              Kamu harus melakukan pesanan dulu sebelum bisa menggunakan Fotobox.
            </p>
            <Link
              to="#menu"
              className="inline-block mt-4 bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Mulai Pesan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-surface-container py-6 md:py-10">
      <div className="max-w-4xl mx-auto px-gutter">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-[40px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
            photo_camera
          </span>
          <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background">
            Fotobox
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Abadikan momen bersama Autentic&apos;s
          </p>
        </div>

        <StepIndicator current={step} />

        <canvas ref={offscreenRef} className="hidden" />

        {/* ===== STEP 1: Layout ===== */}
        {step === "layout" && (
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => chooseLayout(l)}
                  className="group border-2 border-on-background bg-surface neu-shadow p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]"
                >
                  <div className="bg-background border-2 border-on-background mb-4 overflow-hidden max-w-[180px] mx-auto">
                    <LayoutGrid layoutId={l.id} />
                  </div>
                  <span className="font-label-bold text-label-bold uppercase block text-on-background group-hover:text-primary transition-colors">
                    {l.name}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant block">
                    {l.description}
                  </span>
                  <span className="inline-block mt-3 text-xs font-label-bold text-primary uppercase bg-primary-container/50 px-3 py-1 border border-primary/30">
                    {l.cols * l.rows} foto
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-surface border-2 border-on-background neu-shadow p-5 mt-6">
              <h3 className="font-label-bold text-label-bold uppercase text-on-background mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">style</span>
                Pilih Tema / Bingkai
              </h3>
              <TemplatePicker selectedId={selectedTemplate.id} onSelect={setSelectedTemplate} />
            </div>
          </div>
        )}

        {/* ===== STEP 2: Shoot ===== */}
        {step === "shoot" && (
          <div className="max-w-2xl mx-auto">
            {/* Slot grid */}
            <div className="bg-surface border-2 border-on-background neu-shadow p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-label-bold text-label-bold uppercase text-on-background flex items-center gap-2">
                  <span className="bg-primary text-on-primary text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {currentSlot + 1}
                  </span>
                  Isi Slot Foto
                </h2>
                <button
                  onClick={resetAll}
                  className="text-xs font-label-bold uppercase text-on-surface-variant hover:text-primary underline underline-offset-4 transition-colors"
                >
                  Ganti layout
                </button>
              </div>

              <div
                className="grid gap-3 mb-5"
                style={{ gridTemplateColumns: `repeat(${selectedLayout.cols}, 1fr)` }}
              >
                {Array.from({ length: totalSlots }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-[4/3] border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                      photos[i]
                        ? "border-primary shadow-[0_0_0_2px_#8d4b00]"
                        : i === currentSlot
                        ? "border-on-background bg-background ring-2 ring-primary/40"
                        : "border-dashed border-on-surface-variant bg-surface-container"
                    }`}
                  >
                    {photos[i] ? (
                      <>
                        <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => deletePhoto(i)}
                          className="absolute top-1 right-1 bg-error text-white text-xs w-5 h-5 flex items-center justify-center border border-on-background hover:scale-110 transition-transform"
                        >
                          x
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-[28px] block">
                          {i === currentSlot ? "photo_camera" : "photo_frame"}
                        </span>
                        {i === currentSlot && (
                          <span className="text-[10px] font-label-bold uppercase text-on-surface-variant mt-1 block">
                            Sekarang
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Filter picker */}
              <div className="mb-5">
                <h3 className="font-label-bold text-label-bold uppercase text-on-surface-variant mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                  Efek Foto
                </h3>
                <FilterPicker selectedId={selectedFilter.id} onSelect={setSelectedFilter} />
              </div>

              {/* Timer picker */}
              <div className="mb-5">
                <h3 className="font-label-bold text-label-bold uppercase text-on-surface-variant mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">timer</span>
                  Timer Jepret
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: 0, label: "Off" },
                    { v: 3, label: "3 dtk" },
                    { v: 5, label: "5 dtk" },
                    { v: 10, label: "10 dtk" },
                  ].map((o) => {
                    const active = timerSec === o.v;
                    return (
                      <button
                        key={o.v}
                        onClick={() => setTimerSec(o.v)}
                        className={`border-2 px-3 py-2 font-label-bold text-label-bold uppercase transition-all duration-200 ${
                          active
                            ? "border-on-background bg-primary text-on-primary shadow-[3px_3px_0px_0px_#000] -translate-y-0.5"
                            : "border-on-surface-variant bg-background text-on-surface-variant hover:border-on-background hover:-translate-y-0.5"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Camera / Upload */}
              <div>
                {cameraOn ? (
                  <div>
                    <div className="relative border-2 border-on-background overflow-hidden bg-black max-w-sm mx-auto aspect-[4/3] rounded-sm">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                        style={{ filter: selectedFilter.css }}
                      />
                      {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span
                            key={countdown}
                            className="font-display-lg text-white text-[120px] leading-none drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)]"
                            style={{ animation: "fbpop 1s ease-out" }}
                          >
                            {countdown}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 mt-4 justify-center">
                      <button
                        onClick={startCapture}
                        disabled={countdown !== null}
                        className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-8 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-primary-container hover:text-on-background flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                      >
                        <span className="material-symbols-outlined">camera</span>
                        {countdown !== null ? `${countdown}...` : "Jepret!"}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-surface text-on-background border-2 border-on-background neu-shadow px-4 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-error-container hover:text-error flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                        Tutup
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={startCamera}
                      className="flex-1 bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-4 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-primary-container hover:text-on-background flex items-center gap-3 justify-center"
                    >
                      <span className="material-symbols-outlined text-[28px]">camera_alt</span>
                      <span className="text-left">
                        <span className="block">Buka Kamera</span>
                        <span className="block text-[10px] font-body-md opacity-80">Foto langsung dari webcam</span>
                      </span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-surface text-on-background border-2 border-on-background neu-shadow px-6 py-4 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-surface-container flex items-center gap-3 justify-center"
                    >
                      <span className="material-symbols-outlined text-[28px]">photo_library</span>
                      <span className="text-left">
                        <span className="block">Upload Foto</span>
                        <span className="block text-[10px] font-body-md opacity-80">Dari galeri perangkat</span>
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 font-body-md text-body-md text-error bg-error-container border-2 border-error p-3">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  {error}
                </div>
              )}
            </div>

            {/* Gallery of taken photos */}
            {photos.length > 0 && (
              <div className="bg-surface border-2 border-on-background neu-shadow p-5">
                <h3 className="font-label-bold text-label-bold uppercase text-on-surface-variant mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">photo_library</span>
                  Foto tersimpan ({photos.length}/{totalSlots})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="group relative w-24 h-[72px] border-2 border-on-background overflow-hidden shadow-[2px_2px_0px_0px_#000]">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <button
                          onClick={() => deletePhoto(i)}
                          className="opacity-0 group-hover:opacity-100 bg-error text-white text-xs w-6 h-6 flex items-center justify-center border border-on-background transition-all hover:scale-110"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <span className="absolute bottom-0 left-0 bg-primary text-on-primary text-[10px] px-1.5 font-label-bold">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 3: Preview + Template ===== */}
        {step === "preview" && (
          <div className="max-w-2xl mx-auto">
            {/* Result preview */}
            <div className="bg-surface border-2 border-on-background neu-shadow p-5 mb-4">
              <h2 className="font-label-bold text-label-bold uppercase text-on-background mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">photo</span>
                Hasil Fotobox
              </h2>
              <div className="border-2 border-on-background overflow-hidden bg-surface-container shadow-[4px_4px_0px_0px_#000] mx-auto max-w-sm">
                <canvas
                  ref={previewRef}
                  className="w-full h-auto"
                  style={{ display: "block" }}
                />
              </div>
            </div>

            {/* Template selector */}
            <div className="bg-surface border-2 border-on-background neu-shadow p-5 mb-4">
              <h3 className="font-label-bold text-label-bold uppercase text-on-background mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">style</span>
                Pilih Bingkai
              </h3>
              <TemplatePicker selectedId={selectedTemplate.id} onSelect={setSelectedTemplate} />
            </div>

            {/* Send to WhatsApp */}
            <div className="bg-surface border-2 border-on-background neu-shadow p-5 mb-4">
              <h3 className="font-label-bold text-label-bold uppercase text-on-background mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">send</span>
                Kirim ke WhatsApp
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-3">
                Masukkan nomor WhatsApp. Chat WhatsApp akan terbuka dengan pesan otomatis.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border-2 border-on-background bg-background flex-1">
                  <span className="px-3 font-label-bold text-label-bold text-on-surface-variant border-r-2 border-on-background">
                    +62
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={waNumber}
                    onChange={(e) => {
                      setWaNumber(e.target.value);
                      setWaSent(false);
                    }}
                    placeholder="81234567890"
                    className="w-full p-3 font-body-md text-body-md bg-background outline-none focus:bg-surface-container transition-colors"
                  />
                </div>
                <button
                  onClick={sendWhatsApp}
                  className="bg-[#25D366] text-white border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:brightness-95 flex items-center gap-2 justify-center"
                >
                  <span className="material-symbols-outlined">send</span>
                  Kirim
                </button>
              </div>
              {waSent && (
                <div className="mt-3 flex items-center gap-2 font-body-md text-body-md text-primary bg-primary-container/40 border-2 border-primary p-3">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  WhatsApp dibuka.
                </div>
              )}
              {error && (
                <div className="mt-3 flex items-center gap-2 font-body-md text-body-md text-error bg-error-container border-2 border-error p-3">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={downloadResult}
                className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-10 py-4 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-primary-container hover:text-on-background flex items-center gap-2"
              >
                <span className="material-symbols-outlined">download</span>
                Download Foto
              </button>
              <button
                onClick={() => saveToServer()}
                disabled={saveStatus === "saving"}
                className="bg-surface text-on-background border-2 border-on-background neu-shadow px-6 py-4 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-surface-container flex items-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined">
                  {saveStatus === "saved" ? "cloud_done" : "save"}
                </span>
                {saveStatus === "saving"
                  ? "Menyimpan..."
                  : saveStatus === "saved"
                  ? "Tersimpan"
                  : "Simpan ke Galeri"}
              </button>
              <button
                onClick={resetAll}
                className="bg-surface text-on-background border-2 border-on-background neu-shadow px-6 py-4 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-surface-container flex items-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                Buat Lagi
              </button>
            </div>
          </div>
        )}

        {/* User's own saved fotobox gallery */}
        <div className="mt-10">
          <FotoboxGallery userId={user.id} />
        </div>
      </div>
    </div>
  );
}

/* ---- Canvas draw helpers ---- */
function drawTemplate(ctx, w, h, t, pad) {
  const outerW = w;
  const outerH = h;
  const cx = w / 2;
  const topMid = pad.top / 2;
  const botY = h - pad.bottom;
  const botMid = h - pad.bottom / 2;
  const areaX = pad.left;
  const areaY = pad.top;
  const areaW = w - pad.left - pad.right;

  ctx.save();
  ctx.fillStyle = t.bgColor;
  ctx.fillRect(0, 0, outerW, outerH);

  if (t.id === "espresso") {
    ctx.fillStyle = t.borderColor;
    ctx.fillRect(0, 0, outerW, outerH);
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(16, 16, outerW - 32, outerH - 32);
    ctx.fillStyle = t.accentColor;
    ctx.fillRect(areaX, areaY - 18, areaW, 6);
    ctx.fillRect(areaX, botY + 12, areaW, 6);
    ctx.fillStyle = t.textColor;
    ctx.font = "bold 44px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid);
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("☕ ESPRESSO EDITION", cx, botMid + 30);
  } else if (t.id === "cream") {
    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, outerW - 16, outerH - 16);
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(areaX - 12, areaY - 12, areaW + 24, outerH - areaY - pad.bottom + 24);
    ctx.fillStyle = t.borderColor;
    ctx.font = "bold 30px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, topMid);
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("COFFEE & co", cx, botMid);
    const beanPos = [
      [45, 45], [outerW - 45, 45],
      [45, outerH - 45], [outerW - 45, outerH - 45],
    ];
    ctx.fillStyle = t.borderColor;
    beanPos.forEach(([bx, by]) => drawCoffeeBean(ctx, bx, by, 14));
  } else if (t.id === "signature") {
    ctx.fillStyle = "#1a1c1c";
    ctx.fillRect(14, 14, outerW, outerH);
    ctx.fillStyle = t.borderColor;
    ctx.fillRect(8, 8, outerW, outerH);
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(24, 24, outerW - 32, outerH - 32);
    ctx.fillStyle = t.accentColor;
    ctx.fillRect(areaX, areaY - 16, areaW, 6);
    ctx.fillRect(areaX, botY + 12, areaW, 6);
    ctx.fillStyle = t.textColor;
    ctx.font = "bold 32px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ AUTENTIC'S ✦", cx, botMid - 2);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("SIGNATURE COLLECTION", cx, botMid + 26);
    const starPos = [
      [46, 46], [outerW - 46, 46],
      [46, outerH - 46], [outerW - 46, outerH - 46],
    ];
    ctx.fillStyle = t.accentColor;
    starPos.forEach(([sx, sy]) => drawStar(ctx, sx, sy, 5, 12, 5));
  } else if (t.id === "original") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(16, 16, outerW, outerH);
    ctx.fillStyle = t.borderColor;
    ctx.fillRect(8, 8, outerW, outerH);
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(20, 20, outerW - 28, outerH - 28);
    ctx.fillStyle = t.borderColor;
    ctx.fillRect(areaX, botY + 8, areaW, pad.bottom - 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A U T E N T I C ' S", cx, botMid);
  } else if (t.id === "retro70") {
    ctx.fillStyle = t.borderColor;
    ctx.fillRect(0, 0, outerW, outerH);
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(20, 20, outerW - 40, outerH - 40);

    ctx.fillStyle = t.accentColor;
    const cSize = 46;
    [[20, 20], [outerW - 66, 20], [20, outerH - 66], [outerW - 66, outerH - 66]].forEach(([gx, gy]) => {
      ctx.beginPath();
      ctx.moveTo(gx, gy + cSize);
      ctx.lineTo(gx + cSize, gy + cSize);
      ctx.lineTo(gx + cSize, gy);
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = t.accentColor;
    ctx.fillRect(areaX, areaY - 16, areaW, 4);
    ctx.fillRect(areaX, botY + 12, areaW, 4);

    ctx.fillStyle = t.dotColor;
    for (let x = areaX; x < areaX + areaW; x += 25) {
      ctx.beginPath();
      ctx.arc(x, areaY - 26, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 32px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 2);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("✦ RETRO 70's EDITION ✦", cx, botMid + 26);
  } else if (t.id === "vhs") {
    ctx.fillStyle = t.borderColor;
    ctx.fillRect(0, 0, outerW, outerH);
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(16, 16, outerW - 32, outerH - 32);

    ctx.fillStyle = "rgba(0,0,0,0.08)";
    for (let y = 16; y < outerH - 16; y += 4) {
      ctx.fillRect(16, y, outerW - 32, 1);
    }

    ctx.fillStyle = t.accentColor;
    ctx.fillRect(areaX, areaY - 16, areaW, 6);
    ctx.fillRect(areaX, botY + 10, areaW, 6);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 30px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 2);
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("■■ VHS REWIND ■■", cx, botMid + 24);

    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 60, topMid, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 60, topMid, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = t.textColor;
    ctx.font = "bold 18px 'Playfair Display', serif";
    ctx.textBaseline = "middle";
    ctx.fillText("REC ●", cx, topMid);
  } else if (t.id === "newspaper") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = "rgba(58,47,27,0.10)";
    for (let y = 0; y < outerH; y += 8) {
      for (let x = 0; x < outerW; x += 8) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, outerW - 36, outerH - 36);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 60px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S TIMES", cx, topMid - 12);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, areaY - 34);
    ctx.lineTo(outerW - 40, areaY - 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, areaY - 60);
    ctx.lineTo(outerW - 40, areaY - 60);
    ctx.stroke();
    ctx.font = "italic 16px Inter, sans-serif";
    ctx.fillStyle = t.dotColor;
    ctx.fillText("EDISI SPESIAL  •  RETRO EDITION  •  Rp 0,00", cx, areaY - 47);

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 30px 'Playfair Display', serif";
    ctx.fillText("★ KABAR GEMBIRA DARI DAPUR KOPI ★", cx, botMid - 6);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.textColor;
    ctx.fillText("Diabadikan oleh Autentic's Fotobox", cx, botMid + 24);
  } else if (t.id === "magazine") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.accentColor;
    ctx.fillRect(0, 0, outerW, pad.top - 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 66px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VOGUE CAFE", cx, (pad.top - 24) / 2);

    ctx.fillStyle = t.dotColor;
    ctx.fillRect(0, pad.top - 24, outerW, 10);

    ctx.save();
    ctx.translate(outerW - pad.right / 2, h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("EXCLUSIVE • STYLE • COFFEE", 0, 0);
    ctx.restore();

    ctx.fillStyle = t.dotColor;
    ctx.fillRect(areaX, botMid - 27, 250, 54);
    ctx.fillStyle = t.textColor;
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("100% AUTENTIC", areaX + 16, botMid);

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 30px 'Playfair Display', serif";
    ctx.textAlign = "right";
    ctx.fillText("ISSUE #01", areaX + areaW, botMid);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, outerW - 10, outerH - 10);
  } else if (t.id === "scrapbook") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.strokeStyle = "rgba(109,76,65,0.12)";
    ctx.lineWidth = 1;
    for (let x = 40; x < outerW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, outerH);
      ctx.stroke();
    }
    for (let y = 40; y < outerH; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(outerW, y);
      ctx.stroke();
    }

    const tapes = [
      [areaX, areaY, -18, t.accentColor],
      [areaX + areaW, areaY, 14, t.dotColor],
      [areaX, botY, 10, t.dotColor],
      [areaX + areaW, botY, -12, t.accentColor],
    ];
    tapes.forEach(([tx, ty, rot, col]) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = col;
      ctx.fillRect(-55, -16, 110, 32);
      ctx.restore();
    });

    ctx.fillStyle = t.borderColor;
    ctx.font = "bold 48px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("our memories", cx, botMid - 8);
    ctx.fillStyle = t.accentColor;
    ctx.font = "20px Inter, sans-serif";
    ctx.fillText("✿ autentic's scrapbook ✿", cx, botMid + 24);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(20, 20, outerW - 40, outerH - 40);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawCoffeeBean(ctx, cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.quadraticCurveTo(size * 0.6, 0, 0, size * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
