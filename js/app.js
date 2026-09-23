/**
 * Regiane Goveia Imobiliária — Engine de Aplicação
 * Gerencia busca instantânea, filtros múltiplos, modal com galeria fotográfica,
 * simulador de financiamento e integrações com WhatsApp oficial.
 * CRECI 8527 PJ | Ibirité / MG
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constantes de Comunicação
  const WHATSAPP_PHONE = '553135984606';

  // Elementos do DOM
  const propertiesGrid = document.getElementById('propertiesGrid');
  const resultsCounter = document.getElementById('resultsCounter');
  const searchForm = document.getElementById('searchForm');
  const searchCodeInput = document.getElementById('searchCode');
  const searchTypeSelect = document.getElementById('searchType');
  const searchNeighborhoodSelect = document.getElementById('searchNeighborhood');
  const searchPriceSelect = document.getElementById('searchPrice');
  const searchBedroomsSelect = document.getElementById('searchBedrooms');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const purposeTabs = document.querySelectorAll('.search-tab-btn');
  const filterPills = document.querySelectorAll('.filter-pill');

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
  function populateFilterOptions() {
    if (!searchNeighborhoodSelect || !searchTypeSelect) return;

    // Extrair bairros únicos do acervo
    const neighborhoods = [...new Set(PROPERTIES_DATA.map(p => p.neighborhood))].sort();
    neighborhoods.forEach(bairro => {
      const opt = document.createElement('option');
      opt.value = bairro;
      opt.textContent = bairro;
      searchNeighborhoodSelect.appendChild(opt);
    });

    // Extrair tipos únicos
    const types = [...new Set(PROPERTIES_DATA.map(p => p.type))].sort();
    types.forEach(tipo => {
      const opt = document.createElement('option');
      opt.value = tipo;
      opt.textContent = tipo;
      searchTypeSelect.appendChild(opt);
    });
  }

  /* ==========================================================================
     2. RENDERIZAÇÃO DOS CARDS DE IMÓVEIS
     ========================================================================== */
  function renderProperties(list) {
    if (!propertiesGrid) return;
    propertiesGrid.innerHTML = '';

    if (list.length === 0) {
      propertiesGrid.innerHTML = `
        <div class="no-results-box">
          <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
          </svg>
          <h3 class="no-results-title">Nenhum imóvel encontrado para este critério</h3>
          <p class="no-results-desc">Tente remover alguns filtros ou buscar por código/bairro diferente. Nossa equipe pode encontrar exatamente o que você procura.</p>
          <button type="button" class="btn-header-cta" id="btnResetInline">
            Ver Todos os Imóveis
          </button>
        </div>
      `;

      const btnResetInline = document.getElementById('btnResetInline');
      if (btnResetInline) {
        btnResetInline.addEventListener('click', resetAllFilters);
      }

      if (resultsCounter) resultsCounter.innerHTML = 'Exibindo <strong>0</strong> imóveis';
      return;
    }

    if (resultsCounter) {
      resultsCounter.innerHTML = `Exibindo <strong>${list.length}</strong> ${list.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}`;
    }

    list.forEach(prop => {
      const card = document.createElement('article');
      card.className = 'property-card';
      card.setAttribute('data-id', prop.id);

      const statusBadgeText = prop.purpose === 'venda' ? 'Venda' : 'Aluguel';
      const mainPhoto = prop.images && prop.images.length > 0 ? prop.images[0] : 'assets/img/logo-link.png';
      const photosTotal = prop.images ? prop.images.length : 0;

      card.innerHTML = `
        <div class="property-thumb-wrap">
          <img src="${mainPhoto}" alt="${prop.title}" class="property-thumb" loading="lazy" />
          <span class="property-badge-type">${prop.type}</span>
          <span class="property-badge-status">${statusBadgeText}</span>
          <span class="property-code-tag">Cód. ${prop.code}</span>
          <span class="property-photos-count">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            ${photosTotal}
          </span>
        </div>
        <div class="property-body">
          <div class="property-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${prop.neighborhood}, ${prop.city} - ${prop.state}</span>
          </div>
          <h3 class="property-title" title="${prop.title}">${prop.title}</h3>
          <div class="property-specs">
            ${prop.bedrooms > 0 ? `
              <div class="spec-item" title="${prop.bedrooms} Quartos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 7v11m0-4h18m0-7v11M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/>
                </svg>
                <span>${prop.bedrooms} qts</span>
              </div>
            ` : ''}
            ${prop.bathrooms > 0 ? `
              <div class="spec-item" title="${prop.bathrooms} Banheiros">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12h16a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2a2 2 0 0 1 2-2z"/>
                  <path d="M6 12V5a2 2 0 0 1 2-2h1"/>
                </svg>
                <span>${prop.bathrooms} banho${prop.bathrooms > 1 ? 's' : ''}</span>
              </div>
            ` : ''}
            ${prop.parking > 0 ? `
              <div class="spec-item" title="${prop.parking} Vagas de Garagem">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="9" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>${prop.parking} vaga${prop.parking > 1 ? 's' : ''}</span>
              </div>
            ` : ''}
            <div class="spec-item" title="${prop.privateArea}m² Privativos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18M3 9h18"/>
              </svg>
              <span>${prop.privateArea} m²</span>
            </div>
          </div>
          <div class="property-footer">
            <div class="property-price-box">
              <span class="property-price-label">${prop.purpose === 'venda' ? 'Valor de Venda' : 'Aluguel Mensal'}</span>
              <span class="property-price">${prop.formattedPrice}</span>
            </div>
            <button type="button" class="btn-card-details" onclick="openPropertyModal(${prop.id})">
              Ver Detalhes
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      propertiesGrid.appendChild(card);
    });
  }

  /* ==========================================================================
     3. FILTRAGEM MULTICRITÉRIO DOS IMÓVEIS
     ========================================================================== */
  function applyFilters() {
    let filtered = PROPERTIES_DATA.filter(prop => {
      // Filtro por Finalidade
      if (currentFilters.purpose !== 'todos' && prop.purpose !== currentFilters.purpose) {
        return false;
      }
      // Filtro por Tipo
      if (currentFilters.type !== 'todos' && prop.type !== currentFilters.type) {
        return false;
      }
      // Filtro por Bairro
      if (currentFilters.neighborhood !== 'todos' && prop.neighborhood !== currentFilters.neighborhood) {
        return false;
      }
      // Filtro por Código
      if (currentFilters.code.trim() !== '') {
        const query = currentFilters.code.trim().toLowerCase();
        const matchCode = prop.code.toLowerCase().includes(query);
        const matchTitle = prop.title.toLowerCase().includes(query);
        if (!matchCode && !matchTitle) return false;
      }
      // Filtro por Quartos
      if (currentFilters.minBedrooms > 0 && prop.bedrooms < currentFilters.minBedrooms) {
        return false;
      }
      // Filtro por Preço Máximo
      if (currentFilters.maxPrice !== Infinity && prop.price > currentFilters.maxPrice) {
        return false;
      }

      return true;
    });

    renderProperties(filtered);
  }

  function resetAllFilters() {
    currentFilters = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      maxPrice: Infinity,
      minBedrooms: 0,
      code: ''
    };

    if (searchCodeInput) searchCodeInput.value = '';
    if (searchTypeSelect) searchTypeSelect.value = 'todos';
    if (searchNeighborhoodSelect) searchNeighborhoodSelect.value = 'todos';
    if (searchPriceSelect) searchPriceSelect.value = 'todos';
    if (searchBedroomsSelect) searchBedroomsSelect.value = '0';

    purposeTabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-purpose') === 'todos');
    });

    filterPills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-filter') === 'todos');
    });

    renderProperties(PROPERTIES_DATA);
  }

  /* ==========================================================================
     4. EVENT LISTENERS DE BUSCA E FILTROS
     ========================================================================== */
  // Abas de Finalidade no Search Console
  purposeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      purposeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilters.purpose = tab.getAttribute('data-purpose');
      applyFilters();
    });
  });

  // Pills Rápidas acima da grade
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterType = pill.getAttribute('data-filter');
      if (filterType === 'todos') {
        currentFilters.type = 'todos';
        currentFilters.purpose = 'todos';
      } else if (filterType === 'venda' || filterType === 'aluguel') {
        currentFilters.purpose = filterType;
        currentFilters.type = 'todos';
      } else {
        currentFilters.type = filterType;
      }

      applyFilters();
    });
  });

  // Formulário de busca
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (searchCodeInput) currentFilters.code = searchCodeInput.value;
      if (searchTypeSelect) currentFilters.type = searchTypeSelect.value;
      if (searchNeighborhoodSelect) currentFilters.neighborhood = searchNeighborhoodSelect.value;
      if (searchBedroomsSelect) currentFilters.minBedrooms = parseInt(searchBedroomsSelect.value, 10) || 0;
      if (searchPriceSelect) {
        const val = searchPriceSelect.value;
        currentFilters.maxPrice = val === 'todos' ? Infinity : parseInt(val, 10);
      }
      applyFilters();

      // Scroll suave até os imóveis
      const vitrine = document.getElementById('imoveis');
      if (vitrine) vitrine.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', resetAllFilters);
  }

  if (searchCodeInput) {
    searchCodeInput.addEventListener('input', (e) => {
      currentFilters.code = e.target.value;
      applyFilters();
    });
  }

  /* ==========================================================================
     5. MODAL DE DETALHES COM GALERIA NAVEGÁVEL
     ========================================================================== */
  const modalBackdrop = document.getElementById('propertyModal');
  const modalBody = document.getElementById('modalBody');

  window.openPropertyModal = function(id) {
    const prop = PROPERTIES_DATA.find(p => p.id === id);
    if (!prop || !modalBackdrop || !modalBody) return;

    const mainPhoto = prop.images && prop.images.length > 0 ? prop.images[0] : '';
    const whatsappMsg = encodeURIComponent(
      `Olá, equipe Regiane Goveia Imobiliária! Gostaria de mais informações e agendar visita para o imóvel: ${prop.title} (Cód: ${prop.code}), no valor de ${prop.formattedPrice}.`
    );

    modalBody.innerHTML = `
      <div class="modal-gallery-area">
        <div class="modal-main-img-wrap">
          <img src="${mainPhoto}" id="modalHeroImg" alt="${prop.title}" class="modal-main-img" />
        </div>
        ${prop.images && prop.images.length > 1 ? `
          <div class="modal-thumbs-slider">
            ${prop.images.map((img, idx) => `
              <button type="button" class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchModalPhoto('${img}', this)">
                <img src="${img}" alt="Foto ${idx + 1}" />
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="modal-content-area">
        <div class="modal-header-row">
          <div class="modal-title-group">
            <span class="section-tag">${prop.type} • ${prop.purpose === 'venda' ? 'Venda' : 'Aluguel'} • Cód. ${prop.code}</span>
            <h2>${prop.title}</h2>
            <div class="property-location" style="margin-top: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${prop.neighborhood}, ${prop.city} - ${prop.state}</span>
            </div>
          </div>
          <div class="modal-price-box">
            <span class="property-price-label">${prop.purpose === 'venda' ? 'Valor de Venda' : 'Locação Mensal'}</span>
            <div class="modal-price-val">${prop.formattedPrice}</div>
            <div style="font-size: 0.8125rem; color: var(--c-text-muted); margin-top: 2px;">
              Condomínio: ${prop.condo} | IPTU: ${prop.iptu}
            </div>
          </div>
        </div>

        <div class="modal-meta-chips">
          ${prop.bedrooms > 0 ? `<div class="modal-meta-chip">🛏️ ${prop.bedrooms} Dormitórios (${prop.suites} Suíte${prop.suites > 1 ? 's' : ''})</div>` : ''}
          ${prop.bathrooms > 0 ? `<div class="modal-meta-chip">🚿 ${prop.bathrooms} Banheiros</div>` : ''}
          ${prop.parking > 0 ? `<div class="modal-meta-chip">🚗 ${prop.parking} Vagas de Garagem</div>` : ''}
          <div class="modal-meta-chip">📐 ${prop.privateArea} m² Privativos</div>
          ${prop.totalArea > prop.privateArea ? `<div class="modal-meta-chip">🌳 ${prop.totalArea} m² Área Total</div>` : ''}
          <div class="modal-meta-chip">🏢 ${prop.floor}</div>
        </div>

        <h4 class="modal-desc-heading">Sobre este imóvel</h4>
        <p class="modal-desc-text">${prop.description}</p>

        <h4 class="modal-desc-heading">Diferenciais e Características</h4>
        <div class="modal-highlights-grid">
          ${prop.highlights.map(h => `
            <div class="modal-highlight-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>${h}</span>
            </div>
          `).join('')}
        </div>

        <div class="modal-actions-bar">
          <a href="https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${whatsappMsg}" target="_blank" rel="noopener noreferrer" class="btn-modal-wa">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
            </svg>
            Falar com a Regiane Goveia no WhatsApp
          </a>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.switchModalPhoto = function(url, btn) {
    const heroImg = document.getElementById('modalHeroImg');
    if (heroImg) {
      heroImg.style.opacity = '0.4';
      setTimeout(() => {
        heroImg.src = url;
        heroImg.style.opacity = '1';
      }, 150);
    }
    const allBtns = document.querySelectorAll('.modal-thumb-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  };

  window.closePropertyModal = function() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closePropertyModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePropertyModal();
  });

  /* ==========================================================================
     6. SIMULADOR DE FINANCIAMENTO INTERATIVO
     ========================================================================== */
  const simValSlider = document.getElementById('simValSlider');
  const simValText = document.getElementById('simValText');
  const simDownSlider = document.getElementById('simDownSlider');
  const simDownText = document.getElementById('simDownText');
  const simMonthsSelect = document.getElementById('simMonthsSelect');
  const simInstallmentVal = document.getElementById('simInstallmentVal');
  const simFinancedVal = document.getElementById('simFinancedVal');
  const simTotalInterest = document.getElementById('simTotalInterest');
  const btnSimWa = document.getElementById('btnSimWa');

  function calculateFinancing() {
    if (!simValSlider || !simDownSlider || !simMonthsSelect) return;

    const totalValue = parseFloat(simValSlider.value);
    const downPercent = parseFloat(simDownSlider.value);
    const months = parseInt(simMonthsSelect.value, 10);

    const downPayment = totalValue * (downPercent / 100);
    const financed = totalValue - downPayment;

    // Taxa média anual de 9.9% a.a. (~0.79% a.m.) Sistema Price/SAC
    const monthlyRate = 0.0079;
    const factor = Math.pow(1 + monthlyRate, months);
    const monthlyInstallment = (financed * (monthlyRate * factor)) / (factor - 1);

    if (simValText) simValText.textContent = `R$ ${totalValue.toLocaleString('pt-BR')}`;
    if (simDownText) simDownText.textContent = `R$ ${downPayment.toLocaleString('pt-BR')} (${downPercent}%)`;
    if (simFinancedVal) simFinancedVal.textContent = `R$ ${financed.toLocaleString('pt-BR')}`;
    if (simInstallmentVal) simInstallmentVal.textContent = `R$ ${Math.round(monthlyInstallment).toLocaleString('pt-BR')}`;
    if (simTotalInterest) simTotalInterest.textContent = `${months / 12} anos (${months} meses)`;

    if (btnSimWa) {
      const msg = encodeURIComponent(
        `Olá! Fiz uma simulação no site da Regiane Goveia Imobiliária:\n` +
        `• Valor do Imóvel: R$ ${totalValue.toLocaleString('pt-BR')}\n` +
        `• Entrada: R$ ${downPayment.toLocaleString('pt-BR')} (${downPercent}%)\n` +
        `• Financiamento: R$ ${financed.toLocaleString('pt-BR')} em ${months} meses\n` +
        `• Parcela Estimada: R$ ${Math.round(monthlyInstallment).toLocaleString('pt-BR')} /mês\n` +
        `Gostaria de saber quais opções de crédito e bancos aprovam meu perfil!`
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
     7. ABAS DO GUIA DE DOCUMENTOS DE LOCAÇÃO
     ========================================================================== */
  const docTabBtns = document.querySelectorAll('.doc-tab-btn');
  const docPanels = document.querySelectorAll('.docs-panel');

  docTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      docTabBtns.forEach(b => b.classList.remove('active'));
      docPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-doc');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  /* ==========================================================================
     8. FORMULÁRIO "ANUNCIE SEU IMÓVEL"
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
        `Quero cadastrar meu imóvel para ${purpose}:\n` +
        `• Proprietário: ${name}\n` +
        `• Telefone: ${phone}\n` +
        `• Tipo de Imóvel: ${type}\n` +
        `• Bairro/Cidade: ${neighborhood}\n` +
        `• Observações: ${notes || 'Sem observações adicionais.'}`
      );

      window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${waText}`, '_blank');
      ownerForm.reset();
      alert('Obrigado! Suas informações foram formatadas e o WhatsApp da Regiane Goveia foi aberto para concluir seu atendimento.');
    });
  }

  /* ==========================================================================
     9. SCROLL DO HEADER & MENU MOBILE
     ========================================================================== */
  const mainHeader = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (!mainHeader) return;
    if (window.scrollY > 40) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================================================
     10. INICIALIZAÇÃO
     ========================================================================== */
  populateFilterOptions();
  renderProperties(PROPERTIES_DATA);
});
