"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea" | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
  colSpan?: 1 | 2;
  min?: number;
  step?: number;
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: any;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  submitLabel,
  isEdit = false,
}: FormDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      defaults[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? (f.type === "number" ? 0 : f.type === "checkbox" ? false : "");
    });
    return defaults;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset when dialog opens with new initialValues
  const handleOpenChange = (o: boolean) => {
    if (o) {
      const defaults: Record<string, unknown> = {};
      fields.forEach((f) => {
        defaults[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? (f.type === "number" ? 0 : f.type === "checkbox" ? false : "");
      });
      setValues(defaults);
      setError("");
    }
    onOpenChange(o);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const updateValue = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className={field.colSpan === 2 ? "sm:col-span-2" : ""}>
                {field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={!!values[field.name]}
                      onChange={(e) => updateValue(field.name, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
                  </div>
                ) : (
                  <>
                    <Label htmlFor={field.name} className="mb-1.5 block text-sm">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </Label>
                    {field.type === "select" ? (
                      <select
                        id={field.name}
                        value={String(values[field.name] ?? "")}
                        onChange={(e) => updateValue(field.name, e.target.value)}
                        required={field.required}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        value={String(values[field.name] ?? "")}
                        onChange={(e) => updateValue(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type || "text"}
                        value={field.type === "number" ? (values[field.name] as number) : String(values[field.name] ?? "")}
                        onChange={(e) => updateValue(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        min={field.min}
                        step={field.step}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : submitLabel ?? (isEdit ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
