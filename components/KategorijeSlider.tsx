'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/api';

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

const RUBRIKE = ['Podgorica', 'Politika', 'Ekonomija', 'Kultura', 'Sport', 'Servisne informacije'];

// Helper funkcija za spajanje API_URL-a i putanje slike
const getPunaSlikaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API_URL}${url}`;
};

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
  }, [svjezeVijesti]);

  // Filtriramo samo one rubrike koje IMAJU bar jednu svježu vijest
  const aktivneRubrike = RUBRIKE.filter((nazivRubrike) => {
    const vijestiURubrici = svjezeVijesti.filter((v) => {
      const katNaziv = v.kategorija?.naziv?.trim().toLowerCase() || '';
      const trazeniNaziv = nazivRubrike.trim().toLowerCase();
      return katNaziv === trazeniNaziv;
    });
    return vijestiURubrici.length > 0;
  });

  // Ako nema nijedne rubrike sa vijestima, ne prikazujemo ništa
  if (aktivneRubrike.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 border-b pb-2">
        Ostale vijesti
      </h2>

      {aktivneRubrike.map((nazivRubrike) => {
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prikazaneVijesti.map((v) => {
                const slikaPuna = getPunaSlikaUrl(v.slikaUrl);
                return (
                  <Link 
                    key={v.id} 
                    href={`/vijesti/${v.slug}`}
                    className="bg-white p-4 rounded border border-white flex gap-3 items-center hover:shadow-md hover:border-blue-400 transition-all group"
                  >
                    {slikaPuna && (
                      <div className="relative w-24 h-20 shrink-0 overflow-hidden rounded">
                        <Image 
                          src={slikaPuna} 
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
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}