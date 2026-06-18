import { setFontScale, toggleHighContrast, speakText, stopSpeaking } from '../utils/a11y.js';

export function renderAccessibilityToolbar() {
  return `
    <div class="a11y-toolbar" data-a11y-toolbar>
      <div class="a11y-toolbar__panel">
        <button class="a11y-toolbar__btn" data-a11y-font-up>🔤 A+ Aumentar fonte</button>
        <button class="a11y-toolbar__btn" data-a11y-font-down>🔡 A- Diminuir fonte</button>
        <button class="a11y-toolbar__btn" data-a11y-contrast>◐ Alto contraste</button>
        <button class="a11y-toolbar__btn" data-a11y-speak>🔊 Leitura por voz</button>
        <button class="a11y-toolbar__btn" data-a11y-stop>⏹ Parar leitura</button>
      </div>
      <button class="a11y-toolbar__toggle" aria-label="Ferramentas de acessibilidade">♿</button>
    </div>
  `;
}

export function bindAccessibilityToolbar(container) {
  const toolbar = container.querySelector('[data-a11y-toolbar]');
  if (!toolbar) return;

  toolbar.querySelector('.a11y-toolbar__toggle')?.addEventListener('click', () => {
    toolbar.classList.toggle('is-open');
  });

  toolbar.querySelector('[data-a11y-font-up]')?.addEventListener('click', () => setFontScale(0.1));
  toolbar.querySelector('[data-a11y-font-down]')?.addEventListener('click', () => setFontScale(-0.1));
  toolbar.querySelector('[data-a11y-contrast]')?.addEventListener('click', () => toggleHighContrast());
  toolbar.querySelector('[data-a11y-speak]')?.addEventListener('click', () => {
    const main = document.getElementById('main-content');
    if (main) speakText(main.innerText.slice(0, 2000));
  });
  toolbar.querySelector('[data-a11y-stop]')?.addEventListener('click', stopSpeaking);

  document.querySelector('[data-a11y-open]')?.addEventListener('click', () => {
    toolbar.classList.add('is-open');
  });
}
