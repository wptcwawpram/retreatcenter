"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  label,
  className,
}: NumberStepperProps) {
  // Allow an empty string while the user is actively typing
  const [displayValue, setDisplayValue] = useState<string>(String(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync display when value changes externally (and user isn't editing)
  if (!isFocused && String(value) !== displayValue) {
    setDisplayValue(String(value));
  }

  const decrement = () => {
    const next = Math.max(min, value - 1);
    onChange(next);
    setDisplayValue(String(next));
  };

  const increment = () => {
    const next = Math.min(max, value + 1);
    onChange(next);
    setDisplayValue(String(next));
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      {label && <span className="text-sm text-gray-600 mr-3">{label}</span>}
      <div className="inline-flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
          aria-label="Decrease"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={isFocused ? displayValue : String(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            setDisplayValue(raw);
            // Only push to parent if there's a valid number
            if (raw !== "") {
              const num = parseInt(raw, 10);
              if (!isNaN(num)) {
                onChange(Math.max(min, Math.min(max, num)));
              }
            }
          }}
          onFocus={(e) => {
            setIsFocused(true);
            setDisplayValue(String(value));
            e.target.select();
          }}
          onBlur={() => {
            setIsFocused(false);
            // If empty or invalid on blur, reset to min
            if (displayValue === "" || isNaN(parseInt(displayValue, 10))) {
              onChange(min);
              setDisplayValue(String(min));
            } else {
              const num = Math.max(min, Math.min(max, parseInt(displayValue, 10)));
              onChange(num);
              setDisplayValue(String(num));
            }
          }}
          className="w-14 h-10 text-center text-sm font-bold border-x border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
        />
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
          aria-label="Increase"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
