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

  return (
    <>
      <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
        <div>
          {/* Branding / Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-lg shadow-sm">
              P
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">Portal Admin</h2>
              <p className="text-xs text-slate-400">
  {!isMounted 
    ? '' 
    : (korisnik ? (jeAdmin ? 'Administrator' : 'Novinar') : '')}
</p>
            </div>
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
          <nav className="p-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Meni
            </p>

            <Link
              href="/admin/dashboard"
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
                onClick={() => setIsModalOpen(true)}
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
        <div className="p-4 border-t border-slate-800 space-y-3">
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
      </aside>

      {isModalOpen && (
        <ZahtjeviModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}