const API_URL = 'https://imperium-api.imperiumlj.workers.dev';

const IMPERIUM = {
  businessHours: {
    open: '08:00',
    close: '17:00',
    earlyOpen: '06:30'
  },

  arrivalBeforeMinutes: 10,
  toleranceMinutes: 10,
  apiOnline: false,
  servicesLoaded: false,

  services: {
    economica: {
      id: 'economica',
      name: 'Lavagem Econômica',
      price: 75,
      minutes: null,
      group: 'Lavagem base',
      vehicle: 'carro-pequeno',
      desc: 'Lavagem econômica.'
    },

    basica: {
      id: 'basica',
      name: 'Lavagem Básica',
      price: 90,
      minutes: null,
      group: 'Lavagem base',
      vehicle: 'carro-pequeno',
      desc: 'Lavagem básica.'
    },

    completa: {
      id: 'completa',
      name: 'Lavagem Completa',
      price: 100,
      minutes: null,
      group: 'Lavagem base',
      vehicle: 'carro-pequeno',
      desc: 'Lavagem completa.'
    },

    descontaminacao: {
      id: 'descontaminacao',
      name: 'Descontaminação de pintura',
      price: 600,
      minutes: null,
      group: 'Estética',
      vehicle: 'qualquer',
      desc: 'Descontaminação de pintura.'
    },

    polimento: {
      id: 'polimento',
      name: 'Polimento',
      price: 600,
      minutes: null,
      group: 'Estética',
      vehicle: 'qualquer',
      desc: 'Polimento.'
    },

    bancos: {
      id: 'bancos',
      name: 'Higienização de bancos',
      price: 250,
      minutes: null,
      group: 'Higienização',
      vehicle: 'qualquer',
      desc: 'Higienização de bancos.'
    },

    carpete: {
      id: 'carpete',
      name: 'Higienização de carpete',
      price: 200,
      minutes: null,
      group: 'Higienização',
      vehicle: 'qualquer',
      desc: 'Higienização de carpete.'
    },

    teto: {
      id: 'teto',
      name: 'Higienização de teto',
      price: 150,
      minutes: null,
      group: 'Higienização',
      vehicle: 'qualquer',
      desc: 'Higienização de teto.'
    },

    plasticos: {
      id: 'plasticos',
      name: 'Partes plásticas / forros de porta',
      price: 150,
      minutes: null,
      group: 'Higienização',
      vehicle: 'qualquer',
      desc: 'Higienização de partes plásticas e forros de porta.'
    },

    chassi: {
      id: 'chassi',
      name: 'Lavagem de chassi',
      price: 150,
      minutes: null,
      group: 'Chassi',
      vehicle: 'qualquer',
      desc: 'Lavagem de chassi.'
    },

    motor: {
      id: 'motor',
      name: 'Lavagem de motor',
      price: 0,
      minutes: null,
      group: 'Motor',
      vehicle: 'qualquer',
      desc: 'Lavagem de motor.'
    }
  },

  discounts: [
    {
      min: 600,
      rate: 0.25,
      label: '25%'
    },
    {
      min: 300,
      rate: 0.15,
      label: '15%'
    },
    {
      min: 250,
      rate: 0.10,
      label: '10%'
    },
    {
      min: 200,
      rate: 0.05,
      label: '5%'
    }
  ]
};


function money(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value) || 0);
}


function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}


function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function getDiscount(subtotal) {
  return IMPERIUM.discounts.find(
    item => subtotal >= item.min
  ) || {
    min: 0,
    rate: 0,
    label: '0%'
  };
}


function getNextDiscount(subtotal) {
  const next = [...IMPERIUM.discounts]
    .sort((a, b) => a.min - b.min)
    .find(item => subtotal < item.min);

  return next || null;
}


/* =========================================================
   CARREGA SERVIÇOS DO D1
   ========================================================= */

