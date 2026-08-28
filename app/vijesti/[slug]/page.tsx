import Header from '@/components/Header';
import AdPlaceholder from '@/components/AdPlaceholder';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/api';

interface Autor {
  imePrezime: string;
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
  slikaOpis?: string | null;
  datumKreiranja: string;
  kategorija?: Kategorija;
  autor?: Autor;
}

async function getSveVijesti(): Promise<Vijest[]> {
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VijestDetaljPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const sveVijesti = await getSveVijesti();
  
  // Pronađi trenutnu vijest na osnovu slug-a
  const vijest = sveVijesti.find((v) => v.slug === slug);

  if (!vijest) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900">
        <div>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-red-600">Vijest nije pronađena.</h1>
            <p className="text-gray-600 mt-2">Tražena vijest ne postoji ili je obrisana.</p>
            <Link href="/" className="inline-block mt-4 text-blue-600 underline text-sm">
              Nazad na početnu
            </Link>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  // Filtriraj ostale vijesti iz iste rubrike (da ne prikazujemo trenutnu vijest u preporukama)
  const ostaleIzRubrike = sveVijesti
    .filter(
      (v) => 
        v.kategorija?.id === vijest.kategorija?.id && 
        v.id !== vijest.id
    )
    .slice(0, 4); // Uzmi poslednje 4 vijesti

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900 pt-33">
      <div>
        <Header />

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          {/* Top Banner Reklama */}
          <AdPlaceholder type="banner-top" link="https://partner-sajt.com"/>

          {/* Putanja (Breadcrumb) */}
          <div className="border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 rounded bg-gray-50 uppercase">
            <Link href="/" className="hover:text-blue-600">NASLOVNA</Link> 
            {vijest.kategorija && (
              <>
                <span className="mx-1">&gt;</span>
                <Link href={`/kategorije/${vijest.kategorija.slug}`} className="text-blue-600 hover:underline">
                  {vijest.kategorija.naziv}
                </Link>
              </>
            )}
          </div>

          {/* Glavni sadržaj vijesti */}
          <article className="space-y-6">
            <header className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                {vijest.naslov}
              </h1>
              {vijest.podnaslov && (
                <p className="text-lg text-gray-600 font-medium">
                  {vijest.podnaslov}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 border-b pb-4">
                <span>Autor: <strong className="text-gray-800">{vijest.autor?.imePrezime || 'Redakcija'}</strong></span>
                <span>{new Date(vijest.datumKreiranja).toLocaleDateString('sr-ME')}</span>
              </div>
            </header>

            {vijest.slikaUrl && (
  <div className="space-y-1.5">
    <div className="rounded-lg overflow-hidden shadow-md relative w-full h-[450px]">
      <Image 
        src={vijest.slikaUrl} 
        alt={vijest.naslov} 
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover"
      />
    </div>
    
    {/* Prikaz opisa/izvora slike van kontejnera slike */}
    {vijest.slikaOpis && (
      <p className="text-xs text-gray-500 italic text-right">
        {vijest.slikaOpis}
      </p>
    )}
    
  </div>
)}

            {/* Tekst vijesti */}
            <div className="text-gray-800 leading-relaxed space-y-4 text-base whitespace-pre-line">
              {vijest.sadrzaj}
            </div>
          </article>

          {/* Baner reklama iznad preporuka */}
          <div className="pt-4">
            <AdPlaceholder type="banner-middle" link="https://drugi-partner.com"/>
          </div>

          {/* SEKCIJA: Ostale vijesti iz rubrike (Posljednje 4) */}
          {ostaleIzRubrike.length > 0 && (
            <section className="pt-8 border-t border-gray-200 space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900">
                Ostale vijesti iz rubrike: {vijest.kategorija?.naziv}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ostaleIzRubrike.map((ostalaVijest) => (
                  <Link 
                    key={ostalaVijest.id} 
                    href={`/vijesti/${ostalaVijest.slug}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-400 transition-all group"
                  >
                    {ostalaVijest.slikaUrl && (
  <div className="relative w-full h-32 overflow-hidden rounded">
    <Image 
      src={ostalaVijest.slikaUrl} 
      alt={ostalaVijest.naslov} 
      fill
      sizes="(max-width: 768px) 100vw, 300px"
      className="object-cover"
    />
  </div>
)}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                          {ostalaVijest.naslov}
                        </h4>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-3 block">
                        {new Date(ostalaVijest.datumKreiranja).toLocaleDateString('sr-ME')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}