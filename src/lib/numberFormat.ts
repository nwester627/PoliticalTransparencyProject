export type FormatOptions = { compact?: boolean; digits?: number };

export function formatCurrency(value: number, opts: FormatOptions = {}) {
  const { compact = false, digits } = opts;
  if (!isFinite(value) || value === null || value === undefined) return "$0";

  if (compact) {
    const nf = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: typeof digits === "number" ? digits : 1,
    });
    return nf.format(value);
  }

  const nf = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: typeof digits === "number" ? digits : 0,
  });
  return nf.format(value);
}

export function formatNumberCompact(value: number, digits = 1) {
  if (!isFinite(value) || value === null || value === undefined) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);
}
