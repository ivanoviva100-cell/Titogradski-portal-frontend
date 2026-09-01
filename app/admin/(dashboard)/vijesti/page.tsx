'use client';

import { API_URL } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  slikaOpis?: string | null;
  fotoGalerija?: string[];
  brojPregleda: number;
  datumKreiranja: string;
  pozicijaHero: string;
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

  // Stanja za fajlove slika i upload status
  const [slikaFajl, setSlikaFajl] = useState<File | null>(null);
  const [galerijaFajlovi, setGalerijaFajlovi] = useState<File[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [forma, setForma] = useState({
    naslov: '',
    podnaslov: '',
    sadrzaj: '',
    slug: '',
    slikaUrl: '',
    slikaOpis: '',
    fotoGalerija: [] as string[],
    kategorijaId: '',
    pozicijaHero: 'STANDARDNA',
  });

  // Helper funkcija za spajanje API_URL-a i relativne putanje slike iz baze
  const getPunaSlikaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${API_URL}${url}`;
  };

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
    setForma({
      naslov: '',
      podnaslov: '',
      sadrzaj: '',
      slug: '',
      slikaUrl: '',
      slikaOpis: '',
      fotoGalerija: [],
      kategorijaId: '',
      pozicijaHero: 'STANDARDNA',
    });
    setSlikaFajl(null);
    setGalerijaFajlovi([]);
    setFormError('');
    setIsModalOpen(true);
  };

  // Otvaranje modala za IZMJENU postojeće vijesti
  const handleOpenEditModal = (vijest: Vijest) => {
    const postojecaGalerija = Array.isArray(vijest.fotoGalerija)
      ? vijest.fotoGalerija
      : [];

    setSelectedVijestId(vijest.id);
    setForma({
      naslov: vijest.naslov,
      podnaslov: vijest.podnaslov,
      sadrzaj: vijest.sadrzaj,
      slug: vijest.slug,
      slikaUrl: vijest.slikaUrl,
      slikaOpis: vijest.slikaOpis || '',
      fotoGalerija: postojecaGalerija,
      kategorijaId: vijest.kategorija ? String(vijest.kategorija.id) : '',
      pozicijaHero: vijest.pozicijaHero || 'STANDARDNA',
    });
    setSlikaFajl(null);
    setGalerijaFajlovi([]);
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

      // 1. Upload glavne slike ako je izabrana nova
      if (slikaFajl) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('slika', slikaFajl);

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Greška prilikom uploada glavne slike.');
        }

        konačniSlikaUrl = uploadData.slikaUrl;
      }

      if (!konačniSlikaUrl) {
        setFormError('Slika je obavezna (izaberite fajl ili unesite URL).');
        setSubmitting(false);
        setUploadingImage(false);
        return;
      }

      // 2. Upload dodatnih slika za foto galeriju (ako postoje novi fajlovi)
      const konacnaGalerija = [...forma.fotoGalerija];
      if (galerijaFajlovi.length > 0) {
        setUploadingImage(true);
        for (const fajl of galerijaFajlovi) {
          const formData = new FormData();
          formData.append('slika', fajl);

          const uploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.slikaUrl) {
            konacnaGalerija.push(uploadData.slikaUrl);
          }
        }
      }

      setUploadingImage(false);

      const korisnikRaw = localStorage.getItem('korisnik');
      const korisnik = korisnikRaw ? JSON.parse(korisnikRaw) : null;

      const payload = {
        naslov: forma.naslov,
        podnaslov: forma.podnaslov,
        sadrzaj: forma.sadrzaj,
        slug: forma.slug,
        slikaUrl: konačniSlikaUrl,
        slikaOpis: forma.slikaOpis.trim() !== '' ? forma.slikaOpis : null,
        fotoGalerija: konacnaGalerija,
        kategorijaId: Number(forma.kategorijaId),
        pozicijaHero: forma.pozicijaHero,
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

  // Brza izmjena pozicije vijesti direktno iz tabele
const handlePromijeniPoziciju = async (id: number, novaPozicija: string) => {
  setPoruka(null);
  try {
    // Ažuriramo samo poziciju hero, a ostale podatke zadržavamo
    const vijestZaIzmjenu = vijesti.find((v) => v.id === id);
    if (!vijestZaIzmjenu) return;

    const payload = {
      naslov: vijestZaIzmjenu.naslov,
      podnaslov: vijestZaIzmjenu.podnaslov,
      sadrzaj: vijestZaIzmjenu.sadrzaj,
      slug: vijestZaIzmjenu.slug,
      slikaUrl: vijestZaIzmjenu.slikaUrl,
      slikaOpis: vijestZaIzmjenu.slikaOpis,
      fotoGalerija: vijestZaIzmjenu.fotoGalerija || [],
      kategorijaId: vijestZaIzmjenu.kategorija.id,
      pozicijaHero: novaPozicija,
      autorId: vijestZaIzmjenu.autor?.id,
    };

    await azurirajVijest(id, payload);

    // Lokalno ažuriranje state-a da se odmah vidi promjena
    setVijesti((prev) =>
      prev.map((v) => (v.id === id ? { ...v, pozicijaHero: novaPozicija } : v))
    );
    setPoruka({ tekst: 'Pozicija vijesti je uspješno ažurirana.', tip: 'success' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      setPoruka({ tekst: err.message, tip: 'error' });
    } else {
      setPoruka({ tekst: 'Došlo je do greške pri izmjeni pozicije.', tip: 'error' });
    }
  }
};

  const handleObrisi = async (id: number) => {
    const korisnikRaw = localStorage.getItem('korisnik');
    const korisnik = korisnikRaw ? JSON.parse(korisnikRaw) : null;
    const isAdmin = korisnik?.uloga === 'ADMIN';

    if (isAdmin) {
      if (!confirm('Da li ste sigurni da želite da trajno obrišete ovu vijest?')) return;

      setDeletingId(id);
      setPoruka(null);

      try {
        await obrisiVijest(id); // Direktno brisanje iz API-ja
        setVijesti((prev) => prev.filter((v) => v.id !== id));
        setPoruka({ tekst: 'Vijest je uspješno obrisana.', tip: 'success' });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setPoruka({ tekst: err.message, tip: 'error' });
        } else {
          setPoruka({ tekst: 'Došlo je do greške pri brisanju vijesti.', tip: 'error' });
        }
      } finally {
        setDeletingId(null);
      }
      return;
    }

    // 2. AKO JE NOVINAR: Šalje zahtjev administratoru na odobrenje
    const razlogUnos = prompt('Unesite razlog za brisanje ove vijesti (opcionalno):', 'Zastarjelo / Greška u tekstu');
    if (razlogUnos === null) return;

    setDeletingId(id);
    setPoruka(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/zahtjevi-za-brisanje`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          vijestId: id, 
          razlog: razlogUnos || 'Nema navedenog razloga' 
        })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server nije vratio JSON (Status: ${res.status}). Provjerite API putanju.`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Greška prilikom slanja zahtjeva za brisanje.');
      }

      setPoruka({ 
        tekst: 'Zahtjev za brisanje je uspješno poslat administratoru na odobrenje.', 
        tip: 'success' 
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPoruka({ tekst: err.message, tip: 'error' });
      } else {
        setPoruka({ tekst: 'Došlo je do greške pri slanju zahtjeva.', tip: 'error' });
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
      <th className="px-4 py-3">Slika</th>
      <th className="px-4 py-3">Naslov</th>
      <th className="px-4 py-3">Kategorija</th>
      <th className="px-4 py-3">Pozicija</th>
      <th className="px-4 py-3">Autor</th>
      <th className="px-4 py-3">Pregledi</th>
      <th className="px-4 py-3">Datum</th>
      <th className="px-4 py-3 text-right">Akcije</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    {filtriraneVijesti.map((v) => (
      <tr key={v.id} className="hover:bg-gray-50">
        <td className="px-4 py-3">
          {v.slikaUrl ? (
            <div className="relative w-12 h-10 overflow-hidden rounded shadow-sm">
              <Image 
                src={getPunaSlikaUrl(v.slikaUrl)} 
                alt={v.naslov} 
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <span className="text-xs text-gray-400">Nema</span>
          )}
        </td>
        <td className="px-4 py-3 font-medium text-gray-900 max-w-md truncate">{v.naslov}</td>
        <td className="px-4 py-3">
          <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">
            {v.kategorija?.naziv || 'N/A'}
          </span>
        </td>
        {/* Brzo dugme / select za poziciju */}
        <td className="px-4 py-3">
          <select
            value={v.pozicijaHero || 'STANDARDNA'}
            onChange={(e) => handlePromijeniPoziciju(v.id, e.target.value)}
            className={`text-xs px-2 py-1 rounded border font-medium outline-none cursor-pointer ${
              v.pozicijaHero === 'GLAVNA'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : v.pozicijaHero === 'SPOREDNA'
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            <option value="STANDARDNA">Standardna</option>
            <option value="GLAVNA">Glavna</option>
            <option value="SPOREDNA">Sporedna</option>
          </select>
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
        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
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
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Glavna slika *</label>
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
                    <div className="mt-2 flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded overflow-hidden">
                        <Image src={getPunaSlikaUrl(forma.slikaUrl)} alt="Preview" fill sizes="40px" className="object-cover" />
                      </div>
                      <p className="text-xs text-gray-500">Trenutna slika sačuvana.</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Opis / Izvor slike (opcionalno)</label>
                <input
                  type="text"
                  value={forma.slikaOpis}
                  onChange={(e) => setForma({ ...forma, slikaOpis: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="npr. Foto: Unsplash / Preuzeto sa: Vijesti.me"
                />
              </div>

              {/* Sekcija za foto galeriju */}
              <div className="border-t pt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Foto Galerija (dodatne slike)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setGalerijaFajlovi(Array.from(e.target.files));
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {forma.fotoGalerija.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-gray-600 font-medium">Sačuvane slike u galeriji: {forma.fotoGalerija.length}</span>
                      <button
                        type="button"
                        onClick={() => setForma({ ...forma, fotoGalerija: [] })}
                        className="text-xs text-red-600 hover:underline ml-2"
                      >
                        Ukloni sve postojeće
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {forma.fotoGalerija.map((galImg, i) => (
                        <div key={i} className="relative w-12 h-12 rounded border overflow-hidden shrink-0">
                          <Image src={getPunaSlikaUrl(galImg)} alt={`Galerija ${i}`} fill sizes="48px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pozicija u Hero sekciji</label>
                <select
                  value={forma.pozicijaHero}
                  onChange={(e) => setForma({ ...forma, pozicijaHero: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="STANDARDNA">Standardna (Nije u Hero sekciji)</option>
                  <option value="GLAVNA">Glavna vijest (Najveća, lijevo)</option>
                  <option value="SPOREDNA">Sporedna vijest (Jedna od 4 u gridu desno)</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Sistem automatski preuzima najnovije ako nema ručno podešenih, ali ručni odabir ima prioritet.
                </p>
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
                    ? 'Uploadovanje slika i galerije...'
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