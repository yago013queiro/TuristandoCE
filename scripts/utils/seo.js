/**
 * Utilitário para gerenciar SEO e Meta Tags dinamicamente
 */

const DEFAULT_META = {
  title: 'Turistando CE — Turismo no Ceará',
  description: 'Explore Jericoacoara, Canoa Quebrada e Fortaleza. O guia completo para sua viagem ao Ceará.',
  image: 'https://turistandoce.vercel.app/assets/images/og-image.jpg',
  url: window.location.href
};

export function updateMeta(options = {}) {
  const { title, description, image, url } = { ...DEFAULT_META, ...options };

  // Update Title
  document.title = title;

  // Update Standard Meta
  setMeta('description', description);

  // Update Open Graph
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:image', image);
  setMetaProperty('og:url', url || window.location.href);

  // Update Twitter
  setMetaProperty('twitter:title', title);
  setMetaProperty('twitter:description', description);
  setMetaProperty('twitter:image', image);
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.property = property;
    document.head.appendChild(el);
  }
  el.content = content;
}
