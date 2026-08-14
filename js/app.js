/* =============================================================================
   PONTOS HISTÓRICOS · 4ª Bda C Mec (Guaicurus)  |  app.js  (site estático)
   Depende de: Leaflet (CDN) e js/dados/*.js (UNIDADES, LINKS_UTEIS, PONTOS)
   ========================================================================== */

const estado = { unidades: new Set(Object.keys(UNIDADES)), categoria: "", busca: "" };
const marcadores = {};
const camadaMarcadores = L.layerGroup();
let pontoAtivoId = null;

/* -------------------------- mapa ----------------------------------------- */
const mapa = L.map("mapa", { zoomControl: true }).setView([-22.6, -55.4], 6);

const camadasBase = {
  mapa: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "&copy; colaboradores do OpenStreetMap"
  }),
  terreno: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, maxNativeZoom: 17,
    attribution: "&copy; colaboradores do OpenStreetMap &middot; SRTM | mapa: &copy; OpenTopoMap (CC-BY-SA)"
  }),
  satelite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
  })
};
camadasBase.mapa.addTo(mapa);
camadaMarcadores.addTo(mapa);

document.querySelectorAll(".camada-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("ativa")) return;
    document.querySelectorAll(".camada-btn").forEach(b => b.classList.remove("ativa"));
    btn.classList.add("ativa");
    Object.values(camadasBase).forEach(camada => mapa.removeLayer(camada));
    camadasBase[btn.dataset.camada].addTo(mapa);
  });
});

function iconeUnidade(unidadeKey) {
  const cor = (UNIDADES[unidadeKey] || {}).cor || "#666";
  return L.divIcon({
    className: "",
    html: `<div class="marcador" style="background:${cor}"></div>`,
    iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -20]
  });
}

PONTOS.forEach(p => {
  const m = L.marker([p.lat, p.lng], { icon: iconeUnidade(p.unidade) });
  m.bindPopup(
    `<div class="popup-titulo">${escapar(p.nome)}</div>` +
    `<div class="popup-local">${escapar(p.cidade)}</div>` +
    `<button class="popup-btn" onclick="abrirDetalhe('${p.id}')">Ver dossiê</button>`
  );
  m.on("click", () => selecionarItem(p.id, false, false));
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
    return (
      `<button class="item ${p.id === pontoAtivoId ? "ativo" : ""}" data-id="${p.id}">` +
        `<div class="titulo">${escapar(p.nome)}</div>` +
        `<div class="meta"><span class="tag-unidade" style="background:${u.cor}">${escapar(u.rotulo)}</span>` +
        `<span>${escapar(p.cidade)}</span></div>` +
      `</button>`
    );
  }).join("");
  lista.querySelectorAll(".item").forEach(btn =>
    btn.addEventListener("click", () => selecionarItem(btn.dataset.id, true)));
}

/* -------------------------- seleção / dossiê ----------------------------- */
function selecionarItem(id, voarAte, abrirDossie = true) {
  pontoAtivoId = id;
  const p = PONTOS.find(x => x.id === id); if (!p) return;
  document.querySelectorAll(".item").forEach(el => el.classList.toggle("ativo", el.dataset.id === id));
  if (voarAte) {
    mapa.flyTo([p.lat, p.lng], 14, { duration: 0.8 });
    setTimeout(() => marcadores[p.id] && marcadores[p.id].openPopup(), 850);
  }
  if (abrirDossie) abrirDetalhe(id);
  fecharMenu();
}

