import { CURRENCY } from "@/lib/constants";

export function formatCurrency(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString("en-GH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("+233") && cleaned.length === 13) {
    return `+233 ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }
  return phone;
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function roomSortKey(number: string): number {
  if (/^ST(\d+)$/i.test(number)) return 6 + parseFloat("0." + number.replace(/\D/g, ""));
  if (/^HF(\d+)$/i.test(number)) return 100 + parseInt(number.replace(/\D/g, ""), 10);
  const m = number.match(/\d+/);
  return m ? parseInt(m[0], 10) : 9999;
}

export function sortRooms<T extends { number: string }>(rooms: T[]): T[] {
  return [...rooms].sort((a, b) => roomSortKey(a.number) - roomSortKey(b.number));
}
