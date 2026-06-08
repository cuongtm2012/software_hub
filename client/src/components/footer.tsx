import { Link } from "wouter";
import { Mail, MapPin, Phone, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const linkClass =
    "text-slate-300 hover:text-amber-400 transition-all duration-200 inline-block hover:translate-x-0.5";

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-white font-bold text-lg">
                Software<span className="text-amber-400">Hub</span>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              Nền tảng chia sẻ phần mềm và tài liệu IT hàng đầu, kết nối các nhà phát triển với doanh nghiệp.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Nền tảng</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className={linkClass}>
                  Phần mềm & Tài liệu
                </Link>
              </li>
              <li>
                <Link href="/it-services" className={linkClass}>
                  Dịch vụ phát triển
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className={linkClass}>
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/request-project" className={linkClass}>
                  Yêu cầu dự án
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Tài nguyên</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className={linkClass}>
                  Tài liệu hướng dẫn
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Hướng dẫn phát triển
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Trung tâm hỗ trợ
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Diễn đàn cộng đồng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Mỹ Đình 1, Nam Từ Liêm, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <a href="mailto:admin@in2sight.com" className={linkClass}>
                  admin@in2sight.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <a href="tel:+84123456789" className={linkClass}>
                  +84 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© {currentYear} SoftwareHub. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className={linkClass}>
                Chính sách bảo mật
              </a>
              <a href="#" className={linkClass}>
                Điều khoản dịch vụ
              </a>
              <a href="#" className={linkClass}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
