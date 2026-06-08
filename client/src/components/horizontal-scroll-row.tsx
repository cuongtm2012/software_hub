import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollRowProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScrollRow({ children, className }: HorizontalScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, children]);

  const scrollBy = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({
      left: direction * (scrollRef.current.clientWidth * 0.75),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative min-w-0 max-w-full">
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Cuộn trái"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 shadow-md transition hover:bg-white md:flex"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Cuộn phải"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 shadow-md transition hover:bg-white md:flex"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      )}
      <div
        ref={scrollRef}
        className={cn(
          "flex w-full min-w-0 max-w-full gap-4 overflow-x-auto overflow-y-hidden",
          "scroll-smooth snap-x snap-mandatory",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {children}
        {/* Trailing spacer — breathing room when scrolled to end, not empty gap at start */}
        <div className="shrink-0 w-[4%] min-w-4" aria-hidden />
      </div>
    </div>
  );
}
