import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/api'; // Provjerite da li vam je ovdje definisan API_URL

export interface KategorijaTip {
  id: number;
  naziv: string;
  slug: string;
}

export interface VijestTip {
  id: number;
  naslov: string;
  slug?: string;
  slikaUrl?: string;
  datumKreiranja: string;
  kategorija?: KategorijaTip;
  autor?: { imePrezime: string };
}

interface VijestKarticaProps {
  vijest: VijestTip;
  varijanta?: 'velika' | 'mala';
  priority?: boolean;
}

// Helper funkcija za spajanje API_URL-a i putanje slike
const getPunaSlikaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API_URL}${url}`;
};

export default function VijestKartica({ 
  vijest, 
  varijanta = 'mala', 
  priority = false 
}: VijestKarticaProps) {
  
  const href = `/vijesti/${vijest.slug || vijest.id}`;
  const konacniSlikaUrl = getPunaSlikaUrl(vijest.slikaUrl);

  if (varijanta === 'velika') {
    return (
      <Link href={href} className="group relative block w-full h-full min-h-80 rounded-lg overflow-hidden bg-gray-900 shadow-md">
        {konacniSlikaUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <Image 
              src={konacniSlikaUrl} 
              alt={vijest.naslov || 'Vijest'} 
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority={priority}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80" 
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        )}
        <div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white space-y-2">
          {vijest.kategorija && (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              {vijest.kategorija.naziv}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-emerald-300 transition">
            {vijest.naslov}
          </h2>
          <p className="text-xs text-gray-300">
            {new Date(vijest.datumKreiranja).toLocaleDateString('sr-RS')} {vijest.autor && `• ${vijest.autor.imePrezime}`}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex flex-col h-full bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="h-36 bg-gray-100 overflow-hidden relative">
        {konacniSlikaUrl ? (
          <div className="relative w-full h-full overflow-hidden">
            <Image 
              src={konacniSlikaUrl} 
              alt={vijest.naslov || 'Vijest'} 
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover group-hover:scale-105 transition duration-300" 
            />
          </div>
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-400 text-xs font-medium">
            Portal Vijest
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition leading-snug">
          {vijest.naslov}
        </h3>
        <p className="text-[11px] text-gray-400">
          {new Date(vijest.datumKreiranja).toLocaleDateString('sr-RS')}
        </p>
      </div>
    </Link>
  );
}