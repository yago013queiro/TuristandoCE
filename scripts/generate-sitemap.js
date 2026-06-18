/**
 * Script simples para gerar sitemap.xml baseado nos dados do seed
 * Execute com: node scripts/generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');

// Simulação simplificada do carregamento dos dados (já que é ES Module)
// Em um ambiente real, você usaria imports ou leria o arquivo como texto
const seedPath = path.join(__dirname, '../data/seed.js');
const seedContent = fs.readFileSync(seedPath, 'utf8');

// Regex básico para pegar os slugs e tipos (ajuste conforme necessário)
const matches = [...seedContent.matchAll(/slug: '([^']+)', type: '([^']+)'/g)];

const baseUrl = 'https://turistandoce.vercel.app';
const lastMod = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/busca</loc>
    <priority>0.8</priority>
  </url>`;

const typeMap = {
  city: 'cidade',
  beach: 'praia',
  hotel: 'hotel',
  restaurant: 'restaurante',
  tour: 'passeio',
  event: 'evento'
};

matches.forEach(match => {
  const [_, slug, type] = match;
  const pathPrefix = typeMap[type];
  if (pathPrefix) {
    sitemap += `
  <url>
    <loc>${baseUrl}/${pathPrefix}/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>0.9</priority>
  </url>`;
  }
});

sitemap += '\n</urlset>';

fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemap);
console.log('Sitemap gerado com sucesso!');