async function loadServicesFromAPI() {
  try {
    const response = await fetch(
      `${API_URL}/api/servicos`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(
        'Não foi possível consultar os serviços.'
      );
    }

    const data = await response.json();

    if (
      !data.sucesso ||
      !Array.isArray(data.servicos)
    ) {
      throw new Error(
        'Resposta inválida da API.'
      );
    }

    const apiServices = data.servicos;

    const aliases = {
      economica: [
        'lavagem economica'
      ],

      basica: [
        'lavagem basica'
      ],

      completa: [
        'lavagem completa'
      ],

      descontaminacao: [
        'descontaminacao de pintura'
      ],

      polimento: [
        'polimento'
      ],

      bancos: [
        'higienizacao de bancos'
      ],

      carpete: [
        'higienizacao de carpete'
      ],

      teto: [
        'higienizacao de teto',
        'higienizacao de teto interno'
      ],

      plasticos: [
        'partes plasticas / forros de porta',
        'higienizacao de partes plasticas',
        'higienizacao de plasticos'
      ],

      chassi: [
        'lavagem de chassi'
      ],

      motor: [
        'lavagem de motor'
      ]
    };

    let matched = 0;

    for (
      const [slug, names]
      of Object.entries(aliases)
    ) {
      const found = apiServices.find(
        service =>
          names.includes(
            normalizeText(service.nome)
          )
      );

      if (found) {
        IMPERIUM.services[slug] = {
          ...IMPERIUM.services[slug],

          dbId: Number(found.id),

          name: found.nome,

          price: Number(
            found.preco || 0
          ),

          minutes: Number(
            found.duracao_minutos || 0
          ),

          group:
            found.categoria ||
            IMPERIUM.services[slug].group,

          desc:
            found.descricao ||
            IMPERIUM.services[slug].desc
        };

        matched++;
      }
    }

    IMPERIUM.apiOnline = true;
    IMPERIUM.servicesLoaded = matched > 0;

    return {
      ok: true,
      matched,
      total: apiServices.length
    };

  } catch (error) {

    console.error(
      'Erro ao carregar serviços:',
      error
    );

    IMPERIUM.apiOnline = false;
    IMPERIUM.servicesLoaded = false;

    return {
      ok: false,
      error
    };
  }
}


/* =========================================================
   PEDIDO
   ========================================================= */

function calculateOrder() {

  const base =
    localStorage.getItem(
      'imperiumBase'
    ) || 'economica';

  const addons =
    JSON.parse(
      localStorage.getItem(
        'imperiumAddons'
      ) || '[]'
    );

  const items = [
    base,
    ...addons
  ]
    .map(
      id => IMPERIUM.services[id]
    )
    .filter(Boolean);

  const subtotal =
    items.reduce(
      (sum, item) =>
        sum + Number(item.price || 0),
      0
    );

  const discount =
    getDiscount(subtotal);

  const discountValue =
    subtotal * discount.rate;

  const total =
    subtotal - discountValue;

  const hasPendingPrice =
    items.some(
      item =>
        item.price == null ||
        Number(item.price) < 0
    );

  const hasPendingDuration =
    items.some(
      item =>
        !Number.isFinite(
          Number(item.minutes)
        ) ||
        Number(item.minutes) <= 0
    );

  const minutes =
    hasPendingDuration
      ? null
      : items.reduce(
          (sum, item) =>
            sum + Number(item.minutes),
          0
        );

  const serviceIds =
    items
      .map(
        item => Number(item.dbId)
      )
      .filter(
        Number.isInteger
      );

  return {
    base,
    addons,
    items,
    subtotal,
    discount,
    discountValue,
    total,
    minutes,
    hasPendingPrice,
    hasPendingDuration,
    serviceIds
  };
}


function saveSelection(
  base,
  addons
) {
  localStorage.setItem(
    'imperiumBase',
    base
  );

  localStorage.setItem(
    'imperiumAddons',
    JSON.stringify(addons)
  );
}


function renderSelectedItems(
  targetId,
  order
) {

  const target =
    document.getElementById(
      targetId
    );

  if (!target) return;

  if (!order.items.length) {
    target.innerHTML =
      '<span class="empty-state">Nenhum serviço selecionado.</span>';

    return;
  }

  target.innerHTML =
    order.items
      .map(
        item => `
          <div class="selected-item">
            <span>
              ${escapeHtml(item.name)}
            </span>

            <strong>
              ${money(item.price)}
            </strong>
          </div>
        `
      )
      .join('');
}


/* =========================================================
   MONTADOR
   ========================================================= */

function renderBuilder() {

  const base =
    localStorage.getItem(
      'imperiumBase'
    ) || 'economica';

  const addons =
    JSON.parse(
      localStorage.getItem(
        'imperiumAddons'
      ) || '[]'
    );

  const baseInputs =
    document.querySelectorAll(
      'input[name="base-service"]'
    );

  baseInputs.forEach(
    input => {
      input.checked =
        input.value === base;

      input.addEventListener(
        'change',
        () => {
          if (!input.checked) return;

          saveSelection(
            input.value,
            JSON.parse(
              localStorage.getItem(
                'imperiumAddons'
              ) || '[]'
            )
          );

          updateBuilder();
        }
      );
    }
  );

  const addonInputs =
    document.querySelectorAll(
      '.addon-check'
    );

  addonInputs.forEach(
    input => {

      input.checked =
        addons.includes(
          input.value
        );

      input.addEventListener(
        'change',
        () => {

          const selected =
            Array.from(
              document.querySelectorAll(
                '.addon-check:checked'
              )
            )
            .map(
              item => item.value
            );

          const currentBase =
            document.querySelector(
              'input[name="base-service"]:checked'
            )?.value ||
            base;

          saveSelection(
            currentBase,
            selected
          );

          updateBuilder();
        }
      );
    }
  );

  updateBuilder();
}


