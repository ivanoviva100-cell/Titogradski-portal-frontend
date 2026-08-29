'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  naslov: string;
}

export default function ShareButtons({ naslov }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(naslov);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'viber':
        shareUrl = `viber://forward?text=${encodedTitle}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 py-4 border-y border-gray-200 my-6">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2">
        Podijeli vijest:
      </span>
      
      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer"
      >
        Facebook
      </button>

      {/* X / Twitter */}
      <button
        onClick={() => handleShare('twitter')}
        className="bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer"
      >
        X (Twitter)
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin')}
        className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer"
      >
        LinkedIn
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => handleShare('whatsapp')}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer"
      >
        WhatsApp
      </button>

      {/* Viber */}
      <button
        onClick={() => handleShare('viber')}
        className="bg-[#7360f2] hover:bg-[#5f4de4] text-white px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer"
      >
        Viber
      </button>

      {/* Kopiraj link */}
      <button
        onClick={handleCopy}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer"
      >
        {copied ? 'Kopirano! ✓' : 'Kopiraj link'}
      </button>
    </div>
  );
}