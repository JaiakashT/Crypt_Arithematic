/* ═══════════════════════════════════════════════════════
   script.js — Cryptarithm Solver
   Backtracking algorithm + UI interactions + localStorage
   + 3D scroll animations + addition display
   ═══════════════════════════════════════════════════════ */

// ──────────── Navigation ────────────
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => {
    if (p.classList.contains('active')) {
      p.classList.add('page-exit');
      setTimeout(() => p.classList.remove('page-exit'), 500);
    }
    p.classList.remove('active');
  });
  const target = document.getElementById('page-' + pageName);
  if (target) {
    target.classList.remove('active');
    void target.offsetWidth;
    target.classList.add('active');
    // Re-observe scroll-3d elements in the new page
    setTimeout(() => initScrollObserver(), 100);
  }

  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageName);
  });

  document.getElementById('navLinks').classList.remove('show');
  document.getElementById('hamburger').classList.remove('open');
}

function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('show');
  document.getElementById('hamburger').classList.toggle('open');
}

// ──────────── Theme Toggle ────────────
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('toggleIcon').textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('cryptTheme', next);
}
(function restoreTheme() {
  const saved = localStorage.getItem('cryptTheme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('toggleIcon').textContent = saved === 'dark' ? '☀️' : '🌙';
  }
})();

// ──────────── Learn Page Accordion ────────────
function toggleAccordion(btn) {
  const item = btn.parentElement;
  item.classList.toggle('open');
}

// ──────────── Random Puzzle Generator (40+ verified puzzles) ────────────
const RANDOM_PUZZLES = [
  // Classic
  "SEND + MORE = MONEY",
  "TWO + TWO = FOUR",
  "BASE + BALL = GAMES",
  "EAT + THAT = APPLE",
  "MAC + MAC = APPLE",
  "TO + GO = OUT",
  "NO + GUN = HUNT",
  "SIX + SIX + SIX = NINE + NINE",
  "CROSS + ROADS = DANGER",
  // Short & easy
  "AB + BA = CBC",
  "AB + CD = EFG",
  "ABC + DEF = GHI",
  "HE + SHE = HIS",
  "I + ME = MOM",
  "ME + ME = BEE",
  "HI + HI = BYE",
  "UP + UP = TOP",
  "GO + TO = OUT",
  "DO + IT = NOW",
  "IF + IT = SO",
  "IS + IT = OK",
  "ON + TO = OFF",
  // Medium
  "COME + HOME = SOON",
  "SAVE + MORE = MONEY",
  "TAKE + CAKE = BAKE",
  "EAST + WEST = EARTH",
  "RAIN + RAIN = STORM",
  "READ + BOOK = LEARN",
  "STAR + MOON = NIGHT",
  "SEE + THE = SHOW",
  "HERE + SHE = COMES",
  "WIN + LOSE = GAME",
  "BIG + FAT = CAT",
  "ONE + ONE = TWO",
  "TEN + TEN = FORTY",
  "RED + RED = BLUE",
  "HOT + TEA = WARM",
  "DOG + CAT = PETS",
  "PLAY + BALL = SPORT",
  "COCA + COLA = DRINK",
  "SOME + WORD = MAGIC",
  "FOUR + FIVE = NINE",
  "MARS + MOON = SPACE"
];

function generateRandom() {
  const input = document.getElementById('puzzleInput');
  input.value = RANDOM_PUZZLES[Math.floor(Math.random() * RANDOM_PUZZLES.length)];
  resetResults();
}

function resetSolver() {
  document.getElementById('puzzleInput').value = '';
  resetResults();
}

function resetResults() {
  document.getElementById('resultsArea').classList.add('hidden');
  document.getElementById('errorBox').classList.add('hidden');
  document.getElementById('loader').classList.add('hidden');
  document.getElementById('additionDisplay').innerHTML = '';
}

// ──────────── Copy Solution ────────────
let lastSolution = null;

function copySolution() {
  if (!lastSolution) return;
  const text = Object.entries(lastSolution)
    .map(([k, v]) => k + ' = ' + v)
    .join(', ');
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✅ Copied';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 1800);
  });
}