function updateBuilder() {

  const base =
    document.querySelector(
      'input[name="base-service"]:checked'
    )?.value ||
    localStorage.getItem(
      'imperiumBase'
    ) ||
    'economica';

  const addons =
    Array.from(
      document.querySelectorAll(
        '.addon-check:checked'
      )
    )
    .map(
      input => input.value
    );

  const motorAware =
    document.getElementById(
      'motor-aware'
    );

  if (
    addons.includes('motor') &&
    motorAware &&
    !motorAware.checked
  ) {

    const motorInput =
      document.querySelector(
        'input.addon-check[value="motor"]'
      );

    if (motorInput) {
      motorInput.checked = false;
    }

    const index =
      addons.indexOf('motor');

    if (index >= 0) {
      addons.splice(index, 1);
    }
  }

  saveSelection(
    base,
    addons
  );

  const order =
    calculateOrder();

  const subtotalEl =
    document.getElementById(
      'subtotal-price'
    );

  const discountValueEl =
    document.getElementById(
      'discount-value'
    );

  const totalEl =
    document.getElementById(
      'total-price'
    );

  if (subtotalEl) {
    subtotalEl.textContent =
      money(order.subtotal);
  }

  if (discountValueEl) {
    discountValueEl.textContent =
      order.discountValue
        ? `- ${money(order.discountValue)}`
        : money(0);
  }

  if (totalEl) {
    totalEl.textContent =
      order.hasPendingPrice
        ? 'A confirmar'
        : money(order.total);
  }

  renderSelectedItems(
    'selected-items',
    order
  );

  const msg =
    document.getElementById(
      'next-discount-message'
    );

  const value =
    document.getElementById(
      'next-discount-value'
    );

  const progress =
    document.getElementById(
      'discount-progress'
    );

  const next =
    getNextDiscount(
      order.subtotal
    );

  if (
    msg &&
    value &&
    progress
  ) {

    if (next) {

      msg.textContent =
        `Faltam ${money(
          next.min -
          order.subtotal
        )} para ${next.label} de desconto.`;

      value.textContent =
        `Meta: ${money(next.min)}`;

      progress.style.width =
        Math.min(
          100,
          (order.subtotal /
            next.min) * 100
        ) + '%';

    } else {

      msg.textContent =
        'Você já atingiu o maior desconto do combo.';

      value.textContent =
        '25%';

      progress.style.width =
        '100%';
    }
  }

  const status =
    document.getElementById(
      'order-status'
    );

  if (status) {
    status.textContent =
      order.items.length > 1
        ? 'Combo'
        : '1 serviço';
  }
}


function bindMotorAwareness() {

  const checkbox =
    document.getElementById(
      'motor-aware'
    );

  const motorCheck =
    document.querySelector(
      '.addon-check[value="motor"]'
    );

  if (
    !checkbox ||
    !motorCheck
  ) return;

  checkbox.addEventListener(
    'change',
    () => {

      motorCheck.checked =
        checkbox.checked;

      updateBuilder();
    }
  );

  if (motorCheck.checked) {
    checkbox.checked = true;
  }
}


function goToScheduling() {

  const order =
    calculateOrder();

  if (!order.items.length) {

    alert(
      'Escolha pelo menos um serviço antes de continuar.'
    );

    return;
  }

  if (
    !IMPERIUM.apiOnline ||
    !IMPERIUM.servicesLoaded ||
    order.serviceIds.length !==
      order.items.length
  ) {

    alert(
      'Não foi possível confirmar os serviços no sistema. Atualize a página e tente novamente.'
    );

    return;
  }

  if (
    order.hasPendingPrice ||
    order.hasPendingDuration
  ) {

    alert(
      'Este atendimento ainda não possui preço ou duração cadastrados no sistema.'
    );

    return;
  }

  if (
    order.items.some(
      item => item.id === 'motor'
    ) &&
    !document.getElementById(
      'motor-aware'
    )?.checked
  ) {

    alert(
      'Para selecionar a lavagem de motor, confirme a ciência dos riscos.'
    );

    return;
  }

  window.location.href =
    'agendamento.html';
}

window.goToScheduling =
  goToScheduling;


