import { useState } from "react";
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
import { Menu, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <span className="font-bold text-xl cursor-pointer">
                  <span className="text-primary">Software</span><span className="text-accent">Hub</span>
                </span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
              <Link to="/" className={`${location === '/' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} nav-item inline-flex items-center px-1 pt-1 border-b-2`}>
                Home
              </Link>
              <Link to="/projects" className={`${location.startsWith('/projects') ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} nav-item inline-flex items-center px-1 pt-1 border-b-2`}>
                IT services
              </Link>
              <Link to="/marketplace" className={`${location.startsWith('/marketplace') ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} nav-item inline-flex items-center px-1 pt-1 border-b-2`}>
                Marketplace
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form className="relative" onSubmit={handleSearch}>
              <Input
                className="w-64 rounded-full bg-muted border-border py-2 pl-4 pr-10 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background focus-visible:outline-none"
                placeholder="Search software..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Search className="h-5 w-5 text-muted-foreground" />
              </button>
            </form>
            
            {!user ? (
              <div className="flex space-x-3 ml-4">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="ghost"
                  className="btn-secondary"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/auth?tab=register")}
                  className="btn-primary"
                >
                  Sign up
                </Button>
              </div>
            ) : (
              <div className="ml-4 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full flex items-center space-x-3 max-w-xs bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <Avatar className="h-8 w-8 rounded-full border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="flex items-center gap-2 py-2 cursor-pointer">
                        <span className="flex-1">Your Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile/downloads")} className="flex items-center gap-2 py-2 cursor-pointer">
                        <span className="flex-1">Downloaded Software</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile/reviews")} className="flex items-center gap-2 py-2 cursor-pointer">
                        <span className="flex-1">Your Reviews</span>
                      </DropdownMenuItem>
                      {user.role === 'developer' && (
                        <>
                          <DropdownMenuItem onClick={() => navigate("/projects/developer")} className="flex items-center gap-2 py-2 cursor-pointer">
                            <span className="flex-1">My Projects</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/portfolio")} className="flex items-center gap-2 py-2 cursor-pointer">
                            <span className="flex-1">My Portfolio</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.role === 'client' && (
                        <DropdownMenuItem onClick={() => navigate("/projects/client")} className="flex items-center gap-2 py-2 cursor-pointer">
                          <span className="flex-1">My Projects</span>
                        </DropdownMenuItem>
                      )}
                      {user.role === 'seller' && (
                        <DropdownMenuItem onClick={() => navigate("/marketplace/seller")} className="flex items-center gap-2 py-2 cursor-pointer">
                          <span className="flex-1">My Store</span>
                        </DropdownMenuItem>
                      )}
                      {user.role === 'buyer' && (
                        <DropdownMenuItem onClick={() => navigate("/marketplace/orders")} className="flex items-center gap-2 py-2 cursor-pointer">
                          <span className="flex-1">My Orders</span>
                        </DropdownMenuItem>
                      )}
                      {user.role === 'admin' && (
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="flex items-center gap-2 py-2 cursor-pointer">
                          <span className="flex-1">Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 py-2 cursor-pointer text-destructive">
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
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={closeMobileMenu} className={`${location === '/' ? 'bg-primary/10 border-primary text-primary' : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Home
            </Link>
            <Link to="/projects" onClick={closeMobileMenu} className={`${location.startsWith('/projects') ? 'bg-primary/10 border-primary text-primary' : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              IT services
            </Link>
            <Link to="/marketplace" onClick={closeMobileMenu} className={`${location.startsWith('/marketplace') ? 'bg-primary/10 border-primary text-primary' : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Marketplace
            </Link>
          </div>
          
          <div className="pt-2 pb-3 px-4">
            <form className="relative" onSubmit={handleSearch}>
              <Input
                className="w-full rounded-full bg-muted border-border py-2 pl-4 pr-10 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background focus-visible:outline-none"
                placeholder="Search software..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Search className="h-5 w-5 text-muted-foreground" />
              </button>
            </form>
          </div>
          
          {!user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1 px-4">
                <Button
                  onClick={() => {
                    navigate("/auth");
                    closeMobileMenu();
                  }}
                  variant="ghost"
                  className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    navigate("/auth?tab=register");
                    closeMobileMenu();
                  }}
                  variant="ghost"
                  className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Sign up
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile");
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Your Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile/downloads");
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Downloaded Software
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile/reviews");
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Your Reviews
                </Button>
                {user.role === 'developer' && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/projects/developer");
                        closeMobileMenu();
                      }}
                      className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                    >
                      My Projects
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/portfolio");
                        closeMobileMenu();
                      }}
                      className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                    >
                      My Portfolio
                    </Button>
                  </>
                )}
                {user.role === 'client' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/projects/client");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    My Projects
                  </Button>
                )}
                {user.role === 'seller' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/marketplace/seller");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    My Store
                  </Button>
                )}
                {user.role === 'buyer' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/marketplace/orders");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    My Orders
                  </Button>
                )}
                {user.role === 'admin' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/admin");
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
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
                  className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
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
