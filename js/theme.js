// theme.js — Tema & Tahta Modu yönetimi

const THEME_KEY = 'rafx_theme';
const BOARD_KEY = 'rafx_board';

/* ── Tema ── */
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.checked = dark;
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const dark  = saved !== null ? saved === 'dark' : true;
  applyTheme(dark);
}

function onThemeToggle(e) {
  const dark = e.target.checked;
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  applyTheme(dark);
}

/* ── Tahta Modu ── */
function applyBoardMode(on) {
  document.documentElement.dataset.mode = on ? 'board' : '';
  const btn = document.getElementById('board-btn');
  if (btn) btn.classList.toggle('active', on);
}

function initBoardMode() {
  const on = localStorage.getItem(BOARD_KEY) === 'on';
  applyBoardMode(on);
}

function toggleBoardMode() {
  const isOn = document.documentElement.dataset.mode === 'board';
  const next = !isOn;
  localStorage.setItem(BOARD_KEY, next ? 'on' : 'off');
  applyBoardMode(next);

  // Fullscreen sadece oyun sayfasında
  const onGamePage = !!document.getElementById('game-area');
  if (next && onGamePage) {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  } else if (!next) {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

/* ── Başlatma ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBoardMode();

  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('change', onThemeToggle);

  const boardBtn = document.getElementById('board-btn');
  if (boardBtn) boardBtn.addEventListener('click', toggleBoardMode);
});
