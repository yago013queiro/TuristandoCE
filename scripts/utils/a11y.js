let speechSynth = null;

export function initA11y() {
  const saved = JSON.parse(localStorage.getItem('turistando_a11y') || '{}');
  if (saved.fontScale) document.documentElement.style.setProperty('--font-scale', saved.fontScale);
  if (saved.highContrast) document.documentElement.dataset.highContrast = 'true';
}

export function setFontScale(delta) {
  const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
  const next = Math.min(1.4, Math.max(0.8, current + delta));
  document.documentElement.style.setProperty('--font-scale', next);
  saveA11y({ fontScale: next });
  return next;
}

export function toggleHighContrast() {
  const isOn = document.documentElement.dataset.highContrast === 'true';
  document.documentElement.dataset.highContrast = isOn ? 'false' : 'true';
  saveA11y({ highContrast: !isOn });
  return !isOn;
}

export function speakText(text) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function saveA11y(partial) {
  const current = JSON.parse(localStorage.getItem('turistando_a11y') || '{}');
  localStorage.setItem('turistando_a11y', JSON.stringify({ ...current, ...partial }));
}

export function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  first?.focus();
}
