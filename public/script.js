"use strict";
const state = { idx: 0, delay: 3000 };
const els = {
    box: document.getElementById('lyrics-box'),
    counter: document.getElementById('counter'),
    seek: document.getElementById('seek'),
    prev: document.getElementById('prevBtn'),
    next: document.getElementById('nextBtn'),
    playPause: document.getElementById('playPauseBtn'),
    delayRange: document.getElementById('delayRange'),
    delayLabel: document.getElementById('delayLabel'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    content: document.getElementById('content'),
    themeToggle: document.getElementById('themeToggle'),
    uploadBtn: document.getElementById('uploadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    fileInput: document.getElementById('fileInput'),
    currentSource: document.getElementById('currentSource')
};
let lyrics = [];
let timer = null;
const STORAGE_KEY = 'lyricsTrainerState';
const THEME_KEY = 'lyricsTrainerTheme';
const CUSTOM_LYRICS_KEY = 'customLyrics';
const LYRICS_SOURCE_KEY = 'lyricsSource';
// Touch tracking for swipe gestures
let touchStartX = 0;
let touchEndX = 0;
const MIN_SWIPE_DISTANCE = 50;
/* ---------- load / persist ---------- */
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            return { idx: 0, delay: 3000 };
        }
        return JSON.parse(saved);
    }
    catch {
        return { idx: 0, delay: 3000 };
    }
}
function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
/* ---------- theme management ---------- */
function loadTheme() {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        els.themeToggle.textContent = '☀️';
    }
    else if (theme === 'light') {
        document.body.classList.add('light-theme');
        els.themeToggle.textContent = '🌙';
    }
    else {
        // Auto theme - check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            els.themeToggle.textContent = '☀️';
        }
        else {
            els.themeToggle.textContent = '🌙';
        }
    }
}
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme') ||
        (!body.classList.contains('light-theme') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        els.themeToggle.textContent = '🌙';
        localStorage.setItem(THEME_KEY, 'light');
    }
    else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        els.themeToggle.textContent = '☀️';
        localStorage.setItem(THEME_KEY, 'dark');
    }
}
/* ---------- file handling ---------- */
async function loadDefaultLyrics() {
    const res = await fetch(`lyrics.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`Failed to load lyrics (${res.status})`);
    }
    lyrics = await res.json();
}
async function processLyricsFile(file) {
    const text = await file.text();
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}
function handleFileUpload(event) {
    var _a;
    const input = event.target;
    const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file) {
        console.log('File selected:', file.name);
        els.loading.hidden = false;
        els.loading.textContent = 'Processing lyrics file...';
        processLyricsFile(file)
            .then(lines => {
            console.log('Processed lines:', lines.length);
            if (lines.length === 0) {
                throw new Error('No lyrics found in file');
            }
            lyrics = lines;
            state.idx = 0;
            // Save to localStorage
            localStorage.setItem(CUSTOM_LYRICS_KEY, JSON.stringify(lines));
            localStorage.setItem(LYRICS_SOURCE_KEY, 'custom');
            // Update UI
            els.currentSource.textContent = `Custom: ${file.name}`;
            els.resetBtn.hidden = false;
            els.loading.hidden = true;
            els.content.hidden = false;
            console.log('About to render, current lyrics:', lyrics[0]);
            render();
        })
            .catch(error => {
            els.loading.hidden = true;
            els.error.hidden = false;
            els.error.textContent = error instanceof Error
                ? `Error: ${error.message}`
                : 'Failed to process lyrics file';
            console.error('Failed to process file:', error);
        });
    }
}
async function resetToDefaultLyrics() {
    localStorage.removeItem(CUSTOM_LYRICS_KEY);
    localStorage.removeItem(LYRICS_SOURCE_KEY);
    try {
        // Load default lyrics
        await loadDefaultLyrics();
        // Reset UI
        els.currentSource.textContent = 'Default Lyrics';
        els.resetBtn.hidden = true;
        state.idx = 0;
        render();
    }
    catch (error) {
        // If direct loading fails, force reload
        location.reload();
    }
}
/* ---------- bootstrap ---------- */
// Initialize theme before anything else
loadTheme();
// Append a cache‑buster query string to avoid 304/empty-body responses
(async function init() {
    try {
        // Check for custom lyrics first
        const lyricsSource = localStorage.getItem(LYRICS_SOURCE_KEY);
        if (lyricsSource === 'custom') {
            const customLyrics = localStorage.getItem(CUSTOM_LYRICS_KEY);
            if (customLyrics) {
                lyrics = JSON.parse(customLyrics);
                els.currentSource.textContent = 'Custom Lyrics';
                els.resetBtn.hidden = false;
            }
            else {
                // Fallback to default if custom lyrics are missing
                await loadDefaultLyrics();
            }
        }
        else {
            await loadDefaultLyrics();
        }
        if (!Array.isArray(lyrics) || lyrics.length === 0) {
            throw new Error('Invalid lyrics format');
        }
        const st = loadState();
        state.idx = Math.min(st.idx, lyrics.length - 1);
        state.delay = st.delay;
        // Hide loading, show content
        els.loading.hidden = true;
        els.content.hidden = false;
        setupUI();
        render();
    }
    catch (error) {
        els.loading.hidden = true;
        els.error.hidden = false;
        // Check if offline
        if (!navigator.onLine) {
            els.error.textContent = 'No internet connection. Please check your connection and refresh.';
        }
        else {
            els.error.textContent = error instanceof Error
                ? `Error: ${error.message}`
                : 'Failed to load lyrics. Please refresh the page.';
        }
        console.error('Failed to load lyrics:', error);
    }
})();
/* ---------- helpers ---------- */
function render() {
    els.box.textContent = lyrics[state.idx];
    els.counter.textContent = `Line ${state.idx + 1} / ${lyrics.length}`;
    els.prev.disabled = state.idx === 0;
    els.next.textContent = (state.idx === lyrics.length - 1) ? 'Restart' : 'Next';
    els.seek.max = String(lyrics.length - 1);
    els.seek.value = String(state.idx);
    els.seek.setAttribute('aria-valuemax', String(lyrics.length));
    els.seek.setAttribute('aria-valuenow', String(state.idx + 1));
    els.delayRange.value = String(state.delay / 1000);
    els.delayLabel.textContent = String(state.delay / 1000);
    saveState(state);
}
function advance() {
    state.idx = (state.idx === lyrics.length - 1) ? 0 : state.idx + 1;
    render();
}
function startTimer() {
    timer = window.setInterval(advance, state.delay);
    els.playPause.textContent = 'Pause ⏸';
    els.playPause.setAttribute('aria-pressed', 'true');
}
function stopTimer() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }
    els.playPause.textContent = 'Play ▶️';
    els.playPause.setAttribute('aria-pressed', 'false');
}
function toggleTimer() { timer ? stopTimer() : startTimer(); }
/* ---------- event wiring ---------- */
function setupUI() {
    els.themeToggle.onclick = toggleTheme;
    els.uploadBtn.onclick = () => els.fileInput.click();
    els.fileInput.onchange = handleFileUpload;
    els.resetBtn.onclick = resetToDefaultLyrics;
    els.prev.onclick = () => { if (state.idx > 0) {
        state.idx--;
        render();
    } };
    els.next.onclick = advance;
    els.seek.oninput = e => { state.idx = Number(e.target.value); render(); };
    els.playPause.onclick = toggleTimer;
    els.delayRange.oninput = e => {
        state.delay = Number(e.target.value) * 1000;
        els.delayLabel.textContent = String(state.delay / 1000);
        if (timer) {
            stopTimer();
            startTimer();
        }
    };
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' && !els.prev.disabled)
            els.prev.click();
        else if (e.key === 'ArrowRight')
            els.next.click();
        else if (e.key === ' ') {
            e.preventDefault();
            toggleTimer();
        }
        else if (e.key === 'Home') {
            state.idx = 0;
            render();
        }
        else if (e.key === 'End') {
            state.idx = lyrics.length - 1;
            render();
        }
    });
}
/* ---------- clean up ---------- */
/* ---------- touch gestures ---------- */
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}
function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}
function handleSwipe() {
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) < MIN_SWIPE_DISTANCE)
        return;
    if (distance > 0 && state.idx > 0) {
        // Swipe right - previous
        state.idx--;
        render();
    }
    else if (distance < 0) {
        // Swipe left - next
        advance();
    }
}
// Setup touch listeners
els.box.addEventListener('touchstart', handleTouchStart);
els.box.addEventListener('touchend', handleTouchEnd);
/* ---------- clean up ---------- */
window.addEventListener('beforeunload', () => { stopTimer(); saveState(state); });
