# UI Improvement Package v1 — Shadcn Modernization

> Scope: UI-layer only. No API/backend changes. No new dependencies.
> Target: `swhubco.com` production-ready visual upgrade.

---

## 1. Font System

### Change
- **Current:** Roboto, Segoe UI, Open Sans (Google Fonts import in index.css)
- **Target:** Inter — shadcn/ui default, cleaner, better vertical rhythm

### Steps
1. Replace Google Fonts import: `https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap`
2. Update `tailwind.config.ts` `fontFamily.sans` → `['Inter', 'system-ui', 'sans-serif']`
3. Update `index.css` body font-family fallback
4. Remove Roboto/Segoe/Open Sans import URL

### Tailwind Typography Scale
- Keep current `tracking-tight` on headings
- Add `leading-[1.1]` for h1, `leading-[1.2]` for h2 (tighter than current)
- No new classes — just a optional utility class `.heading-tight`

---

## 2. Header → Glassmorphism + Slim

### Current
- `gradient-slate` dark solid bg (`slate-800→700→800`)
- 471 lines, complex mobile menu

### Target
- Sticky header with `backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-border/50`
- Same structure, just lighter visual weight
- Shadow khi scroll (use JS `scrollY > 10` to toggle `shadow-sm` class)

### Implementation
- Replace `className="gradient-slate shadow-lg sticky top-0 z-50 transition-shadow duration-200 text-white"`
- → `className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-200"`
- Nav links: text color đổi từ white sang `text-foreground/80 hover:text-foreground`
- Active nav: `bg-primary/10 text-primary font-medium` thay vì `bg-slate-600 text-white`
- Mobile menu: bg `bg-background/95 backdrop-blur-xl` thay vì gradient-slate
- Logo: nên dùng dark variant hoặc invert filter
- **Conditional shadow**: thêm state `scrolled`, useEffect `scroll` listener, toggle `shadow-sm`

---

## 3. Hero Section (HomePage)

### Current
- `HeroSection.tsx` — gradient primary → primary/80, clip-path polygon ở bottom
- `PageHero.tsx` — mới hơn, đang dùng ở page khác nhưng chưa được dùng ở HomePage

### Plan
Giữ nguyên nội dung, thay đổi visual:

#### 3a. Wave Divider
- Replace clip-path polygon `polygon(0 100%, 100% 0, 100% 100%, 0% 100%)` với inline SVG wave:
```tsx
<div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none">
  <svg viewBox="0 0 1440 64" className="w-full h-full" preserveAspectRatio="none">
    <path d="M0,32 C360,64 720,0 1440,32 L1440,64 L0,64 Z" fill="hsl(var(--background))" />
  </svg>
</div>
```

#### 3b. Gradient depth
- Thêm radial gradient overlay: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,204,0,0.08), transparent 60%)`
- Thêm floating dots/particles nhẹ (CSS only — pseudo-elements)

#### 3c. CTA buttons
- Primary button: gradient variant `bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl`
- Secondary button: glass variant `bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20`

---

## 4. Card System Upgrade

### 4a. Base Card Variants

Thêm vào `index.css`:

```css
.card-glass {
  @apply bg-card/80 backdrop-blur-md border border-border/50 shadow-sm;
}

.card-hover {
  @apply transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5;
}

