/* Assam Through Time: one map per year, 350 CE to today, built by tools/build.js into window.ATLAS. */
(() => {
  'use strict';
  const D = window.ATLAS;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NS = 'http://www.w3.org/2000/svg';
  const S = D.start, E = D.end, N = E - S + 1;
  $('yearIn').min = S; $('yearIn').max = E;
  const { P, ERAS, eraOf, areaAt, changeYears } = createAtlasModel(D);

  /* ---------- state ---------- */
  let year = S, sel = -1, playing = null, colonialGroup = '', colourMode = 'states';
  const navigation = createAtlasNavigation(D);
  const clamp = navigation.clamp;
  const fromHash = () => { ({ year, sel, colonialGroup, colourMode } = navigation.read(location.hash, year)); };
  const getState = () => ({ year, sel, colonialGroup, colourMode });
  const featureContext = { D, P, esc, getState, currentColonialGroup };
  const { colonialCard, statehoodDate } = createColonialCards(featureContext);
  const { growthCard } = createGrowthCards(featureContext);
  const { ratnaCard, postPalaCard } = createKamarupaCards(featureContext);
  const { drawPanel, activeHere } = createAtlasPanel({ D, P, S, E, $, esc, areaAt, getState, colonialCard, growthCard, ratnaCard, postPalaCard });

  /* ---------- map ---------- */
  const svg = $('map');
  const full = { x: 0, y: 0, w: D.W, h: D.H };
  const px = (lon, lat) => [(lon - D.proj.lon0) / (D.proj.lon1 - D.proj.lon0) * D.W, (D.proj.lat1 - lat) / (D.proj.lat1 - D.proj.lat0) * D.H];
  const home = (() => { const [x0, y0] = px(88.4, 28.7), [x1] = px(96.7, 23.9); return { x: x0, y: y0, w: x1 - x0, h: (x1 - x0) * D.H / D.W }; })();   // the Brahmaputra and Barak valleys
  const { getViewport, hideTip, focusGrowth, focusColonial, focusActiveColonial, revealColonialPanel, revealColonialMap } = createAtlasInteraction({
    D, P, S, E, $, esc, svg, px, full, home, getState,
    setColonialGroup: value => { colonialGroup = value; },
    drawMap: () => drawMap(), drawPanel: () => drawPanel(),
    drawLabels: list => drawLabels(list), select: i => select(i), saveHash: () => saveHash()
  });
  function currentColonialGroup() {
    return colonialGroup || (sel >= 0 && D.colonial.groups.find(g => g.polities.includes(P[sel].id))?.id) || 'overview';
  }
  const { drawMap, drawLabels } = createAtlasMap({ D, P, S, $, esc, NS, svg, px, getState, getViewport, currentColonialGroup, statehoodDate });

  $('panel').addEventListener('click', e => {
    const statehood = e.target.closest('[data-statehood-year]');
    if (statehood) {
      e.preventDefault(); stop(); colonialGroup = 'statehood';
      sel = P.findIndex(p => p.id === statehood.dataset.statehoodState);
      setYear(+statehood.dataset.statehoodYear); drawMap(); drawPanel(); drawRowsState();
      focusActiveColonial(); saveHash(); revealColonialPanel(); revealColonialMap(); return;
    }
    const jump = e.target.closest('[data-colonial-jump]'), cy = e.target.closest('[data-colonial-year]');
    if (jump || cy) {
      e.preventDefault(); stop();
      if (jump) colonialGroup = jump.dataset.colonialJump;
      sel = -1; setYear(+(jump ? jump.dataset.year : cy.dataset.colonialYear));
      drawMap(); drawPanel(); focusColonial(currentColonialGroup()); saveHash(); revealColonialPanel(); revealColonialMap(); return;
    }
    const cg = e.target.closest('[data-colonial-group]');
    if (cg) { colonialGroup = cg.dataset.colonialGroup; sel = -1; drawMap(); drawPanel(); focusColonial(colonialGroup); saveHash(); revealColonialPanel(); revealColonialMap(); return; }
    const cf = e.target.closest('[data-colonial-focus]');
    if (cf) { focusColonial(cf.dataset.colonialFocus); revealColonialMap(); return; }
    const focus = e.target.closest('[data-focus-growth]');
    if (focus) { focusGrowth(focus.dataset.focusGrowth); return; }
    const stage = e.target.closest('[data-growth-year]');
    if (stage) { stop(); select(P.findIndex(p => p.id === stage.dataset.growthPolity)); setYear(+stage.dataset.growthYear); if (year >= 1215 && year < 1228) focusGrowth('migration'); if (['koch','mughal','koch-hajo'].includes(stage.dataset.growthPolity) || (stage.dataset.growthPolity === 'ahom' && year >= 1537)) focusGrowth(stage.dataset.growthPolity === 'mughal' && year >= 1612 && year <= 1616 ? 'koch-hajo' : stage.dataset.growthPolity); $('panel').scrollTop = 0; return; }
    const group = e.target.closest('[data-growth]');
    if (group) { select(P.findIndex(p => p.id === group.dataset.growth)); return; }
    const y = e.target.closest('[data-y]'); if (y) { e.preventDefault(); stop(); setYear(+y.dataset.y); return; }
    const pp = e.target.closest('[data-p]'); if (pp) select(+pp.dataset.p === sel ? -1 : +pp.dataset.p);
  });
  $('panel').addEventListener('change', e => {
    if (e.target.id !== 'colonialRegion') return;
    colonialGroup = e.target.value; sel = -1; drawMap(); drawPanel(); focusColonial(colonialGroup); saveHash(); revealColonialPanel();
    $('colonialRegion').focus({ preventScroll: true }); revealColonialMap();
  });

  function select(i) {
    sel = i; drawMap(); drawPanel(); drawRowsState(); saveHash();
  }

  /* ---------- timeline bands ---------- */
  const { chart, rowsEl, placeNames, drawRowsState } = createAtlasTimeline({ D, P, S, E, N, ERAS, $, esc, areaAt, getState, activeHere });
  const yearFromX = cx => { const r = rowsEl.getBoundingClientRect(); return clamp(S + (cx - r.left) / r.width * N - .5); };
  let scrub = false;
  chart.addEventListener('pointerdown', e => {
    const b = e.target.closest('.nm');
    if (b) { select(+b.dataset.p === sel ? -1 : +b.dataset.p); return; }
    scrub = true; stop(); chart.setPointerCapture(e.pointerId); setYear(yearFromX(e.clientX));
  });
  chart.addEventListener('pointermove', e => { if (scrub) setYear(yearFromX(e.clientX)); });
  chart.addEventListener('pointerup', () => { scrub = false; });
  window.addEventListener('resize', () => {
    placeNames(); drawRowsState();
    if (year >= 1765 && colonialGroup) focusActiveColonial();
    else drawLabels(D.states[D.years[year-S]]);
  });
  placeNames();

  /* ---------- controls ---------- */
  function setYear(y) {
    y = clamp(y);
    if (y === year && $('yearIn').value == y) return;
    year = y;
    hideTip();
    $('yearIn').value = y;
    $('yearBig').textContent = y < 1000 ? y + ' CE' : y;
    $('eraBig').textContent = eraOf(y)[2];
    drawMap(); drawPanel(); drawRowsState(); saveHash();
  }
  let hashT = 0;
  const saveHash = () => { clearTimeout(hashT); hashT = setTimeout(() => history.replaceState(null, '', navigation.hash(getState())), 250); };

  const stepChange = dir => {
    stop();
    const y = dir > 0 ? changeYears.find(c => c > year) : [...changeYears].reverse().find(c => c < year);
    setYear(y ?? (dir > 0 ? E : S));
  };
  $('prev').onclick = () => stepChange(-1);
  $('next').onclick = () => stepChange(1);
  $('colourMode').addEventListener('change', e => { colourMode = e.target.value; drawMap(); drawPanel(); saveHash(); });
  $('yminus').onclick = () => { stop(); setYear(year - 1); };
  $('yplus').onclick = () => { stop(); setYear(year + 1); };
  $('yearIn').addEventListener('change', e => { stop(); setYear(+e.target.value || year); });
  $('yearIn').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); stop(); setYear(+e.target.value || year); }
  });

  function stop() { if (playing) { clearTimeout(playing); playing = null; } $('play').textContent = '▶'; $('play').setAttribute('aria-label', 'Play'); }
  function tick() {
    if (year >= E) { stop(); return; }
    setYear(year + 1);
    if (sel >= 0 && P[sel].id === 'koch' && D.growth.phases.some(p => p.polity === 'koch' && p.start === year)) focusGrowth('koch');
    const changed = changeYears.includes(year) || D.events.some(e => e.y === year);
    const frontierPlayback = sel >= 0 && P[sel].id === 'ahom' && year >= 1614 && year <= 1682;
    const journey = frontierPlayback || (year >= 1449 && year <= 1568) || (sel >= 0 && ['mughal','koch-hajo'].includes(P[sel].id) && year >= 1576 && year <= 1666);
    playing = setTimeout(tick, journey ? Math.max(180, +$('speed').value * 8) : +$('speed').value * (changed ? 14 : 1) + (changed ? 250 : 0));
  }
  $('play').onclick = () => {
    if (playing) { stop(); return; }
    if (year >= E) setYear(S);
    $('play').textContent = '❚❚'; $('play').setAttribute('aria-label', 'Pause');
    playing = setTimeout(tick, 150);
  };
  window.addEventListener('keydown', e => {
    if (e.defaultPrevented) return;
    if (e.target.matches('input, select')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); stop(); setYear(year + (k === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 10 : 1)); }
    else if (k === 'PageDown' || k === 'PageUp') { e.preventDefault(); stepChange(k === 'PageDown' ? 1 : -1); }
    else if (k === ' ') { e.preventDefault(); $('play').click(); }
    else if (k === 'Escape') select(-1);
  });

  $('panelToggle').onclick = () => { document.body.classList.toggle('panel-collapsed'); drawLabels(D.states[D.years[year-S]]); };
  $('timelineToggle').onclick = () => document.body.classList.toggle('timeline-collapsed');
  $('modernToggle').addEventListener('change', e => svg.classList.toggle('hide-modern', !e.target.checked));
  $('ratnaChip').addEventListener('click', () => {
    $('panel').scrollTop = 0;
    $('panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('bengalStart').onclick = () => { stop(); setYear(1576); select(P.findIndex(p => p.id === 'mughal')); focusGrowth('mughal'); };
  $('colonialStart').onclick = () => { stop(); colonialGroup = 'overview'; sel = -1; setYear(1826); drawMap(); drawPanel(); focusColonial('overview'); saveHash(); revealColonialPanel(true); };
  $('statehoodStart').onclick = () => { stop(); colonialGroup = 'statehood'; sel = -1; setYear(year < 1947 ? 1963 : year); drawMap(); drawPanel(); focusColonial('statehood'); saveHash(); revealColonialPanel(true); };
  $('sankardevaStart').onclick = () => { stop(); select(-1); setYear(1449); focusGrowth('bhuyan'); $('play').click(); };
  $('sankardevaChip').onclick = () => { location.href = `sankardeva.html#y=${year}`; };
  $('journeyChip').addEventListener('click', () => { select(P.findIndex(p => p.id === 'ahom')); focusGrowth('migration'); });

  fromHash();
  const y0 = year; year = -1; setYear(y0);
  if (sel >= 0 && P[sel].id === 'ahom' && ((year >= 1215 && year <= 1281) || (year >= 1537 && year <= 1816))) focusGrowth('ahom');
  if (sel >= 0 && ['mughal','koch-hajo'].includes(P[sel].id) && year >= 1576 && year <= 1764) focusGrowth(P[sel].id);
  if (year >= 1765 && colonialGroup) focusActiveColonial();
  window.addEventListener('hashchange', () => { fromHash(); const y = year; year = -1; setYear(y); if (year >= 1765 && colonialGroup) focusActiveColonial(); else if (sel >= 0 && ['mughal','koch-hajo'].includes(P[sel].id) && year >= 1576 && year <= 1764) focusGrowth(P[sel].id); else if (sel >= 0 && P[sel].id === 'ahom' && year >= 1537 && year <= 1816) focusGrowth('ahom'); });
})();
