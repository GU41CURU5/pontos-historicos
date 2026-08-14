# Como contribuir

Obrigado por ajudar a preservar a memória histórica da 4ª Bda C Mec (Guaicurus).
Este é um site **somente leitura**: as alterações entram por **issue** ou
**pull request**. Nada é editado pelo navegador de quem consulta.

## Caminho A — Issue (mais simples)
Ideal para sugerir sem editar arquivo.
- **Adicionar ponto:** botão *+ Adicionar ponto* no site, ou abra uma issue com o
  formulário **"Adicionar ponto histórico"**.
- **Corrigir ponto:** botão *Sugerir correção deste ponto* no dossiê, ou o
  formulário **"Corrigir / atualizar ponto"**.
Preencha os campos e envie. Um mantenedor faz o commit no arquivo da unidade.

## Caminho B — Pull Request (entrega pronta)
1. Faça *fork* do repositório.
2. Edite **apenas o arquivo da unidade** em `js/dados/`:
   - `pontos-3bia-aaae.js`, `pontos-10rc-mec.js`, `pontos-11rc-mec.js`, `pontos-17rc-mec.js`
3. Siga o modelo de `js/dados/_MODELO-PONTO.txt`.
4. Fotos: em `assets/fotos/<unidade>/`, com os nomes usados no campo `fotos`.
5. Abra o PR e preencha o checklist.

## Regras dos dados
- `id` único, minúsculo, sem espaços (use hifens).
- `unidade` deve ser uma chave existente: `3bia`, `10rc`, `11rc`, `17rc`.
- Coordenadas em **graus decimais**; Sul e Oeste são **negativos**.
- `precisao`: `exata` (fonte oficial) ou `aproximada` (estimada — a verificar).
- `links` e `fotos` vazios: use `[]`.
- Sempre informe **fontes**.

## Como pegar coordenadas
No Google Maps, clique com o botão direito sobre o ponto e copie o par
`lat, lng` que aparece no topo do menu.

## Dúvidas
Abra uma issue descrevendo o caso. Evite alterar `css/`, `js/app.js` e
`index.html` em PRs de conteúdo — esses são estruturais.
