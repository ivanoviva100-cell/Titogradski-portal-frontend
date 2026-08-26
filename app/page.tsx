import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdPlaceholder from '@/components/AdPlaceholder';
import Footer from '@/components/Footer';
import Link from 'next/link';
import KategorijeSlider from '@/components/KategorijeSlider';
import Image from 'next/image';


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
    const res = await fetch('http://localhost:5000/vijesti', {
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

  const rubrike = [
    'Podgorica',
    'Politika',
    'Ekonomija',
    'Kultura',
    'Sport',
    'Servisne informacije'
  ];

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
            
            {/* Lijeva strana: Sadrži obje sekcije (zauzima 8 kolona) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* 1. SEKCIJA: Po jedna najnovija vijest iz svake kategorije */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 border-b pb-2">
                  Najnovije vijesti
                </h2>

                {rubrike.map((nazivRubrike) => {
                  const najnovijaU_Rubrici = vijesti.find(
                    (v) => v.kategorija?.naziv?.trim().toLowerCase() === nazivRubrike.trim().toLowerCase()
                  );

                  return (
                    <div key={`prva-${nazivRubrike}`} className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-bold uppercase text-gray-900 mb-3">
                        {nazivRubrike}
                      </h3>
                      
                      {najnovijaU_Rubrici ? (
                        <Link 
                          href={`/vijesti/${najnovijaU_Rubrici.slug}`}
                          className="bg-white p-4 rounded border border-white flex flex-col sm:flex-row gap-4 items-center hover:shadow-md hover:border-blue-400 transition-all group "
                        >
                          {najnovijaU_Rubrici.slikaUrl && (
  <div className="relative w-full sm:w-56 h-36 shrink-0 overflow-hidden rounded">
    <Image 
      src={najnovijaU_Rubrici.slikaUrl} 
      alt={najnovijaU_Rubrici.naslov} 
      fill
      sizes="(max-width: 640px) 100vw, 224px"
      className="object-cover"
    />
  </div>
)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                              {najnovijaU_Rubrici.naslov}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {najnovijaU_Rubrici.podnaslov}
                            </p>
                            <span className="text-[10px] text-gray-500 mt-2 block">
                              {new Date(najnovijaU_Rubrici.datumKreiranja).toLocaleDateString('sr-ME')}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <p className="text-xs text-gray-700 italic">Nema objavljenih vijesti u ovoj rubrici.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 2. SEKCIJA: Grupe od po 4 vijesti sa rotacijom (KategorijeSlider) */}
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