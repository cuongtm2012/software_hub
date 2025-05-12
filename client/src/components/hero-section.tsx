import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function HeroSection() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const handleJoinNow = () => {
    navigate("/auth?tab=register");
  };

  return (
    <div className="relative bg-primary-600">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            <span className="block">Discover Free Software</span>
            <span className="block mt-1">Share Your Favorites</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-primary-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Find the best free software for all your needs. Download, rate, and share your experiences with our community.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {!user ? (
              <div className="rounded-full shadow">
                <Button 
                  onClick={handleJoinNow}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-500 hover:bg-green-600 md:py-3 md:text-lg md:px-10"
                >
                  Join Now
                </Button>
              </div>
            ) : (
              <div className="rounded-full shadow">
                <Button 
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-500 hover:bg-green-600 md:py-3 md:text-lg md:px-10"
                >
                  Explore Software
                </Button>
              </div>
            )}
            <div className="mt-3 rounded-full shadow sm:mt-0 sm:ml-3">
              <Button
                onClick={() => {
                  const browseElement = document.getElementById("software-section");
                  if (browseElement) {
                    browseElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                variant="secondary"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-primary-600 bg-white hover:bg-gray-50 md:py-3 md:text-lg md:px-10"
              >
                Browse Software
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="h-8 bg-gray-50 absolute bottom-0 left-0 right-0" style={{ clipPath: "polygon(0 0, 100% 100%, 100% 100%, 0% 100%)" }}></div>
    </div>
  );
}
