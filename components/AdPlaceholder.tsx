import Image from 'next/image';

interface AdPlaceholderProps {
  type: 'banner-top' | 'banner-middle' | 'sidebar';
  link?: string; // <--- Dodano da spriječi TypeScript grešku
}

interface Reklama {
  id: number;
  naziv: string;
  pozicija: string;
  slikaUrl: string;
  linkUrl: string | null;
  aktivna: boolean;
}

async function getReklama(pozicija: string): Promise<Reklama | null> {
  try {
    const res = await fetch(`http://localhost:5000/reklame?pozicija=${pozicija}&aktivna=true`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data: Reklama[] = await res.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Greška pri dohvatanju reklame:", error);
    return null;
  }
}

export default async function AdPlaceholder({ type, link: propLink }: AdPlaceholderProps) {
  const reklama = await getReklama(type);

  // Određujemo sliku i link (prioritet imaju podaci iz baze, a fallback je prop ili generički prikaz)
  const slikaUrl = reklama?.slikaUrl;
  const linkUrl = reklama?.linkUrl || propLink;

  // UKOLIKO NEMA AKTIVNE REKLAME NI SLIKE, VRATI NULL (NE PRIKAZUJ NIŠTA)
  if (!slikaUrl) {
    return null;
  }

  const content = slikaUrl ? (
  <div className={`relative rounded overflow-hidden shadow-sm mx-auto ${
    type === 'sidebar' ? 'w-[300px] h-[250px] sm:h-[600px]' : 'w-full max-w-[728px] h-[90px] sm:h-[90px]'
  }`}>
    <Image 
      src={slikaUrl} 
      alt={reklama?.naziv || 'Reklama'} 
      fill
      className="object-cover"
    />
  </div>
) : (
  <div className={`bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-sm rounded overflow-hidden relative mx-auto ${
    type === 'sidebar' ? 'w-[300px] h-[250px] sm:h-[600px]' : 'w-full max-w-[728px] h-[90px]'
  }`}>
    <span>Reklama ({type}) - Standardni format</span>
  </div>
);

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-95 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}