// ──────────── Recent Puzzles (localStorage) ────────────
function getRecent() {
  try { return JSON.parse(localStorage.getItem('cryptRecent')) || []; }
  catch { return []; }
}
function saveRecent(puzzle) {
  let list = getRecent().filter(p => p !== puzzle);
  list.unshift(puzzle);
  if (list.length > 8) list = list.slice(0, 8);
  localStorage.setItem('cryptRecent', JSON.stringify(list));
}
function renderRecent() {
  const ul = document.getElementById('recentList');
  ul.innerHTML = '';
  getRecent().forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    li.onclick = () => { document.getElementById('puzzleInput').value = p; };
    ul.appendChild(li);
  });
}

// ──────────── Solver (Backtracking) ────────────

/**
 * Parse and validate the puzzle string.
 * Accepts format: WORD + WORD [+ WORD ...] = WORD
 * Returns { leftWords:[], rightWord:'' } or throws error string.
 */
function parsePuzzle(raw) {
  // Normalize: uppercase, trim, collapse whitespace
  const cleaned = raw.toUpperCase().replace(/[^A-Z+=]/g, '');
  const parts = cleaned.split('=');
  if (parts.length !== 2) throw "Equation must contain exactly one '='";
  const left = parts[0].split('+').map(w => w.trim()).filter(Boolean);
  const right = parts[1].trim();
  if (left.length < 1) throw "Left side must have at least one word.";
  if (!right) throw "Right side is missing.";
  for (const w of [...left, right]) {
    if (!/^[A-Z]+$/.test(w)) throw "Only uppercase letters (A-Z) are allowed.";
  }
  return { leftWords: left, rightWord: right };
}

/**
 * Solve the cryptarithmetic puzzle using DFS backtracking.
 * Returns { solutions:[], attempts, timeMs }.
 */
function solveCryptarithmetic(leftWords, rightWord) {
  const allWords = [...leftWords, rightWord];

  const uniqueSet = new Set();
  const firstLetters = new Set();
  for (const w of allWords) {
    for (const c of w) uniqueSet.add(c);
    if (w.length > 1) firstLetters.add(w[0]);
  }
  const chars = Array.from(uniqueSet);

  if (chars.length > 10) throw "Too many unique letters (max 10).";

  const weights = {};
  for (const c of chars) weights[c] = 0;
  for (const w of leftWords) {
    let p = 1;
    for (let i = w.length - 1; i >= 0; i--) { weights[w[i]] += p; p *= 10; }
  }
  {
    let p = 1;
    for (let i = rightWord.length - 1; i >= 0; i--) { weights[rightWord[i]] -= p; p *= 10; }
  }

  chars.sort((a, b) => {
    if (firstLetters.has(a) && !firstLetters.has(b)) return -1;
    if (!firstLetters.has(a) && firstLetters.has(b)) return 1;
    return 0;
  });

  const weightsArr = chars.map(c => weights[c]);
  const solutions = [];
  let attempts = 0;
  const assigned = {};
  const usedDigits = new Array(10).fill(false);

  function search(idx, sum) {
    attempts++;
    if (idx === chars.length) {
      if (sum === 0) solutions.push({ ...assigned });
      return;
    }
    const ch = chars[idx];
    const w = weightsArr[idx];
    const startDigit = firstLetters.has(ch) ? 1 : 0;

    for (let d = startDigit; d <= 9; d++) {
      if (!usedDigits[d]) {
        assigned[ch] = d;
        usedDigits[d] = true;
        search(idx + 1, sum + w * d);
        usedDigits[d] = false;
        delete assigned[ch];
      }
    }
  }

  const t0 = performance.now();
  search(0, 0);
  const t1 = performance.now();

  return {
    solutions,
    attempts,
    timeMs: (t1 - t0).toFixed(2)
  };
}

