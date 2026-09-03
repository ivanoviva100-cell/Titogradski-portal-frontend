'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getStaticnuStranicu, sacuvajStaticnuStranicu } from '@/lib/api';
import Link from 'next/link';

export default function UrediUsloviKoriscenja() {
  const [sadrzaj, setSadrzaj] = useState<string>('');
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  const [cuvanje, setCuvanje] = useState<boolean>(false);
  const [poruka, setPoruka] = useState<string>('');
  const [greskaUcitavanja, setGreskaUcitavanja] = useState<string>('');

  useEffect(() => {
    getStaticnuStranicu('uslovi-koriscenja')
      .then((data: { sadrzaj?: string }) => {
        setSadrzaj(data.sadrzaj || '');
        setUcitavanje(false);
      })
      .catch((err: unknown) => {
        console.error('Greška pri učitavanju:', err);
        setGreskaUcitavanja('Neuspješno učitavanje sadržaja stranice.');
        setUcitavanje(false);
      });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCuvanje(true);
    setPoruka('Čuvanje u toku...');

    try {
      await sacuvajStaticnuStranicu('uslovi-koriscenja', sadrzaj);
      setPoruka('Uspješno sačuvano!');
      setTimeout(() => setPoruka(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPoruka(err.message);
      } else {
        setPoruka('Došlo je do neočekivane greške.');
      }
    } finally {
      setCuvanje(false);
    }
  };

  if (ucitavanje) return <div className="p-6 text-white">Učitavanje...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-slate-200">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Nazad na Dashboard
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-6">Uređivanje stranice: Uslovi korišćenja</h1>

      {greskaUcitavanja && (
        <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded text-sm text-red-300">
          {greskaUcitavanja}
        </div>
      )}

      {poruka && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500 rounded text-sm text-blue-300">
          {poruka}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
            Sadržaj stranice (HTML ili tekst)
          </label>
          <textarea
            rows={24}
            value={sadrzaj}
            onChange={(e) => setSadrzaj(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono text-xs sm:text-sm leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={cuvanje}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
        >
          {cuvanje ? 'Čuvanje...' : 'Sačuvaj izmjene'}
        </button>
      </form>
    </div>
  );
}