.card-border-gradient {
  @apply border border-border relative overflow-hidden;
}
.card-border-gradient::before {
  content: '';
  position: absolute;
  inset: -1px;
  padding: 1px;
  background: linear-gradient(135deg, hsl(var(--primary)/0.2), transparent 40%, hsl(var(--accent)/0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
}
.card-border-gradient:hover::before {
  opacity: 1;
}
```

### 4b. Software Card

Apply `card-hover` class vào `software-grid.tsx` card wrapper.
Thêm: badge gradient thay vì `bg-green-100 text-green-800`.

---

## 5. Button Variants

### Current
Chỉ có `btn-primary`, `btn-secondary` là utility classes.

### Target
Thêm Button variant component pattern (class-variance-authority đã có trong deps).

Trong `button.tsx`:
- **gradient**: `bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md hover:shadow-lg`
- **soft**: `bg-primary/10 text-primary hover:bg-primary/20 border-transparent`
- **ghost**: `hover:bg-accent/20 text-foreground/70 hover:text-foreground`

---

## 6. Micro-interactions

### 6a. Loading States
- Thêm `skeleton-pulse` nâng cấp: gradient shimmer thay vì pulse đơn giản
```css
.skeleton-shimmer {
  background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground)/0.05) 50%, hsl(var(--muted)) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 6b. Hover Effects
- `hover-lift` đã có trong index.css, chỉ cần apply rộng hơn
- Thêm `hover-glow` cho buttons/links:
```css
.hover-glow {
  transition: box-shadow 0.2s;
}
.hover-glow:hover {
  box-shadow: 0 0 20px hsl(var(--primary)/0.15);
}
```

### 6c. Page Transition
- Chỉ cần OPACITY fade khi route change (`animate-fade-in` đã có)
- Apply vào component wrapper trong Router (thêm `<div className="animate-fade-in">`)

---

## 7. Footer Tune-up

### Current
- `gradient-slate` dark footer, content heavy

### Changes
- Giữ cấu trúc, chỉ đổi gradient thành `from-slate-900 to-slate-950` (sâu hơn, đẹp hơn)
- Link hover: từ `hover:text-white` thành `hover:text-amber-400` với `transition-all duration-200 translate-x-0.5`
- Social icons: từ square bg sang circular + `hover:bg-white/10 hover:scale-110`

---

## 8. CSS File Cleanup

### index.css
- **Remove**: Các custom animation không dùng (bounce-in, scale-in, slide-in-right etc nếu ko ai gọi)
- **Keep**: fade-in, shimmer, hover-lift, hover-scale
- **Remove**: `grid-row` utilities (phức tạp, JS calculateGrid đã xử lý)
- **Remove**: `uupm-*` classes (nếu ko ai dùng — search first)
- **Remove**: `@layer base` global input/textarea styles (shadcn đã handle)

---

## 9. Files Changed Summary

| File | Change |
|------|--------|
| `client/src/index.css` | Font swap, card variants, shimmer, glow, cleanup |
| `tailwind.config.ts` | Font family, custom animations |
| `client/index.html` | Font import URL |
| `client/src/components/header.tsx` | Glassmorphism, scroll shadow, nav style |
| `client/src/components/hero-section.tsx` | Wave divider, gradient depth, CTA style |
| `client/src/components/ui/button.tsx` | Gradient/soft/ghost variants |
| `client/src/components/software-grid.tsx` | Card-hover + badge refactor |
| `client/src/components/footer.tsx` | Gradient tweak, hover effects |
| `client/src/App.tsx` | Page transition wrapper (optional) |

**No new npm packages.** Only CSS + component-level changes.

---

## 10. Validation

1. `npm run build` passes
2. No visual regression on: HomePage, Software List, MarketPlace, Courses, Blog
3. Dark mode toggle works (check HeroSection wave fill uses CSS var)
4. Mobile header menu opens/closes correctly
5. Scroll shadow on header works correctly (không flicker)

---

## 11. Out of Scope (v2)

- Dark mode color refinements (separate)
- Animation library (framer-motion) integration — đã có deps nhưng chưa dùng
- Full page transitions with framer-motion AnimatePresence
- Color system tokens overhaul

---

## 12. Effort Estimate

| Component | Complexity | Files |
|-----------|-----------|-------|
| Font system | 1h | 3 |
| Header glassmorphism | 1.5h | 1 |
| Hero wave divider | 1h | 1 |
| Card upgrade | 1h | 2 |
| Button variants | 1h | 1 |
| Micro-interactions | 1h | 2 |
| Footer tune | 0.5h | 1 |
| CSS cleanup | 0.5h | 1 |
| **Total** | **~7.5h** | **12** |
