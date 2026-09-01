import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect, useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [hasDarkHero, setHasDarkHero] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar hasDarkHero={hasDarkHero} />
      {/* If not dark hero, we add top padding so content is not hidden by the fixed navbar */}
      <main className={`flex-grow ${!hasDarkHero ? 'pt-20' : ''}`}>
        <Outlet context={{ setHasDarkHero }} />
      </main>
      <Footer />
    </div>
  );
}

// Hook para que las páginas controlen si tienen un hero oscuro
export function useLayoutConfig() {
  return useOutletContext<{ setHasDarkHero: (value: boolean) => void }>();
}
