import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useTenantStore } from '../../../../stores/useTenantStore';
export default function Navbar({ hasDarkHero = false }: { hasDarkHero?: boolean }) {
  const negocio = useTenantStore((s: any) => s.negocio);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleContacto = () => {
    setIsOpen(false);
    if (location.pathname === '/tienda') {
      // Ya estamos en Home — scroll directo
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navegar a Home y luego hacer scroll
      navigate('/tienda');
      setTimeout(() => {
        document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // Configurar estado inicial
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Menú', path: '/tienda/menu' },
    { name: 'Nosotros', path: '/tienda/nosotros' },
  ];

  const isSolid = !hasDarkHero || isScrolled;
  const navClasses = `fixed top-0 w-full z-50 transition-colors duration-300 font-[family-name:var(--font-mono)] ${
    isSolid ? 'bg-[var(--color-primary)] text-[var(--color-dark)] border-b border-[var(--color-dark)]/10' : 'bg-transparent text-[var(--color-primary)]'
  }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/tienda" className="text-2xl font-[family-name:var(--font-serif)] tracking-widest uppercase">
              <span className="not-italic">{negocio?.nombre || "LA BOCA"}</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-10">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-70 ${
                  location.pathname === link.path ? 'font-bold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleContacto}
              className="text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
            >
              Contacto
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:opacity-70 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className={`md:hidden ${isSolid ? 'bg-[var(--color-primary)] border-t border-[var(--color-dark)]/10' : 'bg-[var(--color-dark)]/90 backdrop-blur-sm'}`}>
          <div className="px-4 pt-4 pb-6 space-y-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-sm uppercase tracking-[0.2em]"
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleContacto}
              className="block text-sm uppercase tracking-[0.2em] text-left w-full"
            >
              Contacto
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
