import { authService } from '../services/auth-service.js';
import { establishmentService } from '../services/auth-service.js';
import { searchService } from '../services/search-service.js';
import { showToast } from '../components/toast.js';
import { openAuthModal } from '../components/header.js';
import { router } from '../router.js';

const STEPS = ['Tipo', 'Dados', 'Localização', 'Confirmar'];

export function renderRegisterPage() {
  const user = authService.getCurrentUser();
  if (!user) {
    return `
      <div class="container" style="padding:var(--space-16) 0;text-align:center">
        <h2>Cadastro de estabelecimentos</h2>
        <p class="text-muted">Faça login como parceiro para cadastrar seu negócio</p>
        <button class="btn btn--primary" data-auth-open>Entrar como parceiro</button>
      </div>
    `;
  }
  if (user.role !== 'parceiro') {
    return `
      <div class="container" style="padding:var(--space-16) 0;text-align:center">
        <h2>Acesso restrito</h2>
        <p class="text-muted">Apenas parceiros podem cadastrar estabelecimentos. Crie uma conta parceiro.</p>
        <button class="btn btn--primary" data-auth-open>Criar conta parceiro</button>
      </div>
    `;
  }

  const cities = searchService.getCities();

  return `
    <div class="planner-page">
      <div class="container">
        <h1>Cadastrar estabelecimento</h1>
        <p class="text-muted">Seu negócio aparecerá automaticamente na busca e no mapa</p>

        <div class="register-steps" data-steps>
          ${STEPS.map((s, i) => `<div class="register-step ${i === 0 ? 'is-active' : ''}" data-step-indicator="${i}"></div>`).join('')}
        </div>

        <div class="planner-form-card" style="max-width:600px;margin:0 auto">
          <form data-register-form>
            <div data-step="0" class="tab-panel is-active">
              <h3>Tipo de estabelecimento</h3>
              <div class="form-group">
                <select class="select" name="type" required>
                  <option value="hotel">Hotel / Pousada</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="tour">Passeio / Experiência</option>
                  <option value="establishment">Loja / Agência / Guia</option>
                </select>
              </div>
              <button type="button" class="btn btn--primary" data-next-step>Próximo</button>
            </div>

            <div data-step="1" class="tab-panel">
              <h3>Dados do estabelecimento</h3>
              <div class="form-group">
                <label class="form-label">Nome</label>
                <input class="input" name="name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Cidade</label>
                <select class="select" name="cityId" required>
                  ${cities.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Endereço</label>
                <input class="input" name="address" required>
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input class="input" name="phone">
              </div>
              <div class="form-group">
                <label class="form-label">Instagram</label>
                <input class="input" name="instagram" placeholder="@seuinstagram">
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="textarea" name="description" required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Faixa de preço (1-4)</label>
                <input class="input" type="number" name="priceRange" min="1" max="4" value="2">
              </div>
              <div class="flex gap-4">
                <button type="button" class="btn btn--ghost" data-prev-step>Voltar</button>
                <button type="button" class="btn btn--primary" data-next-step>Próximo</button>
              </div>
            </div>

            <div data-step="2" class="tab-panel">
              <h3>Localização</h3>
              <div class="form-group">
                <label class="form-label">Latitude</label>
                <input class="input" name="lat" type="number" step="any" value="-3.73">
              </div>
              <div class="form-group">
                <label class="form-label">Longitude</label>
                <input class="input" name="lng" type="number" step="any" value="-38.52">
              </div>
              <div class="form-group">
                <label class="form-label">Horário de funcionamento</label>
                <input class="input" name="schedule" placeholder="Seg-Sex 11h-22h">
              </div>
              <div class="flex gap-4">
                <button type="button" class="btn btn--ghost" data-prev-step>Voltar</button>
                <button type="button" class="btn btn--primary" data-next-step>Próximo</button>
              </div>
            </div>

            <div data-step="3" class="tab-panel">
              <h3>Confirmar cadastro</h3>
              <p class="text-muted">Revise os dados e confirme. Seu estabelecimento ficará visível imediatamente.</p>
              <div data-preview></div>
              <div class="flex gap-4" style="margin-top:var(--space-4)">
                <button type="button" class="btn btn--ghost" data-prev-step>Voltar</button>
                <button type="submit" class="btn btn--primary">Cadastrar</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function bindRegisterPage(container) {
  container.querySelector('[data-auth-open]')?.addEventListener('click', openAuthModal);

  const form = container.querySelector('[data-register-form]');
  if (!form) return;

  let currentStep = 0;

  const showStep = (n) => {
    currentStep = n;
    form.querySelectorAll('[data-step]').forEach((el, i) => {
      el.classList.toggle('is-active', i === n);
    });
    container.querySelectorAll('[data-step-indicator]').forEach((el, i) => {
      el.classList.toggle('is-active', i === n);
      el.classList.toggle('is-done', i < n);
    });
    if (n === 3) {
      const fd = new FormData(form);
      container.querySelector('[data-preview]').innerHTML = `
        <div class="info-card">
          <p><strong>${fd.get('name')}</strong></p>
          <p class="text-muted">${fd.get('type')} · ${form.querySelector(`[name="cityId"] option:checked`)?.textContent}</p>
          <p>${fd.get('description')}</p>
        </div>
      `;
    }
  };

  container.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => showStep(currentStep + 1));
  });
  container.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => showStep(currentStep - 1));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    const fd = new FormData(form);
    const cityOption = form.querySelector(`[name="cityId"] option:checked`);

    try {
      establishmentService.register({
        type: fd.get('type'),
        name: fd.get('name'),
        cityId: fd.get('cityId'),
        cityName: cityOption?.dataset.name || cityOption?.textContent,
        description: fd.get('description'),
        priceRange: parseInt(fd.get('priceRange')) || 2,
        schedule: fd.get('schedule'),
        location: {
          lat: parseFloat(fd.get('lat')),
          lng: parseFloat(fd.get('lng')),
          address: fd.get('address')
        },
        metadata: {
          phone: fd.get('phone'),
          instagram: fd.get('instagram')
        }
      }, user.id);

      showToast('Estabelecimento cadastrado com sucesso!', 'success');
      router.navigate('/perfil');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
