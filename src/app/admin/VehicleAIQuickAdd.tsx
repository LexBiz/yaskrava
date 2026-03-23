"use client";

import {useRef, useState} from "react";

// ─── types ────────────────────────────────────────────────────────────────────

type Extracted = {
  title: string;
  make: string;
  model: string;
  year: string;
  mileageKm: string;
  fuel: string;
  transmission: string;
  priceCzk: string;
  description: string;
  vinLast6: string;
};

type Phase = "idle" | "analyzing" | "modal";

const EMPTY: Extracted = {
  title: "",
  make: "",
  model: "",
  year: "",
  mileageKm: "",
  fuel: "",
  transmission: "",
  priceCzk: "",
  description: "",
  vinLast6: "",
};

const MAX_PHOTOS = 30;

type ExtraHidden = {name: string; value: string};

// ─── styles ───────────────────────────────────────────────────────────────────

const INP =
  "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] transition";
const SEL =
  "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[var(--color-accent)]/50 transition cursor-pointer";
const AREA =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] resize-none transition";
const LABEL = "block text-xs font-semibold text-white/55 mb-1";

// ─── component ────────────────────────────────────────────────────────────────

export function VehicleAIQuickAdd({
  submitAction,
  extraHidden = [],
}: {
  submitAction: (formData: FormData) => Promise<void>;
  extraHidden?: ExtraHidden[];
}) {
  const [phase, setPhase] = useState<Phase>("idle");

  // photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // video
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");

  const [extracted, setExtracted] = useState<Extracted>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  // options set before analysis
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [leasingEligible, setLeasingEligible] = useState(true);

  // which photo is selected as main (index into uploadedUrls, AI-reordered)
  const [mainPhotoIdx, setMainPhotoIdx] = useState(0);

  // modal form state (editable after GPT fill)
  const [form, setForm] = useState<Extracted & {availability: string}>({
    ...EMPTY,
    availability: "ON_SITE",
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function f(field: keyof Extracted, value: string) {
    setForm((s) => ({...s, [field]: value}));
  }

  function pickPhotos(fileList: FileList | null) {
    if (!fileList) return;
    const picked = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_PHOTOS);
    if (!picked.length) return;
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
    setPhotoFiles(picked);
    setError(null);
  }

  function handlePhotoDrop(e: React.DragEvent) {
    e.preventDefault();
    // separate dropped files by type
    const items = Array.from(e.dataTransfer.files);
    const imgs = items.filter((f) => f.type.startsWith("image/"));
    const vids = items.filter((f) => f.type.startsWith("video/"));
    if (imgs.length) pickPhotos(dataTransferToFileList(imgs));
    if (vids.length) pickVideo(vids[0]);
  }

  function pickVideo(file: File) {
    if (!file.type.startsWith("video/")) return;
    setVideoFile(file);
    setError(null);
  }

  async function handleAnalyze() {
    if (!photoFiles.length) {
      setError("Спочатку додайте фотографії");
      return;
    }
    setPhase("analyzing");
    setError(null);

    try {
      const fd = new FormData();
      photoFiles.forEach((f) => fd.append("images", f));
      if (videoFile) fd.append("video", videoFile);

      const res = await fetch("/api/admin/analyze-vehicle", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPhase("idle");
        setError(data.error ?? "Помилка аналізу. Спробуйте ще раз.");
        return;
      }

      const ext = (data.extracted ?? {}) as Record<string, unknown>;
      const filled: Extracted = {
        title: String(ext.title ?? ""),
        make: String(ext.make ?? ""),
        model: String(ext.model ?? ""),
        year: ext.year != null ? String(ext.year) : "",
        mileageKm: ext.mileageKm != null ? String(ext.mileageKm) : "",
        fuel: isValidFuel(String(ext.fuel ?? "")) ? String(ext.fuel) : "",
        transmission: isValidTransmission(String(ext.transmission ?? ""))
          ? String(ext.transmission)
          : "",
        priceCzk: ext.priceCzk != null ? String(ext.priceCzk) : "",
        description: String(ext.description ?? ""),
        vinLast6: String(ext.vinLast6 ?? ""),
      };

      setExtracted(filled);
      setUploadedUrls(Array.isArray(data.uploadedUrls) ? data.uploadedUrls : []);
      setUploadedVideoUrl(typeof data.uploadedVideoUrl === "string" ? data.uploadedVideoUrl : "");
      setMainPhotoIdx(0); // AI puts its best pick first
      setForm({...filled, availability: "ON_SITE"});
      setPhase("modal");
    } catch {
      setPhase("idle");
      setError("Мережева помилка. Перевірте підключення.");
    }
  }

  function handleClose() {
    setPhase("idle");
  }

  // Reorder so user-selected main photo is first
  const orderedForSubmit = uploadedUrls.length > 0
    ? [uploadedUrls[mainPhotoIdx], ...uploadedUrls.filter((_, i) => i !== mainPhotoIdx)].filter(Boolean) as string[]
    : [];
  const primaryUrl = orderedForSubmit[0] ?? "";
  const extraUrls = orderedForSubmit.slice(1).join("\n");

  return (
    <>
      {/* ─── Quick Add Panel ─── */}
      <div className="rounded-2xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/[0.04] p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🤖</span>
          <div>
            <h2 className="text-base font-bold text-white">AI-додавання авто</h2>
            <p className="text-xs text-white/40">
              Завантажте фото — GPT-4 Vision заповнить картку автоматично
            </p>
          </div>
        </div>

        {/* Photo drop zone */}
        <div
          onDrop={handlePhotoDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => photoInputRef.current?.click()}
          className="relative flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] transition hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/[0.03]"
        >
          {previews.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-3 w-full">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative h-20 w-28 overflow-hidden rounded-xl border border-white/10 shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <span className="absolute right-1 bottom-1 rounded bg-black/50 px-1 text-[9px] text-white/60">
                    {i + 1}
                  </span>
                </div>
              ))}
              {previews.length < MAX_PHOTOS && (
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/15 text-xs text-white/30">
                  + ще фото
                </div>
              )}
            </div>
          ) : (
            <>
              <span className="text-3xl text-white/20">📷</span>
              <span className="text-sm font-semibold text-white/50">
                Перетягніть фото або натисніть
              </span>
              <span className="text-xs text-white/25">
                До {MAX_PHOTOS} фото · JPG, PNG, WEBP · до 25 МБ кожне
              </span>
            </>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => pickPhotos(e.target.files)}
          />
        </div>

        {/* Photo counter */}
        {previews.length > 0 && (
          <div className="mt-1.5 text-right text-[11px] text-white/30">
            {previews.length} / {MAX_PHOTOS} фото вибрано
          </div>
        )}

        {/* Video row */}
        <div className="mt-3">
          <div
            onClick={() => videoInputRef.current?.click()}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition ${
              videoFile
                ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/[0.06]"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <span className="text-base">{videoFile ? "🎬" : "📹"}</span>
            <span className="flex-1 text-sm">
              {videoFile ? (
                <span className="font-medium text-white">{videoFile.name}</span>
              ) : (
                <span className="text-white/35">
                  Додати відео (необов'язково) — MP4, MOV, WEBM · до 300 МБ
                </span>
              )}
            </span>
            {videoFile ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoFile(null);
                }}
                className="text-xs text-white/30 hover:text-red-400 transition"
              >
                ✕
              </button>
            ) : (
              <span className="text-xs text-white/30">Натисніть</span>
            )}
          </div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickVideo(f);
            }}
          />
        </div>

        {/* Options row */}
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <Chk
            checked={published}
            onChange={setPublished}
            label="Опублікувати"
            hint="Видно на сайті"
          />
          <Chk
            checked={featured}
            onChange={setFeatured}
            label="Рекомендоване"
            hint="В топі на головній"
          />
          <Chk
            checked={leasingEligible}
            onChange={setLeasingEligible}
            label="Лізинг"
            hint="Доступно в лізинг"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            ⚠ {error}
          </div>
        )}

        {/* Action button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={phase === "analyzing" || !photoFiles.length}
            className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-[var(--color-accent)] px-6 text-sm font-bold text-black hover:brightness-110 active:scale-[.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {phase === "analyzing" ? (
              <>
                <Spinner />
                Завантажую та аналізую…
              </>
            ) : (
              <>
                <span>✨</span>
                Аналізувати за допомогою AI
              </>
            )}
          </button>
          {phase === "analyzing" && (
            <p className="mt-2 text-xs text-white/30">
              Зберігаю фото та викликаю GPT-4 Vision — зазвичай 10–20 секунд
            </p>
          )}
        </div>
      </div>

      {/* ─── Modal ─── */}
      {phase === "modal" && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0e0e0e] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-base">
                  🤖
                </span>
                <div>
                  <div className="text-sm font-bold text-white">
                    AI проаналізував авто
                  </div>
                  <div className="text-[11px] text-white/40">
                    Перевірте та за потреби виправте — потім натисніть «Опублікувати»
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/8 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Photo strip — shows AI-ordered server images, tap to set main */}
            {(uploadedUrls.length > 0 || videoFile) && (
              <div className="border-b border-white/8">
                {uploadedUrls.length > 0 && (
                  <div className="px-6 pt-3 pb-1">
                    <p className="text-[10px] text-white/35 mb-2">
                      ✨ AI впорядкував фото — натисніть на будь-яке, щоб зробити його <span className="text-[var(--color-accent)]">головним</span>
                    </p>
                    <div className="flex items-start gap-2 overflow-x-auto pb-2">
                      {uploadedUrls.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setMainPhotoIdx(i)}
                          className={`relative h-18 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer focus:outline-none ${
                            i === mainPhotoIdx
                              ? "border-[var(--color-accent)] shadow-[0_0_10px_rgba(255,121,24,0.4)]"
                              : "border-white/10 opacity-55 hover:opacity-85 hover:border-white/25"
                          }`}
                          style={{height: "72px", width: "96px"}}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          {i === mainPhotoIdx ? (
                            <span className="absolute left-1 top-1 rounded bg-[var(--color-accent)] px-1.5 py-0.5 text-[9px] font-bold text-black leading-none">
                              ГОЛОВНЕ
                            </span>
                          ) : (
                            <span className="absolute right-1 bottom-1 rounded bg-black/55 px-1 text-[9px] text-white/50">
                              {i + 1}
                            </span>
                          )}
                        </button>
                      ))}
                      {videoFile && (
                        <div className="flex h-[72px] w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/[0.08]">
                          <span className="text-xl">🎬</span>
                          <span className="text-[9px] text-white/50 px-1 text-center leading-tight truncate w-full">
                            {videoFile.name.split(".").pop()?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form action={submitAction} className="px-6 py-5">
              {/* Hidden: images/video already uploaded */}
              <input type="hidden" name="imageUrl" value={primaryUrl} />
              <input type="hidden" name="galleryImageUrls" value={extraUrls} />
              {uploadedVideoUrl && (
                <input type="hidden" name="videoUrl" value={uploadedVideoUrl} />
              )}

              {/* Hidden: options from quick-add panel */}
              {published && <input type="hidden" name="published" value="on" />}
              {featured && <input type="hidden" name="featured" value="on" />}
              {leasingEligible && (
                <input type="hidden" name="leasingEligible" value="on" />
              )}

              {/* Extra hidden inputs for dealer CRM (_lang, _inventory, etc.) */}
              {extraHidden.map((h) => (
                <input key={h.name} type="hidden" name={h.name} value={h.value} />
              ))}

              <div className="grid gap-4">
                {/* Title */}
                <div>
                  <label className={LABEL}>
                    Назва оголошення{" "}
                    <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    name="title"
                    required
                    className={INP}
                    value={form.title}
                    onChange={(e) => f("title", e.target.value)}
                    placeholder="BMW X5 xDrive30d 2021 M Sport"
                  />
                </div>

                {/* Make / Model / Year */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={LABEL}>Марка</label>
                    <input
                      name="make"
                      className={INP}
                      value={form.make}
                      onChange={(e) => f("make", e.target.value)}
                      placeholder="BMW"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Модель</label>
                    <input
                      name="model"
                      className={INP}
                      value={form.model}
                      onChange={(e) => f("model", e.target.value)}
                      placeholder="X5 G05"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Рік</label>
                    <input
                      name="year"
                      type="number"
                      className={INP}
                      value={form.year}
                      onChange={(e) => f("year", e.target.value)}
                      placeholder="2021"
                    />
                  </div>
                </div>

                {/* Mileage / Fuel / Transmission */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={LABEL}>Пробіг, км</label>
                    <input
                      name="mileageKm"
                      type="number"
                      className={INP}
                      value={form.mileageKm}
                      onChange={(e) => f("mileageKm", e.target.value)}
                      placeholder="74 000"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Паливо</label>
                    <select
                      name="fuel"
                      className={SEL}
                      value={form.fuel}
                      onChange={(e) => f("fuel", e.target.value)}
                    >
                      <option value="">— не вказано —</option>
                      <option value="Diesel">Дизель (Diesel)</option>
                      <option value="Petrol">Бензин (Petrol)</option>
                      <option value="Hybrid">Гібрид (Hybrid)</option>
                      <option value="Electric">Електро (Electric)</option>
                      <option value="LPG">Газ (LPG)</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Коробка</label>
                    <select
                      name="transmission"
                      className={SEL}
                      value={form.transmission}
                      onChange={(e) => f("transmission", e.target.value)}
                    >
                      <option value="">— не вказано —</option>
                      <option value="Automatic">Автомат (Automatic)</option>
                      <option value="Manual">Механіка (Manual)</option>
                    </select>
                  </div>
                </div>

                {/* Price / Availability / VIN */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={LABEL}>Ціна, CZK</label>
                    <input
                      name="priceCzk"
                      type="number"
                      className={INP}
                      value={form.priceCzk}
                      onChange={(e) => f("priceCzk", e.target.value)}
                      placeholder="649 000"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Наявність</label>
                    <select
                      name="availability"
                      className={SEL}
                      value={form.availability}
                      onChange={(e) =>
                        setForm((s) => ({...s, availability: e.target.value}))
                      }
                    >
                      <option value="ON_SITE">На майданчику</option>
                      <option value="IN_TRANSIT">В дорозі</option>
                      <option value="SOLD">Продано</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>VIN (останні 6)</label>
                    <input
                      name="vinLast6"
                      className={INP}
                      value={form.vinLast6}
                      onChange={(e) => f("vinLast6", e.target.value)}
                      placeholder="ABC123"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={LABEL}>
                    Опис{" "}
                    <span className="text-white/30 font-normal">
                      — заповнено AI, можна редагувати
                    </span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className={AREA}
                    value={form.description}
                    onChange={(e) => f("description", e.target.value)}
                    placeholder="Стан, комплектація, сервісна історія…"
                  />
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-2 text-xs text-white/35">
                  {uploadedUrls.length > 0 && (
                    <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1">
                      📷 {uploadedUrls.length} фото збережено
                    </span>
                  )}
                  {uploadedVideoUrl && (
                    <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1">
                      🎬 відео збережено
                    </span>
                  )}
                  {extracted.title && (
                    <span className="flex items-center gap-1 rounded-lg bg-[var(--color-accent)]/10 px-2.5 py-1 text-[var(--color-accent)]/70">
                      ✨ дані від GPT-4 Vision
                    </span>
                  )}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-white/60 hover:bg-white/8 hover:text-white transition"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 text-sm font-bold text-black hover:brightness-110 active:scale-[.98] transition"
                  >
                    Опублікувати авто →
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function dataTransferToFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  return dt.files;
}

function isValidFuel(v: string) {
  return ["Diesel", "Petrol", "Hybrid", "Electric", "LPG"].includes(v);
}

function isValidTransmission(v: string) {
  return ["Automatic", "Manual"].includes(v);
}

function Chk({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 accent-[var(--color-accent)]"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-white/70 group-hover:text-white transition">
          {label}
        </span>
        <span className="text-[10px] text-white/30">{hint}</span>
      </span>
    </label>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
