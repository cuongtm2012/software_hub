import { Link } from "wouter";
import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickLinkCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: "blue" | "green" | "orange" | "purple" | "slate";
}

const accentMap = {
  blue: "group-hover:border-[#004080]/40 group-hover:bg-[#004080]/5",
  green: "group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5",
  orange: "group-hover:border-orange-500/40 group-hover:bg-orange-500/5",
  purple: "group-hover:border-violet-500/40 group-hover:bg-violet-500/5",
  slate: "group-hover:border-slate-500/40 group-hover:bg-slate-500/5",
};

const iconMap = {
  blue: "text-[#004080] bg-[#004080]/10",
  green: "text-emerald-600 bg-emerald-500/10",
  orange: "text-orange-600 bg-orange-500/10",
  purple: "text-violet-600 bg-violet-500/10",
  slate: "text-slate-600 bg-slate-500/10",
};

export function QuickLinkCard({
  href,
  title,
  description,
  icon: Icon,
  accent = "blue",
}: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "group flex items-center gap-4 rounded-xl border border-[#004080]/10 bg-card p-4 shadow-sm uupm-card uupm-interactive",
          accentMap[accent],
        )}
      >
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", iconMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground group-hover:text-[#004080] transition-colors">
            {title}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#004080] shrink-0" />
      </div>
    </Link>
  );
}
