/* =============================================================================
   PONTOS HISTÓRICOS · 4ª Bda C Mec (Guaicurus)  |  app.js  (somente leitura)
   Depende de: Leaflet (CDN) e js/dados/*.js (REPOSITORIO, UNIDADES, LINKS_UTEIS, PONTOS)

   Este site NÃO edita dados. Alterações são feitas por issues ou pull requests
   no GitHub (ver README). Os botões "Sugerir alteração" e "Adicionar ponto"
   abrem os formulários de issue do repositório.
   ========================================================================== */

const estado = { unidades: new Set(Object.keys(UNIDADES)), categoria: "", busca: "" };
const marcadores = {};
const camadaMarcadores = L.layerGroup();
let pontoAtivoId = null;

/* -------------------------- mapa ----------------------------------------- */
const mapa = L.map("mapa", { zoomControl: true }).setView([-22.6, -55.4], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19, attribution: "&copy; colaboradores do OpenStreetMap"
}).addTo(mapa);
camadaMarcadores.addTo(mapa);

function iconeUnidade(unidadeKey, aproximado) {
  const cor = (UNIDADES[unidadeKey] || {}).cor || "#666";
  return L.divIcon({
    className: "",
    html: `<div class="marcador ${aproximado ? "aproximado" : ""}" style="background:${cor}"></div>`,
    iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -20]
  });
}

PONTOS.forEach(p => {
  const m = L.marker([p.lat, p.lng], { icon: iconeUnidade(p.unidade, p.precisao === "aproximada") });
  m.bindPopup(
    `<div class="popup-titulo">${escapar(p.nome)}</div>` +
    `<div class="popup-local">${escapar(p.cidade)}</div>` +
    `<button class="popup-btn" onclick="abrirDetalhe('${p.id}')">Ver dossiê</button>`
  );
  m.on("click", () => selecionarItem(p.id, false));
  marcadores[p.id] = m;
  camadaMarcadores.addLayer(m);
});

