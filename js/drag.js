// drag.js — Sürükle-bırak sistemi

let _dragState = null;
let _ghostEl   = null;

function getDragState()   { return _dragState; }
function clearDragState() { _dragState = null; }

/* ── Mouse ── */
function onMouseDown(e) {
  e.preventDefault();
  const chip = e.currentTarget;
  startDrag(chip, e.clientX, e.clientY);

  const onMove = ev => moveGhost(ev.clientX, ev.clientY);
  const onUp   = ev => { endDrag(ev.clientX, ev.clientY); cleanup(); };
  const onBlur = ()  => { killGhost(); _dragState = null; render(true); cleanup(); };
  const cleanup = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup',   onUp);
    window.removeEventListener('blur',      onBlur);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup',   onUp);
  window.addEventListener('blur',      onBlur);
}

/* ── Touch ── */
function onTouchStart(e) {
  e.preventDefault();
  const chip = e.currentTarget;
  const t = e.touches[0];
  startDrag(chip, t.clientX, t.clientY);

  const onMove = ev => {
    ev.preventDefault();
    const t = ev.touches[0];
    moveGhost(t.clientX, t.clientY);
    document.querySelectorAll('.shelf:not(.locked)').forEach(s => s.classList.remove('drag-over'));
    const hit = document.elementFromPoint(t.clientX, t.clientY)?.closest?.('.shelf:not(.locked)');
    if (hit) hit.classList.add('drag-over');
  };
  const onEnd = ev => {
    const t = ev.changedTouches[0];
    endDrag(t.clientX, t.clientY);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend',  onEnd);
  };
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend',  onEnd);
}

/* ── Core ── */
function startDrag(chip, x, y) {
  sndPickup();
  _dragState = {
    fromShelf: parseInt(chip.dataset.shelfId),
    numIdx:    parseInt(chip.dataset.numIdx),
    val:       parseInt(chip.textContent),
  };
  chip.classList.add('dragging');

  _ghostEl = document.createElement('div');
  _ghostEl.className = 'num-chip ghost';
  _ghostEl.textContent = _dragState.val;
  document.body.appendChild(_ghostEl);
  moveGhost(x, y);
}

function moveGhost(x, y) {
  if (!_ghostEl) return;
  _ghostEl.style.left = (x - 22) + 'px';
  _ghostEl.style.top  = (y - 16) + 'px';
}

function killGhost() {
  if (_ghostEl) { _ghostEl.remove(); _ghostEl = null; }
  document.querySelectorAll('.shelf').forEach(s => s.classList.remove('drag-over'));
  document.querySelectorAll('.num-chip.dragging').forEach(c => c.classList.remove('dragging'));
}

function endDrag(x, y) {
  killGhost();
  const els    = document.elementsFromPoint(x, y);
  const target = els.map(el => el.closest?.('.shelf')).find(Boolean) || null;

  if (target && _dragState && !target.classList.contains('locked')) {
    dropOnShelf(parseInt(target.dataset.shelfId));
  } else {
    _dragState = null;
    render(true);
  }
}
