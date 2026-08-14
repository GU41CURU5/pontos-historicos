# Pontos Históricos · 4ª Bda C Mec (Guaicurus)

Site **somente leitura** para consultar os pontos históricos das OM da 4ª Brigada
de Cavalaria Mecanizada em um mapa interativo, com filtro por unidade e categoria,
busca, dossiê com fotos e **links úteis**.

Não há edição pelo navegador: todas as alterações são feitas por **issue** ou
**pull request** no GitHub (ver [Como contribuir](#3-como-contribuir)). Assim o
acervo fica versionado e auditável — dá para saber quem alterou o quê e por quê.

Funciona de dois modos, sem servidor:
- **Local:** dois cliques no `index.html`.
- **Publicado:** hospedado no **GitHub Pages** (link público).

---

## Sumário
1. [Como usar](#1-como-usar)
2. [Arquitetura do projeto](#2-arquitetura-do-projeto)
3. [Como contribuir (issues e pull requests)](#3-como-contribuir)
4. [Esquema de um ponto e onde editar](#4-esquema-de-um-ponto-e-onde-editar)
5. [Fotos](#5-fotos)
6. [Links úteis](#6-links-uteis)
7. [Coordenadas e procedência](#7-coordenadas-e-procedencia)
8. [Publicar no GitHub Pages](#8-github-pages)
9. [Uso 100% offline](#9-uso-100-offline)

---

## 1. Como usar

- Filtre por **Unidade** e **Categoria** ou use a **busca**.
- Clique num item da lista → o mapa voa até o ponto e abre o **dossiê**.
- Clique num marcador → botão “Ver dossiê”.
- No dossiê: ficha, fotos (com ampliação), descrição, **links úteis** e fontes,
  além do botão **Sugerir correção deste ponto**.
- Na lateral, a seção **Links úteis** reúne referências gerais.

---

## 2. Arquitetura do projeto

```
pontos-historicos-guaicurus/
├── index.html                     → estrutura da página (liga tudo)
├── css/
│   └── style.css                  → identidade visual e layout
├── js/
│   ├── dados/
│   │   ├── config.js              → REPOSITORIO, UNIDADES, LINKS_UTEIS, PONTOS = []
│   │   ├── pontos-3bia-aaae.js    → pontos da 3ª Bia AAAe
│   │   ├── pontos-10rc-mec.js     → pontos do 10º RC Mec
│   │   ├── pontos-11rc-mec.js     → pontos do 11º RC Mec
│   │   ├── pontos-17rc-mec.js     → pontos do 17º RC Mec
│   │   └── _MODELO-PONTO.txt      → modelo para copiar/colar
│   └── app.js                     → mapa, filtros e dossiê (somente leitura)
├── assets/
│   └── fotos/<unidade>/           → imagens de cada unidade
├── .github/
│   ├── ISSUE_TEMPLATE/            → formulários de "adicionar" e "corrigir"
│   └── PULL_REQUEST_TEMPLATE.md
├── .nojekyll                      → evita o Jekyll ignorar arquivos (GitHub Pages)
├── CONTRIBUTING.md                → guia de contribuição
└── README.md
```

**Dados divididos por unidade.** Cada OM tem seu próprio arquivo em `js/dados/`.
Quem for corrigir o 10º RC Mec mexe só em `pontos-10rc-mec.js` — menos conflito de
merge e mais fácil de revisar. São `<script>` encadeados (config primeiro, depois
os pontos, depois o app), então **não usam `fetch`** e a página abre tanto por
duplo-clique quanto no GitHub Pages, sem mudar nada.

> **Ao clonar/publicar, ajuste uma linha:** em `js/dados/config.js`, troque
> `REPOSITORIO` pelo endereço real do seu repositório. É isso que faz os botões
> **Sugerir alteração**, **Adicionar ponto** e **Sugerir correção** apontarem para
> os formulários de issue certos.

---

## 3. Como contribuir

Há dois caminhos. Escolha conforme o seu conforto com o GitHub.

### A) Por issue (mais simples — não precisa editar arquivo)
Use quando quiser **sugerir** algo e deixar o commit para quem administra.
1. Clique em **+ Adicionar ponto** (novo ponto) ou **Sugerir correção deste ponto**
   (dentro do dossiê), ou **Sugerir alteração** (lista de issues), no topo do site.
2. O GitHub abre um **formulário** (campos de nome, unidade, coordenada, descrição,
   fontes, links, fotos). Preencha e envie.
3. Um mantenedor transfere os dados para o arquivo da unidade e faz o commit.

### B) Por pull request (para quem edita direto)
Use quando quiser **já entregar a alteração pronta**.
1. Faça um *fork* do repositório (botão **Fork**).
2. Edite o arquivo da unidade em `js/dados/` (ex.: `pontos-10rc-mec.js`),
   seguindo o modelo de `js/dados/_MODELO-PONTO.txt`.
3. Se houver fotos, coloque-as em `assets/fotos/<unidade>/` com os nomes usados
   no campo `fotos`.
4. Abra um **Pull Request**. O modelo de PR traz um checklist.

> Detalhes e boas práticas em **CONTRIBUTING.md** (o GitHub mostra esse guia
> automaticamente ao abrir issues e PRs).

**Fluxo mental:** o site é a vitrine (leitura); o **GitHub é a redação** (onde se
propõe e se aprova a mudança). Nada é gravado no navegador de quem consulta.

---

## 4. Esquema de um ponto e onde editar

Cada ponto é um objeto dentro de `PONTOS.push( ... )`, no arquivo da sua unidade:

```js
{
  id: "identificador-unico",        // sem espaços, minúsculo, com hifens
  unidade: "10rc",                  // 3bia | 10rc | 11rc | 17rc
  nome: "Nome do ponto",
  cidade: "Cidade – MS",
  categoria: "Categoria (vira filtro)",
  periodo: "Ano / evento",
  lat: -22.53000, lng: -55.73000,   // graus decimais; Sul e Oeste são NEGATIVOS
  precisao: "exata",                // "exata" ou "aproximada"
  endereco: "Endereço textual",
  descricao: "Texto do dossiê.",
  fontes: "Fonte 1; Fonte 2",
  links: [ { rotulo: "Nome do link", url: "https://exemplo.org" } ],
  fotos: [ "assets/fotos/10rc-mec/arquivo-01.jpg" ]
}
```

Para uma **nova unidade**: adicione uma chave em `UNIDADES` (em `config.js`) e crie
um arquivo `pontos-<unidade>.js` incluído no `index.html`. O filtro, a legenda e as
cores se ajustam sozinhos.

---

## 5. Fotos

- Coloque os arquivos em `assets/fotos/<unidade>/` com **o nome exato** do campo
  `fotos`. Cada pasta tem um `_LEIA-ME.txt` com os nomes esperados.
- Enquanto a foto não existir, o dossiê mostra o caminho esperado no lugar.
- `.jpg`/`.png`/`.webp`; ~1200 px de largura para não pesar o repositório.

---

## 6. Links úteis

Existem em dois níveis:
- **Por ponto:** campo `links` (lista de `{ rotulo, url }`), exibido no dossiê.
  Já vem preenchido com as fontes de cada ponto.
- **Gerais:** `LINKS_UTEIS` em `config.js`, exibidos na seção “Links úteis” da
  lateral (referências da brigada/fronteira).

---

## 7. Coordenadas e procedência

- **11º** e **17º RC Mec** têm coordenada oficial (`exata`).
- **Bela Vista (10º)**, alguns marcos rurais e Cerro Corá estão como `aproximada`
  (selo âmbar e marcador tracejado) — para ajustar em campo via issue/PR.

---

## 8. GitHub Pages

**Subir os arquivos**
1. Crie um repositório (ex.: `pontos-historicos-guaicurus`).
2. Ajuste `REPOSITORIO` em `js/dados/config.js`.
3. Suba **o conteúdo desta pasta na raiz** do repositório (mantendo `index.html`,
   `css/`, `js/`, `assets/`, `.github/`, `.nojekyll`). Pelo site: *Add file →
   Upload files*; ou por linha de comando:
   ```bash
   git init && git add . && git commit -m "Pontos historicos - 4a Bda C Mec"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/pontos-historicos-guaicurus.git
   git push -u origin main
   ```

**Ativar o Pages**
4. **Settings → Pages**.
5. *Source*: **Deploy from a branch**; *Branch*: **main** / **/(root)** → **Save**.
6. Em ~1 min: `https://SEU-USUARIO.github.io/pontos-historicos-guaicurus/`

Todos os caminhos são **relativos**, então a página funciona igual na raiz ou em
subpasta. O `.nojekyll` evita que o GitHub ignore arquivos iniciados por `_`.

**Atualizar o conteúdo publicado:** cada issue/PR aprovado vira um commit; o Pages
reconstrói sozinho. Visitantes só consultam — quem altera os dados é quem tem
permissão de commit.

---

## 9. Uso 100% offline

Para rodar sem rede (pen drive em operação):
1. Baixe `leaflet.js` e `leaflet.css` (v1.9.4) para `assets/libs/` e troque os
   `<link>`/`<script>` do CDN no `index.html`.
2. Mapa offline: *tiles* pré-baixados (`z/x/y`) por caminho relativo **ou** uma
   carta georreferenciada única via `L.imageOverlay`.
3. As fotos já são locais.
