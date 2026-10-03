# IMPÉRIUM — pacote revisado e verificado

Pacote revisado para o site do IMPÉRIUM Lava Jato e Estacionamento.

## Arquivos
- index.html
- servicos.html
- montar.html
- agendamento.html
- promocoes.html
- app.js
- style.css
- logo-imperium.jpg
- admin.html
- worker.js

## Antes de publicar
1. No GitHub Pages, substitua os arquivos do site pelos arquivos deste pacote.
2. No Cloudflare Workers, substitua o código pelo `worker.js`.
3. Mantenha as variáveis/bindings já existentes: `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET` e `DB`.
4. Não é necessário criar manualmente a tabela `agendamento_detalhes`: o Worker a cria automaticamente quando necessário.
5. Cadastre no Admin a duração real de cada serviço antes de liberar agendamentos. Serviço sem duração não gera horário disponível.

## Regras atuais
- Atendimento presencial: 08:00 às 17:00.
- Horário antecipado: a partir de 06:30, somente após confirmação de pagamento.
- A integração de pagamento ainda não está conectada ao site. Por segurança, a API não aceita que o navegador simplesmente envie `pagamento_confirmado=true`.
- Para habilitar futuramente a confirmação antecipada por integração, o Worker aceita o binding opcional `PAGAMENTO_EARLY_SECRET`. A integração deverá enviar o token correspondente como `pagamento_token`.
- Intervalo padrão entre horários: 30 minutos.
- Chegada recomendada: 10 minutos antes.
- Tolerância informada ao cliente: 10 minutos.
- Domingos: sem agendamento online.
- Descontos: 5% a partir de R$200; 10% a partir de R$250; 15% a partir de R$300; 25% a partir de R$600. Os valores podem ser alterados pelo CMS do Admin.
- Lavagem de motor: a API também exige a confirmação de ciência dos riscos quando um serviço com “motor” no nome é selecionado.

## O que foi corrigido nesta revisão
- Correção das expressões regulares das rotas dinâmicas de serviços, promoções e agendamentos.
- Remoção de caracteres extras nos comentários do Worker.
- Bloqueio de falsificação de pagamento antecipado pelo navegador.
- Validação server-side da ciência da lavagem de motor.
- CMS do Admin inclui os textos de contato e os indicadores de capacidade/câmeras usados na página inicial.
- Indicadores de capacidade e câmeras da página inicial agora podem ser alterados pelo CMS.
- Verificação de sintaxe do `worker.js` e `app.js` concluída.
- Verificação dos links/arquivos locais das páginas concluída.

## Preços
Os preços e durações dos serviços não são inventados pelo código. Eles devem ser cadastrados/ajustados no Admin conforme a tabela comercial real do IMPÉRIUM.
