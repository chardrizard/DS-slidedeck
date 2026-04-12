/* ─── BEFORE/AFTER SLIDER (slide-05) ─── */
(function() {
  const slider = document.getElementById('ba-slider');
  const before = document.getElementById('ba-before');
  const divider = document.getElementById('ba-divider');
  const hint = document.getElementById('ba-hint');
  if (!slider) return;

  let dragging = false, hintHidden = false;

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
