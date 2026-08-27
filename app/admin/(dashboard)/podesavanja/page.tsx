'use client';
import { API_URL } from '@/lib/api';

import { useState, useEffect, FormEvent } from 'react';

export default function PodesavanjaPage() {
  const [nazivPortala, setNazivPortala] = useState('');
  const [opisPortala, setOpisPortala] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uspehPoruka, setUspehPoruka] = useState('');

  useEffect(() => {
    const ucitajPodesavanja = async () => {
      try {
        const res = await fetch(`${API_URL}/podesavanja`);
        if (!res.ok) throw new Error('Neuspješno učitavanje podešavanja.');

        const data = await res.json();
        setNazivPortala(data.nazivPortala || '');
        setOpisPortala(data.opisPortala || '');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Greška pri učitavanju.');
        }
      } finally {
        setLoading(false);
      }
    };

    ucitajPodesavanja();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setUspehPoruka('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/podesavanja`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nazivPortala, opisPortala }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Neuspješno čuvanje podešavanja.');
      }

      setUspehPoruka('Podešavanja su uspješno sačuvana!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Greška prilikom čuvanja.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 max-w-4xl mx-auto text-gray-500">Učitavanje podešavanja...</div>;

  return (
    <main className="p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Podešavanja Portala</h1>
        <p className="text-sm text-gray-500">Osnovne postavke naziva portala, opisa i SEO parametara.</p>
      </div>

      {uspehPoruka && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
          {uspehPoruka}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Naziv Portala</label>
          <input
            type="text"
            value={nazivPortala}
            onChange={(e) => setNazivPortala(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opis Portala (SEO)</label>
          <textarea
            rows={3}
            value={opisPortala}
            onChange={(e) => setOpisPortala(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          {saving ? 'Čuvanje...' : 'Sačuvaj izmjene'}
        </button>
      </form>
    </main>
  );
}