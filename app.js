const services = [
  {
    id: "basica",
    name: "Lavagem Básica",
    description: "Serviço base para a montagem do atendimento.",
    price: 80,
    minutes: 60
  },

  {
    id: "completa",
    name: "Lavagem Completa",
    description: "Lavagem externa completa + limpeza interna.",
    price: 150,
    minutes: 90
  }
];


const addons = [

  {
    id: "sopragem",
    name: "Sopragem",
    description: "Auxilia na secagem e remoção de água.",
    price: 10,
    minutes: 10
  },

  {
    id: "pesados",
    name: "Pelos de animais / sujeira pesada",
    description: "Adicional sujeito à avaliação do veículo.",
    price: 40,
    minutes: 30
  },

  {
    id: "descontaminacao",
    name: "Descontaminação parcial da pintura",
    description: "Remoção parcial de contaminantes da pintura.",
    price: 30,
    minutes: 30
  }

];


let selectedBase = null;

const selectedAddons = new Set();


function money(value) {

  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


function formatMinutes(minutes) {

  if (!minutes) {
    return "0 min";
  }

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;


  if (!hours) {
    return `${mins} min`;
  }

  if (!mins) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;

}


/* =========================
   CONFIGURADOR
========================= */

function renderConfigurator() {

  const baseBox =
    document.getElementById("base-services");

  const addonsBox =
    document.getElementById("addons");


  if (!baseBox || !addonsBox) {
    return;
  }


  baseBox.innerHTML = services.map(service => `

    <label class="option">

      <span class="option-content">

        <input
          type="radio"
          name="base-service"
          value="${service.id}"
        >

        <span>

          <strong>
            ${service.name}
          </strong>

          <small>
            ${service.description}
          </small>

        </span>

      </span>

      <strong>
        ${money(service.price)}
      </strong>

    </label>

  `).join("");


  addonsBox.innerHTML = addons.map(addon => `

    <label class="option">

      <span class="option-content">

        <input
          type="checkbox"
          value="${addon.id}"
        >

        <span>

          <strong>
            ${addon.name}
          </strong>

          <small>
            ${addon.description}
          </small>

        </span>

      </span>

      <strong>
        + ${money(addon.price)}
      </strong>

    </label>

  `).join("");


  document
    .querySelectorAll(
      'input[name="base-service"]'
    )
    .forEach(input => {

      input.addEventListener(
        "change",
        () => {

          selectedBase =
            services.find(
              service =>
                service.id === input.value
            ) || null;

          updateSummary();

        }
      );

    });


  document
    .querySelectorAll(
      '#addons input[type="checkbox"]'
    )
    .forEach(input => {

      input.addEventListener(
        "change",
        () => {

          if (input.checked) {

            selectedAddons.add(
              input.value
            );

          } else {

            selectedAddons.delete(
              input.value
            );

          }

          updateSummary();

        }
      );

    });

}


/* =========================
   RESUMO
========================= */

function updateSummary() {

  const selectedItems =
    document.getElementById(
      "selected-items"
    );


  if (!selectedItems) {
    return;
  }


  const items = [];

  let totalPrice = 0;

  let totalMinutes = 0;


  if (selectedBase) {

    items.push({

      name: selectedBase.name,

      price: selectedBase.price

    });


    totalPrice +=
      selectedBase.price;

    totalMinutes +=
      selectedBase.minutes;

  }


  for (const id of selectedAddons) {

    const addon =
      addons.find(
        item => item.id === id
      );


    if (!addon) {
      continue;
    }


    items.push({

      name: addon.name,

      price: addon.price

    });


    totalPrice +=
      addon.price;

    totalMinutes +=
      addon.minutes;

  }


  selectedItems.innerHTML =
    items.length

      ? items.map(item => `

          <div class="selected-item">

            <span>
              ${item.name}
            </span>

            <strong>
              ${money(item.price)}
            </strong>

          </div>

        `).join("")

      : `

          <span class="empty-state">
            Nenhum serviço selecionado ainda.
          </span>

        `;


  document.getElementById(
    "total-price"
  ).textContent =
    money(totalPrice);


  document.getElementById(
    "total-time"
  ).textContent =
    formatMinutes(totalMinutes);


  document.getElementById(
    "order-status"
  ).textContent =
    selectedBase
      ? "Pronto para agendar"
      : "Em montagem";

}


/* =========================
   SALVAR PEDIDO
========================= */

function saveOrder() {

  if (!selectedBase) {

    alert(
      "Escolha pelo menos um serviço principal."
    );

    return false;
  }


  const order = {

    base: selectedBase,

    addons: Array.from(
      selectedAddons
    ).map(id =>
      addons.find(
        addon => addon.id === id
      )
    )

  };


  localStorage.setItem(
    "imperiumOrder",
    JSON.stringify(order)
  );


  return true;

}


/* =========================
   IR PARA AGENDAMENTO
========================= */

function goToScheduling() {

  if (!saveOrder()) {
    return;
  }


  window.location.href =
    "agendamento.html";

}


/* =========================
   CARREGAR PEDIDO
========================= */

function loadOrder() {

  const data =
    localStorage.getItem(
      "imperiumOrder"
    );


  if (!data) {
    return null;
  }


  try {

    return JSON.parse(data);

  } catch (error) {

    console.error(
      "Erro ao carregar pedido:",
      error
    );

    return null;

  }

}


/* =========================
   AGENDAMENTO
========================= */

function setupBooking() {

  const dateInput =
    document.getElementById(
      "booking-date"
    );


  if (!dateInput) {
    return;
  }


  const order =
    loadOrder();


  if (!order || !order.base) {

    document.getElementById(
      "booking-service"
    ).textContent =
      "Nenhum serviço selecionado";


    return;

  }


  const base =
    order.base;


  const orderAddons =
    order.addons || [];


  let totalPrice =
    base.price;


  let totalMinutes =
    base.minutes;


  orderAddons.forEach(
    addon => {

      totalPrice +=
        addon.price;

      totalMinutes +=
        addon.minutes;

    }
  );


  document.getElementById(
    "booking-service"
  ).textContent =
    base.name;


  document.getElementById(
    "booking-duration"
  ).textContent =
    formatMinutes(totalMinutes);


  document.getElementById(
    "booking-price"
  ).textContent =
    money(totalPrice);


  dateInput.addEventListener(
    "change",
    renderTimeSlots
  );

}


/* =========================
   HORÁRIOS
========================= */

function renderTimeSlots() {

  const dateInput =
    document.getElementById(
      "booking-date"
    );


  const slots =
    document.getElementById(
      "time-slots"
    );


  if (!dateInput || !slots) {
    return;
  }


  if (!dateInput.value) {

    slots.innerHTML = `

      <span class="empty-state">
        Selecione uma data para consultar
        os horários.
      </span>

    `;

    return;

  }


  const examples = [

    "08:00",
    "09:30",
    "11:00",
    "13:30",
    "15:00",
    "16:30",
    "18:00"

  ];


  slots.innerHTML =
    examples.map(
      time => `

        <button
          type="button"
          class="time-slot"
          onclick="chooseTime('${time}')"
        >
          ${time}
        </button>

      `
    ).join("");

}


function chooseTime(time) {

  alert(
    `Horário de exemplo selecionado: ${time}.`
  );

}


/* =========================
   MENU
========================= */

function setupMenu() {

  const toggle =
    document.querySelector(
      ".menu-toggle"
    );


  const nav =
    document.querySelector(
      ".main-nav"
    );


  if (!toggle || !nav) {
    return;
  }


  toggle.addEventListener(
    "click",
    () => {

      const open =
        nav.classList.toggle(
          "open"
        );


      toggle.setAttribute(
        "aria-expanded",
        open
          ? "true"
          : "false"
      );

    }
  );

}


/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderConfigurator();

    updateSummary();

    setupBooking();

    setupMenu();


    const year =
      document.getElementById(
        "year"
      );


    if (year) {

      year.textContent =
        new Date()
          .getFullYear();

    }

  }
);
