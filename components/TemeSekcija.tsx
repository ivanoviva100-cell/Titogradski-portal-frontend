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
  kategorija?: { id: number; naziv: string; slug: string };
}

interface Props {
  vijesti: Vijest[];
}

// Sve rubrike redom kojim želimo da se prikazuju
const SVE_RUBRIKE = ['Politika', 'Ekonomija', 'Sport', 'Podgorica', 'Kultura', 'Servisne informacije'];

// Helper funkcija za spajanje API_URL-a i putanje slike
const getPunaSlikaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API_URL}${url}`;
};

export default function TemeSekcija({ vijesti }: Props) {
  // Filtriramo samo one rubrike koje imaju bar jednu vijest
  const aktivneRubrike = SVE_RUBRIKE.filter((nazivRubrike) => {
    const vijestiU_Rubrici = vijesti.filter(
      (v) => v.kategorija?.naziv?.trim().toLowerCase() === nazivRubrike.trim().toLowerCase()
    );
    return vijestiU_Rubrici.length > 0;
  });

  if (aktivneRubrike.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 border-b pb-2">
        Teme i komentari
      </h2>

      {/* Jedinstveni grid koji automatski slaže kartice bez praznina */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {aktivneRubrike.map((nazivRubrike) => {
          const vijestiU_Rubrici = vijesti.filter(
            (v) => v.kategorija?.naziv?.trim().toLowerCase() === nazivRubrike.trim().toLowerCase()
          );

          const glavnaVijest = vijestiU_Rubrici[0];
          const sporedneVijesti = vijestiU_Rubrici.slice(1, 3);
          const slikaPuna = getPunaSlikaUrl(glavnaVijest?.slikaUrl);

          return (
            <div 
              key={nazivRubrike} 
              className="flex flex-col space-y-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm h-full justify-between"
            >
              <div>
                {/* 1. GLAVNA VIJEST SA SLIKOM */}
                {glavnaVijest && (
                  <Link href={`/vijesti/${glavnaVijest.slug}`} className="group space-y-2 block">
                    {slikaPuna && (
                      <div className="relative w-full h-44 overflow-hidden rounded">
                        <Image 
                          src={slikaPuna} 
                          alt={glavnaVijest.naslov} 
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider block pt-1">
                      {nazivRubrike}
                    </span>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {glavnaVijest.naslov}
                    </h3>
                  </Link>
                )}
              </div>

              {/* 2. SPOREDNE VIJESTI (Samo tekstualni linkovi) */}
              {sporedneVijesti.length > 0 && (
                <div className="divide-y divide-gray-100 space-y-3 pt-2 mt-auto border-t border-gray-50">
                  {sporedneVijesti.map((v) => (
                    <div key={v.id} className="pt-3 first:pt-2">
                      <Link 
                        href={`/vijesti/${v.slug}`} 
                        className="text-xs text-gray-800 font-medium hover:text-blue-600 transition-colors line-clamp-2 block leading-relaxed"
                      >
                        {v.naslov}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}