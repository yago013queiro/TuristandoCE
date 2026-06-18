export function formatPrice(value, currency = 'BRL') {
  if (value == null) return 'Consulte';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
}

export function formatPriceRange(range) {
  if (typeof range === 'number') {
    if (range <= 0) return 'Gratuito';
    return Array(range).fill('R$').join(' ');
  }
  if (range?.min != null && range?.max != null) {
    if (range.min === 0 && range.max === 0) return 'Gratuito';
    return `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
  }
  if (range?.min != null) return `A partir de ${formatPrice(range.min)}`;
  return 'Consulte';
}

export function formatRating(rating) {
  return Number(rating).toFixed(1);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(dateStr));
}

export function formatRelativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
  return formatDate(dateStr);
}

export function pluralize(count, singular, plural) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural || singular + 's'}`;
}

export function truncate(text, max = 120) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).trim() + '…';
}
