/* ─── BEFORE/AFTER SLIDER (slide-05) ─── */
(function() {
  const slider = document.getElementById('ba-slider');
  const before = document.getElementById('ba-before');
  const divider = document.getElementById('ba-divider');
  const hint = document.getElementById('ba-hint');
  if (!slider) return;

  let dragging = false, hintHidden = false;

  // FIX: disable pointer events on all imgs inside the slider so they don't
  // absorb mousedown/touchstart before the slider container gets it.
  // Applied via JS here so it works without touching index.html inline styles.
  slider.querySelectorAll('img').forEach(img => {
    img.style.pointerEvents = 'none';
  });

  // FIX: also disable on the inner layer divs so ba-slider gets every event
  ['ba-after', 'ba-before', 'ba-divider'].forEach(id => {
    const el = document.getElementById(id);
    if (el && id !== 'ba-divider') {
      // ba-after and ba-before should pass pointer events up to the slider
      // ba-divider grip stays interactive for visual feedback only (cursor)
      el.style.pointerEvents = 'none';
    }
  });
  // Re-enable on slider itself so it receives events
  slider.style.pointerEvents = 'auto';

  function setPosition(clientX) {
    const rect = slider.getBoundingClientRect();
    let pct = Math.max(0.04, Math.min(0.96, (clientX - rect.left) / rect.width));
    const pctStr = (pct * 100).toFixed(2) + '%';
    before.style.width = pctStr;
    divider.style.left = pctStr;
  }

  function hideHint() {
    if (!hintHidden) { hint.style.opacity = '0'; hintHidden = true; }
  }

  slider.addEventListener('mousedown', e => { dragging = true; setPosition(e.clientX); hideHint(); e.preventDefault(); });
  document.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });
  document.addEventListener('mouseup', () => { dragging = false; });

  slider.addEventListener('touchstart', e => { dragging = true; setPosition(e.touches[0].clientX); hideHint(); }, { passive: true });
  slider.addEventListener('touchmove', e => { if (dragging) { setPosition(e.touches[0].clientX); e.stopPropagation(); } }, { passive: true });
  slider.addEventListener('touchend', () => { dragging = false; });

  // Reset when slide becomes active
  const slideEl = document.getElementById('slide-05');
  new MutationObserver(() => {
    if (slideEl.classList.contains('active')) {
      before.style.width = '50%';
      divider.style.left = '50%';
      hint.style.opacity = '1';
      hintHidden = false;
    }
  }).observe(slideEl, { attributes: true, attributeFilter: ['class'] });
})();
