/** Software Hub design tokens — aligned with ui-ux-pro-max (SaaS Marketplace / Soft UI) */
export const brand = {
  primary: "#004080",
  primaryHover: "#003366",
  primaryMuted: "rgba(0, 64, 128, 0.08)",
  primaryBorder: "rgba(0, 64, 128, 0.12)",
  accent: "#ffcc00",
  surface: "#f9f9f9",
  text: "#333333",
  textMuted: "#666666",
} as const;

export const motion = {
  fast: "duration-150",
  base: "duration-200",
  slow: "duration-300",
} as const;

/** Placeholder gradients — no AI purple/pink (ui-ux-pro-max anti-pattern) */
export const placeholderGradients = [
  "from-[#004080] to-[#003366]",
  "from-slate-600 to-slate-800",
  "from-[#004080]/90 to-slate-700",
  "from-slate-700 to-[#004080]",
  "from-amber-600 to-amber-800",
  "from-slate-600 to-[#004080]/80",
] as const;

export function getPlaceholderGradient(name: string) {
  const index = (name?.charCodeAt(0) || 0) % placeholderGradients.length;
  return placeholderGradients[index];
}

/** Full-width page shell — matches home page `px-[4%]` edge layout */
export const pageShellClass = "min-h-screen flex flex-col overflow-x-hidden bg-[#f9f9f9]";
export const pageMainClass = "min-w-0 flex-grow overflow-x-hidden";
export const pageContainerClass = "w-full min-w-0 max-w-full px-[4%]";
export const catalogGridClass =
  "grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
