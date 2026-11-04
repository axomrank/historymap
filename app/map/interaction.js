'use strict';
window.createAtlasInteraction = function ({ D, P, S, E, $, esc, svg, px, full, home, getState, setColonialGroup, drawMap, drawPanel, drawLabels, select, saveHash }) {
  let vb = { ...home };
  /* hover / click on the map */
  const tip = $('tip');
  let pinnedTip = false;
  function placeTip(html, cx, cy) {
    tip.innerHTML = html;
    tip.hidden = false;
    const r = svg.parentNode.getBoundingClientRect();
    tip.style.left = Math.max(4, Math.min(cx - r.left + 14, r.width - tip.offsetWidth - 6)) + 'px';
    tip.style.top = Math.max(4, Math.min(cy - r.top + 14, r.height - tip.offsetHeight - 6)) + 'px';
  }
  function featureTip(target, cx, cy) {
    const colonialSpot = target.closest('[data-colonial-spot]');
    if (colonialSpot) {
      const s = D.colonial.spots.find(s => s.id === colonialSpot.dataset.colonialSpot);
      placeTip(`<b>${esc(s.name)}</b><br>${esc(s.note)}`, cx, cy);
      return true;
    }
    const sankardevaPin = target.closest('[data-sankardeva-pin]');
    if (sankardevaPin) {
      const p = D.sankardeva.points.find(p => p.id === sankardevaPin.dataset.sankardevaPin);
      placeTip(`<b>${esc(p.name)}</b><br>${esc(p.note)}<br>${esc(p.chronology)}`, cx, cy);
      return true;
    }
    const river = target.closest('[data-river]'), spot = target.closest('[data-spot]');
    if (river) {
      const r = D.base.rivers[+river.dataset.river];
      document.querySelectorAll('.river-hit.active').forEach(el => el.classList.remove('active'));
      river.classList.add('active');
      placeTip(`<b>${esc(r.n)}</b><br><span>River · mapped present-day course</span>`, cx, cy);
      return true;
    }
    if (spot) {
      const s = D.growth.spots.find(s => s.id === spot.dataset.spot);
      placeTip(`<b>${esc(s.name)}</b><br>${esc(s.date)}<br>${esc(s.note)}`, cx, cy);
      return true;
    }
    return false;
  }
  function hideTip() {
    pinnedTip = false; tip.hidden = true;
    document.querySelectorAll('.river-hit.active').forEach(el => el.classList.remove('active'));
  }
  svg.addEventListener('pointermove', e => {
    if (dragging) { if (moved) hideTip(); return; }
    if (pinnedTip) return;
    if (featureTip(e.target, e.clientX, e.clientY)) return;
    document.querySelectorAll('.river-hit.active').forEach(el => el.classList.remove('active'));
    const el = e.target.closest('.realm');
    if (!el || dragging) { tip.hidden = true; return; }
    const t = D.territories[D.shapes[+el.dataset.si].t], p = P[t.p];
    const affiliation = D.colonial.authorities[t.authority];
    tip.innerHTML = `<b>${esc(t.label && t.label !== p.name ? `${p.name}: ${t.label}` : p.name)}</b><br>${p.start}–${p.end >= E ? 'today' : p.end}${affiliation ? `<br><strong>${esc(affiliation.label)}</strong>` : ''}${t.style === 'context' ? '<br><i>Regional context; exact extent unresolved</i>' : t.style === 'protected' && !affiliation ? '<br><i>Protected / princely rule</i>' : t.style === 'reach' ? '<br><i>campaign reach, not a border</i>' : t.conf === 'low' ? '<br><i>border uncertain</i>' : ''}`;
    const r = svg.parentNode.getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 250) + 'px';
    tip.style.top = (e.clientY - r.top + 14) + 'px';
    tip.hidden = false;
  });
  svg.addEventListener('pointerleave', () => { if (!pinnedTip) hideTip(); });
  svg.addEventListener('click', e => {
    if (moved) return;
    const marker = e.target.closest('[data-colonial-spot]');
    if (marker) {
      const s = D.colonial.spots.find(s => s.id === marker.dataset.colonialSpot);
      setColonialGroup(s.group); drawMap(); drawPanel(); saveHash(); revealColonialPanel(true); return;
    }
    if (featureTip(e.target, e.clientX, e.clientY)) { pinnedTip = true; return; }
    hideTip();
    const el = e.target.closest('.realm');
    select(el ? D.territories[D.shapes[+el.dataset.si].t].p : -1);
  });
  svg.addEventListener('focusin', e => {
    const r = e.target.getBoundingClientRect();
    featureTip(e.target, r.left + r.width / 2, r.top + r.height / 2);
  });
  svg.addEventListener('focusout', () => { if (!pinnedTip) hideTip(); });
  svg.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideTip();
    if (['Enter', ' '].includes(e.key) && e.target.closest('[data-colonial-spot]')) {
      e.preventDefault(); e.target.closest('[data-colonial-spot]').dispatchEvent(new MouseEvent('click', { bubbles: true })); return;
    }
    if (['Enter', ' '].includes(e.key) && e.target.matches('[data-river], [data-spot], [data-sankardeva-pin]')) {
      e.preventDefault(); const r = e.target.getBoundingClientRect();
      featureTip(e.target, r.left + r.width / 2, r.top + r.height / 2); pinnedTip = true;
    }
  });

  /* pan and zoom */
  const setVB = v => {
    const w = Math.max(D.W / 8, Math.min(D.W * 2, v.w)), h = w * v.h / v.w;
    vb = { w, h, x: Math.max(-w * .3, Math.min(D.W - w * .7, v.x)), y: Math.max(-h * .3, Math.min(D.H - h * .7, v.y)) };
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  };
  const svgPt = (cx, cy) => { const r = svg.getBoundingClientRect(), s = Math.max(vb.w / r.width, vb.h / r.height); return { x: vb.x + (cx - r.left - (r.width - vb.w / s) / 2) * s, y: vb.y + (cy - r.top - (r.height - vb.h / s) / 2) * s }; };
  const zoomAt = (f, cx, cy) => {
    const p = cx == null ? { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 } : svgPt(cx, cy);
    const w = Math.max(D.W / 8, Math.min(D.W * 2, vb.w * f)), h = w * vb.h / vb.w;
    setVB({ w, h, x: p.x - (p.x - vb.x) * w / vb.w, y: p.y - (p.y - vb.y) * h / vb.h });
    drawLabels(D.states[D.years[getState().year - S]]);
  };
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
  $('zin').onclick = () => zoomAt(1 / 1.4);
  $('zout').onclick = () => zoomAt(1.4);
  $('zfit').onclick = () => { setVB(vb.w < D.W * .99 ? full : home); drawLabels(D.states[D.years[getState().year - S]]); };
  function focusGrowth(id) {
    const bounds = id === 'ahom-all' ? [89.5,96.3,24.9,28.6] : id === 'ahom' && getState().year >= 1614 ? [89.5,93.4,25.4,27.8] : id === 'ahom' && getState().year >= 1537 ? [91.4,96.3,25.7,28.2] : id === 'mughal' ? [85.6, 93.1, 20.6, 27.4] : id === 'koch-hajo' ? [89.5, 92.9, 25.65, 27.35] : id === 'koch' ? (getState().year < 1520 ? [89.7, 90.9, 26.2, 27.05] : getState().year < 1527 ? [89.2, 91.3, 25.7, 27.15] : [88.1, 94.4, 25.3, 27.4]) : id === 'migration' || (id === 'ahom' && getState().year <= 1228) ? [94.1, 98.65, 23.55, 28.05] : id === 'ahom' ? (getState().year < 1282 ? [94.1, 96.45, 26.55, 28.0] : [93.0, 96.4, 26.2, 28.2]) : id === 'chutia' ? [93.1, 96.5, 26.6, 28.5] : id === 'bhuyan' ? [90.3, 94.3, 25.9, 27.5] : [88.1, 92.1, 25.3, 27.2];
    const [x0, y0] = px(bounds[0], bounds[3]), [x1, y1] = px(bounds[1], bounds[2]);
    const ratio = svg.clientWidth / svg.clientHeight;
    const w = Math.max(x1 - x0, (y1 - y0) * ratio), h = w / ratio;
    setVB({ x: (x0 + x1 - w) / 2, y: (y0 + y1 - h) / 2, w, h });
    drawLabels(D.states[D.years[getState().year - S]]);
  }
  function focusColonial(group) {
    const bounds = D.colonial.groups.find(g => g.id === group)?.bounds || [88,97.3,21.8,29.5];
    const [x0,y0] = px(bounds[0],bounds[3]), [x1,y1] = px(bounds[1],bounds[2]);
    const ratio = svg.clientWidth / svg.clientHeight, w = Math.max(x1-x0,(y1-y0)*ratio), h = w/ratio;
    setVB({ x:(x0+x1-w)/2, y:(y0+y1-h)/2, w,h });
    drawLabels(D.states[D.years[getState().year-S]]);
  }
  function focusActiveColonial() {
    const selected = getState().sel >= 0 && D.colonial.statehood.find(s => s.id === P[getState().sel].id);
    focusColonial(getState().colonialGroup === 'statehood' && selected ? selected.group : getState().colonialGroup);
  }
  function revealColonialPanel(scrollOnMobile = false) {
    document.body.classList.remove('panel-collapsed');
    $('panel').scrollTop = 0;
    if (scrollOnMobile && innerWidth <= 860) $('panel').scrollIntoView({ block: 'start' });
  }
  function revealColonialMap() { if (innerWidth <= 860) svg.scrollIntoView({ block: 'start' }); }
  let dragging = null, moved = false;
  const pts = new Map();
  svg.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && featureTip(e.target, e.clientX, e.clientY)) pinnedTip = true;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragging = { x: e.clientX, y: e.clientY, vb: { ...vb }, d: pinchDist() }; moved = false;
  });
  const pinchDist = () => { const a = [...pts.values()]; return a.length > 1 ? Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) : 0; };
  window.addEventListener('pointermove', e => {
    if (!dragging || !pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size > 1 && dragging.d) {
      const a = [...pts.values()], d = pinchDist();
      zoomAt(dragging.d / d * (vb.w / dragging.vb.w) * dragging.vb.w / vb.w, (a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2);
      dragging.d = d; moved = true; return;
    }
    const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { moved = true; svg.classList.add('dragging'); svg.setPointerCapture?.(e.pointerId); }
    if (!moved) return;
    const r = svg.getBoundingClientRect(), s = Math.max(vb.w / r.width, vb.h / r.height);
    setVB({ ...dragging.vb, x: dragging.vb.x - dx * s, y: dragging.vb.y - dy * s });
  });
  const endDrag = e => { pts.delete(e.pointerId); if (!pts.size) { dragging = null; svg.classList.remove('dragging'); } };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);


return { getViewport: () => vb, hideTip, focusGrowth, focusColonial, focusActiveColonial, revealColonialPanel, revealColonialMap };
};
