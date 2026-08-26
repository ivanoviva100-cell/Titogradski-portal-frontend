'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Vijest {
  id: number;
  naslov: string;
  podnaslov: string;
  slug: string;
  slikaUrl: string;
  datumKreiranja: string;
  kategorija?: { naziv: string };
}

interface KategorijeSliderProps {
  vijesti: Vijest[];
}

// Definišemo rubrike izvan komponente da se ne kreiraju iznova pri svakom renderu
const RUBRIKE = ['Podgorica', 'Politika', 'Ekonomija', 'Kultura', 'Sport', 'Servisne informacije'];

export default function KategorijeSlider({ vijesti }: KategorijeSliderProps) {
  // Izračunaj datum od prije 1 mjesec (30 dana)
  const prijeMjesecDana = new Date();
  prijeMjesecDana.setMonth(prijeMjesecDana.getMonth() - 1);

  // Filtriraj samo vijesti mlađe od mjesec dana
  const svjezeVijesti = vijesti.filter(
    (v) => new Date(v.datumKreiranja) >= prijeMjesecDana
  );

  const [indeksi, setIndeksi] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setIndeksi((prevIndeksi) => {
        const noviIndeksi = { ...prevIndeksi };

        RUBRIKE.forEach((rubrika) => {
          const vijestiURubrici = svjezeVijesti.filter(
            (v) => v.kategorija?.naziv?.toLowerCase() === rubrika.toLowerCase()
          );

          if (vijestiURubrici.length > 4) {
            const trenutni = prevIndeksi[rubrika] || 0;
            noviIndeksi[rubrika] = trenutni + 4 < vijestiURubrici.length ? trenutni + 4 : 0;
          }
        });

        return noviIndeksi;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [svjezeVijesti]); // Sada je sve čisto i ispravno

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 border-b pb-2">
        Ostale vijesti
      </h2>

      {RUBRIKE.map((nazivRubrike) => {
        const vijestiURubrici = svjezeVijesti.filter((v) => {
          const katNaziv = v.kategorija?.naziv?.trim().toLowerCase() || '';
          const trazeniNaziv = nazivRubrike.trim().toLowerCase();
          return katNaziv === trazeniNaziv;
        });

        const trenutniIndeks = indeksi[nazivRubrike] || 0;
        const prikazaneVijesti = vijestiURubrici.slice(trenutniIndeks, trenutniIndeks + 4);

        return (
          <div key={nazivRubrike} className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold uppercase text-gray-900 mb-4">
              {nazivRubrike}
            </h3>

            {prikazaneVijesti.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prikazaneVijesti.map((v) => (
                  <Link 
                    key={v.id} 
                    href={`/vijesti/${v.slug}`}
                    className="bg-white p-4 rounded border border-white flex gap-3 items-center hover:shadow-md hover:border-blue-400 transition-all group"
                  >
                    {v.slikaUrl && (
                      <div className="relative w-24 h-20 shrink-0 overflow-hidden rounded">
                        <Image 
                          src={v.slikaUrl} 
                          alt={v.naslov} 
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                        {v.naslov}
                      </h4>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        {new Date(v.datumKreiranja).toLocaleDateString('sr-ME')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 italic">Nema novih vijesti u ovoj rubrici za protekli mjesec.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}