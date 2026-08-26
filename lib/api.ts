const API_URL = 'http://localhost:5000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // endpoint već kreće sa '/' (npr. '/staticne-stranice?tip=marketing')
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || 'Došlo je do greške prilikom komunikacije sa serverom.'
    );
  }

  return data;
}

// ==========================================
// INTERFEJSI
// ==========================================

export interface VijestPayload {
  naslov: string;
  podnaslov: string;
  sadrzaj: string;
  slug: string;
  slikaUrl: string;
  kategorijaId: number;
  autorId?: number | null;
}

export interface Komentar {
  id: number;
  autorIme: string;
  sadrzaj: string;
  datumKreiranja: string;
  vijestId: number;
  odobren?: boolean;
}

export interface ReklamaPayload {
  naziv: string;
  pozicija: string;
  slikaUrl: string;
  linkUrl?: string;
  aktivna: boolean;
}

// ==========================================
// API METODE
// ==========================================

// Autentifikacija
export async function prijavaKorisnika(email: string, lozinka: string) {
  return apiFetch('/auth/prijava', {
    method: 'POST',
    body: JSON.stringify({ email, lozinka }),
  });
}

// Vijesti
export async function getSveVijesti() {
  return apiFetch('/vijesti');
}

export async function kreirajVijest(vijestData: VijestPayload) {
  return apiFetch('/vijesti', {
    method: 'POST',
    body: JSON.stringify(vijestData),
  });
}

export async function azurirajVijest(id: number, podaci: VijestPayload) {
  return apiFetch(`/vijesti/${id}`, {
    method: 'PUT',
    body: JSON.stringify(podaci),
  });
}

export async function obrisiVijest(id: number) {
  return apiFetch(`/vijesti/${id}`, {
    method: 'DELETE',
  });
}

// Kategorije
export async function getSveKategorije() {
  return apiFetch('/kategorije');
}

// Komentari
export async function getKomentariZaVijest(vijestId: number): Promise<Komentar[]> {
  return apiFetch(`/komentari/vijest/${vijestId}`);
}

export async function dodajKomentar(payload: { vijestId: number; autorIme: string; sadrzaj: string }) {
  return apiFetch('/komentari', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function obrisiKomentar(id: number) {
  return apiFetch(`/komentari/${id}`, {
    method: 'DELETE',
  });
}

export async function odobriKomentar(id: number) {
  return apiFetch(`/komentari/${id}/odobri`, {
    method: 'PATCH',
  });
}

// Statične stranice
export async function getStaticnuStranicu(tip: string) {
  return apiFetch(`/staticne-stranice?tip=${tip}`);
}

export async function sacuvajStaticnuStranicu(tip: string, sadrzaj: string) {
  return apiFetch('/staticne-stranice', {
    method: 'POST',
    body: JSON.stringify({ tip, sadrzaj }),
  });
}

// ==========================================
// REKLAME
// ==========================================

export async function getReklame() {
  return apiFetch('/reklame');
}

export async function kreirajReklamu(reklamaData: ReklamaPayload) {
  return apiFetch('/reklame', {
    method: 'POST',
    body: JSON.stringify(reklamaData),
  });
}

export async function azurirajReklamu(id: number, reklamaData: ReklamaPayload) {
  return apiFetch(`/reklame/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reklamaData),
  });
}

export async function obrisiReklamu(id: number) {
  return apiFetch(`/reklame/${id}`, {
    method: 'DELETE',
  });
}