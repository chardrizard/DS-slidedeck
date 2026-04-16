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
const DRAG_THRESHOLD = 6;
let mouseDownX = 0;
let mouseDownY = 0;
let mouseDownOnNoAdvance = false;

const ADVANCE_IGNORE = [
  'a', 'button', 'input', 'select', 'textarea', 'label',
  '[data-no-advance]',
  '.flip-card',
  '.nav-card',
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
  mouseDownOnNoAdvance = !!e.target.closest(ADVANCE_IGNORE);
});

document.getElementById('viewport').addEventListener('click', e => {
  if (mouseDownOnNoAdvance) return;
  if (e.target.closest(ADVANCE_IGNORE)) return;
  const dx = Math.abs(e.clientX - mouseDownX);
  const dy = Math.abs(e.clientY - mouseDownY);
  if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) return;
  next();
});

// ─── TOUCH/SWIPE ───
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

// ─── CAROUSEL DRAG SCROLL (slide 02) ───
// Native overflow-x scroll doesn't work reliably inside a CSS scale() transform.
// JS drag handler manually sets scrollLeft instead.
(function () {
  function initCarousel() {
    const carousel = document.querySelector('#slide-02 [data-no-advance]');
    if (!carousel) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    carousel.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.clientX;
      scrollStart = carousel.scrollLeft;
      carousel.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDown) return;
      carousel.scrollLeft = scrollStart - (e.clientX - startX);
    });

    document.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      carousel.style.cursor = 'grab';
    });

    carousel.style.cursor = 'grab';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }
})();

// ─── INIT ───
updateUI();

window.goTo = goTo;
window.next = next;
window.prev = prev;

/* ─── ARCH TAB SWITCHER ─── */
document.querySelectorAll('.arch-tab').forEach(tab => {
  tab.addEventListener('click', function(e) {
    e.stopPropagation();
    var idx = this.dataset.archTab;
    var container = this.closest('.arch-tabs');
    container.querySelectorAll('.arch-tab').forEach(t => t.classList.remove('arch-tab--active'));
    container.querySelectorAll('.arch-panel').forEach(p => p.classList.remove('arch-panel--active'));
    this.classList.add('arch-tab--active');
    container.querySelector('.arch-panel[data-arch-panel="' + idx + '"]').classList.add('arch-panel--active');
  });
});