/* -------------------------- filtros -------------------------------------- */
function pontosVisiveis() {
  const termo = estado.busca.trim().toLowerCase();
  return PONTOS.filter(p => {
    if (!estado.unidades.has(p.unidade)) return false;
    if (estado.categoria && p.categoria !== estado.categoria) return false;
    if (termo) {
      const alvo = (p.nome + " " + p.cidade + " " + p.categoria + " " + p.periodo + " " + p.descricao).toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
}

function aplicarFiltros() {
  const visiveis = pontosVisiveis();
  const ids = new Set(visiveis.map(p => p.id));
  PONTOS.forEach(p => {
    const m = marcadores[p.id];
    if (ids.has(p.id)) { if (!camadaMarcadores.hasLayer(m)) camadaMarcadores.addLayer(m); }
    else { if (camadaMarcadores.hasLayer(m)) camadaMarcadores.removeLayer(m); }
  });
  renderLista(visiveis);
  atualizarContadores(visiveis);
  if (pontoAtivoId && !ids.has(pontoAtivoId)) fecharDetalhe();
}

function renderLista(visiveis) {
  const lista = document.getElementById("lista");
  if (!visiveis.length) {
    lista.innerHTML = `<div class="vazio">Nenhum ponto encontrado com os filtros atuais.</div>`;
    return;
  }
  lista.innerHTML = visiveis.map(p => {
    const u = UNIDADES[p.unidade] || { rotulo: p.unidade, cor: "#666" };
    const aprox = p.precisao === "aproximada"
      ? `<span class="aprox" title="Coordenada aproximada — verificar">aprox.</span>` : "";
    return (
      `<button class="item ${p.id === pontoAtivoId ? "ativo" : ""}" data-id="${p.id}">` +
        `<div class="titulo">${escapar(p.nome)}</div>` +
        `<div class="meta"><span class="tag-unidade" style="background:${u.cor}">${escapar(u.rotulo)}</span>` +
        `<span>${escapar(p.cidade)}</span>${aprox}</div>` +
      `</button>`
    );
  }).join("");
  lista.querySelectorAll(".item").forEach(btn =>
    btn.addEventListener("click", () => selecionarItem(btn.dataset.id, true)));
}

/* -------------------------- seleção / dossiê ----------------------------- */
function selecionarItem(id, voarAte) {
  pontoAtivoId = id;
  const p = PONTOS.find(x => x.id === id); if (!p) return;
  document.querySelectorAll(".item").forEach(el => el.classList.toggle("ativo", el.dataset.id === id));
  if (voarAte) {
    mapa.flyTo([p.lat, p.lng], 14, { duration: 0.8 });
    setTimeout(() => marcadores[p.id] && marcadores[p.id].openPopup(), 850);
  }
  abrirDetalhe(id);
}

function abrirDetalhe(id) {
  const p = PONTOS.find(x => x.id === id); if (!p) return;
  pontoAtivoId = id;
  const u = UNIDADES[p.unidade] || { rotulo: p.unidade, cor: "#666" };

  const faixa = document.querySelector(".detalhe .faixa-unidade");
  faixa.textContent = u.rotulo; faixa.style.background = u.cor;
  document.querySelector(".detalhe h2").textContent = p.nome;
  document.querySelector(".detalhe .local").textContent = p.cidade;

  const precisaoSelo = `<span class="selo-precisao ${p.precisao}">${p.precisao}</span>`;
  const linkMapa = `<a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">abrir no Google Maps</a>`;
  document.querySelector(".detalhe .ficha").innerHTML =
    linha("Categoria", escapar(p.categoria)) +
    linha("Período", escapar(p.periodo)) +
    linha("Endereço", escapar(p.endereco)) +
    linha("Coordenadas", `${(+p.lat).toFixed(5)}, ${(+p.lng).toFixed(5)} ${precisaoSelo}<br>${linkMapa}`);

  renderGaleria(p);
  document.querySelector(".detalhe .descricao").textContent = p.descricao;

  // links úteis do ponto (bloco só aparece se houver)
  const blocoLinks = document.querySelector(".detalhe .bloco-links");
  if (p.links && p.links.length) {
    blocoLinks.innerHTML =
      `<p class="rotulo-secao-detalhe">Links úteis</p><ul class="links-dossie">` +
      p.links.map(l => `<li><a href="${escapar(l.url)}" target="_blank" rel="noopener">${escapar(l.rotulo)}</a></li>`).join("") +
      `</ul>`;
  } else { blocoLinks.innerHTML = ""; }

  document.querySelector(".detalhe .fontes").innerHTML = `<b>Fontes:</b> ${escapar(p.fontes || "—")}`;

  // botão de sugerir correção deste ponto (abre issue já intitulada)
  document.getElementById("btn-sugerir-correcao").href = urlIssueCorrigir(p);

  document.querySelector(".detalhe").classList.add("aberto");
  document.querySelectorAll(".item").forEach(el => el.classList.toggle("ativo", el.dataset.id === id));
}

function linha(campo, valor) {
  return `<li><span class="campo">${campo}</span><span class="valor">${valor}</span></li>`;
}
function fecharDetalhe() {
  document.querySelector(".detalhe").classList.remove("aberto");
  pontoAtivoId = null;
  document.querySelectorAll(".item").forEach(el => el.classList.remove("ativo"));
}

function renderGaleria(p) {
  const alvo = document.querySelector(".detalhe .galeria");
  alvo.innerHTML = "";
  const fotos = p.fotos || [];
  if (!fotos.length) {
    alvo.innerHTML = `<div class="placeholder" style="grid-column:1/-1">Sem fotos cadastradas para este ponto.</div>`;
    return;
  }
  fotos.forEach(caminho => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = caminho; img.alt = p.nome;
    img.addEventListener("click", () => abrirLightbox(caminho));
    img.addEventListener("error", () => {
      fig.innerHTML = `<div class="placeholder">Foto pendente<br><code>${escapar(caminho)}</code></div>`;
    });
    fig.appendChild(img); alvo.appendChild(fig);
  });
}

function abrirLightbox(src) {
  const lb = document.getElementById("lightbox");
  lb.querySelector("img").src = src; lb.classList.add("aberto");
}
document.getElementById("lightbox").addEventListener("click", () =>
  document.getElementById("lightbox").classList.remove("aberto"));

/* -------------------------- contribuição (GitHub) ------------------------ */
function urlIssues() { return `${REPOSITORIO}/issues`; }
function urlIssueNovoPonto() { return `${REPOSITORIO}/issues/new?template=adicionar-ponto.yml`; }
function urlIssueCorrigir(p) {
  const titulo = encodeURIComponent(`[Correção] ${p.nome}`);
  return `${REPOSITORIO}/issues/new?template=corrigir-ponto.yml&title=${titulo}`;
}

/* -------------------------- filtros / legenda / links -------------------- */
function montarFiltroUnidades() {
  const box = document.getElementById("unidades");
  box.innerHTML = Object.entries(UNIDADES).map(([key, u]) => {
    const qtd = PONTOS.filter(p => p.unidade === key).length;
    return (
      `<label class="chip-unidade">` +
        `<input type="checkbox" data-unidade="${key}" checked>` +
        `<span class="selo" style="background:${u.cor}"></span>` +
        `<span class="nome">${u.rotulo}</span>` +
        `<span class="qtd" data-qtd="${key}">${qtd}</span>` +
      `</label>`
    );
  }).join("");
  box.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => {
      const key = cb.dataset.unidade;
      if (cb.checked) estado.unidades.add(key); else estado.unidades.delete(key);
      aplicarFiltros();
    });
  });
}

