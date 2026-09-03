'use client';

import { useState, useEffect, FormEvent } from 'react';
import { API_URL } from '@/lib/api';

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

  // Stanje za Modal (Dodavanje)
  const [prikaziModal, setPrikaziModal] = useState(false);
  const [imePrezime, setImePrezime] = useState('');
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [uloga, setUloga] = useState<'ADMIN' | 'NOVINAR'>('NOVINAR');
  const [formaGreska, setFormaGreska] = useState('');
  const [formaLoading, setFormaLoading] = useState(false);

  // Stanje za Modal (Uređivanje postojećeg korisnika / Pseudonim)
  const [urediKorisnika, setUrediKorisnika] = useState<Korisnik | null>(null);
  const [urediImePrezime, setUrediImePrezime] = useState('');
  const [urediUloga, setUrediUloga] = useState<'ADMIN' | 'NOVINAR'>('NOVINAR');
  const [urediLoading, setUrediLoading] = useState(false);

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
      if (!res.ok) throw new Error(data.error || 'Neuspešno kreiranje korisnika.');

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

  const otvoriUredjivanje = (korisnik: Korisnik) => {
    setUrediKorisnika(korisnik);
    setUrediImePrezime(korisnik.imePrezime);
    setUrediUloga(korisnik.uloga as 'ADMIN' | 'NOVINAR');
  };

  const handleAzurirajKorisnika = async (e: FormEvent) => {
    e.preventDefault();
    if (!urediKorisnika) return;
    setUrediLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/korisnici/${urediKorisnika.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imePrezime: urediImePrezime, uloga: urediUloga }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Neuspešno ažuriranje.');

      setKorisnici((prev) => prev.map((k) => (k.id === data.id ? data : k)));
      setUrediKorisnika(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Greška pri ažuriranju.');
    } finally {
      setUrediLoading(false);
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

  if (loading) return <div className="p-8 max-w-7xl mx-auto text-gray-500 text-sm">Učitavanje...</div>;
  if (error) return <div className="p-8 max-w-7xl mx-auto text-red-600 text-sm">{error}</div>;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Korisnici</h1>
          <p className="text-xs sm:text-sm text-gray-500">Pregled i upravljanje registrovanim korisnicima sistema.</p>
        </div>

        {jeAdmin && (
          <button
            onClick={() => setPrikaziModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition self-start sm:self-auto"
          >
            + Novi Korisnik
          </button>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
        {korisnici.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">Nema registrovanih korisnika.</p>
        ) : (
          <>
            {/* MOBILNI PRIKAZ (Kartice) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {korisnici.map((korisnik) => {
                const jeLiTrenutni = korisnik.id === trenutniKorisnik.id;
                return (
                  <div key={korisnik.id} className="border border-gray-200 rounded-lg p-4 bg-white space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-xs text-gray-400 block">#{korisnik.id}</span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {korisnik.imePrezime} {jeLiTrenutni && <span className="text-xs text-gray-400">(Vi)</span>}
                        </span>
                        <span className="text-xs text-gray-500 block">{korisnik.email}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          korisnik.uloga === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {korisnik.uloga}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 pt-1 border-t border-gray-100 flex justify-between items-center">
                      <span>Registracija: {new Date(korisnik.datumKreiranja).toLocaleDateString('sr-RS')}</span>
                    </div>

                    {jeAdmin ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => otvoriUredjivanje(korisnik)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition flex-1 text-center"
                        >
                          Uredi
                        </button>
                        {!jeLiTrenutni && (
                          <button
                            onClick={() => handleObrisi(korisnik.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium transition flex-1 text-center"
                          >
                            Obriši
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* DESKTOP PRIKAZ (Tabela) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Ime / Pseudonim</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Uloga</th>
                    <th className="px-4 py-3">Datum registracije</th>
                    <th className="px-4 py-3 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
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
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-block ${
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
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          {jeAdmin ? (
                            <>
                              <button
                                onClick={() => otvoriUredjivanje(korisnik)}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-medium transition"
                              >
                                Uredi
                              </button>
                              {!jeLiTrenutni && (
                                <button
                                  onClick={() => handleObrisi(korisnik.id)}
                                  className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-medium transition"
                                >
                                  Obriši
                                </button>
                              )}
                            </>
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
          </>
        )}
      </div>

      {/* MODAL ZA DODAVANJE KORISNIKA */}
      {prikaziModal && jeAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Dodaj novog korisnika</h2>

            {formaGreska && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                {formaGreska}
              </div>
            )}

            <form onSubmit={handleDodajKorisnika} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Ime i Prezime (ili Nik/Pseudonim)</label>
                <input
                  type="text"
                  required
                  value={imePrezime}
                  onChange={(e) => setImePrezime(e.target.value)}
                  placeholder="Npr. Petar Petrović ili Anonimni Novinar"
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Lozinka</label>
                <input
                  type="password"
                  required
                  value={lozinka}
                  onChange={(e) => setLozinka(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Uloga</label>
                <select
                  value={uloga}
                  onChange={(e) => setUloga(e.target.value as 'ADMIN' | 'NOVINAR')}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="NOVINAR">NOVINAR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPrikaziModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 transition text-sm"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={formaLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition text-sm"
                >
                  {formaLoading ? 'Spremanje...' : 'Sačuvaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ZA UREĐIVANJE IMENA / NIKA KORISNIKA */}
      {urediKorisnika && jeAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Uredi podatke korisnika</h2>
            <p className="text-xs text-gray-500">Možete izmijeniti ime i prezime ili unijeti nik/pseudonim za anonimnost.</p>

            <form onSubmit={handleAzurirajKorisnika} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Ime i Prezime / Pseudonim</label>
                <input
                  type="text"
                  required
                  value={urediImePrezime}
                  onChange={(e) => setUrediImePrezime(e.target.value)}
                  placeholder="Unesite pravo ime ili nik (npr. Redakcija)"
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Uloga</label>
                <select
                  value={urediUloga}
                  onChange={(e) => setUrediUloga(e.target.value as 'ADMIN' | 'NOVINAR')}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="NOVINAR">NOVINAR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUrediKorisnika(null)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 transition text-sm"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={urediLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition text-sm"
                >
                  {urediLoading ? 'Ažuriranje...' : 'Sačuvaj izmjene'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}