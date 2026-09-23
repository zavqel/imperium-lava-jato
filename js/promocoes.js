/*
  PROMOÇÕES TEMPORÁRIAS
  Para adicionar uma promoção, copie um bloco e altere os campos.
  Para remover, apague o bloco ou troque ativa para false.
  Futuramente o painel administrativo poderá editar esta mesma estrutura sem mexer no código.
*/
const PROMOCOES=[
 {id:'promo-exemplo',ativa:true,titulo:'Promoção Especial',preco:150,precoAnterior:null,validade:'Disponível enquanto durar a promoção.',descricao:'SUBSTITUIR DESCRIÇÃO DA PROMOÇÃO AQUI.',itens:['Serviço 1','Serviço 2']}
];
const pList=document.querySelector('#promotion-list');if(pList){const ativas=PROMOCOES.filter(p=>p.ativa);pList.innerHTML=ativas.length?ativas.map(p=>`<article class="service-card promo"><span class="tag">PROMOÇÃO</span><h2>${p.titulo}</h2>${p.precoAnterior?`<del>${money(p.precoAnterior)}</del>`:''}<strong>${money(p.preco)}</strong><p>${p.descricao}</p><ul>${p.itens.map(i=>`<li>${i}</li>`).join('')}</ul><a class="btn btn-primary" href="montar.html">Montar este atendimento →</a><small>${p.validade}</small></article>`).join(''):'<div class="empty"><h2>Nenhuma promoção disponível no momento.</h2><p>Volte em outro momento para conferir nossas ofertas.</p></div>';}
