"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { IMAGES } from "@/lib/images";
import {
  ImageIcon,
  Loader2,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Upload,
} from "lucide-react";

type ImageValue = string | string[] | Record<string, string | string[]>;

function flattenImages(obj: Record<string, ImageValue>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[path] = value;
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => { result[`${path}[${i}]`] = v; });
    } else if (typeof value === "object") {
      Object.assign(result, flattenImages(value as Record<string, ImageValue>, path));
    }
  }
  return result;
}

function groupByCategory(flat: Record<string, string>): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};
  for (const [path, url] of Object.entries(flat)) {
    const category = path.split(".")[0].split("[")[0];
    if (!groups[category]) groups[category] = {};
    groups[category][path] = url;
  }
  return groups;
}

const CATEGORY_LABELS: Record<string, string> = {
  hero: "Hero Banners",
  rooms: "Room Photos",
  venues: "Venue Photos",
  amenities: "Amenity Photos",
  gallery: "Gallery Images",
  lifestyle: "Lifestyle Photos",
};

function prettifyKey(path: string): string {
  const parts = path.split(".");
  const last = parts[parts.length - 1];
  const match = last.match(/^(.+)\[(\d+)\]$/);
  if (match) {
    return `${match[1].replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim()} #${Number(match[2]) + 1}`;
  }
  return last.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim();
}

