'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect, FormEvent } from 'react';

interface Korisnik {
  id: number;
  imePrezime: string;
  email: string;
  uloga: string;
  datumKreiranja: string;
}

export default function KorisniciPage() {
  const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stanje za Modal i Formu
  const [prikaziModal, setPrikaziModal] = useState(false);
  const [imePrezime, setImePrezime] = useState('');
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [uloga, setUloga] = useState<'ADMIN' | 'NOVINAR'>('NOVINAR');
  const [formaGreska, setFormaGreska] = useState('');
  const [formaLoading, setFormaLoading] = useState(false);

  // Dohvatanje podataka o ulogovanom korisniku iz localStorage-a
  const [trenutniKorisnik] = useState<{ id: number | null; uloga: string | null }>(() => {
    if (typeof window !== 'undefined') {
      const sacuvaniKorisnik = localStorage.getItem('korisnik');
      if (sacuvaniKorisnik) {
        try {
          const parsed = JSON.parse(sacuvaniKorisnik);
          return { id: parsed.id ?? null, uloga: parsed.uloga ?? null };
        } catch (e) {
          console.error(e);
        }
      }
    }
    return { id: null, uloga: null };
  });

  // Provjera da li je trenutno ulogovani korisnik ADMIN
  const jeAdmin = trenutniKorisnik.uloga === 'ADMIN';

  useEffect(() => {
    const ucitajKorisnike = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/korisnici`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Neuspješno učitavanje korisnika.');

        const data = await res.json();
        setKorisnici(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju.');
      } finally {
        setLoading(false);
      }
    };

    ucitajKorisnike();
  }, []);

  const handleDodajKorisnika = async (e: FormEvent) => {
    e.preventDefault();
    setFormaGreska('');
    setFormaLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/korisnici`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imePrezime, email, lozinka, uloga }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Neuspešno kreiranje korisnika.');
      }

      setKorisnici((prev) => [data, ...prev]);
      setPrikaziModal(false);
      setImePrezime('');
      setEmail('');
      setLozinka('');
      setUloga('NOVINAR');
    } catch (err: unknown) {
      setFormaGreska(err instanceof Error ? err.message : 'Greška pri kreiranju.');
    } finally {
      setFormaLoading(false);
    }
  };

  const handleObrisi = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovog korisnika?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/korisnici/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Neuspešno brisanje.');

      setKorisnici((prev) => prev.filter((k) => k.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Greška pri brisanju.');
    }
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto text-gray-500">Učitavanje...</div>;
  if (error) return <div className="p-8 max-w-7xl mx-auto text-red-600">{error}</div>;

  return (
    <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Korisnici</h1>
          <p className="text-sm text-gray-500">Pregled i upravljanje registrovanim korisnicima sistema.</p>
        </div>

        {/* 1. DUGME ZA DODAVANJE VIDI SAMO ADMIN */}
        {jeAdmin && (
          <button
            onClick={() => setPrikaziModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            + Novi Korisnik
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Ime i Prezime</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Uloga</th>
                <th className="px-4 py-3">Datum registracije</th>
                <th className="px-4 py-3 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {korisnici.map((korisnik) => {
                const jeLiTrenutni = korisnik.id === trenutniKorisnik.id;
                return (
                  <tr key={korisnik.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">#{korisnik.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {korisnik.imePrezime} {jeLiTrenutni && <span className="text-xs text-gray-400">(Vi)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{korisnik.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          korisnik.uloga === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {korisnik.uloga}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(korisnik.datumKreiranja).toLocaleDateString('sr-RS')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* 2. DUGME ZA BRISANJE VIDI SAMO ADMIN (I TO SAMO ZA DRUGE KORISNIKE) */}
                      {jeAdmin && !jeLiTrenutni ? (
                        <button
                          onClick={() => handleObrisi(korisnik.id)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded text-xs font-medium transition"
                        >
                          Obriši
                        </button>
                      ) : jeLiTrenutni ? (
                        <span className="text-xs text-gray-400 italic">Sopstveni nalog</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ZA DODAVANJE KORISNIKA */}
      {prikaziModal && jeAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Dodaj novog korisnika</h2>

            {formaGreska && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {formaGreska}
              </div>
            )}

            <form onSubmit={handleDodajKorisnika} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Ime i Prezime</label>
                <input
                  type="text"
                  required
                  value={imePrezime}
                  onChange={(e) => setImePrezime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Lozinka</label>
                <input
                  type="password"
                  required
                  value={lozinka}
                  onChange={(e) => setLozinka(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Uloga</label>
                <select
                  value={uloga}
                  onChange={(e) => setUloga(e.target.value as 'ADMIN' | 'NOVINAR')}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NOVINAR">NOVINAR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPrikaziModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 transition"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={formaLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                  {formaLoading ? 'Spremanje...' : 'Sačuvaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}