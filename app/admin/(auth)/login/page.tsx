'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { prijavaKorisnika } from '@/lib/api';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [greska, setGreska] = useState('');
  const [ucitavanje, setUcitavanje] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const jeIsteklo = searchParams.get('isteklo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska('');
    setUcitavanje(true);

    try {
      const data = await prijavaKorisnika(email, lozinka);

      localStorage.setItem('token', data.token);
      localStorage.setItem('korisnik', JSON.stringify(data.korisnik));

      router.push('/admin/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGreska(err.message);
      } else {
        setGreska('Došlo je do nepoznate greške.');
      }
    } finally {
      setUcitavanje(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Admin Prijava
      </h1>

      {/* PORUKA AKO JE ISTEKLA SESIJA */}
      {jeIsteklo && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-md mb-4 text-sm">
          Vaša sesija je istekla. Molimo prijavite se ponovo.
        </div>
      )}

      {greska && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {greska}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email adresa
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="admin@portal.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lozinka
          </label>
          <input
            type="password"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <button
          type="submit"
          disabled={ucitavanje}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 font-medium"
        >
          {ucitavanje ? 'Prijavljivanje...' : 'Prijavi se'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Suspense fallback={<div className="text-gray-600">Učitavanje...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}