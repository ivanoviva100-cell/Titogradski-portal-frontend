'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Kategorija {
  id: number;
  naziv: string;
  slug: string;
}

export default function Footer() {
  const [rubrike, setRubrike] = useState<{ naziv: string; path: string }[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/kategorije')
      .then((res) => res.json())
      .then((data: Kategorija[]) => {
        if (Array.isArray(data)) {
          const mapiraneRubrike = data.map((kat) => ({
            naziv: kat.naziv.toUpperCase(),
            path: `/kategorije/${kat.slug}`,
          }));
          setRubrike([{ naziv: 'NASLOVNA', path: '/' }, ...mapiraneRubrike]);
        }
      })
      .catch((err) => console.error('Greška pri učitavanju kategorija u footer-u:', err));
  }, []);

  return (
    <footer className="w-full mt-12">
      {/* Gornji dio sa dinamičkim rubrikama */}
      <div className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
            {rubrike.map((item) => (
              <Link key={`footer-${item.path}`} href={item.path} className="hover:text-sky-400 transition-colors">
                {item.naziv}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Donji tamniji dio sa kontaktom */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4 text-xs">
          <div className="flex items-center space-x-6">
            <img 
      src="/titogradski-logo.svg" 
      alt="Titogradski portal logo" 
      className="h-10 w-auto object-contain" 
    />
            <div className="text-left space-y-1 text-gray-300">
              <p>MAIL@GMAIL.COM</p>
              <p>+38200123456</p>
            </div>
          </div>
          <div className="flex space-x-6 pt-2 font-semibold text-gray-300">
            <Link href="/o-nama" className="hover:underline">O NAMA</Link>
            <Link href="/marketing" className="hover:underline">MARKETING</Link>
            <Link href="/uslovi-koriscenja" className="hover:underline">USLOVI KORIŠĆENJA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}