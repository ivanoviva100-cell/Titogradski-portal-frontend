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

interface Props {
  vijesti: Vijest[];
}

export default function NajnovijeSlider({ vijesti }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtriramo vijesti (maksimalno 3 po kategoriji da šarenolikost ostane)
  const getFilteredVijesti = () => {
    const brojacKategorija: { [key: string]: number } = {};
    return vijesti.filter((v) => {
      const katNaziv = v.kategorija?.naziv || 'Ostalo';
      brojacKategorija[katNaziv] = (brojacKategorija[katNaziv] || 0) + 1;
      return brojacKategorija[katNaziv] <= 3;
    });
  };

  const filtriraneVijesti = getFilteredVijesti();

  // Uzimamo grupe od po 3 vijesti
  const grupeVijesti: Vijest[][] = [];
  for (let i = 0; i < filtriraneVijesti.length; i += 3) {
    grupeVijesti.push(filtriraneVijesti.slice(i, i + 3));
  }

  // Funkcije za navigaciju strelicama
  const preidiNaPrethodnu = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? grupeVijesti.length - 1 : prevIndex - 1));
  };

  const preidiNaSljedecu = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % grupeVijesti.length);
  };

  // Automatsko mijenjanje grupa na svakih 5 sekundi
  useEffect(() => {
    if (grupeVijesti.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % grupeVijesti.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [grupeVijesti.length]);

  if (grupeVijesti.length === 0) {
    return <p className="text-xs text-gray-500 italic py-4">Nema objavljenih vijesti.</p>;
  }

  const trenutnaGrupa = grupeVijesti[currentIndex] || grupeVijesti[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">
          Najnovije vijesti
        </h2>
        
        {/* Kontrole: Indikatori (tačkice) i Strelice lijevo/desno */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-1.5 items-center">
            {grupeVijesti.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Idi na stranu ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 border-l pl-3 border-gray-200">
            <button
              onClick={preidiNaPrethodnu}
              className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              aria-label="Prethodne vijesti"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={preidiNaSljedecu}
              className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              aria-label="Sljedeće vijesti"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Grid od tačno 3 kolona koji se glatko smjenjuje */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-500">
        {trenutnaGrupa.map((v) => (
          <Link 
            key={v.id}
            href={`/vijesti/${v.slug}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-400 transition-all group"
          >
            <div>
              {v.slikaUrl && (
                <div className="relative w-full h-40 overflow-hidden">
                  <Image 
                    src={v.slikaUrl} 
                    alt={v.naslov} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                  {v.kategorija?.naziv || 'Aktuelno'}
                </span>
                <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {v.naslov}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {v.podnaslov}
                </p>
              </div>
            </div>
            <div className="px-4 pb-4 pt-0">
              <span className="text-[10px] text-gray-400 block border-t pt-2">
                {new Date(v.datumKreiranja).toLocaleDateString('sr-ME')}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}