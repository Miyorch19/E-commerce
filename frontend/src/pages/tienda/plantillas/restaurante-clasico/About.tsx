import { useEffect } from 'react';
import { useTenantStore } from '../../../../stores/useTenantStore';
import { useLayoutConfig } from '../../../../components/tienda/plantillas/restaurante-clasico/Layout';

export default function About() {
  const negocio = useTenantStore((s: any) => s.negocio);
  const { setHasDarkHero } = useLayoutConfig();
  
  useEffect(() => {
    setHasDarkHero(true);
    return () => setHasDarkHero(false);
  }, [setHasDarkHero]);
  return (
    <div className="bg-[var(--color-primary)] min-h-screen">
      {/* 1. HERO */}
      <section className="relative min-h-screen w-full flex items-center justify-center">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dwvegpaaf/image/upload/v1785119222/nosotros2_wxpjqq.jpg")' }}
        >
          <div className="absolute inset-0 bg-[var(--color-dark)]/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center flex flex-col pt-16">
          <h1 className="font-[family-name:var(--font-serif)] text-[var(--color-primary)] leading-none tracking-tight" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}>
            Nuestra
            <span className="block italic mt-4 md:mt-6">Historia</span>
          </h1>
        </div>
      </section>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col gap-24 w-full">
        
        {/* 2. SECCIÓN /Historia/ */}
        <section className="w-full">
          <h2 className="font-[family-name:var(--font-serif)] italic text-[var(--color-accent)] leading-none mb-12" style={{ fontSize: 'clamp(4.8rem, 9.6vw, 8rem)' }}>
            /Historia/
          </h2>
          
          <div className="relative w-full min-h-[600px] md:min-h-[500px] overflow-visible">
            
            {/* Bloque de imagen — centrado absoluto e independiente */}
            <div className="w-full flex justify-center">
              <div className="relative w-full max-w-xl">
                <div className="bg-[var(--color-accent)] p-8 md:p-11">
                  <div className="aspect-[4/5] bg-neutral-300 w-full relative">
                    <img 
                      src="https://res.cloudinary.com/dwvegpaaf/image/upload/v1785121599/chef_pr8d3z.jpg" 
                      alt="Chef Principal" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white text-[var(--color-accent)] font-[family-name:var(--font-mono)] font-bold text-sm md:text-lg px-8 py-4 w-[85%] text-center">
                      Chef Principal
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna de texto — posicionada de forma absoluta a la derecha del 
                centro de la página, SIN afectar el centrado de la imagen */}
            <div className="hidden md:flex flex-col gap-10 absolute top-0 left-[calc(50%+310px)] max-w-md z-10">
              <p className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-accent)] text-[0.65rem] md:text-xs leading-relaxed">
                Nuestra historia comenzó con la pasión por ofrecer experiencias culinarias memorables. En {negocio?.nombre || ""}, creemos que la comida no es solo sustento, sino un arte que reúne a las personas.
              </p>
              <p className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-accent)] text-[0.65rem] md:text-xs leading-relaxed">
                Cada plato en nuestro menú refleja nuestra dedicación a la calidad, utilizando solo los ingredientes más frescos, seleccionados meticulosamente cada mañana por nuestros chefs.
              </p>
            </div>

            {/* Versión mobile del texto — apilado debajo, sin posición absoluta */}
            <div className="flex md:hidden flex-col gap-10 max-w-md mx-auto mt-12 px-4">
              <p className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-accent)] text-[0.65rem] leading-relaxed">
                Nuestra historia comenzó con la pasión por ofrecer experiencias culinarias memorables. En {negocio?.nombre || ""}, creemos que la comida no es solo sustento, sino un arte que reúne a las personas.
              </p>
              <p className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-accent)] text-[0.65rem] leading-relaxed">
                Cada plato en nuestro menú refleja nuestra dedicación a la calidad, utilizando solo los ingredientes más frescos, seleccionados meticulosamente cada mañana por nuestros chefs.
              </p>
            </div>

          </div>
        </section>

        {/* 3. CITA DESTACADA */}
        <section className="py-8 w-full">
          <h3 className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-accent)] text-2xl md:text-3xl lg:text-4xl text-left leading-snug w-full">
            "Cocinar es amar. Y amar es dar todo lo que tienes, en cada plato."
          </h3>
        </section>

        {/* 4. SECCIÓN /Nuestra cocina/ */}
        <section className="w-full">
          <h2 className="font-[family-name:var(--font-serif)] italic text-[var(--color-accent)] leading-none mb-12" style={{ fontSize: 'clamp(4.8rem, 9.6vw, 8rem)' }}>
            /Nuestra cocina/
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {[
              "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785126412/cocina_1_qxmw6c.jpg",
              "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785126410/cocina_2_oberwu.jpg",
              "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785126409/cocina_3_taxlrf.jpg",
              "https://res.cloudinary.com/dwvegpaaf/image/upload/v1785126408/cocina_4_ctdxym.jpg",
            ].map((url, index) => (
              <div key={index} className="bg-[var(--color-accent)] p-6 md:p-8">
                <div className="aspect-square w-full overflow-hidden">
                  <img src={url} alt={`Nuestra cocina ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CITA FINAL + CIERRE */}
        <section className="text-left pb-12 w-full">
          <h3 className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-accent)] text-2xl md:text-3xl lg:text-4xl leading-snug mb-8 w-full">
            "Una mesa bien servida es el comienzo de las mejores historias."
          </h3>
          <p className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-accent)] text-[0.7rem] md:text-[0.8rem] leading-relaxed max-w-xl">
            Con un ambiente cálido y un equipo que te tratará como familia, te invitamos a disfrutar de momentos únicos alrededor de nuestra mesa. Ya sea para una cena íntima o una celebración especial, aquí encontrarás tu lugar.
          </p>
        </section>

      </main>
    </div>
  );
}
