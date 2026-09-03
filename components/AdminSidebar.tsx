'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ZahtjeviBadge from '@/components/ZahtjeviBadge';
import ZahtjeviModal from '@/components/ZahtjeviModal';

interface Korisnik {
  id?: number;
  imePrezime?: string;
  email?: string;
  uloga?: string;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [korisnik, setKorisnik] = useState<Korisnik | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const sačuvaniKorisnik = localStorage.getItem('korisnik');
      if (sačuvaniKorisnik) {
        try {
          setKorisnik(JSON.parse(sačuvaniKorisnik));
        } catch (err) {
          console.error('Greška pri parsiranju korisničkih podataka:', err);
        }
      }
    }
  }, []);

  const jeAdmin = korisnik?.uloga === 'ADMIN';

  const handleOdjava = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    router.push('/admin/login');
  };

  // Sadržaj sidebara izdvojen da se ne ponavlja za mobilni i desktop
  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Branding / Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-lg shadow-sm">
              P
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">Portal Admin</h2>
              <p className="text-xs text-slate-400">
                {!isMounted ? '' : (korisnik ? (jeAdmin ? 'Administrator' : 'Novinar') : '')}
              </p>
            </div>
          </div>
          {/* Dugme za zatvaranje na mobilnom */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Dugme za otvaranje javnog sajta */}
        <div className="px-4 pt-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <span>🌐</span>
            <span>Posjeti javni portal</span>
          </Link>
        </div>

        {/* Meni stavke */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Meni
          </p>

          <Link
            href="/admin/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/admin/dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-base">📊</span>
            <span>Pregled (Dashboard)</span>
          </Link>

          <Link
            href="/admin/vijesti"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/admin/vijesti'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-base">📝</span>
            <span>Vijesti / Članci</span>
          </Link>

          {/* Kategorije - Vidljivo samo za admina */}
          <Link
            href="/admin/kategorije"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              !jeAdmin ? 'hidden' : ''
            } ${
              pathname === '/admin/kategorije'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-base">📁</span>
            <span>Kategorije</span>
          </Link>

          <Link
            href="/admin/komentari"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/admin/komentari'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-base">💬</span>
            <span>Komentari</span>
          </Link>

          {/* Admin sekcija */}
          <div className={!jeAdmin ? 'hidden space-y-1' : 'space-y-1'}>
            <Link
              href="/admin/korisnici"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/admin/korisnici'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-base">👥</span>
              <span>Korisnici</span>
            </Link>

            {/* Sekcija za uređivanje statičkih stranica */}
            <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Statičke stranice
              </p>

              <Link
                href="/admin/staticne-stranice/o-nama"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/admin/staticne-stranice/o-nama'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>📄</span>
                <span>Uredi: O nama</span>
              </Link>

              <Link
                href="/admin/staticne-stranice/marketing"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/admin/staticne-stranice/marketing'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>📢</span>
                <span>Uredi: Marketing</span>
              </Link>

              <Link
                href="/admin/staticne-stranice/uslovi-koriscenja"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/admin/staticne-stranice/uslovi-koriscenja'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>⚖️</span>
                <span>Uredi: Uslovi korišćenja</span>
              </Link>
            </div>

            {/* Reklame i oglasi */}
            <Link
              href="/admin/reklame"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/admin/reklame'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-base">🎯</span>
              <span>Reklame i oglasi</span>
            </Link>

            <Link
              href="/admin/podesavanja"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-3 ${
                pathname === '/admin/podesavanja'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-base">⚙️</span>
              <span>Podešavanja</span>
            </Link>

            {/* Zahtjevi za brisanje */}
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🗑️</span>
                <span>Zahtjevi za brisanje</span>
              </div>
              <ZahtjeviBadge />
            </button>
          </div>
        </nav>
      </div>

      {/* DNO: Prikaz ULOGOVANOG korisnika i Odjava */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            {korisnik?.imePrezime ? korisnik.imePrezime[0].toUpperCase() : 'K'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">
              {!isMounted ? '' : (korisnik?.imePrezime || '')}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {korisnik?.email || ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleOdjava}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <span className="text-base">🚪</span>
          <span>Odjavi se</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobilni Header sa hamburger dugmetom */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-md text-sm">
            P
          </div>
          <span className="font-bold text-sm">Portal Admin</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Pozadina (backdrop) kada je meni otvoren na mobilnom */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar - fiksiran na lijevoj strani i na desktopu i na mobilnom (preko transform-a) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Modal za zahtjeve */}
      {isModalOpen && (
        <ZahtjeviModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}