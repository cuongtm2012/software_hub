import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowDownCircle } from "lucide-react";

export function HeroSection() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const handleJoinNow = () => {
    navigate("/auth?tab=register");
  };

  return (
    <div className="relative bg-gradient-to-br from-primary to-primary/80">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
            <span className="block">Discover Free Software</span>
            <span className="block mt-1 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">Share Your Favorites</span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-base text-primary-foreground/80 sm:text-lg md:mt-6 md:text-xl md:max-w-3xl leading-relaxed">
            Find the best free software for all your needs. Download, rate, and share your experiences with our community.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
            {!user ? (
              <div className="shadow-lg">
                <Button 
                  onClick={handleJoinNow}
                  className="btn-primary w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
                >
                  Join Now
                </Button>
              </div>
            ) : (
              <div className="shadow-lg">
                <Button 
                  onClick={() => navigate("/")}
                  className="btn-primary w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
                >
                  Explore Software
                </Button>
              </div>
            )}
            <div className="mt-4 shadow-lg sm:mt-0 sm:ml-4">
              <Button
                onClick={() => {
                  const browseElement = document.getElementById("software-section");
                  if (browseElement) {
                    browseElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                variant="secondary"
                className="btn-secondary w-full flex items-center justify-center gap-2 px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
              >
                Browse Software
                <ArrowDownCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="h-16 bg-background absolute bottom-0 left-0 right-0" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0% 100%)" }}></div>
    </div>
  );
}
