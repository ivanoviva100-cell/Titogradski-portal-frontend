import Link from 'next/link';
import Image from 'next/image';

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

export default function TemeSekcija({ vijesti }: Props) {
  // Definišemo sve rubrike podijeljene u dva reda (po 3 u svakom redu)
  const prviRedRubrike = ['Politika', 'Ekonomija', 'Sport'];
  const drugiRedRubrike = ['Podgorica', 'Kultura', 'Servisne informacije'];

  const renderKolona = (nazivRubrike: string) => {
    const vijestiU_Rubrici = vijesti.filter(
      (v) => v.kategorija?.naziv?.trim().toLowerCase() === nazivRubrike.trim().toLowerCase()
    );

    const glavnaVijest = vijestiU_Rubrici[0];
    const sporedneVijesti = vijestiU_Rubrici.slice(1, 3);

    if (!glavnaVijest) return null;

    return (
      <div key={nazivRubrike} className="flex flex-col space-y-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        
        {/* 1. GLAVNA VIJEST SA SLIKOM */}
        <Link href={`/vijesti/${glavnaVijest.slug}`} className="group space-y-2 block">
          {glavnaVijest.slikaUrl && (
            <div className="relative w-full h-44 overflow-hidden rounded">
              <Image 
                src={glavnaVijest.slikaUrl} 
                alt={glavnaVijest.naslov} 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider block">
            {nazivRubrike}
          </span>
          <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {glavnaVijest.naslov}
          </h3>
        </Link>

        {/* 2. SPOREDNE VIJESTI (Samo tekstualni linkovi u dva reda) */}
        <div className="divide-y divide-gray-100 space-y-3 pt-2">
          {sporedneVijesti.map((v) => (
            <div key={v.id} className="pt-3 first:pt-0">
              <Link 
                href={`/vijesti/${v.slug}`} 
                className="text-xs text-gray-800 font-medium hover:text-blue-600 transition-colors line-clamp-2 block leading-relaxed"
              >
                {v.naslov}
              </Link>
            </div>
          ))}
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 border-b pb-2">
        Teme i komentari
      </h2>

      {/* Prvi red (3 kolone) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prviRedRubrike.map((rubrika) => renderKolona(rubrika))}
      </div>

      {/* Drugi red (3 kolone) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drugiRedRubrike.map((rubrika) => renderKolona(rubrika))}
      </div>
    </div>
  );
}