import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#004080] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-white">Software</span>
              <span className="text-[#ffcc00]">Hub</span>
            </h3>
            <p className="text-gray-300 mb-4">
              Your comprehensive platform for software discovery, development services, and marketplace resources.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/it-services" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  IT Services
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/request-project" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  Request Project
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/it-services#software" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  Software Downloads
                </Link>
              </li>
              <li>
                <Link href="/it-services#projects" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  Custom Development
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  Digital Products
                </Link>
              </li>
              <li>
                <Link href="/it-services#portfolios" className="text-gray-300 hover:text-[#ffcc00] transition-colors">
                  Developer Portfolios
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <address className="not-italic text-gray-300 space-y-2">
              <p>Software Hub, Inc.</p>
              <p>123 Tech Boulevard</p>
              <p>Innovation District</p>
              <p>Email: contact@softwarehub.com</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Software Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}