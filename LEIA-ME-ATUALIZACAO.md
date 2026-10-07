# Atualização do IMPÉRIUM

Substitua no GitHub os arquivos desta pasta pelos arquivos de mesmo nome.

- `servico.html` é novo e precisa ser enviado junto com os demais arquivos.
- `app.js` é o JavaScript comum de todas as páginas; ele deve ficar na raiz, ao lado dos HTMLs.
- `worker.js` deve substituir o código do Worker já publicado no Cloudflare. As variáveis `DB`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET` e, se usada, `PAGAMENTO_EARLY_SECRET` permanecem as mesmas.
- Na primeira consulta de serviços, o Worker cria automaticamente a tabela complementar `servico_detalhes`. Não apaga nem altera a tabela `servicos` existente.

No Admin, informe URLs públicas nas imagens. Para os itens inclusos, use uma linha por item.
