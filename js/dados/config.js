/* =============================================================================
   CONFIGURAÇÃO GERAL
   Pontos Históricos · 4ª Bda C Mec (Guaicurus)
   -----------------------------------------------------------------------------
   Este arquivo é carregado ANTES dos arquivos de pontos e do app.
   ========================================================================== */

/* Endereço do repositório no GitHub. AJUSTE após criar o repositório:
   é o que faz os botões "Sugerir alteração" e "Adicionar ponto" funcionarem. */
const REPOSITORIO = "https://github.com/SEU-USUARIO/pontos-historicos-guaicurus";

/* Unidades (aparecem no filtro e na legenda).
   pasta = subpasta em assets/fotos onde ficam as imagens da unidade. */
const UNIDADES = {
  "3bia": { rotulo: "3ª Bia AAAe", cidadeSede: "Três Lagoas – MS", cor: "#2563eb", pasta: "3bia-aaae" },
  "10rc": { rotulo: "10º RC Mec",  cidadeSede: "Bela Vista – MS",   cor: "#16a34a", pasta: "10rc-mec" },
  "11rc": { rotulo: "11º RC Mec",  cidadeSede: "Ponta Porã – MS",   cor: "#dc2626", pasta: "11rc-mec" },
  "17rc": { rotulo: "17º RC Mec",  cidadeSede: "Amambai – MS",      cor: "#ea580c", pasta: "17rc-mec" }
};

/* Links úteis gerais (barra lateral). Um por linha: { rotulo, url }. */
const LINKS_UTEIS = [
  { rotulo: "FUNAG – Biblioteca (fronteira Brasil–Paraguai)", url: "https://funag.gov.br/biblioteca-nova/produto/1-1128" },
  { rotulo: "IHGMS – Instituto Histórico e Geográfico de MS", url: "https://ihgms.org.br" },
  { rotulo: "Exército Brasileiro – Patronos (QAO)", url: "https://www.eb.mil.br/patronos/qao" }
];

/* Array preenchido pelos arquivos js/dados/pontos-*.js */
const PONTOS = [];
