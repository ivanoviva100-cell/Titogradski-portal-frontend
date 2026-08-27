'use client';

import { API_URL } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { getSveVijesti, getSveKategorije, kreirajVijest, azurirajVijest, obrisiVijest } from '@/lib/api';

interface Kategorija {
  id: number;
  naziv: string;
  slug: string;
}

interface Autor {
  id: number;
  imePrezime: string;
  email: string;
}

interface Vijest {
  id: number;
  naslov: string;
  podnaslov: string;
  sadrzaj: string;
  slug: string;
  slikaUrl: string;
  brojPregleda: number;
  datumKreiranja: string;
  kategorija: Kategorija;
  autor?: Autor | null;
}

export default function VijestiPage() {
  const [vijesti, setVijesti] = useState<Vijest[]>([]);
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [poruka, setPoruka] = useState<{ tekst: string; tip: 'info' | 'success' | 'error' } | null>(null);
  const [pretraga, setPretraga] = useState('');

  // Stanja za Modal, Formu i Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVijestId, setSelectedVijestId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  // Novo stanje za fajl slike i upload status
  const [slikaFajl, setSlikaFajl] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [forma, setForma] = useState({
    naslov: '',
    podnaslov: '',
    sadrzaj: '',
    slug: '',
    slikaUrl: '',
    kategorijaId: '',
  });

  const ucitajPodatke = useCallback(async () => {
    try {
      const [vijestiData, kategorijeData] = await Promise.all([
        getSveVijesti(),
        getSveKategorije(),
      ]);
      setVijesti(vijestiData);
      setKategorije(kategorijeData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Greška pri učitavanju podataka.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      ucitajPodatke();
    });
  }, [ucitajPodatke]);

  // Otvaranje modala za NOVU vijest
  const handleOpenCreateModal = () => {
    setSelectedVijestId(null);
    setForma({ naslov: '', podnaslov: '', sadrzaj: '', slug: '', slikaUrl: '', kategorijaId: '' });
    setSlikaFajl(null);
    setFormError('');
    setIsModalOpen(true);
  };

  // Otvaranje modala za IZMJENU postojeće vijesti
  const handleOpenEditModal = (vijest: Vijest) => {
    setSelectedVijestId(vijest.id);
    setForma({
      naslov: vijest.naslov,
      podnaslov: vijest.podnaslov,
      sadrzaj: vijest.sadrzaj,
      slug: vijest.slug,
      slikaUrl: vijest.slikaUrl,
      kategorijaId: vijest.kategorija ? String(vijest.kategorija.id) : '',
    });
    setSlikaFajl(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNaslovChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const naslovVal = e.target.value;
    
    const generisanSlug = !selectedVijestId
      ? naslovVal
          .toLowerCase()
          .replace(/č/g, 'c')
          .replace(/ć/g, 'c')
          .replace(/š/g, 's')
          .replace(/đ/g, 'dj')
          .replace(/ž/g, 'z')
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      : forma.slug;

    setForma((prev) => ({
      ...prev,
      naslov: naslovVal,
      slug: generisanSlug,
    }));
  };

  // Slanje forme (Create ili Update)
  const handleSačuvajVijest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!forma.kategorijaId) {
      setFormError('Molimo izaberite kategoriju.');
      return;
    }

    try {
      setSubmitting(true);
      let konačniSlikaUrl = forma.slikaUrl;

      // Ako je korisnik izabrao novu sliku sa računara, prvo je uploadujemo na /api/upload
      if (slikaFajl) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('slika', slikaFajl);

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        setUploadingImage(false);

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Greška prilikom uploada slike.');
        }

        konačniSlikaUrl = uploadData.slikaUrl;
      }

      if (!konačniSlikaUrl) {
        setFormError('Slika je obavezna (izaberite fajl ili unesite URL).');
        setSubmitting(false);
        return;
      }

      const korisnikRaw = localStorage.getItem('korisnik');
      const korisnik = korisnikRaw ? JSON.parse(korisnikRaw) : null;

      const payload = {
        naslov: forma.naslov,
        podnaslov: forma.podnaslov,
        sadrzaj: forma.sadrzaj,
        slug: forma.slug,
        slikaUrl: konačniSlikaUrl,
        kategorijaId: Number(forma.kategorijaId),
        autorId: korisnik?.id,
      };

      if (selectedVijestId) {
        await azurirajVijest(selectedVijestId, payload);
      } else {
        await kreirajVijest(payload);
      }

      setIsModalOpen(false);
      setLoading(true);
      ucitajPodatke();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Greška prilikom čuvanja vijesti.');
      }
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleObrisi = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovu vijest?')) return;

    setDeletingId(id);
    setPoruka(null);

    try {
      const res = await obrisiVijest(id);
      const porukaTekst = res?.message || 'Akcija je uspješno izvršena.';
      
      if (porukaTekst.includes('obrisana')) {
        setVijesti((prev) => prev.filter((v) => v.id !== id));
        setPoruka({ tekst: porukaTekst, tip: 'success' });
      } else {
        setPoruka({ tekst: porukaTekst, tip: 'info' });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPoruka({ tekst: err.message, tip: 'error' });
      } else {
        setPoruka({ tekst: 'Došlo je do greške pri brisanju.', tip: 'error' });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filtriraneVijesti = vijesti.filter((v) =>
    v.naslov.toLowerCase().includes(pretraga.toLowerCase())
  );

  return (
    <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vijesti i Članci</h1>
          <p className="text-sm text-gray-500">Upravljanje svim objavljenim i pripremljenim tekstovima.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + Dodaj novu vijest
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      {poruka && (
        <div
          className={`p-4 rounded-lg text-sm border flex justify-between items-center ${
            poruka.tip === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : poruka.tip === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{poruka.tekst}</span>
          <button
            onClick={() => setPoruka(null)}
            className="text-xs font-bold ml-4 hover:opacity-7 shadow-none"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={pretraga}
            onChange={(e) => setPretraga(e.target.value)}
            placeholder="Pretraži vijesti po naslovu..."
            className="px-3 py-2 border rounded-md text-sm w-full max-w-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-gray-500 text-sm py-4">Učitavanje vijesti iz baze...</p>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Naslov</th>
                  <th className="px-4 py-3">Kategorija</th>
                  <th className="px-4 py-3">Autor</th>
                  <th className="px-4 py-3">Pregledi</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtriraneVijesti.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-md truncate">{v.naslov}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">
                        {v.kategorija?.naziv || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{v.autor?.imePrezime || 'Nepoznato'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {v.brojPregleda ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(v.datumKreiranja).toLocaleDateString('sr-ME')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => handleOpenEditModal(v)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Uredi
                      </button>
                      <button
                        onClick={() => handleObrisi(v.id)}
                        disabled={deletingId === v.id}
                        className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                      >
                        {deletingId === v.id ? 'Obrada...' : 'Obriši'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtriraneVijesti.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Nije pronađena nijedna vijest.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL ZA DODAVANJE / IZMJENU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedVijestId ? 'Uredi vijest' : 'Nova vijest'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSačuvajVijest} className="space-y-4 text-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Naslov *</label>
                  <input
                    type="text"
                    required
                    value={forma.naslov}
                    onChange={handleNaslovChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Unesite naslov vijesti"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slug (URL)*</label>
                  <input
                    type="text"
                    required
                    value={forma.slug}
                    onChange={(e) => setForma({ ...forma, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Podnaslov *</label>
                <input
                  type="text"
                  required
                  value={forma.podnaslov}
                  onChange={(e) => setForma({ ...forma, podnaslov: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kratki sažetak vijesti"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kategorija *</label>
                  <select
                    required
                    value={forma.kategorijaId}
                    onChange={(e) => setForma({ ...forma, kategorijaId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Izaberite kategoriju</option>
                    {kategorije.map((kat) => (
                      <option key={kat.id} value={kat.id}>
                        {kat.naziv}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slika (Upload fajla) *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSlikaFajl(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {forma.slikaUrl && !slikaFajl && (
                    <p className="text-xs text-gray-500 mt-1">Trenutna slika je sačuvana. Izaberite novu samo ako želite da je promijenite.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sadržaj *</label>
                <textarea
                  required
                  rows={5}
                  value={forma.sadrzaj}
                  onChange={(e) => setForma({ ...forma, sadrzaj: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Unesite kompletan tekst vijesti..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {uploadingImage
                    ? 'Uploadovanje i optimizacija slika...'
                    : submitting
                    ? 'Sačuvanje...'
                    : selectedVijestId
                    ? 'Sačuvaj izmjene'
                    : 'Objavi vijest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}