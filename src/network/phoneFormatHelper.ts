export function digitsOnly(input: string) {
  return input.replace(/[^\d]/g, "");
}

// Canada-only for now: 🇨🇦 +1 + 10 digits
export function toCanadaE164FromLocalDigits(localDigits: string) {
  const d = digitsOnly(localDigits);

  // If user types starting with 1 and 11 digits total, drop leading 1
  const ten = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;

  // Keep max 10 digits for Canada local number
  const local10 = ten.slice(0, 10);

  return {
    local10,
    e164: local10.length === 10 ? `+1${local10}` : null,
  };
}

// Pretty formatting: (123) 456-7890
export function formatCanadaLocal(local10: string) {
  const d = digitsOnly(local10).slice(0, 10);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 10);

  if (d.length <= 3) return a;
  if (d.length <= 6) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}