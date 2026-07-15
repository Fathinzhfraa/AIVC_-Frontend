import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import TEMPLATES, { LAYOUTS, FILTERS, CATEGORIES } from "../data/templates";
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
const CROP_RATIO = 4 / 3;

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
  koranJadul: { top: 170, right: 55, bottom: 150, left: 55 },
  mesintik: { top: 90, right: 70, bottom: 110, left: 70 },
  kartupos: { top: 90, right: 70, bottom: 120, left: 70 },
  popart: { top: 90, right: 60, bottom: 110, left: 60 },
  filmstrip: { top: 110, right: 60, bottom: 110, left: 60 },
  polaroid: { top: 28, right: 28, bottom: 150, left: 28 },
  tarot: { top: 90, right: 70, bottom: 110, left: 70 },
  holo: { top: 80, right: 60, bottom: 100, left: 60 },
  kawaii: { top: 110, right: 60, bottom: 110, left: 60 },
  meme: { top: 120, right: 60, bottom: 120, left: 60 },
  stiker: { top: 100, right: 60, bottom: 110, left: 60 },
  pesta: { top: 100, right: 60, bottom: 110, left: 60 },
  binatang: { top: 120, right: 60, bottom: 110, left: 60 },
  floral: { top: 110, right: 60, bottom: 110, left: 60 },
  mafia: { top: 100, right: 60, bottom: 110, left: 60 },
  cute: { top: 100, right: 60, bottom: 120, left: 60 },
  minimal: { top: 140, right: 60, bottom: 140, left: 60 },
  gradient: { top: 100, right: 60, bottom: 120, left: 60 },
  neon: { top: 110, right: 60, bottom: 120, left: 60 },
  glass: { top: 110, right: 60, bottom: 130, left: 60 },
  brutal: { top: 110, right: 60, bottom: 120, left: 60 },
  struk: { top: 80, right: 50, bottom: 200, left: 50 },
  tabloid: { top: 150, right: 55, bottom: 130, left: 55 },
  robek: { top: 90, right: 60, bottom: 110, left: 60 },
  photostrip: { top: 70, right: 40, bottom: 110, left: 40 },
  vintage: { top: 140, right: 55, bottom: 150, left: 55 },
  korean: { top: 120, right: 55, bottom: 130, left: 55 },
  extra: { top: 240, right: 50, bottom: 200, left: 50 },
  special: { top: 170, right: 60, bottom: 240, left: 60 },
  cutekr: { top: 140, right: 55, bottom: 130, left: 55 },
  pinterest: { top: 210, right: 56, bottom: 200, left: 56 },
  bunny: { top: 150, right: 56, bottom: 150, left: 56 },
  bakery: { top: 150, right: 56, bottom: 150, left: 56 },
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
  const PER_PAGE = 6;
  const [cat, setCat] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = cat === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const start = safePage * PER_PAGE;
  const visible = filtered.slice(start, start + PER_PAGE);

  const go = (dir) => setPage((p) => Math.min(pages - 1, Math.max(0, p + dir)));
  const pickCat = (c) => {
    setCat(c);
    setPage(0);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pickCat(c.id)}
              className={`border-2 px-3 py-1.5 font-label-bold text-label-bold uppercase transition-all duration-200 ${
                active
                  ? "border-on-background bg-primary text-on-primary shadow-[3px_3px_0px_0px_#000] -translate-y-0.5"
                  : "border-on-surface-variant bg-background text-on-surface-variant hover:border-on-background hover:-translate-y-0.5"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={page === 0}
          aria-label="Sebelumnya"
          className="w-9 h-9 flex items-center justify-center border-2 border-on-surface-variant rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:border-on-background hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Halaman ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === page ? "w-5 bg-on-background" : "w-2.5 bg-on-surface-variant"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={page === pages - 1}
          aria-label="Berikutnya"
          className="w-9 h-9 flex items-center justify-center border-2 border-on-surface-variant rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:border-on-background hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visible.map((t) => {
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

function PhotoCropper({ src, ratio, filterCss, onCancel, onConfirm }) {
  const [imgDims, setImgDims] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef(null);
  const imgRef = useRef(null);
  const DISP_W = 300;
  const DISP_H = Math.round(DISP_W / ratio);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = src;
  }, [src]);

  let baseScale = 1;
  let scale = 1;
  let dispW = DISP_W;
  let dispH = DISP_H;
  if (imgDims) {
    baseScale = Math.max(DISP_W / imgDims.w, DISP_H / imgDims.h);
    scale = baseScale * zoom;
    dispW = imgDims.w * scale;
    dispH = imgDims.h * scale;
  }

  const clamp = (p) => ({
    x: Math.min(0, Math.max(DISP_W - dispW, p.x)),
    y: Math.min(0, Math.max(DISP_H - dispH, p.y)),
  });

  useEffect(() => {
    setPos((p) => clamp(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, imgDims]);

  const onPointerDown = (e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    setPos(clamp({ x: drag.current.ox + dx, y: drag.current.oy + dy }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const confirm = () => {
    if (!imgDims || !imgRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = Math.round(640 / ratio);
    const ctx = canvas.getContext("2d");
    ctx.save();
    if (filterCss && filterCss !== "none") ctx.filter = filterCss;
    const srcX = -pos.x / scale;
    const srcY = -pos.y / scale;
    const srcW = DISP_W / scale;
    const srcH = DISP_H / scale;
    ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    onConfirm(canvas.toDataURL("image/png"));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-surface border-2 border-on-background neu-shadow p-5 w-full max-w-sm">
        <h3 className="font-label-bold text-label-bold uppercase text-on-background mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">crop</span>
          Atur Foto
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-3 text-sm">
          Geser untuk atur posisi, geser slider untuk zoom.
        </p>
        <div
          className="relative mx-auto overflow-hidden border-2 border-on-background bg-black select-none"
          style={{ width: DISP_W, height: DISP_H, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {imgDims && (
            <img
              src={src}
              draggable={false}
              alt=""
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: dispW,
                height: dispH,
                pointerEvents: "none",
                maxWidth: "none",
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full mt-4 accent-[#8d4b00]"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-surface text-on-background border-2 border-on-background neu-shadow px-4 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-surface-container"
          >
            Batal
          </button>
          <button
            onClick={confirm}
            className="flex-1 bg-primary text-on-primary border-2 border-on-background neu-shadow px-4 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-primary-container hover:text-on-background"
          >
            Terapkan
          </button>
        </div>
      </div>
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
  const [pendingImage, setPendingImage] = useState(null);
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

  function openCropper(dataUrl) {
    setPendingImage(dataUrl);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = offscreenRef.current;
    if (!video || !canvas) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -vw, 0, vw, vh);
    ctx.restore();
    openCropper(canvas.toDataURL("image/png"));
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
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        openCropper(canvas.toDataURL("image/png"));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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

    const images = await Promise.all(photos.map((dataUrl) => loadImage(dataUrl)));

    const first = images[0];
    const aspect = (first.naturalWidth && first.naturalHeight)
      ? first.naturalWidth / first.naturalHeight
      : 4 / 3;
    const cw = 640;
    const ch = Math.max(360, Math.min(900, Math.round(cw / aspect)));

    const gap = 16;
    const pad = TEMPLATE_PADS[t.id] || TEMPLATE_PADS.default;
    const innerW = layout.cols * cw + (layout.cols - 1) * gap;
    const innerH = layout.rows * ch + (layout.rows - 1) * gap;
    const w = innerW + pad.left + pad.right;
    const h = innerH + pad.top + pad.bottom;

    const cells = [];
    for (let i = 0; i < layout.cols * layout.rows; i++) {
      const col = i % layout.cols;
      const row = Math.floor(i / layout.cols);
      cells.push({ x: pad.left + col * (cw + gap), y: pad.top + row * (ch + gap), w: cw, h: ch });
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    drawTemplate(ctx, w, h, t, pad, cells);

    images.forEach((img, i) => {
      const cell = cells[i];
      if (!cell) return;
      const x = cell.x;
      const y = cell.y;
      const cwc = cell.w;
      const chc = cell.h;

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cwc, chc);
      ctx.clip();
      const ar = (img.naturalWidth && img.naturalHeight)
        ? img.naturalWidth / img.naturalHeight
        : cwc / chc;
      const cellAr = cwc / chc;
      let dw, dh, dx, dy;
      if (ar > cellAr) {
        dh = chc;
        dw = dh * ar;
        dx = x - (dw - cwc) / 2;
        dy = y;
      } else {
        dw = cwc;
        dh = dw / ar;
        dx = x;
        dy = y - (dh - chc) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, cwc, chc);
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

  function dataUrlToFile(dataUrl, filename) {
    const [meta, b64] = dataUrl.split(",");
    const mime = (meta.match(/:(.*?);/) || [])[1] || "image/png";
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  }

  async function sendWhatsApp() {
    const digits = waNumber.replace(/\D/g, "");
    const phone = digits.length >= 8 ? normalizePhone(waNumber) : "";
    if (digits.length > 0 && digits.length < 8) {
      setError("Masukkan nomor WhatsApp yang valid (minimal 8 digit).");
      return;
    }
    setError("");
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
        whatsapp: phone,
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }

    const text = "Halo! Ini hasil fotobox Autentic's aku. Makasih sudah mampir! ☕";
    const file = dataUrlToFile(
      await buildCompositeDataUrl(),
      `fotobox-${selectedTemplate.id}-${Date.now()}.png`
    );

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
        setWaSent(true);
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
      setWaSent(true);
    } else {
      downloadResult();
      setError("Buka di HP untuk kirim langsung ke WA. Foto juga kami unduh.");
    }
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
              to="/menu"
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

        {pendingImage && (
          <PhotoCropper
            src={pendingImage}
            ratio={CROP_RATIO}
            filterCss={selectedFilter.css}
            onCancel={() => setPendingImage(null)}
            onConfirm={(url) => {
              setPendingImage(null);
              addPhoto(url);
            }}
          />
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
              <div className={`border-2 border-on-background overflow-hidden bg-surface-container shadow-[4px_4px_0px_0px_#000] mx-auto max-w-sm ${selectedTemplate.animated ? `fotobox-anim fotobox-anim-${selectedTemplate.anim}` : ""}`}>
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
                Di HP, foto langsung terkirim lewat sheet berbagi (pilih WhatsApp). Di desktop, isi
                nomor untuk buka chat wa.me, atau foto otomatis diunduh.
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
                  Foto siap dibagikan ke WhatsApp.
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
function drawTemplate(ctx, w, h, t, pad, cells) {
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
  } else if (t.id === "koranJadul") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 54px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HARIAN AUTENTIC", cx, topMid - 16);

    ctx.strokeStyle = t.textColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, areaY - 62);
    ctx.lineTo(outerW - 40, areaY - 62);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, areaY - 54);
    ctx.lineTo(outerW - 40, areaY - 54);
    ctx.stroke();

    ctx.font = "italic 13px Inter, sans-serif";
    ctx.fillStyle = t.dotColor;
    ctx.fillText("TERBIT SETIAP HARI  •  TAHUN KE-19  •  HARGA 10 SEN", cx, areaY - 36);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 24px 'Playfair Display', serif";
    ctx.fillText("CERITA DI BALIK SECANGKIR KOPI", cx, botMid - 18);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.dotColor;
    ctx.fillText("Diabadikan oleh Autentic's Fotobox — edisi lawas", cx, botMid + 8);
  } else if (t.id === "mesintik") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    for (let y = areaY - 40; y < botY + 30; y += 26) {
      ctx.beginPath();
      ctx.moveTo(areaX - 10, y);
      ctx.lineTo(areaX + areaW + 10, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(192,57,43,0.25)";
    ctx.beginPath();
    ctx.moveTo(areaX - 6, areaY - 50);
    ctx.lineTo(areaX - 6, botY + 40);
    ctx.stroke();

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 26px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("*** CATATAN HARIAN ***", cx, topMid - 10);

    ctx.fillStyle = t.accentColor;
    ctx.font = "20px 'Courier New', monospace";
    ctx.fillText("~ A U T E N T I C ' S ~", cx, botMid - 12);
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillStyle = t.textColor;
    ctx.fillText("- diketik dgn mesin tik -", cx, botMid + 14);
  } else if (t.id === "kartupos") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(outerW * 0.62, areaY - 30);
    ctx.lineTo(outerW * 0.62, botY + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(outerW - 96, areaY - 44, 64, 64);
    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("POST", outerW - 64, areaY - 22);
    ctx.fillText("30¢", outerW - 64, areaY + 2);
    ctx.beginPath();
    ctx.arc(outerW - 64, areaY + 20, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = t.textColor;
    ctx.font = "italic bold 28px 'Playfair Display', serif";
    ctx.textAlign = "left";
    ctx.fillText("Wish you", areaX - 4, areaY - 18);
    ctx.fillText("were here!", areaX - 4, areaY + 10);

    ctx.fillStyle = t.borderColor;
    ctx.font = "bold 22px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.fillText("GREETINGS FROM", cx, botMid - 12);
    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 26px 'Playfair Display', serif";
    ctx.fillText("AUTENTIC'S CAFE", cx, botMid + 16);
  } else if (t.id === "popart") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let y = 0; y < outerH; y += 16) {
      for (let x = 0; x < outerW; x += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, outerW - 20, outerH - 20);

    ctx.fillStyle = t.accentColor;
    drawStar(ctx, cx, botMid, 12, 70, 36);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 34px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("POW!", areaX, areaY - 22);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Playfair Display', serif";
    ctx.fillText("AUTENTIC'S", cx, botMid - 4);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.textColor;
    ctx.fillText("★ COMIC EDITION ★", cx, botMid + 26);
  } else if (t.id === "filmstrip") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = "#ffffff";
    const holeW = 46, holeH = 40, holeGap = 24;
    for (let x = 30; x + holeW < outerW - 10; x += holeW + holeGap) {
      ctx.fillRect(x, 22, holeW, holeH);
      ctx.fillRect(x, outerH - 22 - holeH, holeW, holeH);
    }

    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(areaX - 14, areaY - 14, areaW + 28, botY - areaY + 28);

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 26px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S FILMS", cx, topMid - 6);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.textColor;
    ctx.fillText("▮▮ REEL 01  •  CLAP! ▮▮", cx, botMid + 8);
  } else if (t.id === "polaroid") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.textColor;
    ctx.font = "italic 26px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("autentic's", cx, botMid - 6);
    ctx.fillStyle = t.accentColor;
    ctx.font = "20px Inter, sans-serif";
    ctx.fillText("♥", cx + 78, botMid - 10);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.dotColor;
    ctx.fillText(String(new Date().getFullYear()), cx, botMid + 22);
  } else if (t.id === "tarot") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, outerW - 28, outerH - 28);
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, outerW - 56, outerH - 56);

    [[44, 44], [outerW - 44, 44], [44, outerH - 44], [outerW - 44, outerH - 44]].forEach(([sx, sy]) =>
      drawStar(ctx, sx, sy, 4, 12, 5)
    );

    ctx.fillStyle = t.accentColor;
    ctx.beginPath();
    ctx.arc(cx, topMid - 6, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 24px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ THE MOMENT ✦", cx, botMid - 14);
    ctx.font = "italic 16px 'Playfair Display', serif";
    ctx.fillText("Mystic Edition", cx, botMid + 14);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("AUTENTIC'S TAROT", cx, botMid + 40);
  } else if (t.id === "holo") {
    const g = ctx.createLinearGradient(0, 0, outerW, outerH);
    g.addColorStop(0, "#ffd1f7");
    g.addColorStop(0.35, "#d1f0ff");
    g.addColorStop(0.7, "#e6d1ff");
    g.addColorStop(1, "#fff4d1");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffffff";
    for (let i = -2; i < 8; i++) {
      ctx.save();
      ctx.translate(i * 140, 0);
      ctx.rotate(0.5);
      ctx.fillRect(0, -200, 60, outerH + 400);
      ctx.restore();
    }
    ctx.restore();

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, outerW - 24, outerH - 24);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 30px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 10);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("✧ HOLOGRAPHIC ✧", cx, botMid + 20);
  } else if (t.id === "kawaii") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    const deco = [
      [70, 96, "♥", t.accentColor],
      [outerW - 80, 120, "★", t.dotColor],
      [92, outerH - 110, "✿", t.dotColor],
      [outerW - 70, outerH - 90, "♥", t.accentColor],
      [cx, 72, "☁", t.accentColor],
    ];
    ctx.font = "34px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    deco.forEach(([dx, dy, s, c]) => {
      ctx.fillStyle = c;
      ctx.fillText(s, dx, dy);
    });

    ctx.fillStyle = "rgba(255,143,179,0.5)";
    ctx.beginPath();
    ctx.arc(areaX + 60, botMid - 6, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(areaX + areaW - 60, botMid - 6, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 34px 'Playfair Display', serif";
    ctx.fillText("KAWAII ♡", cx, botMid - 8);
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("so cuuute ~ autentic's", cx, botMid + 22);
  } else if (t.id === "meme") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.borderColor;
    ctx.fillRect(0, 0, outerW, pad.top - 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BIKIN MOMEN", cx, (pad.top - 30) / 2);

    ctx.fillStyle = t.borderColor;
    ctx.fillRect(0, outerH - pad.bottom + 30, outerW, pad.bottom - 30);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("PAKAI AUTENTIC'S", cx, outerH - (pad.bottom - 30) / 2);

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 24px 'Arial Black', Impact, sans-serif";
    ctx.fillText("LOL :D", cx, botMid);
  } else if (t.id === "stiker") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    const drawFace = (fx, fy) => {
      ctx.fillStyle = t.borderColor;
      ctx.beginPath();
      ctx.arc(fx, fy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(fx - 6, fy - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx + 6, fy - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = t.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx, fy + 2, 7, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    };
    drawFace(areaX + 46, areaY - 32);
    drawFace(areaX + areaW - 46, areaY - 32);

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 26px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 6);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.textColor;
    ctx.fillText("Our Memories!", cx, botMid + 20);
  } else if (t.id === "pesta") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    const colors = [t.dotColor, t.accentColor, "#ffd43b", "#69db7c", "#ffffff"];
    for (let i = 0; i < 60; i++) {
      const rx = (i * 977) % outerW;
      const ry = (i * 613) % outerH;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate((i * 47) % Math.PI);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(-4, -7, 8, 14);
      ctx.restore();
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PARTY TIME!", cx, botMid - 10);
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = t.dotColor;
    ctx.fillText("best day ever", cx, botMid + 20);
  } else if (t.id === "binatang") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.accentColor;
    ctx.beginPath();
    ctx.moveTo(areaX + 30, areaY - 6);
    ctx.lineTo(areaX + 70, areaY - 50);
    ctx.lineTo(areaX + 90, areaY - 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(areaX + areaW - 30, areaY - 6);
    ctx.lineTo(areaX + areaW - 70, areaY - 50);
    ctx.lineTo(areaX + areaW - 90, areaY - 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = t.dotColor;
    const paw = (px, py) => {
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.arc(px + k * 9, py - 12, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    paw(areaX + 40, botMid - 60);
    paw(areaX + areaW - 40, botMid - 60);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 30px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MEOW ♥", cx, botMid + 6);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("kamu lucu banget!", cx, botMid + 32);
  } else if (t.id === "floral") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    const flower = (fx, fy, r, col) => {
      ctx.fillStyle = col;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(a) * r, fy + Math.sin(a) * r, r * 0.55, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = t.accentColor;
      ctx.beginPath();
      ctx.arc(fx, fy, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    };
    flower(70, 100, 18, t.dotColor);
    flower(outerW - 80, 130, 22, t.accentColor);
    flower(90, outerH - 120, 20, t.accentColor);
    flower(outerW - 70, outerH - 100, 16, t.dotColor);

    ctx.strokeStyle = t.dotColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(areaX, areaY - 20);
    ctx.quadraticCurveTo(cx, areaY - 60, areaX + areaW, areaY - 20);
    ctx.stroke();

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 34px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S BLOOM", cx, botMid - 8);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("mekar cantik setiap hari", cx, botMid + 22);
  } else if (t.id === "mafia") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, outerW - 32, outerH - 32);
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, outerW - 52, outerH - 52);

    ctx.fillStyle = t.borderColor;
    [[26, 26], [outerW - 26, 26], [26, outerH - 26], [outerW - 26, outerH - 26]].forEach(([cx0, cy0]) => {
      ctx.beginPath();
      ctx.moveTo(cx0, cy0);
      ctx.lineTo(cx0 + (cx0 < outerW / 2 ? 22 : -22), cy0);
      ctx.lineTo(cx0, cy0 + (cy0 < outerH / 2 ? 22 : -22));
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 38px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 12);
    ctx.font = "italic 18px 'Playfair Display', serif";
    ctx.fillStyle = t.borderColor;
    ctx.fillText("— The Family —", cx, botMid + 20);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.dotColor;
    ctx.fillText("★ RESPECT ★", cx, botMid + 44);
  } else if (t.id === "cute") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.dotColor;
    for (let i = 0; i < 24; i++) {
      const dx = (i * 523) % outerW;
      const dy = (i * 311) % outerH;
      ctx.beginPath();
      ctx.arc(dx, dy, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    const sx = cx;
    const sy = botMid - 6;
    ctx.fillStyle = t.accentColor;
    ctx.beginPath();
    ctx.arc(sx, sy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sx - 9, sy - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + 9, sy - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sx, sy + 2, 11, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 30px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S CUTE", cx, botMid + 44);
  } else if (t.id === "minimal") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(areaX, areaY - 30);
    ctx.lineTo(areaX + areaW, areaY - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(areaX, botY + 30);
    ctx.lineTo(areaX + areaW, botY + 30);
    ctx.stroke();

    ctx.fillStyle = t.textColor;
    ctx.font = "300 26px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A U T E N T I C ' S", cx, botMid - 4);
    ctx.fillStyle = t.dotColor;
    ctx.beginPath();
    ctx.arc(cx, botMid + 24, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (t.id === "gradient") {
    const g = ctx.createLinearGradient(0, 0, outerW, outerH);
    g.addColorStop(0, "#ff9a9e");
    g.addColorStop(0.5, "#a18cd1");
    g.addColorStop(1, "#84fab0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 40px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 6);
    ctx.font = "13px Inter, sans-serif";
    ctx.globalAlpha = 0.9;
    ctx.fillText("modern vibes", cx, botMid + 26);
    ctx.globalAlpha = 1;
  } else if (t.id === "neon") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.save();
    ctx.shadowColor = t.accentColor;
    ctx.shadowBlur = 24;
    ctx.fillStyle = t.textColor;
    ctx.font = "bold 40px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 8);
    ctx.restore();

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("NEON NIGHTS", cx, botMid + 26);

    ctx.save();
    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = t.borderColor;
    ctx.shadowBlur = 16;
    ctx.strokeRect(18, 18, outerW - 36, outerH - 36);
    ctx.restore();
  } else if (t.id === "glass") {
    const g = ctx.createLinearGradient(0, 0, outerW, outerH);
    g.addColorStop(0, "#e0c3fc");
    g.addColorStop(1, "#8ec5fc");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(areaX, botY + 8, areaW, pad.bottom - 24);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(areaX, botY + 8, areaW, pad.bottom - 24);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 34px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 4);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("glass · soft · modern", cx, botMid + 24);
  } else if (t.id === "brutal") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.accentColor;
    ctx.fillRect(areaX - 6, areaY - 6, 120, 40);

    ctx.fillStyle = t.borderColor;
    ctx.font = "bold 46px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx + 6, botMid);
    ctx.fillStyle = t.bgColor;
    ctx.fillText("AUTENTIC'S", cx, botMid - 6);

    ctx.fillStyle = t.borderColor;
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText("RAW · BOLD · REAL", cx, botMid + 40);
  } else if (t.id === "struk") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S CAFE", cx, topMid - 8);
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = t.dotColor;
 

    ctx.strokeStyle = t.textColor;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(areaX, areaY - 18);
    ctx.lineTo(areaX + areaW, areaY - 18);
    ctx.stroke();
    ctx.setLineDash([]);

    const items = [
      "ESPRESSO      $3.5",
      "LATTE         $4.5",
      "CROISSANT     $4.0",
      "TOTAL         $12",
    ];
    ctx.font = "12px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = t.textColor;
    let ly = botY + 22;
    items.forEach((it) => {
      ctx.fillText(it, areaX + 6, ly);
      ly += 18;
    });

    ctx.strokeStyle = t.textColor;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(areaX, ly);
    ctx.lineTo(areaX + areaW, ly);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = "center";
    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText("TERIMA KASIH ☕", cx, ly + 22);

    ctx.fillStyle = t.textColor;
    for (let bx = areaX + 20; bx < areaX + areaW - 20; bx += 4) {
      if ((bx * 7) % 3 === 0) ctx.fillRect(bx, ly + 34, 2, 16);
    }
  } else if (t.id === "tabloid") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 52px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC DAILY", cx, topMid - 14);

    ctx.strokeStyle = t.textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, areaY - 50);
    ctx.lineTo(outerW - 40, areaY - 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, areaY - 44);
    ctx.lineTo(outerW - 40, areaY - 44);
    ctx.stroke();

    ctx.fillStyle = t.textColor;
    ctx.fillRect(areaX, botY + 8, 150, 38);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("HEADLINE", areaX + 10, botY + 27);

    ctx.fillStyle = t.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 20px 'Playfair Display', serif";
    ctx.fillText("SENYUM DARI SECANGKIR KOPI", cx, botY + 52);

    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = t.dotColor;
    for (let i = 0; i < 3; i++) {
      ctx.fillText("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■", areaX, botY + 74 + i * 13);
    }
  } else if (t.id === "robek") {
    ctx.fillStyle = t.dotColor;
    ctx.fillRect(0, 0, outerW, outerH);

    const tOff = 14;
    const step = 26;
    ctx.beginPath();
    ctx.moveTo(0, tOff);
    for (let x = 0; x <= outerW; x += step) {
      const yy = tOff + ((x / step) % 2 === 0 ? 0 : 12);
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(outerW, outerH - tOff);
    for (let x = outerW; x >= 0; x -= step) {
      const yy = outerH - tOff - ((x / step) % 2 === 0 ? 0 : 12);
      ctx.lineTo(x, yy);
    }
    ctx.closePath();
    ctx.fillStyle = t.bgColor;
    ctx.fill();

    ctx.fillStyle = "rgba(180,160,120,0.55)";
    ctx.save();
    ctx.translate(areaX - 6, tOff - 4);
    ctx.rotate(-0.2);
    ctx.fillRect(-30, -16, 90, 32);
    ctx.restore();
    ctx.save();
    ctx.translate(areaX + areaW + 6, tOff - 4);
    ctx.rotate(0.2);
    ctx.fillRect(-60, -16, 90, 32);
    ctx.restore();

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 32px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S", cx, botMid - 6);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("~ ingatan yang robek tapi manis ~", cx, botMid + 22);
  } else if (t.id === "photostrip") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, outerW - 16, outerH - 16);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 16px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S PHOTO BOOTH", cx, topMid - 4);

    ctx.font = "bold 22px 'Playfair Display', serif";
    ctx.fillText("AUTENTIC'S", cx, botMid - 8);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText(
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      cx,
      botMid + 18
    );

    ctx.fillStyle = t.dotColor;
    ctx.beginPath();
    ctx.arc(areaX + 16, botMid - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(areaX + areaW - 16, botMid - 8, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (t.id === "vintage") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = "rgba(120,90,60,0.05)";
    for (let i = 0; i < 1600; i++) {
      const gx = (i * 131) % outerW;
      const gy = (i * 197) % outerH;
      ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i < 900; i++) {
      const gx = (i * 311) % outerW;
      const gy = (i * 523) % outerH;
      ctx.fillRect(gx, gy, 1, 1);
    }

    drawClipping(ctx, areaX, areaY - 78, areaW, 50, "AUTENTIC TIMES", t);
    drawClipping(ctx, areaX, botY + 16, areaW, 42, "EDISI · KOPI & CERITA", t);

    ctx.fillStyle = "rgba(120,72,30,0.16)";
    ctx.beginPath();
    ctx.ellipse(areaX + 36, areaY - 6, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(areaX + areaW - 34, botY + 6, 24, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    (cells || []).forEach((c) => {
      ctx.fillStyle = "#fbf7ec";
      ctx.fillRect(c.x - 7, c.y - 7, c.w + 14, c.h + 20);
      ctx.strokeStyle = "rgba(60,40,20,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x - 7, c.y - 7, c.w + 14, c.h + 20);

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y - 9);
      ctx.rotate(-0.18);
      ctx.fillStyle = "rgba(205,185,145,0.6)";
      ctx.fillRect(-28, -11, 56, 22);
      ctx.restore();

      ctx.fillStyle = t.textColor;
      ctx.font = "12px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("autentic's", c.x + c.w / 2, c.y + c.h + 3);
    });

    [
      [outerW * 0.15, 30, 0.25],
      [outerW * 0.85, 30, -0.25],
      [outerW * 0.15, outerH - 30, -0.25],
      [outerW * 0.85, outerH - 30, 0.25],
    ].forEach(([tx, ty, rot]) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(rot);
      ctx.fillStyle = "rgba(205,185,145,0.5)";
      ctx.fillRect(-30, -13, 60, 26);
      ctx.restore();
    });

    ctx.fillStyle = t.accentColor;
    ctx.font = "22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✶", areaX - 26, areaY + 50);
    ctx.fillText("❤", areaX + areaW + 26, botY - 40);
    ctx.fillText("✦", areaX + areaW + 26, areaY + 50);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 30px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("~ A U T E N T I C ' S ~", cx, botY + 74);
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillStyle = t.dotColor;
    ctx.fillText(
      new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      cx,
      botY + 98
    );
  } else if (t.id === "korean") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    ctx.fillStyle = "rgba(150,130,100,0.04)";
    for (let i = 0; i < 1400; i++) {
      const gx = (i * 97) % outerW;
      const gy = (i * 151) % outerH;
      ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    for (let i = 0; i < 700; i++) {
      const gx = (i * 263) % outerW;
      const gy = (i * 449) % outerH;
      ctx.fillRect(gx, gy, 1, 1);
    }

    const rpx = areaX - 18;
    const rpy = areaY - 18;
    const rpw = areaW + 36;
    const rph = botY - areaY + 36;
    drawRippedPanel(ctx, rpx, rpy, rpw, rph, "#fdfaf2");

    drawClipping(ctx, rpx, rpy - 32, 120, 24, "DAILY", t);
    drawClipping(ctx, rpx + rpw - 120, rpy - 32, 120, 24, "MEMO", t);

    ctx.fillStyle = t.accentColor;
    ctx.font = "italic 26px 'Segoe Script','Brush Script MT',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("dear diary ✎", cx, areaY - 58);

    (cells || []).forEach((c, i) => {
      ctx.fillStyle = "#fdfaf2";
      ctx.fillRect(c.x - 6, c.y - 6, c.w + 12, c.h + 16);
      ctx.strokeStyle = "rgba(90,74,58,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x - 6, c.y - 6, c.w + 12, c.h + 16);

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y - 6);
      ctx.rotate(i % 2 ? 0.12 : -0.12);
      ctx.fillStyle = "rgba(220,200,170,0.55)";
      ctx.fillRect(-22, -8, 44, 16);
      ctx.restore();

      ctx.fillStyle = "rgba(120,100,80,0.7)";
      ctx.font = "italic 13px 'Segoe Script','Brush Script MT',cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("our moment", c.x + c.w / 2, c.y + c.h + 4);
    });

    ctx.font = "20px Inter, sans-serif";
    ctx.fillStyle = t.accentColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♡", areaX - 22, areaY + 40);
    ctx.fillText("✿", areaX + areaW + 22, areaY + 40);
    ctx.fillText("☁", areaX + areaW + 22, botY - 30);
    ctx.fillText("★", areaX - 22, botY - 30);

    ctx.fillStyle = t.textColor;
    ctx.font = "12px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "A U T E N T I C ' S   ·   " +
        new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      cx,
      botY + 70
    );
  } else if (t.id === "extra") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);

    drawHalftone(ctx, outerW, outerH, "rgba(0,0,0,0.05)", 6);
    drawDistressedBorder(ctx, outerW, outerH, "rgba(26,26,26,0.55)");

    const lorem1 =
      "Breaking News — Today's edition proudly features extraordinary moments shared by remarkable people. From heartfelt conversations and endless laughter to unforgettable adventures, every photograph captures a chapter of a story worth celebrating, remembering, and passing on for generations to come. Every smile reflects a memory, every gathering tells a unique story, and every shared moment becomes a treasured piece of life's journey. As the pages of time continue to turn, these memories remain beautifully preserved—proof that the most meaningful stories are written through friendship, love, and the unforgettable moments we create together.";

    ctx.fillStyle = t.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px 'Playfair Display', serif";
    ctx.fillText("THE  A U T E N T I C  G A Z E T T E", cx, 34);
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = t.dotColor;
    ctx.fillText(
      "VOL. I · NO. 1    —    " +
        new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
      cx,
      50
    );
    drawRule(ctx, 30, outerW - 30, 62, t.accentColor);
    drawRule(ctx, 30, outerW - 30, 66, t.accentColor);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 54px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OUR MEMORIES!", cx, 108);
    drawRule(ctx, pad.left, outerW - pad.right, 140, t.accentColor);

    ctx.font = "10px 'Times New Roman', serif";
    ctx.fillStyle = t.textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    wrapLines(ctx, lorem1, areaW).forEach((ln, i) => ctx.fillText(ln, pad.left, 162 + i * 13));

    (cells || []).forEach((c) => {
      ctx.strokeStyle = t.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - 3, c.y - 3, c.w + 6, c.h + 6);
    });

    const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

    const footY = botY + 12;
    drawRule(ctx, pad.left, cx - 18, footY, t.accentColor);
    drawRule(ctx, cx + 18, outerW - pad.right, footY, t.accentColor);
    ctx.fillStyle = t.textColor;
    ctx.font = "14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦", cx, footY);

    const colGap = 24;
    const colW = (areaW - colGap) / 2;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillText("ADVERTISEMENT", pad.left, botY + 34);
    ctx.font = "8px 'Times New Roman', serif";
    wrapLines(ctx, "Today's special! Bring this paper and get 10% off on all of our signature coffee menus.", colW).forEach(
      (ln, i) => ctx.fillText(ln, pad.left, botY + 48 + i * 11)
    );

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillText("MORNING EDITION", pad.left + colW + colGap, botY + 34);
    ctx.font = "8px 'Times New Roman', serif";
    wrapLines(ctx, "Partly cloudy skies. The market rose 2.4%. Enjoy your morning with a good newspaper!", colW).forEach(
      (ln, i) => ctx.fillText(ln, pad.left + colW + colGap, botY + 48 + i * 11)
    );

    const stampW = 230;
    const stampH = 38;
    const stampX = cx - stampW / 2;
    const stampY = botY + 92;
    ctx.strokeStyle = t.textColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(stampX, stampY, stampW, stampH);
    ctx.strokeRect(stampX + 4, stampY + 4, stampW - 8, stampH - 8);
    ctx.fillStyle = t.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText("PRICE 1000 IDR", cx, stampY + stampH / 2);

    const barX = outerW - pad.right - 90;
    const barY = botY + 92;
    ctx.fillStyle = t.textColor;
    for (let i = 0; i < 22; i++) {
      const bw = i % 3 === 0 ? 3 : 1;
      ctx.fillRect(barX + i * 4, barY, bw, 26);
    }
    ctx.font = "7px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("0 1000 AU", barX + 44, barY + 34);

    ctx.fillStyle = t.dotColor;
    ctx.font = "9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("AUTENTIC'S   ·   PUBLISHED DAILY   ·   " + today, cx, outerH - 14);
  } else if (t.id === "special") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);
    drawHalftone(ctx, outerW, outerH, "rgba(0,0,0,0.05)", 6);
    drawDistressedBorder(ctx, outerW, outerH, "rgba(26,26,26,0.55)");

    const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

    ctx.fillStyle = t.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText("THE  A U T E N T I C  G A Z E T T E", cx, 30);
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = t.dotColor;
    ctx.fillText("VOL. I · NO. 1    —    " + today, cx, 46);
    drawRule(ctx, 30, outerW - 30, 58, t.accentColor);
    drawRule(ctx, 30, outerW - 30, 62, t.accentColor);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 44px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPECIAL EDITION", cx, 104);
    drawRule(ctx, pad.left, outerW - pad.right, 134, t.accentColor);

    ctx.font = "italic 12px 'Playfair Display', serif";
    ctx.fillStyle = t.accentColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Today's heartfelt front page", cx, 154);

    (cells || []).forEach((c, i) => {
      ctx.strokeStyle = t.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - 3, c.y - 3, c.w + 6, c.h + 6);
      ctx.fillStyle = t.textColor;
      ctx.font = "9px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
     
    });

    drawRule(ctx, pad.left, outerW - pad.right, botY + 10, t.accentColor);
    ctx.fillStyle = t.textColor;
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("WELCOME", pad.left, botY + 28);
    ctx.font = "9px 'Times New Roman', serif";
    wrapLines(
      ctx,
      "Welcome to today's special edition, where ordinary moments become extraordinary memories. Every photograph on this page reflects genuine emotions, meaningful connections, and unforgettable experiences that deserve more than a place in an album—they deserve to become the headlines of a story that will be remembered for years to come.",
      areaW
    ).forEach((ln, i) => ctx.fillText(ln, pad.left, botY + 44 + i * 12));

    ctx.fillStyle = t.dotColor;
    ctx.font = "9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("AUTENTIC'S   ·   PUBLISHED WITH LOVE   ·   " + today, cx, outerH - 16);
  } else if (t.id === "cutekr") {
    const pastels = ["#f7a8c4", "#a8e6cf", "#ffe6a7", "#cdb4f6", "#a8d8ff", "#ffb3a7"];
    const dc = (k) => pastels[k % pastels.length];

    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);
    ctx.fillStyle = "rgba(0,0,0,0.02)";
    for (let i = 0; i < 700; i++) {
      const gx = (i * 131) % outerW;
      const gy = (i * 197) % outerH;
      ctx.fillRect(gx, gy, 1, 1);
    }

    ctx.strokeStyle = "rgba(247,168,196,0.7)";
    ctx.lineWidth = 3;
    ctx.setLineDash([2, 8]);
    ctx.strokeRect(areaX - 8, areaY - 8, areaW + 16, botY - areaY + 16);
    ctx.setLineDash([]);

    ctx.fillStyle = t.accentColor;
    ctx.font = "italic 26px 'Segoe Script','Brush Script MT',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("our memory ✿", cx, areaY - 56);

    const notes = ["best day", "our moment", "sweet", "lovely", "hehe", "yay"];
    (cells || []).forEach((c, i) => {
      ctx.fillStyle = "#fffdfa";
      ctx.fillRect(c.x - 6, c.y - 6, c.w + 12, c.h + 18);
      ctx.strokeStyle = dc(i);
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - 6, c.y - 6, c.w + 12, c.h + 18);

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y - 8);
      ctx.rotate(i % 2 ? 0.12 : -0.12);
      ctx.fillStyle = "rgba(205,185,230,0.6)";
      ctx.fillRect(-24, -9, 48, 18);
      ctx.restore();

      ctx.fillStyle = dc(i);
      ctx.font = "italic 13px 'Segoe Script','Brush Script MT',cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(notes[i % notes.length], c.x + c.w / 2, c.y + c.h + 4);
    });

    ctx.fillStyle = dc(3);
    drawStar(ctx, cx - 120, areaY - 50, 5, 9, 4);
    drawHeart(ctx, areaX - 2, areaY - 64, 10, dc(0));
    drawSmiley(ctx, cx + 130, areaY - 48, 11, dc(2));
    drawButterfly(ctx, areaX + 64, areaY - 70, 12, dc(1));
    drawFlower(ctx, areaX + areaW - 50, areaY - 58, 9, dc(4), "#fff3b0");

    ctx.fillStyle = dc(4);
    drawStar(ctx, cx - 140, botY + 50, 5, 9, 4);
    drawHeart(ctx, cx + 130, botY + 48, 10, dc(0));
    drawSmiley(ctx, areaX + 50, botY + 50, 11, dc(3));
    drawButterfly(ctx, areaX + areaW - 60, botY + 56, 12, dc(2));
    drawFlower(ctx, cx + 12, botY + 44, 9, dc(1), "#fff3b0");

    drawHeart(ctx, 22, areaY + 60, 9, dc(1));
    ctx.fillStyle = dc(0);
    drawStar(ctx, outerW - 22, areaY + 120, 5, 8, 3.5);
    drawSmiley(ctx, 22, botY - 60, 10, dc(4));
    drawFlower(ctx, outerW - 22, botY - 100, 8, dc(3), "#fff3b0");

    [
      [outerW * 0.16, 26, 0.25],
      [outerW * 0.84, 26, -0.25],
      [outerW * 0.16, outerH - 26, -0.25],
      [outerW * 0.84, outerH - 26, 0.25],
    ].forEach(([tx, ty, rot]) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(rot);
      ctx.fillStyle = "rgba(255,210,225,0.6)";
      ctx.fillRect(-28, -12, 56, 24);
      ctx.restore();
    });

    ctx.fillStyle = dc(2);
    ctx.font = "italic 14px 'Segoe Script','Brush Script MT',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("made with love ✎", cx, outerH - 26);
  } else if (t.id === "pinterest") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);
    drawHalftone(ctx, outerW, outerH, "rgba(31,42,68,0.06)", 5);
    drawDistressedBorder(ctx, outerW, outerH, "rgba(31,42,68,0.5)");

    const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

    drawClipping(ctx, areaX, 18, areaW, 40, "THE DAILY GROOVE", t);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 46px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MIXTAPE", cx, 108);
    ctx.font = "italic 13px 'Playfair Display', serif";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("· a 90s memory strip ·", cx, 138);

    drawNote(ctx, cx + 132, 100, 26, t.accentColor);
    drawNote(ctx, cx - 142, 118, 20, "#c9a227");

    const songs = ["Golden Hour", "Midnight City", "Sunflower", "Lover", "Sunday Morning", "Electric Feel"];
    (cells || []).forEach((c, i) => {
      ctx.fillStyle = "#fbf6e9";
      ctx.fillRect(c.x - 6, c.y - 6, c.w + 12, c.h + 18);
      ctx.strokeStyle = t.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - 6, c.y - 6, c.w + 12, c.h + 18);

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y - 7);
      ctx.rotate(i % 2 ? 0.14 : -0.14);
      ctx.fillStyle = "rgba(201,162,39,0.5)";
      ctx.fillRect(-26, -9, 52, 18);
      ctx.restore();

      ctx.fillStyle = t.textColor;
      ctx.font = "italic 13px 'Segoe Script','Brush Script MT',cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("♪ " + songs[i % songs.length], c.x + c.w / 2, c.y + c.h + 9);
    });

    drawCD(ctx, 28, areaY + 70, 20);
    drawCD(ctx, outerW - 28, botY - 70, 20);
    drawNote(ctx, outerW - 26, areaY + 60, 18, t.accentColor);
    drawNote(ctx, 26, botY - 40, 16, "#c9a227");
    ctx.fillStyle = "#c9a227";
    drawStar(ctx, areaX - 2, botY - 8, 5, 7, 3);
    ctx.fillStyle = t.accentColor;
    drawStar(ctx, outerW - areaX + 6, areaY + 120, 5, 7, 3);

    drawTicket(ctx, areaX + 6, botY + 40, 172, 50);
    drawCassette(ctx, areaX + areaW - 156, botY + 26, 150, 84);

    ctx.fillStyle = "#c9a227";
    ctx.font = "20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦", areaX + 22, areaY + 30);
    ctx.fillText("✧", areaX + areaW - 22, areaY + 30);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUTENTIC'S   ·   90s FOREVER", cx, outerH - 24);
    ctx.font = "9px 'Courier New', monospace";
    ctx.fillStyle = t.dotColor;
    ctx.fillText(today, cx, outerH - 10);
  } else if (t.id === "bunny") {
    drawGingham(ctx, outerW, outerH, "#fff7fb", "#f7c6d9", 36, 0.55);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 34px 'Comic Sans MS','Baloo 2',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Autentic's ♡", cx, topMid + 6);
    ctx.font = "14px 'Comic Sans MS','Baloo 2',cursive";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("· a little hoppy story ·", cx, topMid + 34);

    drawBunny(ctx, areaX + 16, topMid - 6, 26, "#ffffff");
    drawBunny(ctx, outerW - areaX - 16, topMid - 6, 22, "#fff0f5");

    const pastels = ["#f7c6d9", "#b8e6d0", "#ffe6a7", "#d9c2f0", "#bfe3f0", "#f7b8a8"];
    const captions = ["hoppy day", "little bun", "so soft ♡", "carrot ♡", "tulip time", "bun bun"];
    (cells || []).forEach((c, i) => {
      const col = pastels[i % pastels.length];
      ctx.save();
      ctx.shadowColor = "rgba(154,107,122,0.25)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, c.x - 7, c.y - 7, c.w + 14, c.h + 26, 16);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      roundRect(ctx, c.x - 7, c.y - 7, c.w + 14, c.h + 26, 16);
      ctx.stroke();

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y - 8);
      ctx.rotate(i % 2 ? 0.12 : -0.12);
      ctx.fillStyle = i % 2 ? "#f7a8c4" : "#9fdcc0";
      roundRect(ctx, -28, -9, 56, 18, 4);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = t.textColor;
      ctx.font = "italic 13px 'Segoe Script','Brush Script MT',cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(captions[i % captions.length], c.x + c.w / 2, c.y + c.h + 13);

      drawBunny(ctx, c.x + 4, c.y + 6, 14, "#ffffff");
      drawHeart(ctx, c.x + c.w - 8, c.y + 8, 7, col);
    });

    drawTulip(ctx, areaX + 12, areaY + 30, 30, "#f49ac1");
    drawTulip(ctx, outerW - areaX - 12, areaY + 70, 26, "#f7b8a8");
    drawFlower(ctx, areaX + 8, botY - 30, 12, "#ffffff", "#ffe06a");
    drawFlower(ctx, outerW - areaX - 6, botY - 70, 11, "#ffffff", "#ffe06a");
    drawCarrot(ctx, areaX + 14, botY - 14, 26);
    drawCarrot(ctx, outerW - areaX + 2, botY - 30, 22);
    drawButterfly(ctx, areaX + 40, areaY + 90, 16, "#d9c2f0");
    drawButterfly(ctx, outerW - areaX - 40, botY - 120, 14, "#bfe3f0");
    drawStar(ctx, areaX + 30, areaY + 10, 5, 7, 3);
    drawStar(ctx, outerW - areaX - 28, areaY + 40, 5, 6, 2.5);
    drawSmiley(ctx, areaX + 20, botY - 70, 9, "#ffe6a7");
    drawSmiley(ctx, outerW - areaX - 18, botY - 20, 8, "#bfe3f0");

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 13px 'Comic Sans MS',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("made with love ♡ AUTENTIC'S", cx, outerH - 22);
    ctx.font = "10px 'Comic Sans MS',cursive";
    ctx.fillStyle = t.textColor;
    ctx.fillText(new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }), cx, outerH - 8);
  } else if (t.id === "bakery") {
    ctx.fillStyle = t.bgColor;
    ctx.fillRect(0, 0, outerW, outerH);
    ctx.fillStyle = "rgba(232,155,90,0.10)";
    for (let y = 24; y < outerH; y += 46) {
      for (let x = (Math.round(y / 46) % 2 ? 35 : 22); x < outerW; x += 46) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = "rgba(232,155,90,0.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([9, 9]);
    ctx.strokeRect(15, 15, outerW - 30, outerH - 30);
    ctx.setLineDash([]);

    ctx.fillStyle = t.textColor;
    ctx.font = "bold 34px 'Comic Sans MS','Baloo 2',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Autentic's ♡", cx, topMid + 6);
    ctx.font = "14px 'Comic Sans MS','Baloo 2',cursive";
    ctx.fillStyle = t.accentColor;
    ctx.fillText("· fresh from the oven ·", cx, topMid + 34);

    drawDonut(ctx, areaX + 16, topMid - 4, 15, "#f6a5c0");
    drawBread(ctx, outerW - areaX - 18, topMid, 20, "#f0c27b");

    const warm = ["#e89b5a", "#f0c27b", "#e6b98f", "#d98c5f", "#c9a04a", "#cf8f6a"];
    const captions = ["fresh ♡", "so sweet", "tasty!", "yum yum", "cozy", "cute bake"];
    (cells || []).forEach((c, i) => {
      const col = warm[i % warm.length];
      ctx.save();
      ctx.shadowColor = "rgba(154,107,74,0.25)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, c.x - 7, c.y - 7, c.w + 14, c.h + 26, 16);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      roundRect(ctx, c.x - 7, c.y - 7, c.w + 14, c.h + 26, 16);
      ctx.stroke();

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y - 8);
      ctx.rotate(i % 2 ? 0.12 : -0.12);
      ctx.fillStyle = i % 2 ? "#f0c27b" : "#e6b98f";
      roundRect(ctx, -28, -9, 56, 18, 4);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = t.textColor;
      ctx.font = "italic 13px 'Segoe Script','Brush Script MT',cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(captions[i % captions.length], c.x + c.w / 2, c.y + c.h + 13);

      if (i % 2 === 0) drawCookie(ctx, c.x + 6, c.y + 6, 11, "#c98a4b");
      else drawHeart(ctx, c.x + c.w - 9, c.y + 9, 7, col);
    });

    drawCroissant(ctx, areaX + 12, areaY + 40, 18, "#e9b66a");
    drawToast(ctx, outerW - areaX - 6, areaY + 80, 15, "#fbe6c1");
    drawMilk(ctx, areaX + 14, botY - 70, 14);
    drawCookie(ctx, outerW - areaX - 14, botY - 80, 13, "#c98a4b");
    drawBread(ctx, areaX + 24, botY - 14, 16, "#f0c27b");
    drawButter(ctx, outerW - areaX - 30, botY - 26, 12);
    drawDonut(ctx, outerW - areaX - 18, botY - 120, 13, "#f6a5c0");
    drawStar(ctx, areaX + 30, areaY + 12, 5, 7, 3);
    drawStar(ctx, outerW - areaX - 26, areaY + 46, 5, 6, 2.5);
    drawStar(ctx, cx, areaY + 30, 5, 6, 2.5);
    drawHeart(ctx, areaX + 16, botY - 30, 7, "#f6a5c0");
    drawHeart(ctx, outerW - areaX - 14, botY - 40, 6, "#e89b5a");
    drawSmiley(ctx, areaX + 24, areaY + 90, 9, "#ffe6a7");
    drawSmiley(ctx, outerW - areaX - 22, botY - 30, 8, "#f0c27b");

    ctx.fillStyle = t.accentColor;
    ctx.font = "bold 13px 'Comic Sans MS',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("made with love ♡ AUTENTIC'S", cx, outerH - 22);
    ctx.font = "10px 'Comic Sans MS',cursive";
    ctx.fillStyle = t.textColor;
    ctx.fillText(new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }), cx, outerH - 8);
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

