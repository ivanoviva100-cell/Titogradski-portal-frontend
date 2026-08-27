'use client';

import { API_URL } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

interface Zahtjev {
  id: number;
  podnosilac?: {
    id: number;
    imePrezime: string;
    email: string;
  };
  vijest?: {
    id: number;
    naslov: string;
  };
  razlog?: string;
  datumKreiranja: string;
}

interface ZahtjeviModalProps {
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ZahtjeviModal({ onClose, onRefresh }: ZahtjeviModalProps) {
  const [zahtjevi, setZahtjevi] = useState<Zahtjev[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const ucitajZahtjeve = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setError('Niste prijavljeni.');
        setLoading(false);
        return;
      }

      // Ispravljena ruta prema app.ts
      const res = await fetch(`${API_URL}/admin/zahtjevi-za-brisanje`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Greška pri dohvaćanju zahtjeva za brisanje.');
      }

      const data = await res.json();
      setZahtjevi(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Došlo je do nepoznate greške.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      ucitajZahtjeve();
    });
  }, [ucitajZahtjeve]);

  // Obrada odluke (Prihvatanje ili Odbijanje preko jedinstvene backend rute)
  const handleOdluka = async (id: number, prihvaceno: boolean) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      // Ispravljena ruta prema app.ts (/admin/zahtjevi-za-brisanje/:id/odluka)
      const res = await fetch(`${API_URL}/admin/zahtjevi-za-brisanje/${id}/odluka`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prihvaceno }),
      });

      if (!res.ok) {
        throw new Error('Greška pri obradi odluke.');
      }

      // Ukloni iz lokalnog stanja
      setZahtjevi((prev) => prev.filter((z) => z.id !== id));
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Greška pri obradi zahtjeva.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-gray-900">
            Zahtjevi za brisanje vijesti
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm py-4 text-center">Učitavanje zahtjeva...</p>
        ) : zahtjevi.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            Trenutno nema aktivnih zahtjeva za brisanje.
          </p>
        ) : (
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {zahtjevi.map((z) => (
              <div key={z.id} className="py-3 flex justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {z.vijest?.naslov || 'Nepoznata vijest'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Podnosilac: {z.podnosilac?.imePrezime || 'Nepoznat'} •{' '}
                    {new Date(z.datumKreiranja).toLocaleDateString('sr-ME')}
                  </p>
                  {z.razlog && (
                    <p className="text-xs text-slate-600 mt-1">Razlog: {z.razlog}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleOdluka(z.id, true)}
                    disabled={processingId === z.id}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition disabled:opacity-50"
                  >
                    Odobri brisanje
                  </button>
                  <button
                    onClick={() => handleOdluka(z.id, false)}
                    disabled={processingId === z.id}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-medium transition disabled:opacity-50"
                  >
                    Odbij
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}