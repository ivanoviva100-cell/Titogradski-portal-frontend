'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect } from 'react';

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

  if (loading) return <div className="p-8 max-w-7xl mx-auto text-gray-500">Učitavanje komentara...</div>;
  if (error) return <div className="p-8 max-w-7xl mx-auto text-red-600">{error}</div>;

  return (
    <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Komentari</h1>
        <p className="text-sm text-gray-500">Pregled i moderacija komentara posjetilaca.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
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
            <tbody className="divide-y divide-gray-200">
              {komentari.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    Nema unesenih komentara.
                  </td>
                </tr>
              ) : (
                komentari.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{k.autorIme}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs wrap-break-word">{k.sadrzaj}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {k.vijest?.naslov || `Vijest #${k.vijestId}`}
                    </td>
                    <td className="px-4 py-3">
                      {k.odobren ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                          ✓ Odobreno
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-medium">
                          ⏳ Na čekanju
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {!k.odobren && (
                        <button
                          onClick={() => handleOdobri(k.id)}
                          className="bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium transition"
                        >
                          Odobri
                        </button>
                      )}
                      <button
                        onClick={() => handleObrisi(k.id)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium transition"
                      >
                        Obriši
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}