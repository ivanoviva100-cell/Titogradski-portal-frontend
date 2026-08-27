import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdPlaceholder from '@/components/AdPlaceholder';
import VijestKartica, { VijestTip } from '@/components/VijestKartica';
import { API_URL } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getVijestiPoKategoriji(slug: string): Promise<VijestTip[]> {
  try {
    const res = await fetch(`${API_URL}/vijesti/kategorija/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    
    if (Array.isArray(data)) return data;
    if (data.vijesti && Array.isArray(data.vijesti)) return data.vijesti;
    return [];
  } catch (error) {
    console.error("Greška pri dohvatanju vijesti za kategoriju:", error);
    return [];
  }
}

export default async function KategorijaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const vijesti = await getVijestiPoKategoriji(slug);

  // Naziv rubrike
  const nazivRubrike = vijesti.length > 0 && vijesti[0].kategorija 
    ? vijesti[0].kategorija.naziv 
    : slug.replace('-', ' ').toUpperCase();

  const novijeVijesti = vijesti.slice(0, 4);
  const starijeVijesti = vijesti.slice(4);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900 pt-33" >
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 space-y-6 pt-4">
          {/* Top Reklama */}
          <AdPlaceholder type="banner-top" />

          {/* Putanja (Breadcrumb) */}
          <div className="border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 rounded bg-gray-50 uppercase">
            NASLOVNA <span className="text-blue-600">&gt; {nazivRubrike}</span>
          </div>

          {/* Glavni sadržaj i Bočna reklama */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
            
            {/* Lijeva strana (8 kolona) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Sekcija: Novije vijesti iz rubrike */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b pb-2">
                  Novije vijesti iz rubrike: {nazivRubrike}
                </h2>

                {novijeVijesti.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {novijeVijesti.map((vijest) => (
                      <VijestKartica key={vijest.id} vijest={vijest} varijanta="mala" />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 border rounded text-gray-500 text-sm">
                    Trenutno nema objavljenih vijesti u rubrici <strong>{nazivRubrike}</strong>.
                  </div>
                )}
              </div>

              {/* Sekcija: Starije vijesti iz rubrike */}
              {starijeVijesti.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b pb-2">
                    Starije vijesti iz rubrike: {nazivRubrike}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {starijeVijesti.map((vijest) => (
                      <VijestKartica key={vijest.id} vijest={vijest} varijanta="mala" />
                    ))}
                  </div>

                  {/* Paginacija dno */}
                  <div className="text-center pt-4 text-xs font-semibold text-blue-600">
                    STRANICA 1 &gt; &gt;
                  </div>
                </div>
              )}

            </div>

            {/* Desna strana: Bočna Reklama (4 kolone) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-4">
                <AdPlaceholder type="sidebar" />
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}