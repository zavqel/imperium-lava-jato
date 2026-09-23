/*
  EDITE AS DESCRIÇÕES AQUI.
  Por enquanto elas estão marcadas como SUBSTITUIR DESCRIÇÃO AQUI.
  No futuro, este mesmo cadastro poderá ser alimentado pelo painel administrativo.
*/
const SERVICOS=[
 {id:'basica',categoria:'Carros pequenos',nome:'Lavagem Básica',preco:90,descricao:'SUBSTITUIR DESCRIÇÃO AQUI.'},
 {id:'completa',categoria:'Carros pequenos',nome:'Lavagem Completa',preco:100,descricao:'SUBSTITUIR DESCRIÇÃO AQUI.'},
 {id:'descontaminacao',categoria:'Estética',nome:'Descontaminação de pintura',preco:600,apartir:true,descricao:'SUBSTITUIR DESCRIÇÃO AQUI.'},
 {id:'polimento',categoria:'Estética',nome:'Polimento',preco:600,apartir:true,descricao:'Valor de referência sujeito à avaliação do veículo.'},
 {id:'bancos',categoria:'Higienização',nome:'Higienização de bancos',preco:250,apartir:true,descricao:'SUBSTITUIR DESCRIÇÃO AQUI.'},
 {id:'carpete',categoria:'Higienização',nome:'Higienização de carpete',preco:200,apartir:true,descricao:'SUBSTITUIR DESCRIÇÃO AQUI.'},
 {id:'teto',categoria:'Higienização',nome:'Higienização de teto',preco:150,apartir:true,descricao:'SUBSTITUIR DESCRIÇÃO AQUI.'},
 {id:'plasticas',categoria:'Higienização',nome:'Partes plásticas / forros de porta',preco:150,apartir:true,descricao:'SUBSTITUIR DESCRIÇÃO AQUI.'},
 {id:'chassi',categoria:'Chassi',nome:'Lavagem de chassi',preco:150,apartir:true,descricao:'Para veículos de uso urbano. Em veículos com barro, lama, poeira excessiva ou sujeira intensa, o valor pode aumentar conforme a necessidade de trabalho e enxágue. Sem toque: ação química com produtos ativados, como Solupan.'},
 {id:'motor',categoria:'Motor',nome:'Lavagem de motor',preco:null,apartir:true,descricao:'SUBSTITUIR DESCRIÇÃO AQUI. O motor deve estar frio antes do serviço.'}
];
function money(v){return v==null?'Valor por categoria':(v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}));}
const list=document.querySelector('#service-list'); if(list){SERVICOS.forEach(s=>{const c=document.createElement('article');c.className='service-card';c.innerHTML=`<span class="tag">${s.categoria}</span><h2>${s.nome}</h2><strong>${s.apartir?'A partir de ':''}${money(s.preco)}</strong><p>${s.descricao}</p><button class="link-button" data-service="${s.id}">Selecionar serviço →</button>`;list.appendChild(c);});document.addEventListener('click',e=>{const id=e.target.dataset.service;if(id){localStorage.setItem('imperiumBase',id);location.href='montar.html';}})}
