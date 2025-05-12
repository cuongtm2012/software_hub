import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/">
              <span className="text-primary-foreground font-bold text-xl cursor-pointer">
                <span className="text-primary-foreground">Software</span><span className="text-accent">Hub</span>
              </span>
            </Link>
            <p className="mt-2 text-primary-foreground/70 text-sm">
              Free Software Sharing Platform - Find, download, and share the best free software.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground tracking-wider uppercase">Navigation</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/" className="text-base text-primary-foreground/70 hover:text-primary-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/?view=categories" className="text-base text-primary-foreground/70 hover:text-primary-foreground">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/?view=popular" className="text-base text-primary-foreground/70 hover:text-primary-foreground">
                  Popular
                </Link>
              </li>
              <li>
                <Link to="/?view=latest" className="text-base text-primary-foreground/70 hover:text-primary-foreground">
                  Latest
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy-policy" className="text-base text-primary-foreground/70 hover:text-primary-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-primary-foreground/70 hover:text-primary-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-primary-foreground/70 hover:text-primary-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <p className="text-center text-primary-foreground/70 text-sm">&copy; {currentYear} SoftwareHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