// ──────────── Build Addition Display ────────────
function buildAdditionDisplay(leftWords, rightWord, solution) {
  // Convert a word to its number using the solution mapping
  function wordToNumber(word) {
    return word.split('').map(c => solution[c]).join('');
  }

  const leftNums = leftWords.map(w => ({ word: w, num: wordToNumber(w) }));
  const rightNum = { word: rightWord, num: wordToNumber(rightWord) };

  // Find max width for alignment
  const allNums = [...leftNums.map(n => n.num), rightNum.num];
  const maxLen = Math.max(...allNums.map(n => n.length));

  let html = '<div class="addition-content">';

  leftNums.forEach((item, i) => {
    const prefix = i === leftNums.length - 1 ? '+' : ' ';
    const padWord = item.word.padStart(maxLen + 1);
    const padNum = item.num.padStart(maxLen + 1);
    html += `<div class="add-row">
      <span class="add-prefix">${prefix}</span>
      <span class="add-word">${padWord}</span>
      <span class="add-equals">=</span>
      <span class="add-num">${padNum}</span>
    </div>`;
  });

  html += `<div class="add-separator"></div>`;

  const padWordR = rightWord.padStart(maxLen + 1);
  const padNumR = rightNum.num.padStart(maxLen + 1);
  html += `<div class="add-row add-result">
    <span class="add-prefix"> </span>
    <span class="add-word">${padWordR}</span>
    <span class="add-equals">=</span>
    <span class="add-num">${padNumR}</span>
  </div>`;
  html += '</div>';

  return html;
}

// ──────────── Handle Solve Click ────────────
async function handleSolve(e) {
  e.preventDefault();
  const raw = document.getElementById('puzzleInput').value.trim();
  if (!raw) return;

  resetResults();
  const stepMode = document.getElementById('stepToggle').checked;

  document.getElementById('loader').classList.remove('hidden');

  await new Promise(r => setTimeout(r, stepMode ? 800 : 120));

  try {
    const { leftWords, rightWord } = parsePuzzle(raw);
    const result = solveCryptarithmetic(leftWords, rightWord);

    document.getElementById('loader').classList.add('hidden');

    if (result.solutions.length === 0) {
      showError("No valid solution found for this puzzle.");
      return;
    }

    lastSolution = result.solutions[0];
    saveRecent(raw.toUpperCase().replace(/\s+/g, ' '));

    document.getElementById('statCount').textContent = result.solutions.length;
    document.getElementById('statTime').textContent = result.timeMs + ' ms';
    document.getElementById('statAttempts').textContent = Number(result.attempts).toLocaleString();

    const grid = document.getElementById('mappingGrid');
    grid.innerHTML = '';
    const sol = result.solutions[0];
    Object.entries(sol).forEach(([letter, digit], idx) => {
      const cell = document.createElement('div');
      cell.className = 'map-cell';
      cell.style.animationDelay = idx * 0.05 + 's';
      cell.innerHTML = '<span class="letter">' + letter + '</span><span class="digit">' + digit + '</span>';
      grid.appendChild(cell);
    });

    // Build and show the addition display
    const addDisplay = document.getElementById('additionDisplay');
    addDisplay.innerHTML = buildAdditionDisplay(leftWords, rightWord, sol);

    document.getElementById('resultsArea').classList.remove('hidden');
    renderRecent();

    playSuccessSound();

  } catch (err) {
    document.getElementById('loader').classList.add('hidden');
    showError(typeof err === 'string' ? err : err.message);
  }
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.textContent = msg;
  box.classList.remove('hidden');
}

// ──────────── Success Sound (Web Audio) ────────────
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587, ctx.currentTime);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) { /* audio not available */ }
}

// ──────────── 3D Scroll Animations (IntersectionObserver) ────────────
function initScrollObserver() {
  const els = document.querySelectorAll('.scroll-3d');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger the animation based on element index within viewport
        const siblings = Array.from(entry.target.parentElement?.children || []);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.08) + 's';
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  els.forEach(el => {
    el.classList.remove('in-view');
    observer.observe(el);
  });
}

// ──────────── Mouse Tilt on Feature Cards ────────────
function initTiltEffect() {
  document.querySelectorAll('.feature-card, .about-card, .solver-panel').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// ──────────── Parallax Blobs on Mouse Move ────────────
function initBlobParallax() {
  const blobs = document.querySelectorAll('.blob');
  document.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    blobs.forEach((blob, i) => {
      const depth = (i + 1) * 15;
      blob.style.transform = `translate(${mx * depth}px, ${my * depth}px) scale(${1 + i * 0.06})`;
    });
  });
}

// ──────────── Init ────────────
renderRecent();
document.addEventListener('DOMContentLoaded', () => {
  initScrollObserver();
  initTiltEffect();
  initBlobParallax();
});
