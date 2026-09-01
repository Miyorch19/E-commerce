import { useTenantStore } from '../../../../stores/useTenantStore';

export default function Footer() {
  const negocio = useTenantStore((s: any) => s.negocio);
  return (
    <footer className="bg-[var(--color-primary)] text-[var(--color-dark)] py-24 font-[family-name:var(--font-mono)] border-t border-[var(--color-dark)]/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
          
          {/* Horario */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="font-[family-name:var(--font-serif)] italic text-5xl md:text-6xl text-[var(--color-accent)] mb-8">
              /Horario/
            </h2>
            <div className="text-sm md:text-base leading-relaxed tracking-wide text-[var(--color-accent)] max-w-xs">
              <p>Martes a domingo, de:</p>
              <p>8:00 a.m. a 10:00 p.m.</p>
            </div>
          </div>

          {/* Síguenos */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="font-[family-name:var(--font-serif)] italic text-5xl md:text-6xl text-[var(--color-accent)] mb-8">
              /Síguenos/
            </h2>
            <div className="flex gap-4">
              {negocio?.sitioWeb && (
                <a 
                  href={negocio?.sitioWeb} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[var(--color-accent)] text-[var(--color-primary)] p-4 hover:bg-[var(--color-accent)]/90 transition-colors flex items-center justify-center w-14 h-14"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {negocio?.sitioWeb && (
                <a 
                  href={negocio?.sitioWeb} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[var(--color-accent)] text-[var(--color-primary)] p-4 hover:bg-[var(--color-accent)]/90 transition-colors flex items-center justify-center w-14 h-14"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {/* Cuadros extra solicitados */}
              <a href="#" className="bg-[var(--color-accent)] text-[var(--color-primary)] p-4 hover:bg-[var(--color-accent)]/90 transition-colors flex items-center justify-center w-14 h-14">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="bg-[var(--color-accent)] text-[var(--color-primary)] p-4 hover:bg-[var(--color-accent)]/90 transition-colors flex items-center justify-center w-14 h-14">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
