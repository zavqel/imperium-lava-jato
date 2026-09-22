# IMPÉRIUM — novo site

Primeira versão oficial do site do IMPÉRIUM Lava Jato e Estacionamento, estruturada para GitHub Pages usando somente arquivos na raiz do repositório.

## Arquivos

- `index.html` — página de apresentação.
- `montar.html` — configurador de serviços/combos.
- `agendamento.html` — consulta de horários e formulário de pré-agendamento.
- `style.css` — identidade visual e responsividade.
- `app.js` — dados atuais, desconto progressivo, configurador e protótipo de agenda.
- `logo-imperium.jpg` — logo oficial fornecida pelo IMPÉRIUM, sem alteração.

## Dados cadastrados nesta versão

### Lavagens para carros pequenos
- Lavagem Econômica — R$ 75
- Lavagem Básica — R$ 90
- Lavagem Completa — R$ 100

### Estética e higienização
- Descontaminação de pintura — a partir de R$ 600
- Polimento — a partir de R$ 600
- Higienização de bancos — a partir de R$ 250
- Higienização de carpete — a partir de R$ 200
- Higienização de teto — a partir de R$ 150
- Higienização de partes plásticas / forros de porta — a partir de R$ 150

### Chassi
- Lavagem de chassi — a partir de R$ 150 para carros de uso urbano, com possibilidade de aumento conforme barro, lama, poeira e nível de sujeira.
- Procedimento descrito como sem toque, com ação química de produtos ativados, como Solupan.

### Motor
- Valor definido por categoria/tipo de motor (valores ainda não cadastrados nesta versão).
- Aproximadamente 3 horas de espera para o motor esfriar antes da lavagem.
- Proteção de módulos, bornes, sensores e outros componentes sensíveis.
- Ciência e autorização obrigatórias no configurador.

### Desconto progressivo de combos
- A partir de R$ 200 — 5%
- A partir de R$ 250 — 10%
- A partir de R$ 300 — 15%
- A partir de R$ 600 — 25%

## Atendimento

- Presencial: 08:00 às 17:00.
- Horário antecipado: a partir de 06:30, mediante confirmação de pagamento na versão completa do sistema.
- Chegada recomendada: 10 minutos antes.
- Tolerância: 10 minutos após o horário.
- Preferência armazenada para ligação caso o atendimento possa ser antecipado.

## Contato

- Rua General Carneiro, 695 — Estação — Franca/SP
- WhatsApp: (16) 99357-5780
- Instagram: @imperium_lavajato
- CNPJ: 65.675.125/0001-67

## Próxima etapa

Esta versão ainda usa `localStorage` para manter a montagem e o pré-agendamento no navegador. O próximo passo é substituir a simulação pela estrutura real de banco de dados, com clientes, veículos, serviços, duração, conflitos, agenda, histórico, favoritos e painel administrativo.

O QR Code de Pix das artes antigas não é utilizado no site.
