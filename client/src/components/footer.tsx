import { Link } from "wouter";
import { Github, Twitter, Facebook, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#004080] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/">
              <span className="font-bold text-xl cursor-pointer">
                <span className="text-white">Software</span><span className="text-[#ffcc00]">Hub</span>
              </span>
            </Link>
            <p className="mt-2 text-gray-300 text-sm">
              Your trusted source for software downloads across all platforms with Google Drive integration. Find the latest updates and secure applications.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
          
          {/* Main navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Navigation</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/popular" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Popular
                </Link>
              </li>
              <li>
                <Link to="/latest" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Latest
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Categories</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/categories/utilities" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Utilities
                </Link>
              </li>
              <li>
                <Link to="/categories/media" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Media
                </Link>
              </li>
              <li>
                <Link to="/categories/communication" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Communication
                </Link>
              </li>
              <li>
                <Link to="/categories/business" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/categories/games" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Games
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/dmca-policy" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  DMCA Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-300 hover:text-[#ffcc00]">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter form */}
        <div className="mt-12 border-t border-[#003366] pt-8">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="max-w-lg">
              <h3 className="text-sm font-semibold text-white">Subscribe to our newsletter</h3>
              <p className="mt-2 text-sm text-gray-300">
                Get updates on new software releases and special offers
              </p>
            </div>
            <div className="flex flex-1 max-w-md">
              <div className="w-full flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 min-w-0 px-4 py-2 text-gray-900 bg-white border-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
                />
                <button 
                  type="button" 
                  className="px-4 py-2 bg-[#ffcc00] text-gray-900 font-medium rounded-r-md hover:bg-[#e6b800] focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:ring-offset-2"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8">
            <p className="text-center text-gray-300 text-sm">&copy; {currentYear} SoftwareHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