function abrirDetalhe(id) {
  const p = PONTOS.find(x => x.id === id); if (!p) return;
  pontoAtivoId = id;
  const u = UNIDADES[p.unidade] || { rotulo: p.unidade, cor: "#666" };

  const faixa = document.querySelector(".detalhe .faixa-unidade");
  faixa.textContent = u.rotulo; faixa.style.background = u.cor;
  document.querySelector(".detalhe h2").textContent = p.nome;
  document.querySelector(".detalhe .local").textContent = p.cidade;

  const linkMapa = `<a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">abrir no Google Maps</a>`;
  document.querySelector(".detalhe .ficha").innerHTML =
    linha("Categoria", escapar(p.categoria)) +
    linha("Período", escapar(p.periodo)) +
    linha("Endereço", escapar(p.endereco)) +
    linha("Coordenadas", `${(+p.lat).toFixed(5)}, ${(+p.lng).toFixed(5)}<br>${linkMapa}`);

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
  fotos.forEach((caminho, indice) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = caminho; img.alt = p.nome;
    img.addEventListener("click", () => abrirLightbox(fotos, indice));
    img.addEventListener("error", () => {
      fig.innerHTML = `<div class="placeholder">Foto pendente<br><code>${escapar(caminho)}</code></div>`;
    });
    fig.appendChild(img); alvo.appendChild(fig);
  });
}

let galeriaLightbox = [];
let indiceLightbox = 0;

function abrirLightbox(fotos, indice) {
  galeriaLightbox = fotos;
  indiceLightbox = indice;
  mostrarFotoLightbox();
  document.getElementById("lightbox").classList.add("aberto");
}
function mostrarFotoLightbox() {
  const lb = document.getElementById("lightbox");
  lb.querySelector("img").src = galeriaLightbox[indiceLightbox];
  lb.classList.toggle("varias-fotos", galeriaLightbox.length > 1);
}
function lightboxAnterior() {
  indiceLightbox = (indiceLightbox - 1 + galeriaLightbox.length) % galeriaLightbox.length;
  mostrarFotoLightbox();
}
function lightboxProxima() {
  indiceLightbox = (indiceLightbox + 1) % galeriaLightbox.length;
  mostrarFotoLightbox();
}
function fecharLightbox() { document.getElementById("lightbox").classList.remove("aberto"); }
document.getElementById("lightbox").addEventListener("click", fecharLightbox);
document.getElementById("lightbox").querySelector("img").addEventListener("click", e => e.stopPropagation());
document.getElementById("lightbox-fechar").addEventListener("click", fecharLightbox);
document.getElementById("lightbox-anterior").addEventListener("click", e => { e.stopPropagation(); lightboxAnterior(); });
document.getElementById("lightbox-proxima").addEventListener("click", e => { e.stopPropagation(); lightboxProxima(); });

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
  ).join("");
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
document.addEventListener("keydown", e => {
  const lightboxAberto = document.getElementById("lightbox").classList.contains("aberto");
  if (lightboxAberto && e.key === "ArrowLeft") { lightboxAnterior(); return; }
  if (lightboxAberto && e.key === "ArrowRight") { lightboxProxima(); return; }
  if (e.key !== "Escape") return;
  fecharLightbox();
  fecharDetalhe();
  fecharMenu();
});

/* -------------------------- menu hambúrguer (mobile) --------------------- */
const lateralEl = document.getElementById("lateral");
const fundoLateralEl = document.getElementById("fundo-lateral");
const btnHamburguerEl = document.getElementById("btn-hamburguer");

function abrirMenu() {
  lateralEl.classList.add("aberta");
  fundoLateralEl.classList.add("aberto");
  btnHamburguerEl.setAttribute("aria-expanded", "true");
}
function fecharMenu() {
  lateralEl.classList.remove("aberta");
  fundoLateralEl.classList.remove("aberto");
  btnHamburguerEl.setAttribute("aria-expanded", "false");
}
btnHamburguerEl.addEventListener("click", () =>
  lateralEl.classList.contains("aberta") ? fecharMenu() : abrirMenu());
fundoLateralEl.addEventListener("click", fecharMenu);

/* -------------------------- start ---------------------------------------- */
montarFiltroUnidades();
montarFiltroCategorias();
montarLegenda();
montarLinksUteis();
aplicarFiltros();
enquadrarTudo();
