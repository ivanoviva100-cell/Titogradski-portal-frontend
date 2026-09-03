'use client';
import { API_URL } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vijest {
  id: number;
  naslov: string;
  datumKreiranja: string;
  brojPregleda: number;
  kategorija?: {
    naziv: string;
  };
  autor?: {
    imePrezime: string;
  };
}

interface Statistika {
  ukupnoVijesti: number;
  ukupnoKategorija: number;
  ukupnoKomentara: number;
  ukupnoKorisnika: number;
}

// Pomoćna funkcija za API pozive sa provjerom isteklog tokena (401)
async function customFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('uloga');
      alert("Vaša sesija je istekla. Molimo prijavite se ponovo.");
      window.location.href = '/login';
    }
    throw new Error('Sesija je istekla.');
  }

  return res;
}

export default function DashboardPage() {
  const [vijesti, setVijesti] = useState<Vijest[]>([]);
  const [statistika, setStatistika] = useState<Statistika>({
    ukupnoVijesti: 0,
    ukupnoKategorija: 0,
    ukupnoKomentara: 0,
    ukupnoKorisnika: 0,
  });
  const [loading, setLoading] = useState(true);

  const [isAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('uloga') === 'ADMIN';
    }
    return false;
  });

  useEffect(() => {
    const ucitajPodatke = async () => {
      try {
        const [resVijesti, resStatistika] = await Promise.all([
          customFetch(`${API_URL}/vijesti/najnovije`),
          customFetch(`${API_URL}/statistika`),
        ]);

        if (resVijesti.ok) {
          const dataVijesti = await resVijesti.json();
          setVijesti(dataVijesti);
        }

        if (resStatistika.ok) {
          const dataStatistika = await resStatistika.json();
          setStatistika(dataStatistika);
        }
      } catch (err) {
        console.error('Greška pri dohvaćanju podataka za dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    ucitajPodatke();
  }, []);

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500">Pregled statistike i aktivnosti novinarskog portala.</p>
      </div>

      {/* ADMIN SEKCIJA: Upravljanje statičkim stranicama (Prikazuje se samo administratoru) */}
      {isAdmin && (
        <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-emerald-400">Administracija sadržaja</h2>
              <p className="text-xs text-gray-300">Brzo uređivanje informativnih stranica portala (Samo za administratore)</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/staticne-stranice/o-nama"
              className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-emerald-500 transition block"
            >
              <h3 className="font-bold text-sm text-white">O nama</h3>
              <p className="text-xs text-gray-400 mt-1">Uredi tekst stranice O nama</p>
            </Link>

            <Link
              href="/admin/staticne-stranice/marketing"
              className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-emerald-500 transition block"
            >
              <h3 className="font-bold text-sm text-white">Marketing</h3>
              <p className="text-xs text-gray-400 mt-1">Uredi ponude i kontakt za oglašavanje</p>
            </Link>

            <Link
              href="/admin/staticne-stranice/uslovi-koriscenja"
              className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-emerald-500 transition block"
            >
              <h3 className="font-bold text-sm text-white">Uslovi korišćenja</h3>
              <p className="text-xs text-gray-400 mt-1">Uredi pravila i uslove korišćenja</p>
            </Link>
          </div>
        </div>
      )}

      {/* Dinamičke kartice sa statistikama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ukupno Vijesti</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            {loading ? '-' : statistika.ukupnoVijesti}
          </p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kategorije</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            {loading ? '-' : statistika.ukupnoKategorija}
          </p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Komentari</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            {loading ? '-' : statistika.ukupnoKomentara}
          </p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aktivni Korisnici</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            {loading ? '-' : statistika.ukupnoKorisnika}
          </p>
        </div>
      </div>

      {/* Sekcija sa nedavno objavljenim vijestima */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Nedavno objavljene vijesti</h2>
          <Link
            href="/admin/vijesti"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition"
          >
            Prikaži sve →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-4">Učitavanje vijesti...</p>
        ) : (
          <>
            {/* MOBILNI PRIKAZ (Kartice umjesto skučene tabele) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {vijesti.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">Nema objavljenih vijesti.</p>
              ) : (
                vijesti.map((v) => (
                  <div key={v.id} className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/50 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{v.naslov}</p>
                      <span className="bg-gray-200 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded shrink-0">
                        {v.kategorija?.naziv || 'Opšte'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-200/60">
                      <span>Autor: <strong className="text-gray-700">{v.autor?.imePrezime || 'Nepoznat'}</strong></span>
                      <span>{new Date(v.datumKreiranja).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-gray-400">Pregleda:</span>
                      <span className="font-mono font-medium text-gray-700 bg-gray-200/60 px-2 py-0.5 rounded">{v.brojPregleda}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP PRIKAZ (Klasična tabela) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Naslov</th>
                    <th className="px-4 py-3">Kategorija</th>
                    <th className="px-4 py-3">Autor</th>
                    <th className="px-4 py-3">Datum</th>
                    <th className="px-4 py-3 text-right">Pregledi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vijesti.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">
                        Nema objavljenih vijesti.
                      </td>
                    </tr>
                  ) : (
                    vijesti.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                          {v.naslov}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {v.kategorija?.naziv || 'Opšte'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {v.autor?.imePrezime || 'Nepoznat'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(v.datumKreiranja).toLocaleDateString('sr-RS', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">
                          {v.brojPregleda}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}