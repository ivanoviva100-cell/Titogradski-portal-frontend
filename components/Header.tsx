'use client';

import { API_URL } from '@/lib/api';
import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';

interface Korisnik {
  ime?: string;
  email?: string;
  uloga?: 'ADMIN' | 'NOVINAR' | 'KORISNIK';
}

interface Kategorija {
  id: number;
  naziv: string;
  slug: string;
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('korisnik');
}

function getServerSnapshot(): string | null {
  return null;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rubrike, setRubrike] = useState<{ naziv: string; path: string }[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const rawKorisnik = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let korisnik: Korisnik | null = null;
  if (rawKorisnik) {
    try {
      korisnik = JSON.parse(rawKorisnik);
    } catch {
      korisnik = null;
    }
  }

  const jeAdminIliNovinar =
    korisnik && (korisnik.uloga === 'ADMIN' || korisnik.uloga === 'NOVINAR');

  const getPrikazUloge = (uloga?: string) => {
    switch (uloga) {
      case 'ADMIN':
        return 'Administrator';
      case 'NOVINAR':
        return 'Novinar';
      default:
        return 'Korisnik';
    }
  };

  // Praćenje skrola za dugme "Nazad na vrh"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dinamičko povlačenje kategorija sa bekenda
  useEffect(() => {
    fetch(`${API_URL}/kategorije`)
      .then((res) => res.json())
      .then((data: Kategorija[]) => {
        if (Array.isArray(data)) {
          const mapiraneRubrike = data
            .filter((kat) => kat.naziv.toLowerCase() !== 'naslovna')
            .map((kat) => ({
              naziv: kat.naziv.toUpperCase(),
              path: `/kategorije/${kat.slug}`,
            }));
          setRubrike([{ naziv: 'NASLOVNA', path: '/' }, ...mapiraneRubrike]);
        }
      })
      .catch((err) => console.error('Greška pri učitavanju kategorija u header-u:', err));
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        {jeAdminIliNovinar && (
          <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  Prijavljeni ste kao: <strong className="text-white">{korisnik?.ime || getPrikazUloge(korisnik?.uloga)}</strong>
                </span>
              </div>

              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded transition-colors shadow-sm"
              >
                <span>📊</span>
                <span>Nazad na Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        <nav className="bg-gray-100 text-gray-800 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 flex items-center space-x-6 overflow-x-auto py-4 text-sm font-extrabold tracking-wide scrollbar-none">
            
            <Link href="/" className="flex items-center space-x-3 hover:opacity-95 transition-opacity shrink-0">
              <img 
                src="/titogradski-logo.svg" 
                alt="Titogradski portal logo" 
                className="h-14 w-auto object-contain" 
              />
            </Link>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3.5 py-2 rounded-md transition shadow-sm shrink-0"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            {rubrike.map((item) => {
  // Sakrivamo "NASLOVNA" i "EKONOMIJA" na manjim ekranima (ispod lg breakpoint-a)
  const isHiddenOnSmall = item.naziv === 'NASLOVNA' || item.naziv === 'EKONOMIJA' || item.naziv === 'POLITIKA' || item.naziv === 'PODGORICA' || item.naziv === 'SPORT' || item.naziv === 'SERVISNE INFORMACIJE' || item.naziv === 'KULTURA';
  const additionalClasses = isHiddenOnSmall ? 'hidden lg:inline-block' : '';

  return (
    <Link 
      key={item.path} 
      href={item.path} 
      className={`hover:text-blue-600 whitespace-nowrap transition-colors ${additionalClasses}`}
    >
      {item.naziv}
    </Link>
  );
})}
          </div>

          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl py-4 px-6 z-50">
              <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {rubrike.map((item) => (
                  <Link
                    key={`dropdown-${item.path}`}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-800 hover:text-blue-600 font-bold text-sm py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-100 transition-colors"
                  >
                    {item.naziv}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Dugme za povratak na vrh stranice */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center focus:outline-none"
          aria-label="Nazad na vrh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}