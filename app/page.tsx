import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdPlaceholder from '@/components/AdPlaceholder';
import Footer from '@/components/Footer';
import NajnovijeSlider from '@/components/NajnovijeSlider';
import TemeSekcija from '@/components/TemeSekcija';
import KategorijeSlider from '@/components/KategorijeSlider';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

interface Autor {
  imePrezime: string;
  email?: string;
}

interface Kategorija {
  id: number;
  naziv: string;
  slug: string;
}

interface Vijest {
  id: number;
  naslov: string;
  podnaslov: string;
  sadrzaj: string;
  slug: string;
  slikaUrl: string;
  brojPregleda?: number;
  datumKreiranja: string;
  kategorija?: Kategorija;
  autor?: Autor;
}

async function getVijesti(): Promise<Vijest[]> {
  try {
    const res = await fetch(`${API_URL}/vijesti`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    
    return data.map((v: Vijest) => ({
      ...v,
      slikaUrl: v.slikaUrl && !v.slikaUrl.startsWith('http') ? `${API_URL}${v.slikaUrl}` : v.slikaUrl
    }));
  } catch (error) {
    console.error("Greška pri dohvatanju vijesti:", error);
    return [];
  }
}

export default async function Home() {
  const vijesti: Vijest[] = await getVijesti();

  // Sortiranje najčitanijih vijesti po broju pregleda (uzimamo top 5)
  const najcitanijeVijesti = [...vijesti]
    .sort((a, b) => (b.brojPregleda || 0) - (a.brojPregleda || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900">
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 space-y-6 pt-37">
          {/* Top Banner Reklama */}
          <AdPlaceholder type="banner-top" link="https://partner-sajt.com"/>

          {/* Hero Sekcija (Glavna vijest + 4 posljednje) */}
          <HeroSection vijesti={vijesti} />

          {/* Srednja Reklama */}
          <AdPlaceholder type="banner-middle" link="https://drugi-partner.com"/>

          {/* Putanja (Breadcrumb) */}
          <div className="border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 rounded bg-gray-50">
            NASLOVNA <span className="text-blue-600"></span>
          </div>

          {/* Main Content Layout sa Sekcijama i Sidebar Reklamom */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
            
            {/* Lijeva strana: Sadrži sekcije (zauzima 8 kolona) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* 1. SEKCIJA: Najnovije vijesti (Slider sa 3 u redu) */}
              <NajnovijeSlider vijesti={vijesti} />

              {/* 2. SEKCIJA: Teme i komentari (3 kolone sa slikom + tekstualne vijesti ispod) */}
              <TemeSekcija vijesti={vijesti} />

              {/* 3. SEKCIJA: Grupe od po 4 vijesti sa rotacijom (KategorijeSlider) */}
              <div>
                <KategorijeSlider vijesti={vijesti} />
              </div>

            </div>

            {/* Desna strana: Najčitanije vijesti + Sticky bočna reklama */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Blok sa najčitanijim vijestima (skrolovanjem ide nagore) */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                    Najčitanije
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                </div>

                <div className="divide-y divide-gray-100">
                  {najcitanijeVijesti.map((v, index) => (
                    <Link 
                      key={v.id} 
                      href={`/vijesti/${v.slug}`}
                      className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0 hover:bg-gray-50/50 transition-colors rounded px-1"
                    >
                      <span className="text-2xl font-black text-gray-300 group-hover:text-blue-600 transition-colors w-6 shrink-0 text-center">
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        {v.kategorija && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {v.kategorija.naziv}
                          </span>
                        )}
                        <h4 className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {v.naslov}
                        </h4>
                      </div>
                    </Link>
                  ))}
                  {najcitanijeVijesti.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">Nema dostupnih vijesti.</p>
                  )}
                </div>
              </div>

              {/* Bočna reklama (zadržava sticky poziciju) */}
              <div className="sticky top-4">
                <AdPlaceholder type="sidebar" link="https://sidebar-partner.com"/>
              </div>

            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}