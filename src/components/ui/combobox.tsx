"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

export interface ComboboxOption {
  label: string;
  value: string;
}

/**
 * Searchable select. Filtering beats scrolling for long lists (10+ options).
 * - Edge-aware (Base UI popover flips to stay on screen)
 * - Keyboard: type to filter, arrows to move, Enter to select, Esc to close
 * - Comfortable target size, matches the app's select styling
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search…",
  emptyText = "No matches",
  id,
  disabled,
  className,
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        render={
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-background px-3 text-sm transition-colors outline-none hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[popup-open]:border-ring",
              !selected && "text-muted-foreground",
              className,
            )}
          >
            <span className="line-clamp-1 text-left">{selected ? selected.label : placeholder}</span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" sideOffset={4} className="w-(--anchor-width) min-w-[12rem] p-0">
        <Command
          filter={(val, search) => {
            // val is the option label (we pass label as the CommandItem value)
            return val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => { onChange(opt.value); setOpen(false); }}
                className="cursor-pointer py-2"
              >
                <span className="flex-1 line-clamp-1">{opt.label}</span>
                {opt.value === value && <CheckIcon className="size-4 text-sidebar-primary" />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
