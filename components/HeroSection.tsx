import VijestKartica, { VijestTip } from './VijestKartica';

interface HeroSectionProps {
  vijesti?: VijestTip[];
}

export default function HeroSection({ vijesti = [] }: HeroSectionProps) {
  const glavnaVijest = vijesti[0];
  const ostaleVijesti = vijesti.slice(1, 5);

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
            {ostaleVijesti.length > 0 ? (
              ostaleVijesti.map((v) => (
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