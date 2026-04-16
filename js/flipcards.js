/* ═══════════════════════════════════════════
   FLIP CARDS + AEON INTERACTIVE COMPONENTS
═══════════════════════════════════════════ */

// ─── FLIP CARDS ───
// FIX: guard against clicks that originate from interactive elements inside
// the card (inputs, buttons, dropdowns, labels, checkboxes).
// Also guard against clicks on the back face bleeding through.
const INTERACTIVE_SELECTORS = 'input, button, select, textarea, label, .aeon-dd, .aeon-dd-wrap, .aeon-dd-item, .aeon-pill, .aeon-chk-row';

function handleCardClick(e, id) {
  // If the click target is or is inside an interactive element, don't flip
  if (e.target.closest(INTERACTIVE_SELECTORS)) return;
  flipTo(id);
}

function flipTo(id) {
  const c = document.getElementById(id);
  if (c && !c.classList.contains('flipped')) c.classList.add('flipped');
}

function flipBack(id) {
  const c = document.getElementById(id);
  if (c) c.classList.remove('flipped');
}

// Export to global scope for inline onclick handlers
window.handleCardClick = handleCardClick;
window.flipBack = flipBack;

// ─── TEXT FIELDS ───
function sfInput(inp) {
  const f = inp.closest('.s-field');
  f.classList.toggle('is-filled', inp.value.length > 0);
  f.classList.remove('is-err');
}

function sfBlur(inp) {
  inp.closest('.s-field').classList.toggle('is-filled', inp.value.length > 0);
}

function sfClear(btn) {
  const f = btn.closest('.s-field');
  const inp = f.querySelector('.s-field__input');
  inp.value = '';
  f.classList.remove('is-filled', 'is-err');
  clearMsg(f);
  inp.focus();
}

function sfInputPostcode(inp) {
  let v = inp.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  if (v.length > 4) v = v.slice(0,4) + ' ' + v.slice(4);
  inp.value = v.slice(0, 7);
  const f = inp.closest('.s-field');
  f.classList.toggle('is-filled', inp.value.length > 0);
  f.classList.remove('is-err');
  clearMsg(f);
}

