import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTenantStore } from '../../../../stores/useTenantStore';
// import { useProductos } from '../../../../hooks/useProductos'; // Comentado temporalmente, se reactivará con CRUD
import { menuItems } from './data/mock';
import { useLayoutConfig } from '../../../../components/tienda/plantillas/restaurante-clasico/Layout';

export default function Home() {
  const negocio = useTenantStore((s: any) => s.negocio);
  // const { productos: menuItems } = useProductos(); // Comentado temporalmente
  const { setHasDarkHero } = useLayoutConfig();
  
  useEffect(() => {
    setHasDarkHero(true);
    return () => setHasDarkHero(false);
  }, [setHasDarkHero]);

  const currentYear = new Date().getFullYear();
  
  // Tabs for Menu Filter
  const [activeTab, setActiveTab] = useState('Parrilla');
  const filteredMenu = menuItems.filter(item => item.categoria === activeTab);
  const pizzas = menuItems.filter(item => item.categoria === 'Pizzas').slice(0, 3);

  // Hover state for menu items
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-primary)] font-[family-name:var(--font-mono)]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-[var(--color-primary)] pt-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[var(--color-dark)] overflow-hidden">
          {/* Background image */}
          <div 
            className="w-full h-full bg-cover bg-center opacity-50"
            style={{ backgroundImage: "url('https://res.cloudinary.com/dwvegpaaf/image/upload/v1785108907/HERORES_yufhiz.jpg')" }}
          ></div>
        </div>
        
        <div className="relative z-10 w-full flex flex-col items-center text-center mt-auto mb-auto">
          <h1 className="flex flex-col items-center leading-none">
            <span className="font-[family-name:var(--font-serif)] text-[5rem] sm:text-[8rem] md:text-[11rem] leading-[0.8] tracking-tight uppercase">
              <span className="not-italic mr-4 md:mr-8">LA</span>
              <span className="italic">BOCA</span>
            </span>
            <span className="font-[family-name:var(--font-serif)] not-italic text-5xl sm:text-7xl md:text-[8rem] leading-[0.8] tracking-widest uppercase mt-4">
              ASADERO
            </span>
          </h1>
          <p className="mt-12 text-sm md:text-base max-w-lg mx-auto text-[var(--color-primary)]/90 tracking-wide">
            Una auténtica experiencia culinaria<br/>donde el fuego es el protagonista.
          </p>
        </div>
        <div className="relative z-10 pb-8 text-xs tracking-widest uppercase text-[var(--color-primary)]/70">
          Desde {currentYear}
        </div>
      </section>

      {/* 2. SECCIÓN MENÚ DESTACADO */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Encabezado y Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <h2 className="font-[family-name:var(--font-serif)] italic text-6xl md:text-8xl text-[var(--color-accent)] leading-none">
            /Menú/
          </h2>
          
          {/* Tabs - 2x2 grid on mobile, flex on desktop */}
          <div className="grid grid-cols-2 md:flex w-full md:w-fit md:border md:border-[var(--color-accent)] md:mb-4 gap-[1px] md:gap-0 bg-[var(--color-accent)] md:bg-transparent border border-[var(--color-accent)]">
            {['Parrilla', 'Pastas', 'Ensaladas', 'Postres'].map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 md:px-8 py-3 md:py-2 text-[11px] sm:text-xs md:text-sm uppercase tracking-widest cursor-pointer transition-colors md:border-r md:border-[var(--color-accent)] md:last:border-r-0 ${
                    isActive ? 'bg-[var(--color-accent)] text-[var(--color-primary)] md:text-[var(--color-primary)]' : 'bg-[var(--color-primary)] md:bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Header — grid-cols-[280px_1fr_120px] idéntico al de cada fila */}
        <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr] gap-4 text-xs text-[var(--color-accent)] tracking-widest border-b border-dashed border-[var(--color-accent)] pb-2">
          <span>(Platillo)</span>
          <span>(Descripción)</span>
          <span className="text-right">(Precio)</span>
        </div>

        {/* Menu Items */}
        <div className="mb-16">
          {filteredMenu.length > 0 ? filteredMenu.map((item) => {
            const isActive = hoveredItem === item.id;
            return (
              <div
                key={item.id}
                className="border-b border-dashed border-[var(--color-accent)] cursor-pointer"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Fila — mismo grid-cols-[1fr_1.5fr_1fr] que el header */}
                <div className="grid grid-cols-[1fr_1.5fr_1fr] items-baseline gap-4 py-6">
                  <span className="font-bold text-[var(--color-accent)] text-lg">{item.nombre}</span>

                  <span className="text-sm text-[var(--color-accent)]">{item.descripcion}</span>

                  <span className="font-bold text-[var(--color-accent)] text-lg text-right">${item.precio.toFixed(2)}</span>

                  {isActive && item.imagenes.length > 0 && (
                    <div className="col-span-3 col-start-1 grid grid-cols-3 gap-2 w-full mt-4">
                      {item.imagenes.map((url, i) => (
                        <div key={i} className="aspect-square w-full overflow-hidden">
                          <img src={url} alt={item.nombre} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-[var(--color-dark)]/50 text-sm border-b border-dashed border-[var(--color-accent)]">No hay platillos en esta categoría.</div>
          )}
        </div>
      </section>

      {/* 3. SECCIÓN ESPECIALIDADES */}
      <section className="pt-8 pb-24 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="font-[family-name:var(--font-serif)] text-5xl md:text-7xl text-[var(--color-accent)] mb-6">
            /Prueba nuestras <span className="italic">pizzas</span>/
          </h2>
          <p className="text-[var(--color-accent)] text-sm md:text-base max-w-md">
            Pizzas artesanales con ingredientes frescos y masa horneada en leña.
          </p>
        </div>

        {/* CSS Grid for touching corners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative">
          
          {/* Margarita */}
          {pizzas[0] && (
            <>
              <div className="w-full aspect-square bg-[var(--color-accent)] p-4 md:p-6 flex items-center justify-center order-2 md:order-1">
                <div className="w-full h-full overflow-hidden">
                  {pizzas[0]?.imagenes[0] && <img src={pizzas[0].imagenes[0]} alt={pizzas[0].nombre} className="w-full h-full object-cover" />}
                </div>
              </div>
              <div className="w-full md:aspect-square relative px-4 py-8 md:p-12 flex flex-col justify-start md:justify-center order-1 md:order-2 overflow-visible">
                <div className="max-w-xs md:max-w-sm mt-0">
                  <h3 className="text-6xl md:text-7xl font-semibold text-[var(--color-accent)] mb-4 tracking-tight">
                    {pizzas[0].nombre}
                  </h3>
                  <p className="text-[var(--color-accent)] text-base md:text-lg leading-relaxed">
                    {pizzas[0].descripcion}
                  </p>
                </div>
                {/* Separador visual inferior en Desktop (Absolute para no romper aspect-square) */}
                <div className="absolute left-0 right-0 -bottom-10 hidden md:flex justify-center pointer-events-none z-10">
                  <img 
                    src="https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109381/pizzero_gy9nf3.png" 
                    alt="Pizzero" 
                    className="w-full object-contain max-h-56 opacity-90"
                  />
                </div>
              </div>
            </>
          )}

          {/* Pepperoni */}
          {pizzas[1] && (
            <>
              {/* Mobile Separator */}
              <div className="w-full flex justify-center py-4 order-3 md:hidden">
                  <img 
                    src="https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109381/pizzero_gy9nf3.png" 
                    alt="Pizzero" 
                    className="w-full object-contain max-h-24 scale-x-[-1]"
                  />
              </div>
              <div className="w-full md:aspect-square relative px-4 py-8 md:p-12 flex flex-col justify-start md:justify-center order-4 md:order-3 overflow-visible">
                <div className="max-w-xs md:max-w-sm mt-0">
                  <h3 className="text-6xl md:text-7xl font-semibold text-[var(--color-accent)] mb-4 tracking-tight">
                    {pizzas[1].nombre}
                  </h3>
                  <p className="text-[var(--color-accent)] text-base md:text-lg leading-relaxed">
                    {pizzas[1].descripcion}
                  </p>
                </div>
                {/* Separador visual inferior en Desktop (espejo) (Absolute) */}
                <div className="absolute left-0 right-0 -bottom-10 hidden md:flex justify-center pointer-events-none z-10">
                  <img 
                    src="https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109381/pizzero_gy9nf3.png" 
                    alt="Pizzero" 
                    className="w-full object-contain max-h-56 opacity-90 scale-x-[-1]"
                  />
                </div>
              </div>
              <div className="w-full aspect-square bg-[var(--color-accent)] p-4 md:p-6 flex items-center justify-center order-5 md:order-4">
                <div className="w-full h-full overflow-hidden">
                  {pizzas[1]?.imagenes[0] && <img src={pizzas[1].imagenes[0]} alt={pizzas[1].nombre} className="w-full h-full object-cover" />}
                </div>
              </div>
            </>
          )}

          {/* Prosciutto */}
          {pizzas[2] && (
            <>
              <div className="w-full aspect-square bg-[var(--color-accent)] p-4 md:p-6 flex items-center justify-center order-8 md:order-5 mt-4 md:mt-0">
                <div className="w-full h-full overflow-hidden">
                  {pizzas[2]?.imagenes[0] && <img src={pizzas[2].imagenes[0]} alt={pizzas[2].nombre} className="w-full h-full object-cover" />}
                </div>
              </div>
              {/* Mobile Separator (Missing previously) */}
              <div className="w-full flex justify-center py-4 order-6 md:hidden mt-4">
                  <img 
                    src="https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109381/pizzero_gy9nf3.png" 
                    alt="Pizzero" 
                    className="w-full object-contain max-h-24"
                  />
              </div>
              <div className="w-full md:aspect-square relative px-4 py-8 md:p-12 flex flex-col justify-start md:justify-center order-7 md:order-6 overflow-visible">
                <div className="max-w-xs md:max-w-sm mt-0">
                  <h3 className="text-6xl md:text-7xl font-semibold text-[var(--color-accent)] mb-4 tracking-tight">
                    {pizzas[2].nombre}
                  </h3>
                  <p className="text-[var(--color-accent)] text-base md:text-lg leading-relaxed">
                    {pizzas[2].descripcion}
                  </p>
                </div>

                <div className="absolute left-0 right-0 -bottom-10 hidden md:flex justify-center pointer-events-none z-10">
                  <img
                    src="https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109381/pizzero_gy9nf3.png"
                    alt="Pizzero"
                    className="w-full object-contain max-h-56 opacity-90"
                  />
                </div>
              </div>
              {/* Final Mobile Separator after last pizza */}
              <div className="w-full flex justify-center py-4 order-9 md:hidden mt-4">
                  <img 
                    src="https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109381/pizzero_gy9nf3.png" 
                    alt="Pizzero" 
                    className="w-full object-contain max-h-24 scale-x-[-1]"
                  />
              </div>
            </>
          )}
          
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-24 text-center">
        <Link 
          to="/tienda/menu" 
          className="inline-block bg-[var(--color-accent)] text-[var(--color-primary)] px-16 py-5 text-sm md:text-base font-semibold tracking-widest uppercase hover:bg-[var(--color-accent)]/90 transition-colors"
        >
          Ver todo el menú
        </Link>
      </section>

      {/* 5. SECCIÓN CONTACTO */}
      <section id="contacto" className="relative py-32 flex items-center justify-center min-h-[70vh]">
        {/* Split Backgrounds */}
        <div className="absolute inset-0 flex">
          <div 
            className="w-1/2 h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109563/hero1_bxcudk.jpg')" }}
          ></div>
          <div 
            className="w-1/2 h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://res.cloudinary.com/dwvegpaaf/image/upload/v1785109562/hero2_biczwv.jpg')" }}
          ></div>
          <div className="absolute inset-0 bg-[var(--color-dark)]/40"></div>
        </div>
        
        <div className="relative z-10 bg-[var(--color-accent)] p-12 md:p-20 flex flex-col items-center text-center max-w-lg w-full mx-4">
          <h2 className="font-[family-name:var(--font-serif)] italic text-5xl md:text-7xl text-[var(--color-primary)] mb-12">
            /Contacto/
          </h2>
          <div className="flex flex-col gap-6 w-full items-center">
            <a 
              href={`mailto:${negocio?.email || ""}`}
              className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-12 py-3 text-sm tracking-widest uppercase hover:bg-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors w-full"
            >
              Escríbenos
            </a>
            
            <span className="font-[family-name:var(--font-serif)] italic text-2xl text-[var(--color-primary)]">Ó</span>
            
            <a 
              href={`https://wa.me/${negocio?.whatsapp || ""}`}
              target="_blank" 
              rel="noreferrer"
              className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-12 py-3 text-sm tracking-widest uppercase hover:bg-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors w-full"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
