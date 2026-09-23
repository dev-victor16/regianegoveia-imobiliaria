/**
 * Regiane Goveia Imobiliária — Engine de Aplicação
 * Gerencia busca instantânea, filtros múltiplos, modal com galeria fotográfica,
 * simulador de financiamento e integrações com WhatsApp oficial.
 * CRECI 8527 PJ | Ibirité / MG
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_PHONE = '553135984606';

  // Elementos do DOM
  const propertiesGrid = document.getElementById('propertiesGrid');
  const inventoryCounter = document.getElementById('inventoryCounter');
  const searchForm = document.getElementById('searchForm');
  const filterType = document.getElementById('filterType');
  const filterNeighborhood = document.getElementById('filterNeighborhood');
  const filterPrice = document.getElementById('filterPrice');
  const filterBedrooms = document.getElementById('filterBedrooms');
  const filterCode = document.getElementById('filterCode');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const purposeButtons = document.querySelectorAll('.purpose-btn');
  const featuredHeroCard = document.getElementById('featuredHeroCard');

  // Estado dos Filtros
  let currentFilters = {
    purpose: 'todos',
    type: 'todos',
    neighborhood: 'todos',
    maxPrice: Infinity,
    minBedrooms: 0,
    code: ''
  };

  /* ==========================================================================
     1. POVOAMENTO DOS SELECTS DE FILTRO
     ========================================================================== */
  function populateSelects() {
    if (!filterNeighborhood || !filterType) return;

    // Bairros
    const neighborhoods = [...new Set(PROPERTIES_DATA.map(p => p.neighborhood))].sort();
    neighborhoods.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      filterNeighborhood.appendChild(opt);
    });

    // Tipos
    const types = [...new Set(PROPERTIES_DATA.map(p => p.type))].sort();
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      filterType.appendChild(opt);
    });
  }

  /* ==========================================================================
     2. RENDERIZAÇÃO DOS CARDS DE IMÓVEIS
     ========================================================================== */
  function renderProperties(list) {
    if (!propertiesGrid) return;
    propertiesGrid.innerHTML = '';

    // Atualizar contador
    if (inventoryCounter) {
      inventoryCounter.innerHTML = `Exibindo <strong>${list.length}</strong> ${list.length === 1 ? 'imóvel' : 'imóveis'}`;
    }

    // Se estiver filtrado, ocultar o card de banner se ele não bater com o filtro
    if (featuredHeroCard) {
      if (currentFilters.purpose !== 'todos' || currentFilters.type !== 'todos' || currentFilters.neighborhood !== 'todos' || currentFilters.code !== '') {
        const matchesFeatured = list.some(p => p.id === 1383);
        featuredHeroCard.style.display = matchesFeatured ? 'grid' : 'none';
      } else {
        featuredHeroCard.style.display = 'grid';
      }
    }

    if (list.length === 0) {
      propertiesGrid.innerHTML = `
        <div class="empty-results">
          <p style="font-weight: 700; font-size: 1.125rem; color: var(--color-forest); margin-bottom: 6px;">Nenhum imóvel encontrado com os filtros selecionados.</p>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 16px;">Tente buscar por outro bairro ou código, ou limpe os filtros para ver todo o catálogo.</p>
          <button type="button" class="btn-primary" onclick="window.resetFiltersAction()">Ver Todos os Imóveis</button>
        </div>
      `;
      return;
    }

    // Não duplicar o imóvel 1383 na grade se o banner de destaque principal estiver visível
    const isBannerVisible = featuredHeroCard && featuredHeroCard.style.display !== 'none';
    const renderList = isBannerVisible ? list.filter(p => p.id !== 1383) : list;

    renderList.forEach(prop => {
      const card = document.createElement('article');
      card.className = 'property-card';
      const mainPhoto = prop.images && prop.images.length > 0 ? prop.images[0] : 'assets/img/logo-link.png';

      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${mainPhoto}" alt="${prop.title}" class="card-img" loading="lazy" />
          <span class="card-badge-status">${prop.purpose === 'venda' ? 'Venda' : 'Aluguel'}</span>
          <span class="card-code">Cód. ${prop.code}</span>
        </div>
        <div class="card-body">
          <div class="card-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${prop.neighborhood}, ${prop.city}</span>
          </div>
          <h3 class="card-title" title="${prop.title}">${prop.title}</h3>
          <div class="card-specs">
            ${prop.bedrooms > 0 ? `<span><strong>${prop.bedrooms}</strong> qts</span> • ` : ''}
            ${prop.bathrooms > 0 ? `<span><strong>${prop.bathrooms}</strong> banho${prop.bathrooms > 1 ? 's' : ''}</span> • ` : ''}
            ${prop.parking > 0 ? `<span><strong>${prop.parking}</strong> vaga${prop.parking > 1 ? 's' : ''}</span> • ` : ''}
            <span><strong>${prop.privateArea}</strong> m²</span>
          </div>
          <div class="card-footer">
            <div class="card-price">${prop.formattedPrice}</div>
            <button type="button" class="btn-card-view" onclick="openPropertyModal(${prop.id})">
              Ver Detalhes
            </button>
          </div>
        </div>
      `;
      propertiesGrid.appendChild(card);
    });
  }

  /* ==========================================================================
     3. FILTRAGEM
     ========================================================================== */
  function applyFilters() {
    const filtered = PROPERTIES_DATA.filter(p => {
      if (currentFilters.purpose !== 'todos' && p.purpose !== currentFilters.purpose) {
        return false;
      }
      if (currentFilters.type !== 'todos' && p.type !== currentFilters.type) {
        return false;
      }
      if (currentFilters.neighborhood !== 'todos' && p.neighborhood !== currentFilters.neighborhood) {
        return false;
      }
      if (currentFilters.code.trim() !== '') {
        const q = currentFilters.code.trim().toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchTitle = p.title.toLowerCase().includes(q);
        if (!matchCode && !matchTitle) return false;
      }
      if (currentFilters.minBedrooms > 0 && p.bedrooms < currentFilters.minBedrooms) {
        return false;
      }
      if (currentFilters.maxPrice !== Infinity && p.price > currentFilters.maxPrice) {
        return false;
      }
      return true;
    });

    renderProperties(filtered);
  }

  window.resetFiltersAction = function() {
    currentFilters = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      maxPrice: Infinity,
      minBedrooms: 0,
      code: ''
    };

    if (filterCode) filterCode.value = '';
    if (filterType) filterType.value = 'todos';
    if (filterNeighborhood) filterNeighborhood.value = 'todos';
    if (filterPrice) filterPrice.value = 'todos';
    if (filterBedrooms) filterBedrooms.value = '0';

    purposeButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-purpose') === 'todos');
    });

    renderProperties(PROPERTIES_DATA);
  };

  // Listeners de Busca
  purposeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      purposeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.purpose = btn.getAttribute('data-purpose');
      applyFilters();
    });
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (filterType) currentFilters.type = filterType.value;
      if (filterNeighborhood) currentFilters.neighborhood = filterNeighborhood.value;
      if (filterBedrooms) currentFilters.minBedrooms = parseInt(filterBedrooms.value, 10) || 0;
      if (filterPrice) {
        const val = filterPrice.value;
        currentFilters.maxPrice = val === 'todos' ? Infinity : parseInt(val, 10);
      }
      applyFilters();

      const catalogo = document.getElementById('catalogo');
      if (catalogo) catalogo.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (filterCode) {
    filterCode.addEventListener('input', (e) => {
      currentFilters.code = e.target.value;
      applyFilters();
    });
  }

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', window.resetFiltersAction);
  }

  /* ==========================================================================
     4. MODAL COM GALERIA
     ========================================================================== */
  const modalOverlay = document.getElementById('propertyModal');
  const modalBody = document.getElementById('modalBody');

  window.openPropertyModal = function(id) {
    const prop = PROPERTIES_DATA.find(p => p.id === id);
    if (!prop || !modalOverlay || !modalBody) return;

    const mainPhoto = prop.images && prop.images.length > 0 ? prop.images[0] : '';
    const whatsappMsg = encodeURIComponent(
      `Olá, Regiane Goveia Imobiliária! Gostaria de informações sobre o imóvel: ${prop.title} (Cód: ${prop.code}) no valor de ${prop.formattedPrice}.`
    );

    modalBody.innerHTML = `
      <div class="modal-gallery">
        <div class="modal-hero-photo-wrap">
          <img src="${mainPhoto}" id="modalHeroPhoto" alt="${prop.title}" class="modal-hero-photo" />
        </div>
        ${prop.images && prop.images.length > 1 ? `
          <div class="modal-thumbs">
            ${prop.images.map((img, idx) => `
              <div class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="switchModalPhoto('${img}', this)">
                <img src="${img}" alt="Foto ${idx + 1}" />
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="modal-details">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
          <div>
            <span class="section-tag">${prop.type} • ${prop.purpose === 'venda' ? 'Venda' : 'Aluguel'} • Cód. ${prop.code}</span>
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--color-forest);">${prop.title}</h2>
            <div style="font-size: 0.8125rem; color: var(--text-subtle); margin-top: 4px;">
              ${prop.neighborhood}, ${prop.city} - ${prop.state}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.6875rem; text-transform: uppercase; color: var(--text-subtle); font-weight: 600;">
              ${prop.purpose === 'venda' ? 'Valor de Venda' : 'Aluguel Mensal'}
            </div>
            <div style="font-family: var(--font-heading); font-size: 1.85rem; font-weight: 800; color: var(--color-primary);">
              ${prop.formattedPrice}
            </div>
          </div>
        </div>

        <div class="modal-specs-bar">
          ${prop.bedrooms > 0 ? `<div class="modal-spec-chip">🛏️ ${prop.bedrooms} Dormitórios (${prop.suites} Suíte${prop.suites > 1 ? 's' : ''})</div>` : ''}
          ${prop.bathrooms > 0 ? `<div class="modal-spec-chip">🚿 ${prop.bathrooms} Banheiros</div>` : ''}
          ${prop.parking > 0 ? `<div class="modal-spec-chip">🚗 ${prop.parking} Vagas</div>` : ''}
          <div class="modal-spec-chip">📐 ${prop.privateArea} m² Privativos</div>
          ${prop.totalArea > prop.privateArea ? `<div class="modal-spec-chip">🌳 ${prop.totalArea} m² Terreno</div>` : ''}
          <div class="modal-spec-chip">🏢 ${prop.floor}</div>
        </div>

        <h4 style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--color-forest); margin-bottom: 6px;">Descrição do Imóvel</h4>
        <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 20px;">${prop.description}</p>

        <h4 style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--color-forest); margin-bottom: 10px;">Destaques</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; font-size: 0.8125rem; color: var(--text-dark);">
          ${prop.highlights.map(h => `<div>✓ ${h}</div>`).join('')}
        </div>

        <a href="https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${whatsappMsg}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; height: 46px; font-size: 0.9375rem;">
          Falar com Corretor no WhatsApp Sobre Este Imóvel
        </a>
      </div>
    `;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.switchModalPhoto = function(url, thumb) {
    const hero = document.getElementById('modalHeroPhoto');
    if (hero) hero.src = url;
    const thumbs = document.querySelectorAll('.modal-thumb');
    thumbs.forEach(t => t.classList.remove('active'));
    if (thumb) thumb.classList.add('active');
  };

  window.closePropertyModal = function() {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closePropertyModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePropertyModal();
  });

  /* ==========================================================================
     5. ACCORDION DE DOCUMENTOS
     ========================================================================== */
  window.toggleAccordion = function(header) {
    const item = header.parentElement;
    item.classList.toggle('active');
  };

  /* ==========================================================================
     6. SIMULADOR DE FINANCIAMENTO
     ========================================================================== */
  const simValSlider = document.getElementById('simValSlider');
  const simValText = document.getElementById('simValText');
  const simDownSlider = document.getElementById('simDownSlider');
  const simDownText = document.getElementById('simDownText');
  const simMonthsSelect = document.getElementById('simMonthsSelect');
  const simInstallmentVal = document.getElementById('simInstallmentVal');
  const simFinancedVal = document.getElementById('simFinancedVal');
  const btnSimWa = document.getElementById('btnSimWa');

  function calculateFinancing() {
    if (!simValSlider || !simDownSlider || !simMonthsSelect) return;

    const total = parseFloat(simValSlider.value);
    const downPct = parseFloat(simDownSlider.value);
    const months = parseInt(simMonthsSelect.value, 10);

    const downPayment = total * (downPct / 100);
    const financed = total - downPayment;

    // Estimativa SAC aproximada (~0.79% a.m.)
    const monthlyRate = 0.0079;
    const factor = Math.pow(1 + monthlyRate, months);
    const installment = (financed * (monthlyRate * factor)) / (factor - 1);

    if (simValText) simValText.textContent = `R$ ${total.toLocaleString('pt-BR')}`;
    if (simDownText) simDownText.textContent = `R$ ${downPayment.toLocaleString('pt-BR')} (${downPct}%)`;
    if (simFinancedVal) simFinancedVal.textContent = `R$ ${financed.toLocaleString('pt-BR')}`;
    if (simInstallmentVal) simInstallmentVal.textContent = `R$ ${Math.round(installment).toLocaleString('pt-BR')}`;

    if (btnSimWa) {
      const msg = encodeURIComponent(
        `Olá! Simulei um financiamento no site da Regiane Goveia:\n` +
        `• Valor do Imóvel: R$ ${total.toLocaleString('pt-BR')}\n` +
        `• Entrada: R$ ${downPayment.toLocaleString('pt-BR')} (${downPct}%)\n` +
        `• Financiamento: R$ ${financed.toLocaleString('pt-BR')} em ${months} meses\n` +
        `• Parcela estimada: R$ ${Math.round(installment).toLocaleString('pt-BR')} /mês\n` +
        `Gostaria de verificar as opções de crédito com a equipe!`
      );
      btnSimWa.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${msg}`;
    }
  }

  if (simValSlider && simDownSlider && simMonthsSelect) {
    simValSlider.addEventListener('input', calculateFinancing);
    simDownSlider.addEventListener('input', calculateFinancing);
    simMonthsSelect.addEventListener('change', calculateFinancing);
    calculateFinancing();
  }

  /* ==========================================================================
     7. FORMULÁRIO DE PROPRIETÁRIOS
     ========================================================================== */
  const ownerForm = document.getElementById('ownerForm');
  if (ownerForm) {
    ownerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ownerName').value;
      const phone = document.getElementById('ownerPhone').value;
      const purpose = document.getElementById('ownerPurpose').value;
      const type = document.getElementById('ownerType').value;
      const neighborhood = document.getElementById('ownerNeighborhood').value;
      const notes = document.getElementById('ownerNotes').value;

      const waText = encodeURIComponent(
        `Olá, equipe Regiane Goveia Imobiliária!\n` +
        `Quero anunciar meu imóvel para ${purpose}:\n` +
        `• Proprietário: ${name}\n` +
        `• Contato: ${phone}\n` +
        `• Tipo: ${type}\n` +
        `• Bairro/Cidade: ${neighborhood}\n` +
        `• Detalhes: ${notes || 'Sem observações adicionais.'}`
      );

      window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${waText}`, '_blank');
      ownerForm.reset();
      alert('Informações formatadas! O WhatsApp foi aberto para concluir o envio.');
    });
  }

  /* ==========================================================================
     8. SCROLL DO HEADER & MENU MOBILE
     ========================================================================== */
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isDisplayed = mainNav.style.display === 'block';
      mainNav.style.display = isDisplayed ? 'none' : 'block';
      if (!isDisplayed) {
        mainNav.style.position = 'absolute';
        mainNav.style.top = '80px';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.backgroundColor = '#FFFFFF';
        mainNav.style.padding = '20px';
        mainNav.style.borderBottom = '1px solid var(--border-subtle)';
        mainNav.style.boxShadow = 'var(--shadow-md)';
      }
    });

    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          mainNav.style.display = 'none';
        }
      });
    });
  }

  /* ==========================================================================
     9. INICIALIZAÇÃO
     ========================================================================== */
  populateSelects();
  renderProperties(PROPERTIES_DATA);
});
