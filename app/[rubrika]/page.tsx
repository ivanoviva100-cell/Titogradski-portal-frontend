'use client';
import { API_URL } from '@/lib/api';

import { use, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdPlaceholder from '@/components/AdPlaceholder';
import VijestKartica, { VijestTip } from '@/components/VijestKartica';

interface PageProps {
  params: Promise<{ rubrika: string }>;
}

export default function RubrikaPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const nazivRubrike = resolvedParams.rubrika.toUpperCase();

  const [vijesti, setVijesti] = useState<VijestTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Slanje zahtjeva na backend (kategorija sa prvim velikim slovom ili tačnim nazivom)
    fetch(`${API_URL}/vijesti?kategorija=${encodeURIComponent(resolvedParams.rubrika)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        
        // Rukovanje u zavisnosti od toga da li backend vraća niz ili objekat sa paginacijom
        if (Array.isArray(data)) {
          setVijesti(data);
        } else if (data.vijesti && Array.isArray(data.vijesti)) {
          setVijesti(data.vijesti);
        } else {
          setVijesti([]);
        }
      })
      .catch((err) => console.error('Greška pri učitavanju vijesti za rubriku:', err))
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.rubrika]);

  const novijeVijesti = vijesti.slice(0, 4);
  const starijeVijesti = vijesti.slice(4);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900">
      <div>
        {/* Zaglavlje i Meni sajta */}
        <Header />

        <main className="max-w-7xl mx-auto px-4 my-6 space-y-6">
          <AdPlaceholder type="banner-top" />

          {/* Putanja (Breadcrumb) */}
          <div className="border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 rounded bg-gray-50">
            NASLOVNA &gt; <span className="text-blue-600">{nazivRubrike}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Glavni sadržaj */}
            <div className="lg:col-span-9 space-y-8">
              
              {/* Novije vijesti */}
              <section>
                <h2 className="text-sm font-bold uppercase mb-3 text-gray-800 border-b pb-2">
                  Novije vijesti iz rubrike: {nazivRubrike}
                </h2>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-48 bg-gray-200 animate-pulse rounded" />
                    ))}
                  </div>
                ) : novijeVijesti.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center my-4">
                    <p className="text-sm font-medium text-gray-600">
                      Trenutno nema objavljenih vijesti u rubrici <strong>{nazivRubrike}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {novijeVijesti.map((v) => (
                      <VijestKartica key={v.id} vijest={v} varijanta="mala" />
                    ))}
                  </div>
                )}
              </section>

              {/* Starije vijesti */}
              {!loading && starijeVijesti.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase mb-3 text-gray-800 border-b pb-2">
                    Starije vijesti
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {starijeVijesti.map((v) => (
                      <VijestKartica key={v.id} vijest={v} varijanta="mala" />
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Reklama sa strane */}
            <aside className="lg:col-span-3">
              <AdPlaceholder type="sidebar" />
            </aside>
          </div>
        </main>
      </div>

      {/* Podnožje sajta */}
      <Footer />
    </div>
  );
}