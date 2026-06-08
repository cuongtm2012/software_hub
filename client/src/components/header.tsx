import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Search, Store, ShoppingCart, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/notification-bell";
import { CartTrigger } from "@/components/cart-sidebar";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass = (active: boolean) =>
    cn(
      "flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg px-1.5 text-center text-xs font-medium leading-tight tracking-normal transition-colors truncate xl:px-2 xl:text-sm",
      active
        ? "bg-slate-600 text-white shadow-sm"
        : "text-slate-200 hover:bg-slate-700/90 hover:text-white",
    );

  const mobileNavLinkClass = (active: boolean) =>
    cn(
      "block pl-3 pr-4 py-2 border-l-4 text-base font-medium whitespace-nowrap",
      active
        ? "bg-slate-600 border-[#ffcc00] text-white"
        : "border-transparent text-slate-200 hover:bg-slate-700 hover:border-slate-500 hover:text-white",
    );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U"; // Default to 'U' for User if name is undefined
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header
      className={cn(
        "gradient-slate shadow-lg sticky top-0 z-50 transition-shadow duration-200 text-white",
        scrolled && "shadow-xl",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-2 sm:gap-3 min-w-0">
          <div className="flex min-w-0 flex-1 items-center overflow-hidden">
            <div className="flex shrink-0 items-center space-x-2 lg:space-x-3">
              <Link to="/">
                <img
                  src="/software-hub-logo.png"
                  alt="Software Hub Logo"
                  className="h-12 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                />
              </Link>
              {user && <NotificationBell />}
            </div>
            <nav className="hidden lg:ml-3 lg:flex lg:h-10 lg:min-w-0 lg:flex-1 lg:items-stretch lg:gap-1">
              <Link to="/" className={navLinkClass(location === "/")}>
                Home
              </Link>
              <Link
                to="/it-services#projects"
                className={navLinkClass(
                  location.startsWith("/projects") || location.startsWith("/it-services"),
                )}
              >
                IT Services
              </Link>
              <Link to="/courses" className={navLinkClass(location.startsWith("/courses"))}>
                Tài liệu
              </Link>
              <Link to="/blog" className={navLinkClass(location.startsWith("/blog"))}>
                Blog
              </Link>
              <Link
                to="/marketplace"
                className={navLinkClass(location.startsWith("/marketplace"))}
              >
                Marketplace
              </Link>
            </nav>
          </div>
          <div className="relative z-10 hidden shrink-0 md:flex md:items-center md:gap-2 md:pl-2">
            <form className="relative" onSubmit={handleSearch}>
              <Input
                className="w-28 lg:w-36 xl:w-48 2xl:w-56 rounded-lg bg-slate-900/50 border-slate-600 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 text-white focus-visible:ring-2 focus-visible:ring-[#ffcc00] focus-visible:border-transparent focus-visible:outline-none transition-all"
                placeholder="Tìm kiếm..."
                title="Tìm kiếm phần mềm, tài liệu..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            </form>

            {!user ? (
              <div className="flex items-center space-x-2 xl:space-x-3">
                {/* Shopping Cart */}
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative">
                  <ShoppingCart className="w-5 h-5 text-slate-200" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-slate-900 text-xs font-bold rounded-full flex items-center justify-center">
                    0
                  </span>
                </button>

                <Button
                  onClick={() => navigate("/auth")}
                  variant="ghost"
                  className="text-slate-200 hover:bg-slate-700 hover:text-white px-4 py-2"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => navigate("/auth?tab=register")}
                  className="bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-slate-900 font-semibold px-4 py-2"
                >
                  Đăng ký
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 xl:space-x-3">
                <CartTrigger />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative rounded-full flex items-center space-x-3 max-w-xs bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <Avatar className="h-8 w-8 rounded-full border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {user.name || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 py-2 cursor-pointer"
                      >
                        <span className="flex-1">Your Profile</span>
                      </DropdownMenuItem>
                      {/* Dashboard - unified for all users including sellers */}
                      {user.role !== "admin" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/dashboard")}
                          className="flex items-center gap-2 py-2 cursor-pointer"
                        >
                          <span className="flex-1">
                            {user.role === "seller"
                              ? "Dashboard Full"
                              : "Dashboard"}
                          </span>
                        </DropdownMenuItem>
                      )}

                      {/* Developer specific options */}
                      {user.role === "developer" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => navigate("/projects/developer")}
                            className="flex items-center gap-2 py-2 cursor-pointer"
                          >
                            <span className="flex-1">My Projects</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/it-services#projects")}
                            className="flex items-center gap-2 py-2 cursor-pointer"
                          >
                            <span className="flex-1">Browse Portfolios</span>
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Seller Registration */}
                      {user.role !== "seller" && user.role !== "admin" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/seller/registration")}
                          className="flex items-center gap-2 py-2 cursor-pointer"
                        >
                          <Store className="h-4 w-4" />
                          <span className="flex-1">Become a Seller</span>
                        </DropdownMenuItem>
                      )}

                      {/* Admin-specific access */}
                      {user.role === "admin" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-2 py-2 cursor-pointer"
                        >
                          <span className="flex-1">Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}

                      {/* Add Funds */}
                      <DropdownMenuItem
                        onClick={() => navigate("/add-funds")}
                        className="flex items-center gap-2 py-2 cursor-pointer"
                      >
                        <Wallet className="h-4 w-4" />
                        <span className="flex-1">Add Funds</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 py-2 cursor-pointer text-destructive"
                    >
                      <span className="flex-1">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-200 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#ffcc00]"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-700">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={mobileNavLinkClass(location === "/")}
            >
              Home
            </Link>
            <Link
              to="/it-services#projects"
              onClick={closeMobileMenu}
              className={mobileNavLinkClass(
                location.startsWith("/projects") || location.startsWith("/it-services"),
              )}
            >
              IT Services
            </Link>
            <Link
              to="/courses"
              onClick={closeMobileMenu}
              className={mobileNavLinkClass(location.startsWith("/courses"))}
            >
              Tài liệu
            </Link>
            <Link
              to="/blog"
              onClick={closeMobileMenu}
              className={mobileNavLinkClass(location.startsWith("/blog"))}
            >
              Blog
            </Link>
            <Link
              to="/marketplace"
              onClick={closeMobileMenu}
              className={mobileNavLinkClass(location.startsWith("/marketplace"))}
            >
              Marketplace
            </Link>
          </div>

          <div className="pt-2 pb-3 px-4">
            <form className="relative" onSubmit={handleSearch}>
              <Input
                className="w-full rounded-full bg-slate-900/50 border-slate-600 py-2 pl-4 pr-10 placeholder:text-slate-400 text-white focus-visible:ring-2 focus-visible:ring-[#ffcc00] focus-visible:outline-none"
                placeholder="Tìm kiếm phần mềm, tài liệu..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Search className="h-5 w-5 text-slate-400" />
              </button>
            </form>
          </div>

          {!user ? (
            <div className="pt-4 pb-3 border-t border-slate-700">
              <div className="space-y-1 px-4">
                <Button
                  onClick={() => {
                    navigate("/auth");
                    closeMobileMenu();
                  }}
                  variant="ghost"
                  className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => {
                    navigate("/auth?tab=register");
                    closeMobileMenu();
                  }}
                  variant="ghost"
                  className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                >
                  Đăng ký
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-slate-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10 rounded-full border border-slate-500">
                    <AvatarFallback className="bg-slate-600 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile");
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                >
                  Your Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile/downloads");
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                >
                  Downloaded Software
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile/reviews");
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                >
                  Your Reviews
                </Button>
                {user.role === "developer" && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/projects/developer");
                        closeMobileMenu();
                      }}
                      className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                    >
                      My Projects
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/it-services#projects");
                        closeMobileMenu();
                      }}
                      className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                    >
                      Browse Portfolios
                    </Button>
                  </>
                )}
                {user.role === "client" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/projects/client");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                  >
                    My Projects
                  </Button>
                )}
                {user.role === "seller" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/marketplace/seller");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                  >
                    My Store
                  </Button>
                )}
                {user.role === "buyer" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/marketplace/orders");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                  >
                    My Orders
                  </Button>
                )}
                {user.role === "admin" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/admin");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md"
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
