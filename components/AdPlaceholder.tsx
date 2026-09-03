'use client';

import Image from 'next/image';
import { API_URL } from '@/lib/api';
import { useState, useEffect } from 'react';

interface AdPlaceholderProps {
  type: 'banner-top' | 'banner-middle' | 'sidebar';
  link?: string;
}

interface Reklama {
  id: number;
  naziv: string;
  pozicija: string;
  slikaUrl: string;
  linkUrl: string | null;
  aktivna: boolean;
}

export default function AdPlaceholder({ type, link: propLink }: AdPlaceholderProps) {
  const [reklama, setReklama] = useState<Reklama | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReklama() {
      try {
        const res = await fetch(`${API_URL}/reklame?pozicija=${type}&aktivna=true`);
        if (res.ok) {
          const data: Reklama[] = await res.json();
          if (data.length > 0) {
            setReklama(data[0]);
          }
        }
      } catch (error) {
        console.error("Greška pri dohvatanju reklame:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReklama();
  }, [type]);

  if (loading || !reklama?.slikaUrl) {
    return null;
  }

  const slikaUrl = reklama.slikaUrl;
  const linkUrl = reklama.linkUrl || propLink;

  const content = (
    <div className={`relative rounded overflow-hidden shadow-sm mx-auto ${
      type === 'sidebar' ? 'w-[300px] h-[250px] sm:h-[600px]' : 'w-full max-w-[728px] h-[90px] sm:h-[90px]'
    }`}>
      <Image 
        src={slikaUrl} 
        alt={reklama.naziv || 'Reklama'} 
        fill
        className="object-cover"
      />
    </div>
  );

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-95 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}