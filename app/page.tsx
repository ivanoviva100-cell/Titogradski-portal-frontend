import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdPlaceholder from '@/components/AdPlaceholder';
import Footer from '@/components/Footer';
import NajnovijeSlider from '@/components/NajnovijeSlider';
import TemeSekcija from '@/components/TemeSekcija';
import KategorijeSlider from '@/components/KategorijeSlider';
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
    return await res.json();
  } catch (error) {
    console.error("Greška pri dohvatanju vijesti:", error);
    return [];
  }
}

export default async function Home() {
  const vijesti: Vijest[] = await getVijesti();

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

            {/* Desna strana: Rezervisano mjesto za bočnu reklamu */}
            <div className="lg:col-span-4 space-y-6">
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