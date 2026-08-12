"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMAGES } from "@/lib/images";
import {
  ImageIcon,
  Loader2,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Save,
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

export default function SiteImagesPage() {
  const [defaults] = useState(() => flattenImages(IMAGES as unknown as Record<string, ImageValue>));
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/site-images");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOverrides(data.overrides || {});
      const merged: Record<string, string> = {};
      for (const [path] of Object.entries(defaults)) {
        merged[path] = data.overrides?.[path] || defaults[path];
      }
      setEditValues(merged);
    } catch {
      setEditValues({ ...defaults });
    } finally {
      setLoading(false);
    }
  }, [defaults]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleSave = async (path: string) => {
    const url = editValues[path];
    if (!url || url === defaults[path] && !overrides[path]) return;

    setSaving((p) => ({ ...p, [path]: true }));
    setError("");
    try {
      const res = await fetch("/api/site-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, url }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setOverrides((p) => ({ ...p, [path]: url }));
      setSaved((p) => ({ ...p, [path]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [path]: false })), 2000);
    } catch {
      setError(`Failed to save ${path}`);
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
      setEditValues((p) => ({ ...p, [path]: defaults[path] }));
      setSaved((p) => ({ ...p, [path]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [path]: false })), 2000);
    } catch {
      setError(`Failed to reset ${path}`);
    } finally {
      setSaving((p) => ({ ...p, [path]: false }));
    }
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
          Manage all images displayed on the public website. Paste image URLs to replace the defaults.
        </p>
      </div>

      {error && (
        <div className="p-3 border border-red-500/30 bg-red-500/10 text-sm text-red-400 rounded-md">
          {error}
        </div>
      )}

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
                  {Object.entries(images).map(([path]) => {
                    const currentUrl = editValues[path] || defaults[path];
                    const isOverridden = !!overrides[path];
                    const hasChanges = editValues[path] !== (overrides[path] || defaults[path]);

                    return (
                      <div key={path} className="p-4 space-y-3">
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
                          <div className="relative w-32 h-20 rounded overflow-hidden border border-border/50 bg-muted/20 shrink-0">
                            {currentUrl && (
                              <Image
                                src={currentUrl}
                                alt={prettifyKey(path)}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={editValues[path] || ""}
                                onChange={(e) => setEditValues((p) => ({ ...p, [path]: e.target.value }))}
                                placeholder="Paste image URL..."
                                className="text-xs h-9 font-mono"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSave(path)}
                                disabled={saving[path] || !hasChanges}
                                className="h-9 px-3 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shrink-0"
                              >
                                {saving[path] ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : saved[path] ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Save className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              {currentUrl && (
                                <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sidebar-primary hover:underline flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />Preview
                                </a>
                              )}
                              {isOverridden && (
                                <button
                                  onClick={() => handleReset(path)}
                                  disabled={saving[path]}
                                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                  <RotateCcw className="h-3 w-3" />Reset to default
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
