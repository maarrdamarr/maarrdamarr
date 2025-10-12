// Node 18+ sudah punya fetch global
import { readFileSync, writeFileSync } from 'fs';

const API = 'https://ghibliapi.vercel.app/films';

async function getFilm() {
  const resp = await fetch(API, { headers: { 'accept': 'application/json' }});
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  const films = await resp.json();
  if (!Array.isArray(films) || films.length === 0) throw new Error('No films');

  // acak 1 film
  const film = films[Math.floor(Math.random() * films.length)];
  // fallback jika field berbeda
  const poster = film.image || film.movie_banner || '';
  const title = film.title || 'Judul tidak diketahui';
  const year = film.release_date || '????';
  const director = film.director || '—';

  return { poster, title, year, director };
}

function injectToReadme(html) {
  const start = '<!-- GHIBLI_START -->';
  const end = '<!-- GHIBLI_END -->';
  const path = 'README.md';
  const md = readFileSync(path, 'utf8');

  const block = `${start}
${html}
${end}`;

  let out;
  if (md.includes(start) && md.includes(end)) {
    const re = new RegExp(`${start}[\\s\\S]*?${end}`, 'm');
    out = md.replace(re, block);
  } else {
    // jika marker belum ada, tambahkan di akhir
    out = `${md}\n\n## 🎬 Film Kartun Hari Ini\n${block}\n`;
  }

  writeFileSync(path, out);
}

try {
  const { poster, title, year, director } = await getFilm();
  const html = `
<p align="center">
  <img src="${poster}" alt="${title}" width="320"><br/>
  <b>${title} (${year})</b><br/>
  Sutradara: ${director}
</p>`.trim();

  injectToReadme(html);
  console.log('Updated README with:', title);
} catch (e) {
  console.error('Gagal update:', e.message);
  // placeholder elegan saat gagal
  const fallback = `
<p align="center">
  <b>Tidak bisa memuat film hari ini.</b><br/>
  Coba lagi besok ya ✨
</p>`.trim();
  injectToReadme(fallback);
}
