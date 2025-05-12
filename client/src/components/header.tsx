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
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <span className="text-primary-600 font-bold text-xl cursor-pointer">
                  Software<span className="text-green-500">Hub</span>
                </span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
              <Link to="/">
                <a className={`${location === '/' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Home
                </a>
              </Link>
              <Link to="/?view=categories">
                <a className={`${location === '/?view=categories' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Categories
                </a>
              </Link>
              <Link to="/?view=latest">
                <a className={`${location === '/?view=latest' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Latest
                </a>
              </Link>
              <Link to="/?view=popular">
                <a className={`${location === '/?view=popular' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Popular
                </a>
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form className="relative" onSubmit={handleSearch}>
              <Input
                className="w-64 rounded-full bg-gray-100 border-0 py-2 pl-4 pr-10 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none"
                placeholder="Search software..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </form>
            
            {!user ? (
              <div className="flex space-x-3 ml-4">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="ghost"
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/auth?tab=register")}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Sign up
                </Button>
              </div>
            ) : (
              <div className="ml-4 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full flex items-center space-x-3 max-w-xs bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Your Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile/downloads")}>
                        Downloaded Software
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile/reviews")}>
                        Your Reviews
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
            <Link to="/" onClick={closeMobileMenu}>
              <a className={`${location === '/' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                Home
              </a>
            </Link>
            <Link to="/?view=categories" onClick={closeMobileMenu}>
              <a className={`${location === '/?view=categories' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                Categories
              </a>
            </Link>
            <Link to="/?view=latest" onClick={closeMobileMenu}>
              <a className={`${location === '/?view=latest' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                Latest
              </a>
            </Link>
            <Link to="/?view=popular" onClick={closeMobileMenu}>
              <a className={`${location === '/?view=popular' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                Popular
              </a>
            </Link>
          </div>
          
          <div className="pt-2 pb-3 px-4">
            <form className="relative" onSubmit={handleSearch}>
              <Input
                className="w-full rounded-full bg-gray-100 border-0 py-2 pl-4 pr-10 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none"
                placeholder="Search software..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
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
