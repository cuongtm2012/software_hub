import { Link } from "wouter";
import { Mail, MapPin, Phone, Github, Twitter, Linkedin, Download, Code, ShoppingCart, Users } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-[#004080] via-[#003366] to-[#002244] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-white">Software</span>
                <span className="text-[#ffcc00]">Hub</span>
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Empowering businesses with cutting-edge software solutions, expert development services, and a thriving marketplace for digital innovation.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-blue-600/30 rounded-lg hover:bg-blue-500/40 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-blue-600/30 rounded-lg hover:bg-blue-500/40 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-blue-600/30 rounded-lg hover:bg-blue-500/40 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#ffcc00]">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="flex items-center text-blue-100 hover:text-[#ffcc00] transition-colors group">
                  <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Software Catalog
                </Link>
              </li>
              <li>
                <Link href="/it-services" className="flex items-center text-blue-100 hover:text-[#ffcc00] transition-colors group">
                  <Code className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Development Services
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="flex items-center text-blue-100 hover:text-[#ffcc00] transition-colors group">
                  <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Digital Marketplace
                </Link>
              </li>
              <li>
                <Link href="/request-project" className="flex items-center text-blue-100 hover:text-[#ffcc00] transition-colors group">
                  <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Custom Projects
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#ffcc00]">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-blue-100 hover:text-[#ffcc00] transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-[#ffcc00] transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-[#ffcc00] transition-colors">
                  Developer Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-[#ffcc00] transition-colors">
                  Support Center
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-[#ffcc00] transition-colors">
                  Community Forum
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#ffcc00]">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-[#ffcc00] mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-blue-100">
                  <p className="font-medium">SoftwareHub Headquarters</p>
                  <p className="text-sm">123 Innovation Drive</p>
                  <p className="text-sm">Tech District, CA 94107</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-[#ffcc00] mr-3 flex-shrink-0" />
                <a href="mailto:hello@softwarehub.com" className="text-blue-100 hover:text-[#ffcc00] transition-colors">
                  hello@softwarehub.com
                </a>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-[#ffcc00] mr-3 flex-shrink-0" />
                <a href="tel:+1-555-TECH-HUB" className="text-blue-100 hover:text-[#ffcc00] transition-colors">
                  +1 (555) TECH-HUB
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-blue-400/20 bg-[#001a33]/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-blue-200 text-sm">
              &copy; {currentYear} SoftwareHub. All rights reserved.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-blue-200 hover:text-[#ffcc00] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-blue-200 hover:text-[#ffcc00] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-blue-200 hover:text-[#ffcc00] transition-colors">
                Cookie Policy
              </a>
            </div>
            
            <div className="text-blue-200 text-sm">
              Made with ❤️ by SoftwareHub Team
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}