function ImageCard({
  path,
  currentUrl,
  isOverridden,
  blur,
  onUpload,
  onReset,
  onBlurChange,
  saving,
  saved,
}: {
  path: string;
  currentUrl: string;
  isOverridden: boolean;
  blur: number;
  onUpload: (path: string, file: File) => void;
  onReset: (path: string) => void;
  onBlurChange: (path: string, value: number) => void;
  saving: boolean;
  saved: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium capitalize">{prettifyKey(path)}</span>
          {isOverridden && (
            <span className="text-[10px] bg-sidebar-primary/15 text-sidebar-primary px-1.5 py-0.5 rounded font-medium">
              Custom
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{path}</span>
      </div>

      <div className="flex gap-3">
        <div className="relative w-36 h-24 rounded overflow-hidden border border-border/50 bg-muted/20 shrink-0 group">
          {currentUrl && (
            <Image
              src={currentUrl}
              alt={prettifyKey(path)}
              fill
              className="object-cover"
              style={blur > 0 ? { filter: `blur(${blur / 5}px)`, transform: "scale(1.05)" } : undefined}
              unoptimized
            />
          )}
          <div
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
          >
            <Upload className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(path, file);
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-md border border-dashed border-sidebar-primary/30 text-sidebar-primary text-sm hover:bg-sidebar-primary/5 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>
            ) : saved ? (
              <><Check className="h-4 w-4" />Uploaded!</>
            ) : (
              <><Upload className="h-4 w-4" />Upload New Image</>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground shrink-0 w-12">Blur: {blur}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={blur}
              onChange={(e) => onBlurChange(path, Number(e.target.value))}
              className="flex-1 h-1.5 accent-sidebar-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground truncate flex-1">
              {isOverridden ? "Custom image" : "Default (Unsplash)"}
            </span>
            {isOverridden && (
              <button
                onClick={() => onReset(path)}
                disabled={saving}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="h-3 w-3" />Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteImagesPage() {
  const logoRef = useRef<HTMLInputElement>(null);
  const [defaults] = useState(() => flattenImages(IMAGES as unknown as Record<string, ImageValue>));
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [blurs, setBlurs] = useState<Record<string, number>>({});
  const [currentUrls, setCurrentUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const blurTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/site-images");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOverrides(data.overrides || {});
      setBlurs(data.blurs || {});
      const merged: Record<string, string> = {};
      for (const [path] of Object.entries(defaults)) {
        merged[path] = data.overrides?.[path] || defaults[path];
      }
      setCurrentUrls(merged);
    } catch {
      setCurrentUrls({ ...defaults });
    } finally {
      setLoading(false);
    }
  }, [defaults]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (path: string, file: File) => {
    setSaving((p) => ({ ...p, [path]: true }));
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      const res = await fetch("/api/site-images/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setOverrides((p) => ({ ...p, [path]: data.url }));
      setCurrentUrls((p) => ({ ...p, [path]: data.url }));
      setSaved((p) => ({ ...p, [path]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [path]: false })), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to upload ${path}`);
    } finally {
      setSaving((p) => ({ ...p, [path]: false }));
    }
  };

  const handleReset = async (path: string) => {
    setSaving((p) => ({ ...p, [path]: true }));
    try {
      const res = await fetch(`/api/site-images?path=${encodeURIComponent(path)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to reset");
      setOverrides((p) => { const n = { ...p }; delete n[path]; return n; });
      setCurrentUrls((p) => ({ ...p, [path]: defaults[path] }));
      setSaved((p) => ({ ...p, [path]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [path]: false })), 2000);
    } catch {
      setError(`Failed to reset ${path}`);
    } finally {
      setSaving((p) => ({ ...p, [path]: false }));
    }
  };

  const handleBlurChange = (path: string, value: number) => {
    setBlurs((p) => ({ ...p, [path]: value }));
    if (blurTimers.current[path]) clearTimeout(blurTimers.current[path]);
    blurTimers.current[path] = setTimeout(async () => {
      try {
        const res = await fetch("/api/site-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, blur: value }),
        });
        if (!res.ok) throw new Error("Failed");
      } catch {
        setError(`Failed to save blur for ${path}`);
      }
    }, 500);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((p) => ({ ...p, [cat]: !p[cat] }));
  };

  const groups = groupByCategory(defaults);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Images</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload images to replace the defaults on the public website. Use the blur slider to add a blur effect (0-100). Accepted formats: JPEG, PNG, WebP, GIF (max 5MB).
        </p>
      </div>

      {error && (
        <div className="p-3 border border-red-500/30 bg-red-500/10 text-sm text-red-400 rounded-md">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-300 hover:text-red-200">x</button>
        </div>
      )}

      {/* Logo / Branding */}
      <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border/50">
          <ImageIcon className="h-4 w-4 text-sidebar-primary" />
          <span className="font-semibold text-sm">Site Logo</span>
          {overrides["branding.logo"] && (
            <span className="text-[10px] bg-sidebar-primary/15 text-sidebar-primary px-2 py-0.5 rounded-full font-medium">
              Custom
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-4">
            Upload your site logo. It appears on the navbar, dashboard sidebar, and footer. Recommended: square or landscape, transparent PNG.
          </p>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50 bg-muted/20 shrink-0 group">
              {currentUrls["branding.logo"] ? (
                <Image
                  src={currentUrls["branding.logo"]}
                  alt="Site logo"
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-2xl font-bold text-sidebar-primary font-[family-name:var(--font-playfair)]">W</span>
                </div>
              )}
              <div
                onClick={() => logoRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
              >
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={logoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload("branding.logo", file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                disabled={!!saving["branding.logo"]}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-md border border-dashed border-sidebar-primary/30 text-sidebar-primary text-sm hover:bg-sidebar-primary/5 transition-colors disabled:opacity-50"
              >
                {saving["branding.logo"] ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>
                ) : saved["branding.logo"] ? (
                  <><Check className="h-4 w-4" />Uploaded!</>
                ) : (
                  <><Upload className="h-4 w-4" />Upload Logo</>
                )}
              </button>
              {overrides["branding.logo"] && (
                <button
                  onClick={() => handleReset("branding.logo")}
                  disabled={!!saving["branding.logo"]}
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />Reset to default text logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(groups).map(([category, images]) => {
          const isExpanded = expandedCategories[category] !== false;
          const overrideCount = Object.keys(images).filter((p) => overrides[p]).length;

          return (
            <div key={category} className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-4 w-4 text-sidebar-primary" />
                  <span className="font-semibold text-sm">
                    {CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Object.keys(images).length} images
                  </span>
                  {overrideCount > 0 && (
                    <span className="text-[10px] bg-sidebar-primary/15 text-sidebar-primary px-2 py-0.5 rounded-full font-medium">
                      {overrideCount} customized
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border/50 divide-y divide-border/30">
                  {Object.entries(images).map(([path]) => (
                    <ImageCard
                      key={path}
                      path={path}
                      currentUrl={currentUrls[path] || defaults[path]}
                      isOverridden={!!overrides[path]}
                      blur={blurs[path] || 0}
                      onUpload={handleUpload}
                      onReset={handleReset}
                      onBlurChange={handleBlurChange}
                      saving={!!saving[path]}
                      saved={!!saved[path]}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
