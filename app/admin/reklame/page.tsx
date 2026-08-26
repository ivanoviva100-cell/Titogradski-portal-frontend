'use client';
import { apiFetch } from '../../../lib/api';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Reklama {
  id: number;
  naziv: string;
  pozicija: string;
  slikaUrl: string;
  linkUrl: string;
  aktivna: boolean;
}

export default function AdminReklamePage() {
  const [reklame, setReklame] = useState<Reklama[]>([]);
  const [naziv, setNaziv] = useState('');
  const [pozicija, setPozicija] = useState('banner-top');
  const [slikaUrl, setSlikaUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [aktivna, setAktivna] = useState(true);
  
  const [editId, setEditId] = useState<number | null>(null);
  const [poruka, setPoruka] = useState('');

  const fetchReklame = async () => {
    try {
      const data = await apiFetch('/reklame');
      setReklame(data || []);
    } catch (error) {
      console.error('Greška pri dohvatanju reklama:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReklame();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naziv || !slikaUrl) {
      setPoruka('Molimo popunite obavezna polja.');
      return;
    }

    try {
      if (editId !== null) {
        await apiFetch(`/reklame/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ naziv, pozicija, slikaUrl, linkUrl, aktivna }),
        });
        setPoruka('Reklama je uspješno izmijenjena!');
      } else {
        await apiFetch('/reklame', {
          method: 'POST',
          body: JSON.stringify({ naziv, pozicija, slikaUrl, linkUrl, aktivna }),
        });
        setPoruka('Nova reklama je uspješno dodana!');
      }

      await fetchReklame();

      setNaziv('');
      setPozicija('banner-top');
      setSlikaUrl('');
      setLinkUrl('');
      setAktivna(true);
      setEditId(null);
    } catch (error: unknown) {
      console.error('Greška pri čuvanju reklame:', error);
      const errorMessage = error instanceof Error ? error.message : 'Došlo je do greške.';
      setPoruka(errorMessage);
    }

    setTimeout(() => setPoruka(''), 3000);
  };

  const handleEdit = (reklama: Reklama) => {
    setEditId(reklama.id);
    setNaziv(reklama.naziv);
    setPozicija(reklama.pozicija);
    setSlikaUrl(reklama.slikaUrl);
    setLinkUrl(reklama.linkUrl || '');
    setAktivna(reklama.aktivna);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovu reklamu?')) {
      try {
        await apiFetch(`/reklame/${id}`, {
          method: 'DELETE',
        });

        setPoruka('Reklama je obrisana.');
        await fetchReklame();
      } catch (error: unknown) {
        console.error('Greška pri brisanju reklame:', error);
        const errorMessage = error instanceof Error ? error.message : 'Došlo je do greške.';
        setPoruka(errorMessage);
      }
      setTimeout(() => setPoruka(''), 3000);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Upravljanje reklamama</h1>
        <p className="text-sm text-slate-400">Kreirajte, mijenjajte i kontrolišite oglasne pozicije na portalu.</p>
        <p className="text-sm text-slate-400">
          <table>
            <tr>
            <td>top-banner:</td><td>728/90px</td>
            </tr>
            <tr>
             <td>middle-banner:</td><td>728/90px</td>
             </tr>
             <tr>
              <td>sidebar:</td><td>300/250px</td>
            </tr>
          </table>
        </p>
      </div>

      {poruka && (
        <div className="mb-6 p-4 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm">
          {poruka}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-white">
            {editId !== null ? 'Izmjeni reklamu' : 'Dodaj novu reklamu'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Naziv reklame *</label>
              <input
                type="text"
                value={naziv}
                onChange={(e) => setNaziv(e.target.value)}
                placeholder="npr. Ljetnja kampanja baner"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Oglasna pozicija</label>
              <select
                value={pozicija}
                onChange={(e) => setPozicija(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
              >
                <option value="banner-top">Glavna reklama (Glavni baner gore)</option>
                <option value="sidebar">Sidebar (Bočni baner)</option>
                <option value="banner-middle">Srednja reklama (Banner middle)</option>
                <option value="footer">Footer (Dno stranice)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">URL slike banera *</label>
              <input
                type="url"
                value={slikaUrl}
                onChange={(e) => setSlikaUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Odredišni URL (Link)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://sajt-oglašivača.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="aktivna"
                checked={aktivna}
                onChange={(e) => setAktivna(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <label htmlFor="aktivna" className="text-sm text-slate-300">Reklama je aktivna</label>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
              >
                {editId !== null ? 'Sačuvaj izmjene' : 'Dodaj reklamu'}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setNaziv('');
                    setSlikaUrl('');
                    setLinkUrl('');
                    setAktivna(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Otkaži
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Postojeće reklame</h2>
            <span className="text-xs text-slate-400">Ukupno: {reklame.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                  <th className="p-4">Naziv / Pozicija</th>
                  <th className="p-4">Pregled</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {reklame.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">Nema kreiranih reklama.</td>
                  </tr>
                ) : (
                  reklame.map((reklama) => (
                    <tr key={reklama.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-white">{reklama.naziv}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-blue-400 uppercase tracking-wider">
                          {reklama.pozicija}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-24 h-12 bg-slate-950 border border-slate-800 rounded overflow-hidden relative flex items-center justify-center">
                          {reklama.slikaUrl ? (
                            <Image 
                              src={reklama.slikaUrl} 
                              alt={reklama.naziv} 
                              fill
                              sizes="96px"
                              className="object-cover" 
                            />
                          ) : (
                            <span className="text-[10px] text-slate-600">Nema slike</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          reklama.aktivna ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${reklama.aktivna ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          {reklama.aktivna ? 'Aktivna'  : 'Pauzirana'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(reklama)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(reklama.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
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
      </div>
    </div>
  );
}