function drawClipping(ctx, x, y, w, h, title, t) {
  ctx.save();
  ctx.fillStyle = "#d9d2c2";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.32)";
  for (let i = 0; i < 3; i++) {
    const colX = x + 12 + i * (w / 3);
    ctx.fillRect(colX, y + 22, w / 3 - 18, 2);
    ctx.fillRect(colX, y + 28, w / 3 - 20, 2);
  }

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 18px 'Playfair Display', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, x + w / 2, y + 11);
  ctx.restore();
}

function drawRippedPanel(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;
  const step = 14;
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  for (let px = x; px <= x + w; px += step) {
    const j = (Math.round(px / step) % 2 === 0) ? 0 : 7;
    ctx.lineTo(px, y + j);
  }
  ctx.lineTo(x + w, y + h - 6);
  for (let px = x + w; px >= x; px -= step) {
    const j = (Math.round(px / step) % 2 === 0) ? 0 : 7;
    ctx.lineTo(px, y + h - j);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHalftone(ctx, w, h, color, spacing) {
  ctx.save();
  ctx.fillStyle = color;
  for (let y = 0; y < h; y += spacing) {
    for (let x = 0; x < w; x += spacing) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.restore();
}

function drawRule(ctx, x1, x2, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function drawDistressedBorder(ctx, w, h, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const s = 10;
  const step = 10;
  const n = (v) => ((Math.round(v / step) % 2 === 0) ? -2 : 2);
  ctx.beginPath();
  ctx.moveTo(s, s);
  for (let x = s; x <= w - s; x += step) ctx.lineTo(x, s + n(x));
  for (let y = s; y <= h - s; y += step) ctx.lineTo(w - s + n(y), y);
  for (let x = w - s; x >= s; x -= step) ctx.lineTo(x, h - s + n(x));
  for (let y = h - s; y >= s; y -= step) ctx.lineTo(s + n(y), y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function wrapLines(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
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

function drawHeart(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.3);
  ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s * 0.9, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.6, x + s, y + s * 0.3);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSmiley(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2a2a";
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.12, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.35, y - r * 0.12, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a2a2a";
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.12, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,120,150,0.5)";
  ctx.beginPath();
  ctx.arc(x - r * 0.55, y + r * 0.22, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.55, y + r * 0.22, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawButterfly(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.5, y - s * 0.3, s * 0.55, s * 0.5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.5, y - s * 0.3, s * 0.55, s * 0.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - s * 0.45, y + s * 0.35, s * 0.45, s * 0.4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.45, y + s * 0.35, s * 0.45, s * 0.4, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a4a4a";
  ctx.lineWidth = Math.max(1.5, s * 0.12);
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.8);
  ctx.quadraticCurveTo(x - s * 0.3, y - s * 1.2, x - s * 0.4, y - s * 1.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.8);
  ctx.quadraticCurveTo(x + s * 0.3, y - s * 1.2, x + s * 0.4, y - s * 1.3);
  ctx.stroke();
  ctx.fillStyle = "#5a4a4a";
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.1, s * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFlower(ctx, x, y, r, color, centerColor) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = centerColor || "#fff3b0";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCD(ctx, x, y, r) {
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.4, "#cfe3ff");
  g.addColorStop(0.7, "#b9a7e0");
  g.addColorStop(1, "#8fa9d6");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.78, -0.6, 0.2);
  ctx.stroke();
  ctx.fillStyle = "#efe6d2";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(31,42,68,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCassette(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#27406b";
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "#fbf6e9";
  roundRect(ctx, x + 8, y + 7, w - 16, h * 0.42, 4);
  ctx.fill();
  const ry = y + h * 0.62;
  const rr = h * 0.16;
  [x + w * 0.34, x + w * 0.66].forEach((rx) => {
    ctx.fillStyle = "#1f2a44";
    ctx.beginPath();
    ctx.arc(rx, ry, rr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(rx, ry, rr * 0.35, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#1f2a44";
  ctx.fillRect(x + w * 0.3, ry - 3, w * 0.4, 5);
  ctx.fillStyle = "#fbf6e9";
  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MIXTAPE '99", x + w / 2, y + h * 0.26);
  ctx.restore();
}

function drawTicket(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#fbf6e9";
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = "#1f2a44";
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();
  ctx.strokeStyle = "rgba(31,42,68,0.45)";
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.66, y + 3);
  ctx.lineTo(x + w * 0.66, y + h - 3);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#1f2a44";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("ADMIT ONE", x + w * 0.33, y + h * 0.36);
  ctx.font = "9px 'Courier New', monospace";
  ctx.fillText("CONCERT '99", x + w * 0.33, y + h * 0.64);
  ctx.fillStyle = "#c9a227";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText("♪", x + w * 0.83, y + h * 0.5);
  ctx.restore();
}

function drawNote(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.5, s * 0.3, s * 0.22, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + s * 0.26, y - s * 0.5, s * 0.12, s);
  ctx.beginPath();
  ctx.moveTo(x + s * 0.38, y - s * 0.5);
  ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.2, x + s * 0.5, y + s * 0.1);
  ctx.lineTo(x + s * 0.38, y);
  ctx.quadraticCurveTo(x + s * 0.7, y - s * 0.2, x + s * 0.38, y - s * 0.5);
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawGingham(ctx, w, h, base, stripe, size, alpha) {
  ctx.save();
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = stripe;
  ctx.globalAlpha = alpha;
  for (let x = 0; x < w + size; x += size * 2) ctx.fillRect(x, 0, size, h);
  for (let y = 0; y < h + size; y += size * 2) ctx.fillRect(0, y, w, size);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBunny(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.32, y - s * 0.95, s * 0.16, s * 0.5, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.32, y - s * 0.95, s * 0.16, s * 0.5, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f7a8c4";
  ctx.beginPath();
  ctx.ellipse(x - s * 0.32, y - s * 0.88, s * 0.07, s * 0.32, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.32, y - s * 0.88, s * 0.07, s * 0.32, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.62, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(247,120,150,0.45)";
  ctx.beginPath();
  ctx.arc(x - s * 0.34, y + s * 0.12, s * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.34, y + s * 0.12, s * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2a2a";
  ctx.beginPath();
  ctx.arc(x - s * 0.19, y - s * 0.04, s * 0.075, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.19, y - s * 0.04, s * 0.075, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f7a8c4";
  ctx.beginPath();
  ctx.arc(x, y + s * 0.1, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a2a2a";
  ctx.lineWidth = Math.max(1, s * 0.04);
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.16);
  ctx.quadraticCurveTo(x - s * 0.09, y + s * 0.24, x - s * 0.15, y + s * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.16);
  ctx.quadraticCurveTo(x + s * 0.09, y + s * 0.24, x + s * 0.15, y + s * 0.15);
  ctx.stroke();
  ctx.restore();
}

function drawTulip(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = "#7bbf6a";
  ctx.lineWidth = Math.max(2, s * 0.12);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + s * 0.9);
  ctx.stroke();
  ctx.fillStyle = "#7bbf6a";
  ctx.beginPath();
  ctx.ellipse(x - s * 0.22, y + s * 0.62, s * 0.12, s * 0.3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.22, y + s * 0.62, s * 0.12, s * 0.3, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.32, y);
  ctx.quadraticCurveTo(x - s * 0.36, y - s * 0.5, x, y - s * 0.58);
  ctx.quadraticCurveTo(x + s * 0.36, y - s * 0.5, x + s * 0.32, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.52);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.16, y - s * 0.46);
  ctx.lineTo(x - s * 0.13, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.16, y - s * 0.46);
  ctx.lineTo(x + s * 0.13, y);
  ctx.stroke();
  ctx.restore();
}

function drawCarrot(ctx, x, y, s) {
  ctx.save();
  ctx.fillStyle = "#f59231";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s * 0.28, y + s * 0.55);
  ctx.lineTo(x + s * 0.28, y + s * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.18 + i * s * 0.18, y + s * 0.12);
    ctx.lineTo(x - s * 0.18 + i * s * 0.18, y + s * 0.52);
    ctx.stroke();
  }
  ctx.fillStyle = "#7bbf6a";
  ctx.beginPath();
  ctx.ellipse(x - s * 0.13, y - s * 0.12, s * 0.1, s * 0.3, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.13, y - s * 0.12, s * 0.1, s * 0.3, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.2, s * 0.09, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBread(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s, y - s * 0.85, x, y - s * 0.85);
  ctx.quadraticCurveTo(x + s, y - s * 0.85, x + s, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.7, y - s * 0.1);
  ctx.quadraticCurveTo(x - s * 0.7, y - s * 0.7, x, y - s * 0.7);
  ctx.quadraticCurveTo(x + s * 0.7, y - s * 0.7, x + s * 0.7, y - s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5a3a24";
  ctx.beginPath();
  ctx.arc(x - s * 0.34, y - s * 0.34, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.34, y - s * 0.34, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3a24";
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.beginPath();
  ctx.arc(x, y - s * 0.18, s * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "rgba(244,120,120,0.5)";
  ctx.beginPath();
  ctx.arc(x - s * 0.55, y - s * 0.12, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.55, y - s * 0.12, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCroissant(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.3);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, s, Math.PI * 0.15, Math.PI * 0.85, false);
  ctx.arc(0, -s * 0.05, s * 0.6, Math.PI * 0.85, Math.PI * 0.15, true);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(120,70,30,0.25)";
  ctx.lineWidth = Math.max(1, s * 0.06);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * s * 0.35, -s * 0.2);
    ctx.lineTo(i * s * 0.35, s * 0.45);
    ctx.stroke();
  }
  ctx.fillStyle = "#5a3a24";
  ctx.beginPath();
  ctx.arc(-s * 0.18, s * 0.05, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.18, s * 0.05, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3a24";
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.beginPath();
  ctx.arc(0, s * 0.18, s * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "rgba(244,120,120,0.5)";
  ctx.beginPath();
  ctx.arc(-s * 0.4, s * 0.22, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.4, s * 0.22, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawToast(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = "#e3a857";
  roundRect(ctx, x - s, y - s, s * 2, s * 2, s * 0.55);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, x - s * 0.78, y - s * 0.78, s * 1.56, s * 1.56, s * 0.4);
  ctx.fill();
  ctx.fillStyle = "#5a3a24";
  ctx.beginPath();
  ctx.arc(x - s * 0.3, y - s * 0.1, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y - s * 0.1, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3a24";
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.arc(x, y + s * 0.18, s * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "rgba(244,120,120,0.5)";
  ctx.beginPath();
  ctx.arc(x - s * 0.5, y + s * 0.28, s * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.5, y + s * 0.28, s * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDonut(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8ef";
  ctx.beginPath();
  ctx.arc(x, y, s * 0.34, 0, Math.PI * 2);
  ctx.fill();
  const spr = ["#ffffff", "#ffe06a", "#9fdcc0", "#d9c2f0", "#bfe3f0", "#f7b8a8"];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    ctx.save();
    ctx.translate(x + Math.cos(a) * s * 0.68, y + Math.sin(a) * s * 0.68);
    ctx.rotate(a);
    ctx.fillStyle = spr[i % spr.length];
    ctx.fillRect(-1.5, -4, 3, 8);
    ctx.restore();
  }
  ctx.fillStyle = "#5a3a24";
  ctx.beginPath();
  ctx.arc(x - s * 0.3, y - s * 0.55, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y - s * 0.55, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3a24";
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.beginPath();
  ctx.arc(x, y + s * 0.55, s * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "rgba(244,120,120,0.5)";
  ctx.beginPath();
  ctx.arc(x - s * 0.55, y - s * 0.3, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.55, y - s * 0.3, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCookie(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, s, 0, Math.PI * 2);
  ctx.fill();
  const chips = [[-0.45, -0.25], [0.4, 0.05], [-0.15, 0.45], [0.25, -0.45], [0.5, -0.25], [-0.55, 0.2]];
  ctx.fillStyle = "#5a3a24";
  chips.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + dy * s, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(x - s * 0.32, y - s * 0.1, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.32, y - s * 0.1, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.arc(x, y + s * 0.08, s * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "rgba(244,120,120,0.5)";
  ctx.beginPath();
  ctx.arc(x - s * 0.55, y + s * 0.12, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.55, y + s * 0.12, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawButter(ctx, x, y, s) {
  ctx.save();
  ctx.fillStyle = "#ffe27a";
  ctx.beginPath();
  ctx.moveTo(x - s, y + s * 0.5);
  ctx.lineTo(x - s * 0.6, y - s * 0.5);
  ctx.lineTo(x + s * 0.9, y - s * 0.5);
  ctx.lineTo(x + s * 0.5, y + s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.6, y - s * 0.5);
  ctx.lineTo(x - s * 0.6, y - s * 0.2);
  ctx.lineTo(x + s * 0.9, y - s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMilk(ctx, x, y, s) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - s, y + s);
  ctx.lineTo(x - s, y - s * 0.3);
  ctx.lineTo(x, y - s);
  ctx.lineTo(x + s, y - s * 0.3);
  ctx.lineTo(x + s, y + s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#bfe3f0";
  ctx.beginPath();
  ctx.moveTo(x - s, y - s * 0.3);
  ctx.lineTo(x, y - s);
  ctx.lineTo(x, y - s * 0.3);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s, y - s * 0.3);
  ctx.lineTo(x, y - s);
  ctx.lineTo(x, y - s * 0.3);
  ctx.lineTo(x + s, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#cfe3ef";
  ctx.lineWidth = Math.max(1, s * 0.08);
  ctx.beginPath();
  ctx.moveTo(x - s, y + s);
  ctx.lineTo(x - s, y - s * 0.3);
  ctx.lineTo(x, y - s);
  ctx.lineTo(x + s, y - s * 0.3);
  ctx.lineTo(x + s, y + s);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "#5a3a24";
  ctx.beginPath();
  ctx.arc(x - s * 0.3, y + s * 0.12, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y + s * 0.12, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3a24";
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.arc(x, y + s * 0.38, s * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}
