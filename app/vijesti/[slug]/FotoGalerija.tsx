'use client';

import { useState } from 'react';
import Image from 'next/image';
import { API_URL } from '@/lib/api'; // Dodajte import API_URL-a

interface FotoGalerijaProps {
  slike: string[];
  naslovVijesti: string;
}

export default function FotoGalerija({ slike, naslovVijesti }: FotoGalerijaProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  if (!Array.isArray(slike) || slike.length === 0) return null;

  // Helper za formatiranje putanje slike
  const getPunaSlikaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${API_URL}${url}`;
  };

  const prikazaneSlike = slike.slice(0, 3);
  const imaViskaSlika = slike.length > 3;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex !== null) {
      setCurrentIndex((prev) => (prev === 0 ? slike.length - 1 : (prev as number) - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex !== null) {
      setCurrentIndex((prev) => (prev === slike.length - 1 ? 0 : (prev as number) + 1));
    }
  };

  return (
    <div className="pt-6 border-t border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900">
          Foto Galerija
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          Ukupno slika: {slike.length}
        </span>
      </div>

      {/* Grid sa tačno do 3 slike u jednom redu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {prikazaneSlike.map((slika, index) => (
          <div 
            key={index} 
            onClick={() => setCurrentIndex(index)}
            className="relative w-full h-48 rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer group"
          >
            <Image
              src={getPunaSlikaUrl(slika)}
              alt={`${naslovVijesti} - slika ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {index === 2 && imaViskaSlika && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-base">
                  +{slike.length - 3} još
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">Uvećaj</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {currentIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setCurrentIndex(null)}
        >
          <div className="relative max-w-5xl w-full h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={() => setCurrentIndex(null)}
              className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold z-20 transition"
            >
              ✕
            </button>

            <div className="absolute top-4 left-4 text-white bg-black/60 px-3 py-1.5 rounded text-xs font-semibold z-20">
              {currentIndex + 1} / {slike.length}
            </div>

            <button
              onClick={handlePrev}
              className="absolute left-2 sm:-left-12 text-white bg-black/60 hover:bg-black w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold z-20 transition"
            >
              ❮
            </button>

            <div className="relative w-full h-full">
              <Image
                src={getPunaSlikaUrl(slike[currentIndex])}
                alt={`${naslovVijesti} - uvećana slika`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:-right-12 text-white bg-black/60 hover:bg-black w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold z-20 transition"
            >
              ❯
            </button>
          </div>
        </div>
      )}
    </div>
  );
}