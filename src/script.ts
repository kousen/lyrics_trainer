interface TrainerState {
    idx:   number;
    delay: number;   // milliseconds
}

const state: TrainerState = { idx:0, delay:3000 };

const els = {
    box:        document.getElementById('lyrics-box')  as HTMLDivElement,
    counter:    document.getElementById('counter')     as HTMLDivElement,
    seek:       document.getElementById('seek')        as HTMLInputElement,
    prev:       document.getElementById('prevBtn')     as HTMLButtonElement,
    next:       document.getElementById('nextBtn')     as HTMLButtonElement,
    playPause:  document.getElementById('playPauseBtn')as HTMLButtonElement,
    delayRange: document.getElementById('delayRange')  as HTMLInputElement,
    delayLabel: document.getElementById('delayLabel')  as HTMLSpanElement,
    loading:    document.getElementById('loading')     as HTMLDivElement,
    error:      document.getElementById('error')       as HTMLDivElement,
    content:    document.getElementById('content')     as HTMLDivElement
};

let lyrics: string[] = [];
let timer: number | null = null;
const STORAGE_KEY = 'lyricsTrainerState';

// Touch tracking for swipe gestures
let touchStartX = 0;
let touchEndX = 0;
const MIN_SWIPE_DISTANCE = 50;

/* ---------- load / persist ---------- */
function loadState(): TrainerState {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)!) }
    catch { return { idx:0, delay:3000 } }
}
function saveState(s: TrainerState){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

/* ---------- bootstrap ---------- */
// Append a cache‑buster query string to avoid 304/empty-body responses
(async function init(){
    try {
        const res = await fetch(`lyrics.json?v=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to load lyrics (${res.status})`);
        }
        lyrics = await res.json();
        
        if (!Array.isArray(lyrics) || lyrics.length === 0) {
            throw new Error('Invalid lyrics format');
        }
        
        const st = loadState();
        state.idx   = Math.min(st.idx, lyrics.length-1);
        state.delay = st.delay;
        
        // Hide loading, show content
        els.loading.hidden = true;
        els.content.hidden = false;
        
        setupUI();
        render();
    } catch (error) {
        els.loading.hidden = true;
        els.error.hidden = false;
        
        // Check if offline
        if (!navigator.onLine) {
            els.error.textContent = 'No internet connection. Please check your connection and refresh.';
        } else {
            els.error.textContent = error instanceof Error 
                ? `Error: ${error.message}` 
                : 'Failed to load lyrics. Please refresh the page.';
        }
        console.error('Failed to load lyrics:', error);
    }
})();

/* ---------- helpers ---------- */
function render(){
    els.box.textContent = lyrics[state.idx];
    els.counter.textContent = `Line ${state.idx+1} / ${lyrics.length}`;
    els.prev.disabled = state.idx === 0;
    els.next.textContent = (state.idx === lyrics.length-1) ? 'Restart' : 'Next';
    els.seek.max = String(lyrics.length-1);
    els.seek.value = String(state.idx);
    els.seek.setAttribute('aria-valuemax', String(lyrics.length));
    els.seek.setAttribute('aria-valuenow', String(state.idx+1));
    els.delayRange.value = String(state.delay/1000);
    els.delayLabel.textContent = String(state.delay/1000);
    saveState(state);
}
function advance(){
    state.idx = (state.idx === lyrics.length-1) ? 0 : state.idx+1;
    render();
}
function startTimer(){
    timer = window.setInterval(advance, state.delay);
    els.playPause.textContent = 'Pause ⏸';
    els.playPause.setAttribute('aria-pressed','true');
}
function stopTimer(){
    if(timer!==null){ clearInterval(timer); timer=null; }
    els.playPause.textContent = 'Play ▶️';
    els.playPause.setAttribute('aria-pressed','false');
}
function toggleTimer(){ timer ? stopTimer() : startTimer(); }

/* ---------- event wiring ---------- */
function setupUI(){
    els.prev.onclick = () => { if(state.idx>0){ state.idx--; render(); } };
    els.next.onclick = advance;
    els.seek.oninput = e => { state.idx = Number((e.target as HTMLInputElement).value); render(); };
    els.playPause.onclick = toggleTimer;
    els.delayRange.oninput = e=>{
        state.delay = Number((e.target as HTMLInputElement).value) * 1000;
        els.delayLabel.textContent = String(state.delay/1000);
        if(timer){ stopTimer(); startTimer(); }
    };
    document.addEventListener('keydown', e=>{
        if(e.key==='ArrowLeft' && !els.prev.disabled) els.prev.click();
        else if(e.key==='ArrowRight') els.next.click();
        else if(e.key===' '){ e.preventDefault(); toggleTimer(); }
        else if(e.key==='Home'){ state.idx=0; render(); }
        else if(e.key==='End'){ state.idx=lyrics.length-1; render(); }
    });
}

/* ---------- clean up ---------- */
/* ---------- touch gestures ---------- */
function handleTouchStart(e: TouchEvent){
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e: TouchEvent){
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe(){
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return;
    
    if (distance > 0 && state.idx > 0) {
        // Swipe right - previous
        state.idx--;
        render();
    } else if (distance < 0) {
        // Swipe left - next
        advance();
    }
}

// Setup touch listeners
els.box.addEventListener('touchstart', handleTouchStart);
els.box.addEventListener('touchend', handleTouchEnd);

/* ---------- clean up ---------- */
window.addEventListener('beforeunload', ()=>{ stopTimer(); saveState(state); });