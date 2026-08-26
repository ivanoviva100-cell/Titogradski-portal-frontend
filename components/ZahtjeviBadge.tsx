'use client';

import { useEffect, useState } from 'react';

export default function ZahtjeviBadge() {
  const [brojZahtjeva, setBrojZahtjeva] = useState(0);

  useEffect(() => {
    const fetchZahtjevi = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5000/admin/zahtjevi-za-brisanje', {
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
    // Možeš dodati interval ili event listener po želji da se osvježava
  }, []);

  if (brojZahtjeva === 0) return null;

  return (
    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
      {brojZahtjeva}
    </span>
  );
}