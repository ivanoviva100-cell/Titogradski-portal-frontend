'use client';
import { API_URL } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function ZahtjeviBadge() {
  const [brojZahtjeva, setBrojZahtjeva] = useState(0);

  useEffect(() => {
    const fetchZahtjevi = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Opcionalno: Provjeri ulogu iz sačuvanog korisnika da ne mučiš rutu ako si novinar
        const rawKorisnik = localStorage.getItem('korisnik');
        if (rawKorisnik) {
          try {
            const korisnik = JSON.parse(rawKorisnik);
            // Ako nije admin, nemoj ni slati zahtjev da izbjegneš 403 grešku
            if (korisnik.uloga !== 'ADMIN') return;
          } catch {
            // Ako parsiranje pukne, nastavi regularno pa šta bude
          }
        }

        const res = await fetch(`${API_URL}/zahtjevi-za-brisanje`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setBrojZahtjeva(data.length);
        }
      } catch (err) {
        console.error('Greška pri dohvatu zahtjeva za brisanje:', err);
      }
    };

    fetchZahtjevi();
  }, []);

  if (brojZahtjeva === 0) return null;

  return (
    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
      {brojZahtjeva}
    </span>
  );
}