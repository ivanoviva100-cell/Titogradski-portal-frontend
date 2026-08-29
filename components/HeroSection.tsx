import VijestKartica, { VijestTip } from './VijestKartica';

// Proširujemo lokalni tip ili osiguravamo da VijestTip sadrži pozicijaHero
interface HeroVijestTip extends VijestTip {
  pozicijaHero?: string;
}

interface HeroSectionProps {
  vijesti?: HeroVijestTip[];
}

export default function HeroSection({ vijesti = [] }: HeroSectionProps) {
  // 1. Pronalaženje ručno označene glavne vijesti bez 'any' tipa
  let glavnaVijest = vijesti.find((v) => v.pozicijaHero === 'GLAVNA');
  
  // 2. Pronalaženje ručno označenih sporednih vijesti (maksimalno 4)
  let sporedneVijesti = vijesti.filter((v) => v.pozicijaHero === 'SPOREDNA').slice(0, 4);

  // 3. Fallback logika ukoliko nema ručno podešenih pozicija
  if (!glavnaVijest) {
    const zauzeteIds = new Set(sporedneVijesti.map((v) => v.id));
    glavnaVijest = vijesti.find((v) => !zauzeteIds.has(v.id));
  }

  if (sporedneVijesti.length < 4) {
    const vecPrikazaneIds = new Set([
      glavnaVijest?.id, 
      ...sporedneVijesti.map((v) => v.id)
    ].filter((id): id is number => id !== undefined));
    
    const preostaleZaPopunu = vijesti
      .filter((v) => !vecPrikazaneIds.has(v.id))
      .slice(0, 4 - sporedneVijesti.length);

    sporedneVijesti = [...sporedneVijesti, ...preostaleZaPopunu];
  }

  return (
    <section className="bg-gray-50 p-4 rounded-lg my-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Glavna vijest */}
        <div className="lg:col-span-7">
          {glavnaVijest ? (
            <VijestKartica vijest={glavnaVijest} varijanta="velika" priority={true}/>
          ) : (
            <div className="bg-gray-100 text-gray-500 min-h-75 p-6 rounded flex items-center justify-center">
              Nema objavljenih vijesti
            </div>
          )}
        </div>

        {/* Ostale aktuelne vijesti */}
        <div className="lg:col-span-5">
          <h3 className="text-xs font-bold uppercase mb-2 text-right text-gray-700">Ostale aktuelne vijesti</h3>
          <div className="grid grid-cols-2 gap-2">
            {sporedneVijesti.length > 0 ? (
              sporedneVijesti.map((v) => (
                <VijestKartica key={v.id} vijest={v} varijanta="mala" />
              ))
            ) : (
              <p className="col-span-2 text-xs text-gray-600 text-right">Nema dodatnih vijesti.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}