function sfInputIban(inp) {
  let raw = inp.value.replace(/\s/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  inp.value = raw.replace(/(.{4})(?=.)/g,'$1 ').slice(0, 22);
  const f = inp.closest('.s-field');
  f.classList.toggle('is-filled', inp.value.length > 0);
  f.classList.remove('is-err');
  clearMsg(f);
}

function sfBlurValidate(inp, type) {
  const f = inp.closest('.s-field');
  const v = inp.value.trim();
  f.classList.toggle('is-filled', v.length > 0);
  if (!v) { clearMsg(f); return; }

  if (type === 'postcode') {
    const ok = /^\d{4}\s?[A-Za-z]{2}$/.test(v);
    if (ok) {
      inp.value = v.replace(/^(\d{4})\s?([A-Za-z]{2})$/, (_, n, l) => `${n} ${l.toUpperCase()}`);
      f.classList.add('is-filled');
      f.classList.remove('is-err');
      showMsg(f, '✓ Geldig', 'ok');
    } else {
      showMsg(f, 'Formaat: 1234 AB', 'err');
      f.classList.add('is-err');
    }
  }

  if (type === 'iban') {
    const raw = v.replace(/\s/g,'').toUpperCase();
    const ibanRx = /^NL\d{2}[A-Z]{4}\d{10}$/;
    if (!ibanRx.test(raw)) {
      showMsg(f, 'NL IBAN: NL91 ABNA 0417 1643 00', 'err');
      f.classList.add('is-err');
    } else if (!modCheck(raw)) {
      showMsg(f, 'Ongeldige controlegetal', 'err');
      f.classList.add('is-err');
    } else {
      inp.value = raw.replace(/(.{4})/g,'$1 ').trim();
      f.classList.add('is-filled');
      f.classList.remove('is-err');
      showMsg(f, '✓ Geldig IBAN', 'ok');
    }
  }
}

function modCheck(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.split('').map(c => {
    const code = c.charCodeAt(0);
    return code >= 65 ? (code - 55).toString() : c;
  }).join('');
  let remainder = 0;
  for (const chunk of numeric.match(/.{1,9}/g)) {
    remainder = parseInt(remainder + chunk, 10) % 97;
  }
  return remainder === 1;
}

function showMsg(f, text, cls) {
  const el = f.querySelector('.s-field__support');
  if (!el) return;
  el.textContent = text;
  el.className = `s-field__support ${cls}`;
}

function clearMsg(f) {
  const el = f.querySelector('.s-field__support');
  if (el) { el.textContent = ''; el.className = 's-field__support'; }
  f.classList.remove('is-err');
}

// Export text field functions to global scope
window.sfInput = sfInput;
window.sfBlur = sfBlur;
window.sfClear = sfClear;
window.sfInputPostcode = sfInputPostcode;
window.sfInputIban = sfInputIban;
window.sfBlurValidate = sfBlurValidate;

/* FIX 4a: Click anywhere on .s-field__box focuses the input inside it.
   Without this, only the bottom 20px (where the <input> lives) is clickable.
   Event delegation so it works for dynamically rendered fields too. */
document.addEventListener('click', e => {
  const box = e.target.closest('.s-field__box');
  if (!box) return;
  // Don't steal focus from the clear button
  if (e.target.closest('.s-field__clear')) return;
  const inp = box.querySelector('.s-field__input');
  if (inp) inp.focus();
});

// ─── DROPDOWN ───
const DD_LABEL = 'Verzekeringsproduct';
const ddOptions = {
  single:     ['Overlijdensrisicoverzekering','Arbeidsongeschiktheid','Hypotheek','Pensioenopbouw','Aanvullende zorgverzekering','Uitvaartverzekering','Woonverzekering','Inkomensbescherming','Zorgverzekering','Aansprakelijkheidsverzekering'],
  multi:      ['Overlijdensrisicoverzekering','Arbeidsongeschiktheid','Hypotheek','Pensioenopbouw','Aanvullende zorgverzekering','Uitvaartverzekering','Woonverzekering','Inkomensbescherming','Zorgverzekering','Aansprakelijkheidsverzekering'],
  filterable: ['Overlijdensrisicoverzekering','Arbeidsongeschiktheid','Hypotheek','Pensioenopbouw','Aanvullende zorgverzekering','Uitvaartverzekering','Woonverzekering','Inkomensbescherming','Zorgverzekering','Aansprakelijkheidsverzekering'],
};
let ddSelect = 'single', ddOpen = false, ddSelected = [];
const chevSvg = c => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="${c}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function renderDD() {
  const c = document.getElementById('aeon-dd-c3'); if (!c) return;
  const isMulti = ddSelect === 'multi', isFilter = ddSelect === 'filterable';
  const opts = ddOptions[ddSelect];
  let tc = 'aeon-dd'; if (ddOpen) tc += ' aeon-dd--open';
  const chevCol = ddOpen ? '#1B75BB' : 'currentColor';
  const selCount = ddSelected.length;
  const labelText = selCount === 0 ? '' : isMulti ? opts.filter((_,i) => ddSelected.includes(i)).join(', ') : opts[ddSelected[0]];
  const countPill = (isMulti && selCount > 2) ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#1a1a1a;color:#fff;font-size:11px;font-weight:500;padding:3px 8px;border-radius:9999px;white-space:nowrap;flex-shrink:0;">${selCount} <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>` : '';

  let html = '<div class="aeon-dd-wrap" id="aeon-dd-root" style="width:100%;">';
  if (isFilter && ddOpen) {
    html += `<div class="${tc}" style="cursor:text;"><div class="aeon-dd--open" style="display:contents;"><div class="aeon-dd__inner" style="display:flex;flex-direction:column;gap:1px;flex:1;height:100%;justify-content:center;"><span class="aeon-dd__float">${DD_LABEL}</span><input id="dd-filter-inp" class="aeon-dd__val" style="border:none;outline:none;background:transparent;padding:0;font-family:var(--sans);font-size:13px;" placeholder="Zoeken…" oninput="filterDD(this.value)"></div></div><span class="aeon-dd__chev" style="align-self:center;">${chevSvg(chevCol)}</span></div>`;
  } else if (ddOpen && labelText && isMulti && selCount > 2) {
    html += `<div class="${tc}" onclick="toggleDD()" tabindex="0"><div class="aeon-dd__inner"><span class="aeon-dd__float">${DD_LABEL}</span><div style="display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden;"><span class="aeon-dd__val" style="flex:1;min-width:0;">${labelText}</span>${countPill}</div></div><span class="aeon-dd__chev" style="align-self:center;flex-shrink:0;">${chevSvg(chevCol)}</span></div>`;
  } else if (ddOpen && labelText) {
    html += `<div class="${tc}" onclick="toggleDD()" tabindex="0"><div class="aeon-dd__inner"><span class="aeon-dd__float">${DD_LABEL}</span><span class="aeon-dd__val">${labelText}</span></div><span class="aeon-dd__chev" style="align-self:center;">${chevSvg(chevCol)}</span></div>`;
  } else if (ddOpen) {
    html += `<div class="${tc}" onclick="toggleDD()" tabindex="0"><div class="aeon-dd__inner"><span class="aeon-dd__float">${DD_LABEL}</span><span class="aeon-dd__val" style="color:#a0a0a0;">Selecteer een product</span></div><span class="aeon-dd__chev" style="align-self:center;">${chevSvg(chevCol)}</span></div>`;
  } else if (isMulti && selCount > 2 && labelText) {
    html += `<div class="${tc}" onclick="toggleDD()" tabindex="0"><div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;overflow:hidden;"><span class="aeon-dd__lbl" style="flex:1;min-width:0;">${labelText}</span>${countPill}</div><span class="aeon-dd__chev" style="flex-shrink:0;">${chevSvg(chevCol)}</span></div>`;
  } else {
    html += `<div class="${tc}" onclick="toggleDD()" tabindex="0"><span class="aeon-dd__lbl ${labelText?'':'aeon-dd__lbl--ph'}">${labelText||DD_LABEL}</span><span class="aeon-dd__chev">${chevSvg(chevCol)}</span></div>`;
  }

  if (ddOpen) {
    html += `<div class="aeon-dd-menu" id="dd-live-menu">`;
    opts.forEach((opt, i) => {
      const active = ddSelected.includes(i);
      if (isMulti) {
        html += `<div class="aeon-dd-item" onclick="toggleDDItem(${i})"><span class="aeon-dd-chk${active?' aeon-dd-chk--on':''}">${active?'<svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</span>${opt}</div>`;
      } else {
        html += `<div class="aeon-dd-item${active?' aeon-dd-item--sel':''}" onclick="selectDDItem(${i})">${opt}</div>`;
      }
    });
    html += '</div>';
  }

  html += '</div>';
  c.innerHTML = html;
  if (isFilter && ddOpen) setTimeout(() => { const el = document.getElementById('dd-filter-inp'); if (el) el.focus(); }, 10);
}

