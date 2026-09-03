'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface Komentar {
  id: number;
  autorIme: string;
  sadrzaj: string;
  odobren: boolean;
  datumKreiranja: string;
  vijestId: number;
  vijest?: {
    naslov: string;
  };
}

export default function KomentariPage() {
  const [komentari, setKomentari] = useState<Komentar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKomentari = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/komentari`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Greška ${res.status}: Neuspešno dohvaćanje.`);
        }

        const data = await res.json();
        setKomentari(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Greška na mreži.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchKomentari();
  }, []);

  const handleOdobri = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/komentari/${id}/odobri`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Neuspješno odobravanje komentara.');

      setKomentari((prev) =>
        prev.map((k) => (k.id === id ? { ...k, odobren: true } : k))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Greška pri odobravanju.';
      alert(msg);
    }
  };

  const handleObrisi = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj komentar?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/komentari/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Neuspješno brisanje komentara.');

      setKomentari((prev) => prev.filter((k) => k.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Greška pri brisanju.';
      alert(msg);
    }
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto text-gray-500 text-sm">Učitavanje komentara...</div>;
  if (error) return <div className="p-8 max-w-7xl mx-auto text-red-600 text-sm">{error}</div>;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Komentari</h1>
        <p className="text-xs sm:text-sm text-gray-500">Pregled i moderacija komentara posjetilaca.</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
        {komentari.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">Nema unesenih komentara.</p>
        ) : (
          <>
            {/* MOBILNI PRIKAZ (Kartice - dugmad ispod sadržaja) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {komentari.map((k) => (
                <div key={k.id} className="border border-gray-200 rounded-lg p-4 bg-white space-y-3 shadow-xs">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm block">{k.autorIme}</span>
                      <span className="text-xs text-gray-400">Za vijest: {k.vijest?.naslov || `Vijest #${k.vijestId}`}</span>
                    </div>
                    <div>
                      {k.odobren ? (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-medium inline-block">
                          ✓ Odobreno
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-medium inline-block">
                          ⏳ Na čekanju
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm break-words bg-gray-50 p-2.5 rounded-md border border-gray-100">
                    {k.sadrzaj}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {!k.odobren && (
                      <button
                        onClick={() => handleOdobri(k.id)}
                        className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-xs font-medium transition flex-1 text-center"
                      >
                        Odobri
                      </button>
                    )}
                    <button
                      onClick={() => handleObrisi(k.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium transition flex-1 text-center"
                    >
                      Obriši
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP PRIKAZ (Tabela) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Autor</th>
                    <th className="px-4 py-3">Komentar</th>
                    <th className="px-4 py-3">Na vijest</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {komentari.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 align-top">{k.autorIme}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs break-words align-top">{k.sadrzaj}</td>
                      <td className="px-4 py-3 text-gray-500 align-top">
                        {k.vijest?.naslov || `Vijest #${k.vijestId}`}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {k.odobren ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium inline-block">
                            ✓ Odobreno
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-medium inline-block">
                            ⏳ Na čekanju
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 align-top whitespace-nowrap">
                        {!k.odobren && (
                          <button
                            onClick={() => handleOdobri(k.id)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded text-xs font-medium transition"
                          >
                            Odobri
                          </button>
                        )}
                        <button
                          onClick={() => handleObrisi(k.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs font-medium transition"
                        >
                          Obriši
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}