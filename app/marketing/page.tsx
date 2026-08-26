'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getStaticnuStranicu } from '@/lib/api';

export default function MarketingPage() {
  const [sadrzaj, setSadrzaj] = useState('');
  const [ucitavanje, setUcitavanje] = useState(true);

  useEffect(() => {
    getStaticnuStranicu('marketing')
      .then((data) => {
        setSadrzaj(data.sadrzaj || '');
        setUcitavanje(false);
      })
      .catch(() => setUcitavanje(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900">
      <div>
        <Header />
        <main className="max-w-4xl mx-auto px-4 pt-43 space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Marketing</h1>
          {ucitavanje ? (
            <p>Učitavanje...</p>
          ) : (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {sadrzaj || 'Sadržaj još uvijek nije unesen.'}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}