function montarFiltroCategorias() {
  const sel = document.getElementById("filtro-categoria");
  const categorias = [...new Set(PONTOS.map(p => p.categoria))].sort();
  sel.innerHTML = `<option value="">Todas as categorias</option>` +
    categorias.map(c => `<option value="${c}">${c}</option>`).join("");
  sel.addEventListener("change", () => { estado.categoria = sel.value; aplicarFiltros(); });
}

function montarLegenda() {
  const box = document.querySelector(".legenda .corpo-legenda");
  box.innerHTML = Object.values(UNIDADES).map(u =>
    `<div class="linha-legenda"><span class="selo" style="background:${u.cor}"></span>${u.rotulo}</div>`
  ).join("") +
  `<div class="linha-legenda" style="margin-top:6px"><span class="marcador aproximado" style="background:#999;width:11px;height:11px;transform:none;border-radius:3px"></span>marco aproximado</div>`;
}

function montarLinksUteis() {
  const box = document.getElementById("links-uteis");
  if (!LINKS_UTEIS || !LINKS_UTEIS.length) { box.innerHTML = "<li class='vazio-links'>Sem links.</li>"; return; }
  box.innerHTML = LINKS_UTEIS.map(l =>
    `<li><a href="${escapar(l.url)}" target="_blank" rel="noopener">${escapar(l.rotulo)}</a></li>`).join("");
}

function atualizarContadores(visiveis) {
  document.getElementById("contador-total").textContent = visiveis.length;
  Object.keys(UNIDADES).forEach(key => {
    const el = document.querySelector(`[data-qtd="${key}"]`);
    if (el) el.textContent = visiveis.filter(p => p.unidade === key).length;
  });
}

function enquadrarTudo() {
  const visiveis = pontosVisiveis(); if (!visiveis.length) return;
  const grupo = L.featureGroup(visiveis.map(p => marcadores[p.id]).filter(Boolean));
  if (grupo.getLayers().length) mapa.fitBounds(grupo.getBounds().pad(0.2));
}

/* -------------------------- util ----------------------------------------- */
function escapar(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* -------------------------- eventos -------------------------------------- */
document.getElementById("busca").addEventListener("input", e => { estado.busca = e.target.value; aplicarFiltros(); });
document.getElementById("btn-enquadrar").addEventListener("click", enquadrarTudo);
document.querySelector(".detalhe .fechar").addEventListener("click", fecharDetalhe);
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharDetalhe(); });

document.getElementById("btn-sugerir").href = urlIssues();
document.getElementById("btn-adicionar").href = urlIssueNovoPonto();

/* -------------------------- start ---------------------------------------- */
montarFiltroUnidades();
montarFiltroCategorias();
montarLegenda();
montarLinksUteis();
aplicarFiltros();
enquadrarTudo();
