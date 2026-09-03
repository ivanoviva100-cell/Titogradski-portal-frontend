'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  // Proveravamo localStorage odmah pri inicijalizaciji, bez useEffect-a
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('cookie_consent');
  });

  if (!showBanner) return null;

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setShowBanner(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 text-slate-200 p-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300 text-center sm:text-left">
          Ovaj sajt koristi kolačiće (cookies) kako bi poboljšao korisničko iskustvo i pratio posjećenost vijesti. 
          Nastavkom korištenja portala slažete se sa našom{' '}
          <Link href="/uslovi-koriscenja" className="text-blue-400 hover:underline">
            politikom privatnosti
          </Link>.
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
          >
            Odbij
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Prihvatam
          </button>
        </div>
      </div>
    </div>
  );
}