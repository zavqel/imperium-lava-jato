(() => {
  "use strict";

  const API = "https://imperium-api.imperiumlj.workers.dev";
  const ORDER_KEY = "imperium_order_v1";
  let siteConfig = {};
  let servicesPromise;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[char]);
  const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const categoryName = (service) => String(service.categoria || "Outros").trim() || "Outros";
  const duration = (service) => Math.max(0, number(service.duracao_minutos));
  const priceLabel = (service) => `${service.preco_tipo === "a_partir_de" ? "A partir de " : ""}${money(service.preco)}`;

  async function api(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    let data = {};
    try { data = await response.json(); } catch { /* resposta inválida */ }
    if (!response.ok || data.sucesso === false) throw new Error(data.erro || "Não foi possível carregar as informações agora.");
    return data;
  }

  async function getServices() {
    if (!servicesPromise) {
      servicesPromise = api("/api/servicos").then((data) => Array.isArray(data.servicos) ? data.servicos : []);
    }
    return servicesPromise;
  }

  function safeImage(value) {
    const url = String(value || "").trim();
    return /^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(url) ? url : "";
  }

  function imageMarkup(value, alt, className = "") {
    const url = safeImage(value);
    return url ? `<img${className ? ` class="${className}"` : ""} src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">` : "";
  }

  function paragraphs(value) {
    return String(value || "").trim().split(/\n{2,}/).filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
  }

  function itemLines(value) {
    return String(value || "").split(/\r?\n|;/).map((item) => item.replace(/^[-•✓\s]+/, "").trim()).filter(Boolean);
  }

  function setupNavigation() {
    const button = $(".menu-toggle");
    const nav = $(".main-nav");
    if (!button || !nav) return;
    button.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function applyConfig(config) {
    siteConfig = config || {};
    $$('[data-config]').forEach((node) => {
      const value = siteConfig[node.dataset.config];
      if (value !== undefined && value !== null && value !== "") node.textContent = value;
    });
    const whatsapp = String(siteConfig.whatsapp || "").replace(/\D/g, "");
    const whatsappLink = $("#whatsapp-link");
    if (whatsappLink && whatsapp) whatsappLink.href = `https://wa.me/${whatsapp.startsWith("55") ? whatsapp : `55${whatsapp}`}`;
    const instagramLink = $("#instagram-link");
    if (instagramLink && /^https?:\/\//i.test(siteConfig.instagram_url || "")) instagramLink.href = siteConfig.instagram_url;
    const mapsLink = $("#google-maps-link");
    if (mapsLink && /^https?:\/\//i.test(siteConfig.google_maps_url || "")) mapsLink.href = siteConfig.google_maps_url;
    if (siteConfig.seo_titulo) document.title = siteConfig.seo_titulo;
    const meta = $("#meta-description");
    if (meta && siteConfig.seo_descricao) meta.content = siteConfig.seo_descricao;
  }

  async function loadConfig() {
    try {
      const data = await api("/api/configuracoes");
      applyConfig(data.configuracoes || {});
    } catch {
      applyConfig({});
    }
  }

  function serviceCard(service) {
    const id = encodeURIComponent(service.id);
    const short = service.descricao_curta || service.descricao || service.descricao_completa || "Confira os detalhes deste serviço.";
    return `<article class="service-compact-card">
      <div class="service-compact-image">${imageMarkup(service.imagem, service.nome)}</div>
      <div class="service-compact-content">
        <span class="tag">${escapeHtml(categoryName(service))}</span>
        <h2>${escapeHtml(service.nome)}</h2>
        <p>${escapeHtml(short)}</p>
        <div class="service-meta"><strong class="service-price">${escapeHtml(priceLabel(service))}</strong>${duration(service) ? `<span>${duration(service)} min</span>` : ""}</div>
        <div class="service-card-actions"><a class="text-link" href="servico.html?id=${id}">Saiba mais →</a><a class="btn btn-secondary" href="montar.html?servico=${id}">Montar</a></div>
      </div>
    </article>`;
  }

  async function initServicesPage() {
    const root = $("#services-page");
    const categoryRoot = $("#service-categories");
    if (!root || !categoryRoot) return;
    try {
      const services = await getServices();
      if (!services.length) {
        root.innerHTML = '<div class="empty-state">Nenhum serviço está disponível no momento.</div>';
        return;
      }
      const categories = [...new Set(services.map(categoryName))];
      let active = categories[0];
      const render = () => {
        categoryRoot.innerHTML = categories.map((category) => `<button class="category-pill${category === active ? " active" : ""}" type="button" role="tab" aria-selected="${category === active}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");
        const current = services.filter((service) => categoryName(service) === active);
        root.innerHTML = current.map(serviceCard).join("");
        $$("[data-category]", categoryRoot).forEach((button) => button.addEventListener("click", () => {
          active = button.dataset.category;
          render();
        }));
      };
      render();
    } catch (error) {
      root.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  }

  async function initServiceDetail() {
    const root = $("#service-detail");
    if (!root) return;
    const id = Number(new URLSearchParams(location.search).get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      root.innerHTML = '<div class="empty-state">Serviço não encontrado. <a class="text-link" href="servicos.html">Ver todos os serviços</a></div>';
      return;
    }
    try {
      const data = await api(`/api/servicos/${id}`);
      const service = data.servico;
      if (!service) throw new Error("Serviço não encontrado.");
      document.title = `${service.nome} | IMPÉRIUM`;
      const overview = service.descricao_completa || service.descricao || service.descricao_curta || "Os detalhes deste serviço serão confirmados no atendimento.";
      const inclusions = itemLines(service.itens_inclusos);
      root.innerHTML = `<div class="service-detail-layout">
        <article class="service-detail-main">
          <span class="eyebrow">${escapeHtml(categoryName(service))}</span>
          <h1>${escapeHtml(service.nome)}</h1>
          <p class="service-detail-summary">${escapeHtml(service.descricao_curta || service.descricao || "Conheça todos os detalhes antes de montar seu atendimento.")}</p>
          ${imageMarkup(service.imagem, service.nome, "service-detail-image")}
          <h2>Sobre este serviço</h2>${paragraphs(overview)}
          ${inclusions.length ? `<h2>O que está incluído</h2><ul class="included-list">${inclusions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
          ${service.observacoes ? `<h2>Observações</h2>${paragraphs(service.observacoes)}` : ""}
        </article>
        <aside class="service-detail-aside">
          <span class="tag">${escapeHtml(categoryName(service))}</span>
          <strong class="service-price">${escapeHtml(priceLabel(service))}</strong>
          <p class="service-duration">${duration(service) ? `Tempo estimado: ${duration(service)} minutos` : "Tempo a confirmar"}</p>
          <a class="btn btn-primary btn-full" href="montar.html?servico=${encodeURIComponent(service.id)}">Montar meu atendimento</a>
          <small>Os preços “a partir de” e o tempo podem ser confirmados após a avaliação do veículo.</small>
        </aside>
      </div>`;
    } catch (error) {
      root.innerHTML = `<div class="empty-state">${escapeHtml(error.message)} <a class="text-link" href="servicos.html">Voltar para serviços</a></div>`;
    }
  }

  function isBaseService(service) {
    return /lavagem/i.test(`${categoryName(service)} ${service.nome || ""}`);
  }

  function calculateDiscount(subtotal) {
    const levels = [
      [number(siteConfig.desconto_25_min, 600), number(siteConfig.desconto_25_percentual, 25)],
      [number(siteConfig.desconto_15_min, 300), number(siteConfig.desconto_15_percentual, 15)],
      [number(siteConfig.desconto_10_min, 250), number(siteConfig.desconto_10_percentual, 10)],
      [number(siteConfig.desconto_5_min, 200), number(siteConfig.desconto_5_percentual, 5)]
    ].filter(([minimum, rate]) => minimum > 0 && rate > 0).sort((a, b) => b[0] - a[0]);
    const level = levels.find(([minimum]) => subtotal >= minimum);
    return { rate: level ? level[1] / 100 : 0, levels };
  }

  function saveOrder(order) {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }

  function readOrder() {
    try {
      const order = JSON.parse(localStorage.getItem(ORDER_KEY) || "{}");
      return { serviceIds: Array.isArray(order.serviceIds) ? order.serviceIds.map(Number).filter(Number.isInteger) : [], motorAware: order.motorAware === true };
    } catch { return { serviceIds: [], motorAware: false }; }
  }

  async function initBuilder() {
    const baseRoot = $("#base-services");
    const addonsRoot = $("#addons");
    if (!baseRoot || !addonsRoot) return;
    try {
      const services = await getServices();
      const baseServices = services.filter(isBaseService);
      const bases = baseServices.length ? baseServices : services;
      const baseIds = new Set(bases.map((service) => Number(service.id)));
      const addons = services.filter((service) => !baseIds.has(Number(service.id)));
      const requestedId = Number(new URLSearchParams(location.search).get("servico"));
      const selected = new Set();
      if (services.some((service) => Number(service.id) === requestedId)) selected.add(requestedId);
      const motorBlock = $("#motor");
      const hasMotor = services.some((service) => /motor/i.test(`${service.nome || ""} ${categoryName(service)}`));
      if (motorBlock && !hasMotor) motorBlock.classList.add("hidden-by-app");
      if ($("#motor-warning") && siteConfig.motor_aviso) $("#motor-warning").textContent = siteConfig.motor_aviso;
      if ($("#motor-hours") && siteConfig.motor_resfriamento_horas) $("#motor-hours").textContent = siteConfig.motor_resfriamento_horas;
      if ($("#motor-checkbox-label") && siteConfig.motor_termo_checkbox) $("#motor-checkbox-label").textContent = siteConfig.motor_termo_checkbox;

      const selectedServices = () => services.filter((service) => selected.has(Number(service.id)));
      const option = (service, kind) => `<label class="option-card">
        <input type="${kind === "base" ? "radio" : "checkbox"}" name="${kind === "base" ? "base-service" : `addon-${service.id}`}" value="${service.id}" ${selected.has(Number(service.id)) ? "checked" : ""} data-service-choice data-kind="${kind}">
        <span class="option-card-body"><span class="tag">${escapeHtml(categoryName(service))}</span><h3>${escapeHtml(service.nome)}</h3><small>${escapeHtml(service.descricao_curta || service.descricao || "Veja todos os detalhes antes de agendar.")}</small><span class="option-card-actions"><a href="servico.html?id=${encodeURIComponent(service.id)}" target="_blank" rel="noopener">Saiba mais ↗</a></span></span>
        <span class="option-price">${escapeHtml(priceLabel(service))}${duration(service) ? `<small>${duration(service)} min</small>` : ""}</span>
      </label>`;
      const renderLists = () => {
        baseRoot.innerHTML = bases.length ? bases.map((service) => option(service, "base")).join("") : '<span class="empty-state">Nenhum serviço cadastrado.</span>';
        addonsRoot.innerHTML = addons.length ? addons.map((service) => option(service, "addon")).join("") : '<span class="empty-state">Os demais serviços aparecerão aqui.</span>';
        $$('[data-service-choice]').forEach((input) => input.addEventListener("change", () => {
          const id = Number(input.value);
          if (input.dataset.kind === "base") {
            bases.forEach((service) => selected.delete(Number(service.id)));
            if (input.checked) selected.add(id);
          } else if (input.checked) selected.add(id); else selected.delete(id);
          renderLists();
          updateSummary();
        }));
      };
      const updateSummary = () => {
        const chosen = selectedServices();
        const subtotal = chosen.reduce((total, service) => total + number(service.preco), 0);
        const discount = calculateDiscount(subtotal);
        const discountAmount = subtotal * discount.rate;
        const total = subtotal - discountAmount;
        const motorSelected = chosen.some((service) => /motor/i.test(`${service.nome || ""} ${categoryName(service)}`));
        const motorCheckbox = $("#motor-aware");
        if (motorBlock && hasMotor) motorBlock.classList.toggle("hidden-by-app", !motorSelected);
        if (!motorSelected && motorCheckbox) motorCheckbox.checked = false;
        const items = $("#selected-items");
        if (items) items.innerHTML = chosen.length ? chosen.map((service) => `<div class="selected-item"><span>${escapeHtml(service.nome)}</span><strong>${escapeHtml(priceLabel(service))}</strong></div>`).join("") : '<div class="selected-item"><span>Escolha os serviços</span></div>';
        if ($("#subtotal-price")) $("#subtotal-price").textContent = money(subtotal);
        if ($("#discount-value")) $("#discount-value").textContent = discount.rate ? `-${money(discountAmount)}` : money(0);
        if ($("#discount-label")) $("#discount-label").textContent = discount.rate ? `Desconto (${Math.round(discount.rate * 100)}%)` : "Desconto";
        if ($("#total-price")) $("#total-price").textContent = money(total);
        if ($("#order-status")) $("#order-status").textContent = chosen.length ? `${chosen.length} serviço${chosen.length > 1 ? "s" : ""}` : "Em montagem";
        const next = discount.levels.filter(([minimum]) => minimum > subtotal).sort((a, b) => a[0] - b[0])[0];
        if ($("#next-discount-message")) $("#next-discount-message").textContent = next ? `Faltam ${money(next[0] - subtotal)} para ${next[1]}% de desconto.` : (discount.rate ? "Melhor desconto disponível aplicado." : "Adicione serviços para ativar os descontos.");
        if ($("#next-discount-value")) $("#next-discount-value").textContent = next ? `${next[1]}%` : "";
        if ($("#discount-progress")) $("#discount-progress").style.width = `${Math.min(100, next ? (subtotal / next[0]) * 100 : 100)}%`;
      };
      renderLists();
      updateSummary();
      $("#go-scheduling")?.addEventListener("click", () => {
        const chosen = selectedServices();
        const motorSelected = chosen.some((service) => /motor/i.test(`${service.nome || ""} ${categoryName(service)}`));
        if (!chosen.length) return alert("Escolha pelo menos um serviço para continuar.");
        if (motorSelected && !$("#motor-aware")?.checked) return alert("Confirme que leu as condições da lavagem de motor para continuar.");
        saveOrder({ serviceIds: chosen.map((service) => Number(service.id)), motorAware: Boolean($("#motor-aware")?.checked) });
        location.href = "agendamento.html";
      });
    } catch (error) {
      baseRoot.innerHTML = `<span class="empty-state">${escapeHtml(error.message)}</span>`;
      addonsRoot.innerHTML = "";
    }
  }

  function currentDateInSaoPaulo() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  async function initBooking() {
    const summaryRoot = $("#booking-order");
    if (!summaryRoot) return;
    const saved = readOrder();
    try {
      const allServices = await getServices();
      const services = allServices.filter((service) => saved.serviceIds.includes(Number(service.id)));
      if (!services.length) {
        summaryRoot.innerHTML = '<div class="selected-item"><span>Nenhum serviço selecionado.</span></div>';
        $("#time-slots").innerHTML = '<span class="empty-state">Volte e monte seu atendimento antes de escolher um horário.</span>';
        return;
      }
      const serviceIds = services.map((service) => Number(service.id));
      let selectedTime = "";
      let serverTotals = null;
      const dateInput = $("#booking-date");
      dateInput.min = currentDateInSaoPaulo();
      const renderSummary = () => {
        const subtotal = serverTotals ? number(serverTotals.subtotal) : services.reduce((total, service) => total + number(service.preco), 0);
        const discountAmount = serverTotals ? number(serverTotals.desconto) : subtotal * calculateDiscount(subtotal).rate;
        const total = serverTotals ? number(serverTotals.total) : subtotal - discountAmount;
        summaryRoot.innerHTML = services.map((service) => `<div class="selected-item"><span>${escapeHtml(service.nome)}</span><strong>${escapeHtml(priceLabel(service))}</strong></div>`).join("");
        $("#booking-subtotal").textContent = money(subtotal);
        $("#booking-discount").textContent = discountAmount ? `-${money(discountAmount)}` : money(0);
        $("#booking-total").textContent = money(total);
      };
      const updateConfirm = () => { $("#confirm-booking").disabled = !selectedTime; };
      const renderSlots = (slots) => {
        const root = $("#time-slots");
        if (!slots.length) { root.innerHTML = '<span class="empty-state">Não há horários disponíveis nesta data.</span>'; return; }
        root.innerHTML = slots.map((slot) => `<button class="time-slot${slot.hora_inicio === selectedTime ? " selected" : ""}" type="button" data-time="${escapeHtml(slot.hora_inicio)}">${escapeHtml(slot.hora_inicio)}<small>até ${escapeHtml(slot.hora_fim)}</small></button>`).join("");
        $$('[data-time]', root).forEach((button) => button.addEventListener("click", () => {
          selectedTime = button.dataset.time;
          renderSlots(slots);
          updateConfirm();
        }));
      };
      const loadSlots = async () => {
        selectedTime = "";
        updateConfirm();
        const date = dateInput.value;
        if (!date) return;
        $("#time-slots").innerHTML = '<span class="empty-state">Consultando horários...</span>';
        try {
          const data = await api(`/api/agendamentos/disponibilidade?date=${encodeURIComponent(date)}&service_ids=${encodeURIComponent(serviceIds.join(","))}`);
          serverTotals = data;
          renderSummary();
          $("#duration-label").textContent = `Tempo estimado: ${number(data.duracao_minutos)} min`;
          renderSlots(Array.isArray(data.horarios) ? data.horarios : []);
        } catch (error) {
          $("#time-slots").innerHTML = `<span class="empty-state">${escapeHtml(error.message)}</span>`;
        }
      };
      renderSummary();
      dateInput.addEventListener("change", loadSlots);
      $("#confirm-booking").addEventListener("click", async () => {
        const feedback = $("#booking-feedback");
        const name = $("#customer-name").value.trim();
        const phone = $("#customer-phone").value.trim();
        if (!dateInput.value || !selectedTime || !name || !phone) { feedback.className = "feedback error"; feedback.textContent = "Preencha seu contato e selecione um horário para continuar."; return; }
        const button = $("#confirm-booking");
        button.disabled = true;
        feedback.className = "feedback";
        feedback.textContent = "Confirmando agendamento...";
        try {
          const data = await api("/api/agendamentos", { method: "POST", body: JSON.stringify({ data: dateInput.value, hora_inicio: selectedTime, nome: name, telefone: phone, service_ids: serviceIds, advance_call: Boolean($("#advance-call").checked), motor_aware: saved.motorAware }) });
          localStorage.removeItem(ORDER_KEY);
          feedback.className = "feedback success";
          feedback.textContent = `Agendamento registrado com sucesso para ${data.data}, às ${data.hora_inicio}.`;
          $("#time-slots").innerHTML = '<div class="booking-confirmed">Seu pedido foi enviado. Em breve entraremos em contato para confirmar.</div>';
        } catch (error) {
          button.disabled = false;
          feedback.className = "feedback error";
          feedback.textContent = error.message;
        }
      });
    } catch (error) {
      summaryRoot.innerHTML = `<div class="selected-item"><span>${escapeHtml(error.message)}</span></div>`;
    }
  }

  async function initPromotions() {
    const root = $("#promotions-page");
    if (!root) return;
    try {
      const data = await api("/api/promocoes");
      const promotions = Array.isArray(data.promocoes) ? data.promocoes : [];
      root.innerHTML = promotions.length ? promotions.map((promo) => `<article class="feature-card">
        ${imageMarkup(promo.imagem, promo.titulo)}<span class="tag">PROMOÇÃO</span><h3>${escapeHtml(promo.titulo)}</h3>
        <strong class="service-price">${promo.preco == null ? "Consulte" : money(promo.preco)}</strong>${promo.preco_anterior ? `<p><s>${money(promo.preco_anterior)}</s></p>` : ""}
        <p>${escapeHtml(promo.descricao || "Confira as condições desta promoção.")}</p>${promo.data_fim ? `<small>Válida até ${escapeHtml(promo.data_fim)}</small>` : ""}
      </article>`).join("") : '<div class="empty-state">Não há promoções ativas no momento.</div>';
    } catch (error) {
      root.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    setupNavigation();
    $$("#year").forEach((node) => { node.textContent = new Date().getFullYear(); });
    await loadConfig();
    await Promise.all([initServicesPage(), initServiceDetail(), initBuilder(), initBooking(), initPromotions()]);
  });
})();
