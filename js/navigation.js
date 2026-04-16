/* ─── NAVIGATION ─── */
const SLIDES = document.querySelectorAll('.slide');
const TOTAL = SLIDES.length;
const SECTIONS = [
  { id: 'intro',    start: 0,  count: 3  },
  { id: 'cs1',      start: 3,  count: 12 },
  { id: 'cs2',      start: 15, count: 9  },
  { id: 'features', start: 24, count: 2  },
  { id: 'close',    start: 26, count: 1  },
];

let current = 0;
let notesVisible = false;

// ─── SCALE ───
function scaleStage() {
  const scaler = document.getElementById('scaler');
  const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
  scaler.style.transform = `scale(${scale})`;
}
scaleStage();
window.addEventListener('resize', scaleStage);

// ─── BUILD DOTS ───
const dotsEl = document.getElementById('dots');
SECTIONS.forEach((sec, si) => {
  if (si > 0) { const sep = document.createElement('div'); sep.className = 'dot-section-sep'; dotsEl.appendChild(sep); }
  for (let i = 0; i < sec.count; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.dataset.idx = sec.start + i;
    dot.addEventListener('click', () => goTo(sec.start + i));
    dotsEl.appendChild(dot);
  }
});

// ─── GO TO SLIDE ───
function goTo(idx, dir) {
  if (idx < 0 || idx >= TOTAL) return;
  const fromSlide = SLIDES[current];
  const toSlide = SLIDES[idx];
  const direction = dir !== undefined ? dir : (idx > current ? 1 : -1);

  fromSlide.classList.remove('active');
  fromSlide.classList.add(direction > 0 ? 'exit-left' : 'enter-right');

  toSlide.classList.remove('exit-left', 'enter-right');
  toSlide.style.transform = `translateX(${direction > 0 ? 60 : -60}px)`;
  toSlide.style.opacity = '0';
  toSlide.style.pointerEvents = 'none';

  toSlide.getBoundingClientRect(); // force reflow

  toSlide.style.transform = '';
  toSlide.style.opacity = '';
  toSlide.style.pointerEvents = '';
  toSlide.classList.add('active');

  setTimeout(() => { fromSlide.classList.remove('exit-left', 'enter-right'); }, 460);

  current = idx;
  updateUI();
}

function next() { if (current < TOTAL - 1) goTo(current + 1, 1); }
function prev() { if (current > 0) goTo(current - 1, -1); }

// ─── UPDATE UI ───
function updateUI() {
  document.getElementById('slide-counter').textContent = `${current + 1} / ${TOTAL}`;
  document.getElementById('btn-prev').classList.toggle('disabled', current === 0);
  document.getElementById('btn-next').classList.toggle('disabled', current === TOTAL - 1);
  const sec = SECTIONS.find(s => current >= s.start && current < s.start + s.count);
  document.querySelectorAll('.nav-tab').forEach(t => { t.classList.toggle('active', t.dataset.section === (sec ? sec.id : '')); });
  document.querySelectorAll('.dot').forEach(d => { d.classList.toggle('active', parseInt(d.dataset.idx) === current); });
}

// ─── NAV CONTROLS ───
document.getElementById('btn-prev').addEventListener('click', prev);
document.getElementById('btn-next').addEventListener('click', next);
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => { const sec = SECTIONS.find(s => s.id === tab.dataset.section); if (sec) goTo(sec.start); });
});
document.querySelectorAll('.nav-card[data-goto]').forEach(card => {
  card.addEventListener('click', () => goTo(parseInt(card.dataset.goto)));
});
document.getElementById('notes-toggle').addEventListener('click', () => {
  notesVisible = !notesVisible;
  document.body.classList.toggle('notes-visible', notesVisible);
  document.getElementById('notes-toggle').classList.toggle('active', notesVisible);
});

// ─── KEYBOARD ───
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End')  goTo(TOTAL - 1);
});

// ─── CLICK-TO-ADVANCE ───
// Track mousedown position so we can distinguish a clean click from a drag.
// If the pointer moved more than DRAG_THRESHOLD px between down and up, it's
// a drag (carousel scroll, BA slider, etc.) — don't advance the slide.
const DRAG_THRESHOLD = 6; // px
let mouseDownX = 0;
let mouseDownY = 0;
let mouseDownOnNoAdvance = false;

// Interactive elements that should never trigger slide advance
const ADVANCE_IGNORE = [
  'a', 'button', 'input', 'select', 'textarea', 'label',
  '[data-no-advance]',          // explicit opt-out (slider, flip cards)
  '.flip-card',                 // flip cards handle their own click
  '.nav-card',                  // contents-page nav cards
  '.aeon-dd', '.aeon-dd-wrap', '.aeon-dd-item',
  '.aeon-pill',
  '.aeon-chk-row',
  '.arch-tab',
  '.sproj-card',
  '.dot',
  '#navbar', '#dots',
].join(', ');

document.getElementById('viewport').addEventListener('mousedown', e => {
  mouseDownX = e.clientX;
  mouseDownY = e.clientY;
  // Check at mousedown whether we're on a no-advance zone so we don't have
  // to re-check at mouseup (target may differ after a drag).
  mouseDownOnNoAdvance = !!e.target.closest(ADVANCE_IGNORE);
});

document.getElementById('viewport').addEventListener('click', e => {
  // Bail if mousedown was on an interactive / no-advance element
  if (mouseDownOnNoAdvance) return;

  // Bail if the click target itself is interactive
  if (e.target.closest(ADVANCE_IGNORE)) return;

  // Bail if the pointer moved — user was dragging (carousel, slider, etc.)
  const dx = Math.abs(e.clientX - mouseDownX);
  const dy = Math.abs(e.clientY - mouseDownY);
  if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) return;

  next();
});

// ─── TOUCH/SWIPE (slide-level) ───
// Only fires on areas that are NOT marked data-no-advance.
// Carousel and BA slider stop propagation on their own touchmove so this
// won't interfere with horizontal scroll inside those elements.
let touchStartX = null;
let touchStartOnNoAdvance = false;

document.getElementById('viewport').addEventListener('touchstart', e => {
  touchStartOnNoAdvance = !!e.target.closest('[data-no-advance]');
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.getElementById('viewport').addEventListener('touchend', e => {
  if (touchStartX === null || touchStartOnNoAdvance) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  touchStartX = null;
  touchStartOnNoAdvance = false;
}, { passive: true });

// ─── INIT ───
updateUI();

// Export for other modules
window.goTo = goTo;
window.next = next;
window.prev = prev;

/* ─── ARCH TAB SWITCHER ─── */
document.querySelectorAll('.arch-tab').forEach(tab => {
  tab.addEventListener('click', function(e) {
    e.stopPropagation();
    const idx = this.dataset.tab;
    const container = this.closest('.arch-tabs');
    container.querySelectorAll('.arch-tab').forEach(t => t.classList.remove('arch-tab--active'));
    container.querySelectorAll('.arch-panel').forEach(p => p.classList.remove('arch-panel--active'));
    this.classList.add('arch-tab--active');
    container.querySelector(`.arch-panel[data-panel="${idx}"]`).classList.add('arch-panel--active');
  });
});
