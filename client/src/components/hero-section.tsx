import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowDownCircle } from "lucide-react";

export function HeroSection() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handleJoinNow = () => {
    navigate("/auth?tab=register");
  };

  return (
    <div className="relative bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
      {/* Radial accent glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,204,0,0.08), transparent 60%)",
        }}
      />

      {/* Floating dots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-[18%] left-[12%] h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="absolute top-[32%] right-[18%] h-2 w-2 rounded-full bg-white/15" />
        <div className="absolute top-[55%] left-[28%] h-1 w-1 rounded-full bg-white/25" />
        <div className="absolute top-[22%] right-[32%] h-1.5 w-1.5 rounded-full bg-white/10" />
      </div>

      <div className="relative max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl heading-tight">
            <span className="block">Discover Free Software</span>
            <span className="block mt-1 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Share Your Favorites
            </span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-base text-primary-foreground/80 sm:text-lg md:mt-6 md:text-xl md:max-w-3xl leading-relaxed">
            Find the best free software for all your needs. Download, rate, and share your experiences with our community.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 gap-4">
            {!user ? (
              <Button
                onClick={handleJoinNow}
                variant="gradient"
                size="lg"
                className="w-full sm:w-auto hover-glow"
              >
                Join Now
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/")}
                variant="gradient"
                size="lg"
                className="w-full sm:w-auto hover-glow"
              >
                Explore Software
              </Button>
            )}
            <Button
              onClick={() => {
                const browseElement = document.getElementById("software-section");
                if (browseElement) {
                  browseElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              size="lg"
              className="mt-4 sm:mt-0 w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground hover:bg-white/20"
            >
              Browse Software
              <ArrowDownCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 64" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,32 C360,64 720,0 1440,32 L1440,64 L0,64 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </div>
  );
}
