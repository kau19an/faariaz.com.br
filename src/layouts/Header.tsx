import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import LanguageSelector from "../components/ui/LanguageSelector";
import { getLocalizedPath } from "../lib/utils";
import GeoBanner from "../components/ui/GeoBanner";

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLang = i18n.language;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: "menu.home", path: "/" },
    { label: "menu.about", path: "/about" },
    { label: "menu.blog", path: "blog" },
    { label: "menu.contact", path: "/contact" },
  ];
  const buttonStyles =
    "p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-200 transition-colors";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-300 font-sans">
      <div className="relative z-60">
        <GeoBanner />
      </div>

      <header
        className={`w-full h-16 transition-all duration-300 bg-gray-50 relative z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={getLocalizedPath("/", currentLang)}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/images/logo-200.png"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain select-none pointer-events-none"
              />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden ${buttonStyles}`}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={getLocalizedPath(link.path, currentLang)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location.pathname.includes(link.path) && link.path !== "/"
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div
        className={`absolute top-full left-0 w-full h-screen bg-gray-50 backdrop-blur-xl border-t border-gray-100 transition-all duration-300 origin-top z-40 ${
          isMobileMenuOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col p-6 gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={getLocalizedPath(link.path, currentLang)}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold text-gray-800 py-4 border-b border-gray-100 hover:pl-2 transition-all"
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
