const services = [
  {
    id: "basica",
    name: "Lavagem Básica",
    description: "Serviço base para a montagem do atendimento.",
    price: 80,
    minutes: 60,
  },
  {
    id: "completa",
    name: "Lavagem Completa",
    description: "Cadastro de exemplo — ajustar descrição, preço e tempo.",
    price: 150,
    minutes: 90,
  },
];

const addons = [
  {
    id: "sopragem",
    name: "Sopragem",
    description: "Adicional para auxiliar na secagem e remoção de água.",
    price: 10,
    minutes: 10,
  },
  {
    id: "pesados",
    name: "Pelos de animais / sujeira pesada",
    description: "Adicional sujeito à avaliação do veículo.",
    price: 40,
    minutes: 30,
  },
  {
    id: "descontaminacao",
    name: "Descontaminação parcial da pintura",
    description: "Valor provisório — ajustar no cadastro definitivo.",
    price: 30,
    minutes: 30,
  },
];

let selectedBase = null;
const selectedAddons = new Set();

function money(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMinutes(minutes) {
  if (!minutes) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  if (!m) return `${h}h`;
  return `${h}h ${m}min`;
}

function renderServices() {
  const servicesGrid = document.getElementById("services-grid");
  const baseServices = document.getElementById("base-services");
  const addonsBox = document.getElementById("addons");

  servicesGrid.innerHTML = services.map(service => `
    <article class="service-card">
      <div>
        <span class="eyebrow">SERVIÇO</span>
        <h3>${service.name}</h3>
        <p>${service.description}</p>
      </div>
      <div>
        <div class="service-price">A partir de ${money(service.price)}</div>
        <div class="service-time">${formatMinutes(service.minutes)} estimados</div>
      </div>
    </article>
  `).join("");

  baseServices.innerHTML = services.map(service => `
    <label class="option">
      <span class="option-content">
        <input type="radio" name="base-service" value="${service.id}">
        <span>
          <strong>${service.name}</strong>
          <small>${service.description}</small>
        </span>
      </span>
      <strong>${money(service.price)}</strong>
    </label>
  `).join("");

  addonsBox.innerHTML = addons.map(addon => `
    <label class="option">
      <span class="option-content">
        <input type="checkbox" value="${addon.id}">
        <span>
          <strong>${addon.name}</strong>
          <small>${addon.description}</small>
        </span>
      </span>
      <strong>+ ${money(addon.price)}</strong>
    </label>
  `).join("");

  document.querySelectorAll('input[name="base-service"]').forEach(input => {
    input.addEventListener("change", () => {
      selectedBase = services.find(service => service.id === input.value) || null;
      updateSummary();
    });
  });

  document.querySelectorAll('#addons input[type="checkbox"]').forEach(input => {
    input.addEventListener("change", () => {
      input.checked ? selectedAddons.add(input.value) : selectedAddons.delete(input.value);
      updateSummary();
    });
  });
}

function updateSummary() {
  const items = [];
  let totalPrice = 0;
  let totalMinutes = 0;

  if (selectedBase) {
    items.push({ name: selectedBase.name, price: selectedBase.price });
    totalPrice += selectedBase.price;
    totalMinutes += selectedBase.minutes;
  }

  for (const id of selectedAddons) {
    const addon = addons.find(item => item.id === id);
    if (!addon) continue;
    items.push({ name: addon.name, price: addon.price });
    totalPrice += addon.price;
    totalMinutes += addon.minutes;
  }

  const selectedItems = document.getElementById("selected-items");
  selectedItems.innerHTML = items.length
    ? items.map(item => `<div class="selected-item"><span>${item.name}</span><strong>${money(item.price)}</strong></div>`).join("")
    : `<span class="empty-state">Nenhum serviço selecionado ainda.</span>`;

  document.getElementById("total-price").textContent = money(totalPrice);
  document.getElementById("total-time").textContent = formatMinutes(totalMinutes);
  document.getElementById("order-status").textContent = selectedBase ? "Pronto para agendar" : "Em montagem";
}

function goToScheduling() {
  document.getElementById("agendamento").scrollIntoView({ behavior: "smooth" });
  if (!selectedBase) {
    alert("Escolha pelo menos um serviço principal antes de continuar.");
  }
}

function renderTimeSlots() {
  const dateInput = document.getElementById("booking-date");
  const slots = document.getElementById("time-slots");
  if (!dateInput.value) {
    slots.innerHTML = `<span class="empty-state">Selecione uma data para consultar os horários.</span>`;
    return;
  }

  // Horários de exemplo. O banco de dados substituirá esta lógica na próxima etapa.
  const examples = ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30", "18:00"];
  slots.innerHTML = examples.map(time => `
    <button type="button" class="time-slot" onclick="chooseTime('${time}')">${time}</button>
  `).join("");
}

function chooseTime(time) {
  alert(`Horário de exemplo selecionado: ${time}. Na próxima etapa vamos registrar isso no banco de dados.`);
}

document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  updateSummary();
  document.getElementById("booking-date").addEventListener("change", renderTimeSlots);
  document.getElementById("year").textContent = new Date().getFullYear();

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.querySelectorAll(".main-nav a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
});
