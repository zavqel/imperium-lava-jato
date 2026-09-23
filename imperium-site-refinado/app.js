const IMPERIUM = {
  businessHours: { open: '08:00', close: '17:00', earlyOpen: '06:30' },
  arrivalBeforeMinutes: 10,
  toleranceMinutes: 10,
  services: {
    economica: { id: 'economica', name: 'Lavagem Econômica', price: 75, minutes: null, group: 'Lavagem base', vehicle: 'carro-pequeno', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    basica: { id: 'basica', name: 'Lavagem Básica', price: 90, minutes: null, group: 'Lavagem base', vehicle: 'carro-pequeno', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    completa: { id: 'completa', name: 'Lavagem Completa', price: 100, minutes: null, group: 'Lavagem base', vehicle: 'carro-pequeno', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    descontaminacao: { id: 'descontaminacao', name: 'Descontaminação de pintura', price: 600, minutes: null, group: 'Estética', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    polimento: { id: 'polimento', name: 'Polimento', price: 600, minutes: null, group: 'Estética', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    bancos: { id: 'bancos', name: 'Higienização de bancos', price: 250, minutes: null, group: 'Higienização', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    carpete: { id: 'carpete', name: 'Higienização de carpete', price: 200, minutes: null, group: 'Higienização', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    teto: { id: 'teto', name: 'Higienização de teto', price: 150, minutes: null, group: 'Higienização', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    plasticos: { id: 'plasticos', name: 'Partes plásticas / forros de porta', price: 150, minutes: null, group: 'Higienização', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    chassi: { id: 'chassi', name: 'Lavagem de chassi', price: 150, minutes: null, group: 'Chassi', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' },
    motor: { id: 'motor', name: 'Lavagem de motor', price: 0, minutes: null, group: 'Motor', vehicle: 'qualquer', desc: 'Descrição do serviço — substitua este texto pelas informações oficiais do IMPÉRIUM.' }
  },
  discounts: [
    { min: 600, rate: 0.25, label: '25%' },
    { min: 300, rate: 0.15, label: '15%' },
    { min: 250, rate: 0.10, label: '10%' },
    { min: 200, rate: 0.05, label: '5%' }
  ]
};

function money(value){
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value || 0);
}

function getDiscount(subtotal){
  return IMPERIUM.discounts.find(item => subtotal >= item.min) || {min:0, rate:0, label:'0%'};
}

function getNextDiscount(subtotal){
  const next = [...IMPERIUM.discounts].sort((a,b)=>a.min-b.min).find(item => subtotal < item.min);
  return next || null;
}

function calculateOrder(){
  const base = localStorage.getItem('imperiumBase') || 'economica';
  const addons = JSON.parse(localStorage.getItem('imperiumAddons') || '[]');
  const items = [base, ...addons].map(id => IMPERIUM.services[id]).filter(Boolean);
  const subtotal = items.reduce((sum,item)=>sum + item.price,0);
  const discount = getDiscount(subtotal);
  const discountValue = subtotal * discount.rate;
  const total = subtotal - discountValue;
  const hasPendingPrice = items.some(item => item.price === 0);
  const hasPendingDuration = items.some(item => item.minutes == null);
  const minutes = hasPendingDuration ? null : items.reduce((sum,item)=>sum + item.minutes,0);
  return {base, addons, items, subtotal, discount, discountValue, total, minutes, hasPendingPrice, hasPendingDuration};
}

function saveSelection(base, addons){
  localStorage.setItem('imperiumBase', base);
  localStorage.setItem('imperiumAddons', JSON.stringify(addons));
}

function renderSelectedItems(targetId, order, dark=true){
  const el = document.getElementById(targetId);
  if(!el) return;
  if(!order.items.length){
    el.innerHTML = '<div class="selected-item"><span>Escolha um serviço para começar.</span><strong>—</strong></div>';
    return;
  }
  el.innerHTML = order.items.map((item,index) => `
    <div class="selected-item">
      <span>${index===0 ? '<b>Base:</b> ' : ''}${item.name}</span>
      <strong>${item.price ? money(item.price) : 'A confirmar'}</strong>
    </div>
  `).join('');
}

function renderBuilder(){
  if(!document.getElementById('base-services')) return;
  const savedBase = localStorage.getItem('imperiumBase') || 'economica';
  const savedAddons = JSON.parse(localStorage.getItem('imperiumAddons') || '[]');
  const baseEl = document.getElementById('base-services');
  const addonsEl = document.getElementById('addons');
  const baseIds = ['economica','basica','completa'];
  const addonIds = ['descontaminacao','polimento','bancos','carpete','teto','plasticos','chassi','motor'];

  baseEl.innerHTML = baseIds.map(id=>{
    const s=IMPERIUM.services[id];
    return `<label class="option-card"><input type="radio" name="base-service" value="${id}" ${savedBase===id?'checked':''}><span><h3>${s.name}</h3><small>${s.desc}</small></span><span class="option-price">${money(s.price)}</span></label>`;
  }).join('');

  addonsEl.innerHTML = addonIds.map(id=>{
    const s=IMPERIUM.services[id];
    const motorClass=id==='motor'?' data-motor-addon="true"':'';
    return `<label class="option-card"${motorClass}><input class="addon-check" type="checkbox" value="${id}" ${savedAddons.includes(id)?'checked':''}><span><h3>${s.name}</h3><small>${s.desc}</small></span><span class="option-price">${s.price ? money(s.price) : 'A confirmar'}</span></label>`;
  }).join('');

  baseEl.addEventListener('change', updateBuilder);
  addonsEl.addEventListener('change', updateBuilder);
  updateBuilder();
}

function updateBuilder(){
  const base = document.querySelector('input[name="base-service"]:checked')?.value || 'economica';
  const addons = [...document.querySelectorAll('.addon-check:checked')].map(input=>input.value);
  const motorAware = document.getElementById('motor-aware');
  if(addons.includes('motor') && motorAware && !motorAware.checked){
    document.querySelector('input.addon-check[value="motor"]').checked = false;
    const index = addons.indexOf('motor'); if(index >= 0) addons.splice(index,1);
  }
  saveSelection(base, addons);
  const order = calculateOrder();
  const subtotalEl=document.getElementById('subtotal-price');
  const discountValueEl=document.getElementById('discount-value');
  const totalEl=document.getElementById('total-price');
  if(subtotalEl) subtotalEl.textContent=money(order.subtotal);
  if(discountValueEl) discountValueEl.textContent=order.discountValue ? `- ${money(order.discountValue)}` : money(0);
  if(totalEl) totalEl.textContent=order.hasPendingPrice ? 'A confirmar' : money(order.total);
  renderSelectedItems('selected-items',order,true);

  const msg=document.getElementById('next-discount-message');
  const value=document.getElementById('next-discount-value');
  const progress=document.getElementById('discount-progress');
  const next=getNextDiscount(order.subtotal);
  if(msg && value && progress){
    if(next){
      msg.textContent=`Faltam ${money(next.min - order.subtotal)} para ${next.label} de desconto.`;
      value.textContent=`Meta: ${money(next.min)}`;
      progress.style.width=Math.min(100,(order.subtotal/next.min)*100)+'%';
    }else{
      msg.textContent='Você já atingiu o maior desconto do combo.';
      value.textContent='25%';
      progress.style.width='100%';
    }
  }
  const status=document.getElementById('order-status');
  if(status) status.textContent = order.items.length > 1 ? 'Combo' : '1 serviço';
}

function bindMotorAwareness(){
  const checkbox = document.getElementById('motor-aware');
  const motorCheck = document.querySelector('.addon-check[value="motor"]');
  if(!checkbox || !motorCheck) return;
  checkbox.addEventListener('change',()=>{
    if(checkbox.checked){
      motorCheck.checked=true;
      updateBuilder();
    }else{
      motorCheck.checked=false;
      updateBuilder();
    }
  });
  if(motorCheck.checked) checkbox.checked=true;
}

function goToScheduling(){
  const order=calculateOrder();
  if(!order.items.length){
    alert('Escolha pelo menos um serviço antes de continuar.');
    return;
  }
  if(order.hasPendingPrice){
    alert('Há um serviço com valor a confirmar. Finalize a avaliação desse serviço antes de agendar.');
    return;
  }
  if(order.items.some(item=>item.id==='motor') && !document.getElementById('motor-aware')?.checked){
    alert('Para selecionar a lavagem de motor, confirme a ciência dos riscos.');
    return;
  }
  window.location.href='agendamento.html';
}
window.goToScheduling=goToScheduling;

function minutesFromTime(time){
  const [h,m]=time.split(':').map(Number); return h*60+m;
}
function timeLabel(total){
  const h=Math.floor(total/60);const m=total%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
}
function isWeekday(date){ const day=date.getDay(); return day!==0; }
function generateSlots(date, duration, paidEarly=false){
  if(!date || !isWeekday(date)) return [];
  const slots=[];
  const open = paidEarly ? minutesFromTime(IMPERIUM.businessHours.earlyOpen) : minutesFromTime(IMPERIUM.businessHours.open);
  const close = minutesFromTime(IMPERIUM.businessHours.close);
  const step=30;
  for(let start=open; start+duration<=close; start+=step){
    const label=timeLabel(start);
    const early=start<minutesFromTime(IMPERIUM.businessHours.open);
    slots.push({label, early, end:timeLabel(start+duration)});
  }
  return slots;
}

function setupBooking(){
  if(!document.getElementById('time-slots')) return;
  const order=calculateOrder();
  renderSelectedItems('booking-order',order,false);
  const sub=document.getElementById('booking-subtotal'); if(sub) sub.textContent=money(order.subtotal);
  const dis=document.getElementById('booking-discount'); if(dis) dis.textContent=order.discountValue ? `- ${money(order.discountValue)}` : money(0);
  const tot=document.getElementById('booking-total'); if(tot) tot.textContent=order.hasPendingPrice ? 'A confirmar' : money(order.total);
  const durationLabel=document.getElementById('duration-label'); if(durationLabel) durationLabel.textContent=order.hasPendingDuration ? 'Tempo estimado: a confirmar' : `Tempo estimado: ${order.minutes} min`;

  const dateInput=document.getElementById('booking-date');
  if(order.hasPendingPrice || order.hasPendingDuration){
    const note=document.getElementById('time-slots');
    if(note) note.innerHTML='<span class="empty-state">A duração e/ou o valor deste atendimento ainda precisam ser confirmados. Assim que fecharmos os dados oficiais, esta agenda será calculada automaticamente.</span>';
  }
  const feedback=document.getElementById('booking-feedback');
  const confirm=document.getElementById('confirm-booking');
  const slotsEl=document.getElementById('time-slots');
  let chosenTime='';
  const today=new Date(); today.setHours(0,0,0,0);
  dateInput.min = today.toISOString().split('T')[0];

  function renderSlots(){
    chosenTime=''; confirm.disabled=true;
    if(order.hasPendingPrice || order.hasPendingDuration) return;
    const date=dateInput.value ? new Date(dateInput.value+'T12:00:00') : null;
    if(!date){ slotsEl.innerHTML='<span class="empty-state">Escolha uma data para consultar os horários.</span>'; return; }
    const slots=generateSlots(date, Math.max(order.minutes || 30,30), false);
    const earlySlots=generateSlots(date, Math.max(order.minutes || 30,30), true).filter(slot=>slot.early);
    const all=[...earlySlots,...slots.filter(slot=>!slot.early)];
    if(!all.length){slotsEl.innerHTML='<span class="empty-state">Não há horários compatíveis para esta data.</span>';return;}
    slotsEl.innerHTML=all.map(slot=>`<button type="button" class="time-slot ${slot.early?'early':''}" data-time="${slot.label}"><span>${slot.label}</span><small>termina ${slot.end}${slot.early?' • pagamento':''}</small></button>`).join('');
    slotsEl.querySelectorAll('.time-slot').forEach(btn=>btn.addEventListener('click',()=>{
      slotsEl.querySelectorAll('.time-slot').forEach(el=>el.classList.remove('selected')); btn.classList.add('selected'); chosenTime=btn.dataset.time; confirm.disabled=false;
    }));
  }
  dateInput.addEventListener('change',renderSlots);
  renderSlots();

  confirm.addEventListener('click',()=>{
    const name=document.getElementById('customer-name')?.value.trim();
    const phone=document.getElementById('customer-phone')?.value.trim();
    const advanceCall=document.getElementById('advance-call')?.checked || false;
    if(!chosenTime){feedback.textContent='Escolha um horário.';feedback.className='feedback error';return;}
    if(!name || !phone){feedback.textContent='Preencha nome e WhatsApp para continuar.';feedback.className='feedback error';return;}
    const booking={date:dateInput.value,time:chosenTime,name,phone,advanceCall,order:{base:order.base,addons:order.addons,total:order.total,discount:order.discount.rate,minutes:order.minutes}};
    localStorage.setItem('imperiumBookingDraft',JSON.stringify(booking));
    feedback.textContent=`Pré-agendamento salvo para ${dateInput.value} às ${chosenTime}. Na versão com banco, este passo confirmará a disponibilidade real.`;
    feedback.className='feedback success';
  });
}

function setupMenu(){
  const button=document.querySelector('.menu-toggle'); const nav=document.querySelector('.main-nav');
  if(!button||!nav) return;
  button.addEventListener('click',()=>{const open=nav.classList.toggle('open');button.setAttribute('aria-expanded',String(open));});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
}

document.addEventListener('DOMContentLoaded',()=>{
  const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear();
  setupMenu(); renderBuilder(); bindMotorAwareness(); setupBooking();
});
