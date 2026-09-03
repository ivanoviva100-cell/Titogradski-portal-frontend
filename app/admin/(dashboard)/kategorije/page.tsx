'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface Kategorija {
  id: number;
  naziv: string;
  slug: string;
}

export default function KategorijePage() {
  const router = useRouter();

  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [naziv, setNaziv] = useState('');
  const [slug, setSlug] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [poruka, setPoruka] = useState('');
  const [greska, setGreska] = useState('');
  const [loading, setLoading] = useState(true);

  // Funkcija za automatsko čišćenje i generisanje slug-a
  const generisiSlug = (input: string) => {
    return input
      .toLowerCase()
      .replace(/č/g, 'c')
      .replace(/ć/g, 'c')
      .replace(/š/g, 's')
      .replace(/đ/g, 'dj')
      .replace(/ž/g, 'z')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNazivChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNaziv(val);
    if (!editingId) {
      setSlug(generisiSlug(val));
    }
  };

  const ucitajKategorije = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/kategorije`);
      if (res.ok) {
        const data = await res.json();
        setKategorije(data);
      } else {
        setGreska('Neuspješno preuzimanje kategorija.');
      }
    } catch (err) {
      console.error('Greška pri učitavanju kategorija:', err);
      setGreska('Greška pri komunikaciji sa serverom.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Upravljanje Kategorijama - Admin';

    const token = localStorage.getItem('token');
    const sačuvaniKorisnik = localStorage.getItem('korisnik');
    
    if (!token || !sačuvaniKorisnik) {
      router.push('/admin/login');
      return;
    }

    try {
      const korisnik = JSON.parse(sačuvaniKorisnik);
      if (korisnik.uloga !== 'ADMIN') {
        router.push('/admin/dashboard'); 
        return;
      }
    } catch {
      router.push('/admin/login');
      return;
    }

    queueMicrotask(() => {
      ucitajKategorije();
    });
  }, [router, ucitajKategorije]);

  const handleSacuvajKategoriju = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoruka('');
    setGreska('');

    const token = localStorage.getItem('token');
    const url = editingId
      ? `${API_URL}/kategorije/${editingId}`
      : `${API_URL}/kategorije`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ naziv, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.message || data.error || 'Greška pri čuvanju kategorije.');
        return;
      }

      setPoruka(
        editingId
          ? `Kategorija "${data.naziv}" uspješno izmijenjena!`
          : `Kategorija "${data.naziv}" uspješno dodana!`
      );
      
      handleOtkaziEdit();
      ucitajKategorije();
    } catch {
      setGreska('Greška pri komunikaciji sa serverom.');
    }
  };

  const handleZapocniEdit = (kat: Kategorija) => {
    setEditingId(kat.id);
    setNaziv(kat.naziv);
    setSlug(kat.slug);
    setPoruka('');
    setGreska('');
  };

  const handleOtkaziEdit = () => {
    setEditingId(null);
    setNaziv('');
    setSlug('');
  };

  const handleObrisiKategoriju = async (id: number, nazivKategorije: string) => {
    const potvrdjeno = window.confirm(
      `Da li ste sigurni da želite obrisati kategoriju "${nazivKategorije}"?\n\nUPOZORENJE: Sve vijesti koje pripadaju ovoj kategoriji biće takođe trajno obrisane!`
    );

    if (!potvrdjeno) return;

    setPoruka('');
    setGreska('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/kategorije/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setGreska(data.error || 'Greška pri brisanju kategorije.');
        return;
      }

      setPoruka(`Kategorija "${nazivKategorije}" je obrisana.`);
      
      if (editingId === id) {
        handleOtkaziEdit();
      }
      
      ucitajKategorije();
    } catch {
      setGreska('Greška pri komunikaciji sa serverom.');
    }
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* SEKCIJA ZA FORMU */}
      <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          {editingId ? 'Izmijeni kategoriju' : 'Dodaj novu kategoriju'}
        </h2>

        {poruka && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {poruka}
          </div>
        )}

        {greska && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {greska}
          </div>
        )}

        <form onSubmit={handleSacuvajKategoriju} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Naziv kategorije</label>
              <input
                type="text"
                value={naziv}
                onChange={handleNazivChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                placeholder="npr. Politika"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black bg-gray-50"
                placeholder="npr. politika"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition shadow-sm"
            >
              {editingId ? 'Sačuvaj izmjene' : 'Sačuvaj kategoriju'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleOtkaziEdit}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg text-sm transition"
              >
                Otkaži
              </button>
            )}
          </div>
        </form>
      </section>

      {/* SEKCIJA ZA PRIKAZ */}
      <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Postojeće kategorije ({kategorije.length})
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm py-4 text-center">Učitavanje kategorija...</p>
        ) : kategorije.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">Trenutno nema unesenih kategorija.</p>
        ) : (
          <>
            {/* MOBILNI PRIKAZ (Kartice - dugmad ispod naziva i sluga) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {kategorije.map((kat) => (
                <div key={kat.id} className="border border-gray-200 rounded-lg p-3.5 bg-white space-y-2.5 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-400">ID: {kat.id}</span>
                      <h3 className="text-gray-900 font-semibold text-sm">{kat.naziv}</h3>
                      <p className="text-gray-500 font-mono text-xs">/{kat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleZapocniEdit(kat)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs px-3 py-1.5 rounded-md transition font-medium flex-1 text-center"
                    >
                      Uredi
                    </button>
                    <button
                      onClick={() => handleObrisiKategoriju(kat.id, kat.naziv)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-md transition font-medium flex-1 text-center"
                    >
                      Obriši
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP PRIKAZ (Tabela) */}
            <div className="hidden md:block w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 w-16">ID</th>
                    <th className="px-4 py-3">Naziv</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {kategorije.map((kat) => (
                    <tr key={kat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{kat.id}</td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">{kat.naziv}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">/{kat.slug}</td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleZapocniEdit(kat)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs px-3 py-1.5 rounded-md transition font-medium"
                        >
                          Uredi
                        </button>
                        <button
                          onClick={() => handleObrisiKategoriju(kat.id, kat.naziv)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-md transition font-medium"
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
      </section>
    </main>
  );
}