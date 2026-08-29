interface SadrzajTekstaProps {
  sadrzaj: string;
}

export default function SadrzajTeksta({ sadrzaj }: SadrzajTekstaProps) {
  if (!sadrzaj) return null;

  // Regularni izraz za pronalaženje YouTube linkova unutar vitičastih zagrada {https://...}
  const youtubeRegex = /\{((?:https?:)?\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s}]+)\}/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = youtubeRegex.exec(sadrzaj)) !== null) {
    // Dodaj tekst prije YouTube linka
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: sadrzaj.substring(lastIndex, match.index) });
    }
    // Dodaj YouTube link
    parts.push({ type: 'video', url: match[1] });
    lastIndex = youtubeRegex.lastIndex;
  }

    // Dodaj preostali tekst nakon posljednjeg linka
  if (lastIndex < sadrzaj.length) {
    parts.push({ type: 'text', content: sadrzaj.substring(lastIndex) });
  }

  // Funkcija za izvlačenje YouTube Video ID-ja
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="text-gray-800 leading-relaxed space-y-4 text-base">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <div key={index} className="whitespace-pre-line">
              {part.content}
            </div>
          );
        } else if (part.type === 'video') {
          const videoId = getYouTubeId(part.url || '');
          if (!videoId) return null;

          return (
            <div key={index} className="my-6 w-full max-w-2xl mx-auto">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}