function toggleDD()      { ddOpen = !ddOpen; renderDD(); }
function selectDDItem(i) { ddSelected = [i]; ddOpen = false; renderDD(); }
function toggleDDItem(i) { ddSelected = ddSelected.includes(i) ? ddSelected.filter(x=>x!==i) : [...ddSelected, i]; renderDD(); }
function filterDD(val)   { document.querySelectorAll('#dd-live-menu .aeon-dd-item').forEach((el,i) => { el.style.display = ddOptions[ddSelect][i].toLowerCase().includes(val.toLowerCase()) ? '' : 'none'; }); }

// Export dropdown functions to global scope
window.toggleDD = toggleDD;
window.selectDDItem = selectDDItem;
window.toggleDDItem = toggleDDItem;
window.filterDD = filterDD;
window.renderDD = renderDD;

// ─── PILL GROUP INIT ───
function initPillGroup(groupId, cb) {
  const g = document.getElementById(groupId); if (!g) return;
  g.querySelectorAll('.aeon-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      g.querySelectorAll('.aeon-pill').forEach(b => b.classList.remove('aeon-pill--on'));
      btn.classList.add('aeon-pill--on');
      cb(btn.dataset.val);
    });
  });
}

initPillGroup('dd-select-ctrl', val => { ddSelect = val; ddSelected = []; ddOpen = false; renderDD(); });
initPillGroup('pill-c4', () => {});

// FIX: close dropdown on outside click — guard against firing on card elements
document.addEventListener('click', e => {
  if (ddOpen && !e.target.closest('#aeon-dd-root') && !e.target.closest('#aeon-dd-c3')) {
    ddOpen = false;
    renderDD();
  }
});

// ─── CHECKBOX + RADIO ───
function syncChk(input) {
  const box = input.nextElementSibling; if (!box) return;
  if (input.checked) { box.style.background = 'var(--aeon-blue)'; box.style.borderColor = 'var(--aeon-blue)'; }
  else { box.style.background = ''; box.style.borderColor = ''; }
}

function selectRadio(name, selectedId) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(inp => {
    const rb = document.getElementById('rb-' + inp.id); if (!rb) return;
    const dot = rb.querySelector('.radio-dot');
    if (inp.id === selectedId) {
      inp.checked = true;
      rb.style.borderColor = 'var(--aeon-blue)';
      if (dot) dot.style.display = 'block';
    } else {
      inp.checked = false;
      rb.style.borderColor = '#C8C8C8';
      if (dot) dot.style.display = 'none';
    }
  });
}

// Export to global scope
window.syncChk = syncChk;
window.selectRadio = selectRadio;

// ─── INIT ───
document.querySelectorAll('.aeon-chk-row input[type=checkbox]').forEach(syncChk);
selectRadio('freq', 'freq-m');
renderDD();
