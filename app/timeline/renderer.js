'use strict';
window.createAtlasTimeline = function ({ D, P, S, E, N, ERAS, $, esc, areaAt, getState, activeHere }) {
  const chart = $('chart'), rowsEl = $('rows');
  // Lanes: a kingdom and the ones that followed it in the same lane, so one rises as the last fades.
  const lanes = [...new Set(P.map(p => p.lane))].sort((a, b) => a - b);
  const RH = 17;
  const band = i => {   // centred on the lane; thickness grows with the land held (square-root scale, shared by all)
    const p = P[i], pts = [];
    for (let y = Math.max(S, p.start); y <= Math.min(E, p.end); y++) {
      const present = D.states[D.years[y - S]].some(si => D.territories[D.shapes[si].t].p === i);
      pts.push([y - S, Math.min(1, Math.sqrt(areaAt(i, y) / 100000)), present ? .1 : 0]);
    }
    const top = pts.map(([x, v, floor], k) => `${k ? 'L' : 'M'}${x} ${(RH / 2 - Math.max(floor, v) * (RH / 2 - 1)).toFixed(2)}`).join('');
    const bot = pts.reverse().map(([x, v, floor]) => `L${x + 1} ${(RH / 2 + Math.max(floor, v) * (RH / 2 - 1)).toFixed(2)}`).join('');
    return `<path class="band" data-p="${i}" fill="${p.color}" d="${top}${bot}Z"><title>${esc(p.name)}, ${p.start}–${p.end >= E ? 'today' : p.end}</title></path>`;
  };
  rowsEl.innerHTML = lanes.map(l => {
    const ps = P.map((p, i) => i).filter(i => P[i].lane === l);
    return `<div class="row"><svg viewBox="0 0 ${N} ${RH}" preserveAspectRatio="none">${ps.map(band).join('')}</svg>
      ${ps.map(i => `<span class="nm" data-p="${i}" data-s="${P[i].start}" data-e="${Math.min(E, P[i].end)}">${esc(P[i].short)}</span>`).join('')}</div>`;
  }).join('');
  function placeNames() {   // a name sits in the middle of its band, if the band is wide enough at this width
    const w = rowsEl.clientWidth;
    rowsEl.querySelectorAll('.nm').forEach(el => {
      const s = +el.dataset.s, e = +el.dataset.e, px = (e - s + 1) / N * w;
      el.style.left = ((s + e + 1) / 2 - S) / N * 100 + '%';
      el.hidden = px < el.textContent.length * 6.3 + 6;
    });
  }
  const span = (a, b) => `left:${(a - S) / N * 100}%;width:${(b - a + 1) / N * 100}%`;
  $('eras').innerHTML = ERAS.map(e => `<div class="era" style="${span(e[0], e[1])}" title="${esc(e[2])} (${e[0]}–${e[1]})">${esc(e[2])}</div>`).join('');
  $('axis').innerHTML = [400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000].map(y => `<span style="left:${(y - S) / N * 100}%">${y}</span>`).join('') +
    D.events.map(e => `<i class="evtick" style="left:${(e.y - S) / N * 100}%"></i>`).join('');

  const plotX = y => rowsEl.offsetLeft + (y - S + .5) / N * rowsEl.clientWidth;
  function drawRowsState() {
    const { year, sel } = getState();
    const on = new Set(activeHere());
    rowsEl.querySelectorAll('[data-p]').forEach(r => {
      const i = +r.dataset.p;
      r.classList.toggle('on', on.has(i));
      r.classList.toggle('sel', i === sel);
      r.classList.toggle('dim', sel >= 0 && i !== sel);
    });
    $('cursor').style.left = plotX(year) + 'px';
    $('cursorYear').textContent = year;
    $('cursorYear').style.transform = year > E - (E - S) * .1 ? 'translateX(calc(-100% - 8px))' : '';
  }

return { chart, rowsEl, placeNames, drawRowsState };
};
