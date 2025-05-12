import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/">
              <span className="text-white font-bold text-xl cursor-pointer">
                Software<span className="text-green-500">Hub</span>
              </span>
            </Link>
            <p className="mt-2 text-gray-400 text-sm">
              Free Software Sharing Platform - Find, download, and share the best free software.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Navigation</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/">
                  <a className="text-base text-gray-400 hover:text-white">Home</a>
                </Link>
              </li>
              <li>
                <Link to="/?view=categories">
                  <a className="text-base text-gray-400 hover:text-white">Categories</a>
                </Link>
              </li>
              <li>
                <Link to="/?view=popular">
                  <a className="text-base text-gray-400 hover:text-white">Popular</a>
                </Link>
              </li>
              <li>
                <Link to="/?view=latest">
                  <a className="text-base text-gray-400 hover:text-white">Latest</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy-policy">
                  <a className="text-base text-gray-400 hover:text-white">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link to="/terms">
                  <a className="text-base text-gray-400 hover:text-white">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <a className="text-base text-gray-400 hover:text-white">Contact Us</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">&copy; {currentYear} SoftwareHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