/* =========================================================
   HORÁRIOS
   ========================================================= */

function minutesFromTime(time) {

  const [
    h,
    m
  ] = time
    .split(':')
    .map(Number);

  return h * 60 + m;
}


function timeLabel(total) {

  const h =
    Math.floor(
      total / 60
    );

  const m =
    total % 60;

  return (
    String(h).padStart(2, '0') +
    ':' +
    String(m).padStart(2, '0')
  );
}


async function getAvailability(
  date,
  serviceIds
) {

  const params =
    new URLSearchParams({
      date,
      service_ids:
        serviceIds.join(',')
    });

  const response =
    await fetch(
      `${API_URL}/api/agendamentos/disponibilidade?${params.toString()}`,
      {
        cache: 'no-store'
      }
    );

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (
    !response.ok ||
    !data.sucesso
  ) {

    throw new Error(
      data.erro ||
      'Não foi possível consultar a agenda.'
    );
  }

  return data;
}


/* =========================================================
   AGENDAMENTO
   ========================================================= */

function setupBooking() {

  if (
    !document.getElementById(
      'time-slots'
    )
  ) return;

  const order =
    calculateOrder();

  renderSelectedItems(
    'booking-order',
    order
  );

  const sub =
    document.getElementById(
      'booking-subtotal'
    );

  const dis =
    document.getElementById(
      'booking-discount'
    );

  const tot =
    document.getElementById(
      'booking-total'
    );

  const durationLabel =
    document.getElementById(
      'duration-label'
    );

  if (sub) {
    sub.textContent =
      money(order.subtotal);
  }

  if (dis) {
    dis.textContent =
      order.discountValue
        ? `- ${money(order.discountValue)}`
        : money(0);
  }

  if (tot) {
    tot.textContent =
      order.hasPendingPrice
        ? 'A confirmar'
        : money(order.total);
  }

  if (durationLabel) {
    durationLabel.textContent =
      order.hasPendingDuration
        ? 'Tempo estimado: a confirmar'
        : `Tempo estimado: ${order.minutes} min`;
  }

  const dateInput =
    document.getElementById(
      'booking-date'
    );

  const feedback =
    document.getElementById(
      'booking-feedback'
    );

  const confirm =
    document.getElementById(
      'confirm-booking'
    );

  const slotsEl =
    document.getElementById(
      'time-slots'
    );

  let chosenTime = '';

  let availabilityRequest = 0;

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  dateInput.min =
    today
      .toISOString()
      .split('T')[0];


  async function renderSlots() {

    const requestId =
      ++availabilityRequest;

    chosenTime = '';

    confirm.disabled = true;

    if (!dateInput.value) {

      slotsEl.innerHTML =
        '<span class="empty-state">Escolha uma data para consultar os horários.</span>';

      return;
    }

    if (
      order.hasPendingPrice ||
      order.hasPendingDuration ||
      order.serviceIds.length !==
        order.items.length
    ) {

      slotsEl.innerHTML =
        '<span class="empty-state">Este atendimento ainda não está pronto para ser agendado.</span>';

      return;
    }

    slotsEl.innerHTML =
      '<span class="empty-state">Consultando horários disponíveis...</span>';

    try {

      const data =
        await getAvailability(
          dateInput.value,
          order.serviceIds
        );

      if (
        requestId !==
        availabilityRequest
      ) return;

      if (durationLabel) {

        durationLabel.textContent =
          `Tempo estimado: ${data.duracao_minutos} min`;
      }

      if (
        !Array.isArray(
          data.horarios
        ) ||
        !data.horarios.length
      ) {

        slotsEl.innerHTML =
          '<span class="empty-state">Não há horários disponíveis para esta data.</span>';

        return;
      }

      slotsEl.innerHTML =
        data.horarios
          .map(
            slot => `
              <button
                type="button"
                class="time-slot"
                data-time="${escapeHtml(
                  slot.hora_inicio
                )}"
              >
                <span>
                  ${escapeHtml(
                    slot.hora_inicio
                  )}
                </span>

                <small>
                  termina ${escapeHtml(
                    slot.hora_fim
                  )}
                </small>
              </button>
            `
          )
          .join('');

      slotsEl
        .querySelectorAll(
          '.time-slot'
        )
        .forEach(
          btn => {

            btn.addEventListener(
              'click',
              () => {

                slotsEl
                  .querySelectorAll(
                    '.time-slot'
                  )
                  .forEach(
                    el =>
                      el.classList.remove(
                        'selected'
                      )
                  );

                btn.classList.add(
                  'selected'
                );

                chosenTime =
                  btn.dataset.time;

                confirm.disabled =
                  false;

                feedback.textContent =
                  '';

                feedback.className =
                  'feedback';
              }
            );
          }
        );

    } catch (error) {

      if (
        requestId !==
        availabilityRequest
      ) return;

      slotsEl.innerHTML =
        `<span class="empty-state">${
          escapeHtml(
            error.message ||
            'Erro ao consultar horários.'
          )
        }</span>`;
    }
  }


  dateInput.addEventListener(
    'change',
    renderSlots
  );

  renderSlots();


  /* =======================================================
     CONFIRMAR AGENDAMENTO
     ======================================================= */

  confirm.addEventListener(
    'click',
    async () => {

      const name =
        document
          .getElementById(
            'customer-name'
          )
          ?.value
          .trim();

      const phone =
        document
          .getElementById(
            'customer-phone'
          )
          ?.value
          .trim();

      const advanceCall =
        document
          .getElementById(
            'advance-call'
          )
          ?.checked ||
        false;


      if (!chosenTime) {

        feedback.textContent =
          'Escolha um horário.';

        feedback.className =
          'feedback error';

        return;
      }


      if (!name || !phone) {

        feedback.textContent =
          'Preencha nome e WhatsApp para continuar.';

        feedback.className =
          'feedback error';

        return;
      }


      if (
        order.serviceIds.length !==
        order.items.length
      ) {

        feedback.textContent =
          'Não foi possível identificar todos os serviços. Volte e atualize a página.';

        feedback.className =
          'feedback error';

        return;
      }


      confirm.disabled = true;

      feedback.textContent =
        'Confirmando disponibilidade e registrando seu agendamento...';

      feedback.className =
        'feedback';


      try {

        const response =
          await fetch(
            `${API_URL}/api/agendamentos`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body: JSON.stringify({
                data:
                  dateInput.value,

                hora_inicio:
                  chosenTime,

                nome:
                  name,

                telefone:
                  phone,

                observacoes:
                  advanceCall
                    ? 'Cliente deseja ser avisado caso o atendimento possa ser antecipado.'
                    : null,

                service_ids:
                  order.serviceIds
              })
            }
          );


        const data =
          await response
            .json()
            .catch(
              () => ({})
            );


        if (
          !response.ok ||
          !data.sucesso
        ) {

          throw new Error(
            data.erro ||
            'Não foi possível confirmar o agendamento.'
          );
        }


        localStorage.setItem(
          'imperiumBookingDraft',
          JSON.stringify({
            id:
              data.agendamento_id,

            date:
              dateInput.value,

            time:
              data.hora_inicio ||
              chosenTime,

            name,

            phone,

            advanceCall,

            order: {
              base:
                order.base,

              addons:
                order.addons,

              total:
                data.total,

              discount:
                order.discount.rate,

              minutes:
                data.duracao_minutos
            }
          })
        );


        feedback.textContent =
          `Agendamento confirmado para ${
            dateInput.value
              .split('-')
              .reverse()
              .join('/')
          } às ${
            data.hora_inicio ||
            chosenTime
          }.`;

        feedback.className =
          'feedback success';


        slotsEl
          .querySelectorAll(
            '.time-slot'
          )
          .forEach(
            el =>
              el.disabled = true
          );


      } catch (error) {

        feedback.textContent =
          error.message ||
          'Não foi possível confirmar o agendamento.';

        feedback.className =
          'feedback error';

        confirm.disabled =
          false;

        await renderSlots();
      }
    }
  );
}


/* =========================================================
   MENU
   ========================================================= */

function setupMenu() {

  const button =
    document.querySelector(
      '.menu-toggle'
    );

  const nav =
    document.querySelector(
      '.main-nav'
    );

  if (!button || !nav) return;

  button.addEventListener(
    'click',
    () => {

      const open =
        nav.classList.toggle(
          'open'
        );

      button.setAttribute(
        'aria-expanded',
        String(open)
      );
    }
  );

  nav
    .querySelectorAll('a')
    .forEach(
      a =>
        a.addEventListener(
          'click',
          () =>
            nav.classList.remove(
              'open'
            )
        )
    );
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    const year =
      document.getElementById(
        'year'
      );

    if (year) {
      year.textContent =
        new Date().getFullYear();
    }

    setupMenu();

    const serviceResult =
      await loadServicesFromAPI();

    renderBuilder();

    bindMotorAwareness();

    if (
      document.getElementById(
        'base-services'
      ) &&
      !serviceResult.ok
    ) {

      const status =
        document.getElementById(
          'order-status'
        );

      if (status) {
        status.textContent =
          'Sistema de serviços indisponível';
      }
    }

    setupBooking();
  }
);
