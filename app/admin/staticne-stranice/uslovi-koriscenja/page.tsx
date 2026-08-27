'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getStaticnuStranicu, sacuvajStaticnuStranicu } from '@/lib/api';

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
    <div className="p-8 max-w-4xl mx-auto text-slate-200">
      <h1 className="text-2xl font-bold mb-6">Uređivanje stranice: Uslovi korišćenja</h1>

      {greskaUcitavanja && (
        <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded text-sm text-red-300">
          {greskaUcitavanja}
        </div>
      )}

      {poruka && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500 rounded text-sm">
          {poruka}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Sadržaj stranice (HTML ili tekst)
          </label>
          <textarea
            rows={36}
            value={sadrzaj}
            onChange={(e) => setSadrzaj(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={cuvanje}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          {cuvanje ? 'Čuvanje...' : 'Sačuvaj izmjene'}
        </button>
      </form>
    </div>
  );
}