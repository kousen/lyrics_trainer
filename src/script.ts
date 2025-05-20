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
    content:    document.getElementById('content')     as HTMLDivElement,
    themeToggle:document.getElementById('themeToggle') as HTMLButtonElement,
    uploadBtn:  document.getElementById('uploadBtn')   as HTMLButtonElement,
    resetBtn:   document.getElementById('resetBtn')    as HTMLButtonElement,
    fileInput:  document.getElementById('fileInput')   as HTMLInputElement,
    currentSource: document.getElementById('currentSource') as HTMLSpanElement
};

let lyrics: string[] = [];
let timer: number | null = null;
const STORAGE_KEY = 'lyricsTrainerState';
const THEME_KEY = 'lyricsTrainerTheme';
const CUSTOM_LYRICS_KEY = 'customLyrics';
const LYRICS_SOURCE_KEY = 'lyricsSource';
const DEFAULT_LYRICS_FILE = 'this_is_the_moment.txt';
const LAST_LYRICS_FILE_KEY = 'lastLyricsFile';
const LYRICS_PATH_KEY = 'lyricsPath';

// Touch tracking for swipe gestures
let touchStartX = 0;
let touchEndX = 0;
const MIN_SWIPE_DISTANCE = 50;

/* ---------- load / persist ---------- */
function loadState(): TrainerState {
    try { 
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            return { idx:0, delay:3000 };
        }
        return JSON.parse(saved);
    }
    catch { return { idx:0, delay:3000 } }
}
function saveState(s: TrainerState){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

/* ---------- theme management ---------- */
function loadTheme(){
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        els.themeToggle.textContent = '☀️';
    } else if (theme === 'light') {
        document.body.classList.add('light-theme');
        els.themeToggle.textContent = '🌙';
    } else {
        // Auto theme - check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            els.themeToggle.textContent = '☀️';
        } else {
            els.themeToggle.textContent = '🌙';
        }
    }
}

function toggleTheme(){
    const body = document.body;
    const isDark = body.classList.contains('dark-theme') || 
                   (!body.classList.contains('light-theme') && 
                    window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        els.themeToggle.textContent = '🌙';
        localStorage.setItem(THEME_KEY, 'light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        els.themeToggle.textContent = '☀️';
        localStorage.setItem(THEME_KEY, 'dark');
    }
}

/* ---------- file handling ---------- */
async function loadDefaultLyrics() {
    try {
        // Use the last path if available, or construct from last filename, or fall back to default
        const lyricsPath = localStorage.getItem(LYRICS_PATH_KEY) || 
                         `lyrics/${localStorage.getItem(LAST_LYRICS_FILE_KEY) || DEFAULT_LYRICS_FILE}`;
        
        const res = await fetch(`${lyricsPath}?v=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) {
            // Fall back to the default file if the last one can't be found
            const defaultRes = await fetch(`lyrics/${DEFAULT_LYRICS_FILE}?v=${Date.now()}`, { cache: 'no-store' });
            if (!defaultRes.ok) {
                throw new Error(`Failed to load lyrics (${defaultRes.status})`);
            }
            const text = await defaultRes.text();
            
            // Reset the path to default
            localStorage.setItem(LYRICS_PATH_KEY, `lyrics/${DEFAULT_LYRICS_FILE}`);
            localStorage.setItem(LAST_LYRICS_FILE_KEY, DEFAULT_LYRICS_FILE);
            
            return processLyricsText(text);
        }
        const text = await res.text();
        return processLyricsText(text);
    } catch (error) {
        console.error('Error loading lyrics:', error);
        throw error;
    }
}

function processLyricsText(text: string): string[] {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

async function processLyricsFile(file: File): Promise<string[]> {
    const text = await file.text();
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
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
                localStorage.setItem(LAST_LYRICS_FILE_KEY, file.name);
                
                // We don't have a real path for uploaded files, so use a special identifier
                localStorage.setItem(LYRICS_PATH_KEY, `custom:${file.name}`);
                
                // Update UI
                els.currentSource.textContent = `Custom: ${file.name}`;
                els.resetBtn.hidden = false;
                els.loading.hidden = true;
                els.content.hidden = false;
                
                // Update playlist if available
                if (window.playlistComponent) {
                    window.playlistComponent.refresh();
                }
                
                console.log('About to render, current lyrics:', lyrics[0]);
                render();
                
                // Reset the input value so the same file can be selected again
                input.value = '';
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
    localStorage.setItem(LAST_LYRICS_FILE_KEY, DEFAULT_LYRICS_FILE);
    localStorage.setItem(LYRICS_PATH_KEY, `lyrics/${DEFAULT_LYRICS_FILE}`);
    
    try {
        // Load default lyrics
        lyrics = await loadDefaultLyrics();
        
        // Reset UI
        els.currentSource.textContent = 'Default: This is the Moment';
        els.resetBtn.hidden = true;
        state.idx = 0;
        render();
        
        // Update playlist if available
        if (window.playlistComponent) {
            window.playlistComponent.refresh();
            window.playlistComponent.setActiveFile(`lyrics/${DEFAULT_LYRICS_FILE}`);
        }
    } catch (error) {
        // If direct loading fails, force reload
        location.reload();
    }
}

/* ---------- bootstrap ---------- */
// Initialize theme before anything else
loadTheme();

// Append a cache‑buster query string to avoid 304/empty-body responses
// Add properties to Window interface to make TypeScript happy
interface Window {
    playlistComponent: any;
    loadLyricsFromPath: Function;
}

/**
 * Load lyrics from a specific path
 * @param filePath - Path to the lyrics file
 * @param fileName - Name of the file (for display)
 */
async function loadLyricsFromPath(filePath: string, fileName: string) {
    try {
        els.loading.hidden = false;
        els.loading.textContent = 'Loading lyrics...';
        els.content.hidden = true;
        
        // Fetch the lyrics file
        const res = await fetch(`${filePath}?v=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to load lyrics (${res.status})`);
        }
        
        const text = await res.text();
        const processedLyrics = processLyricsText(text);
        
        if (processedLyrics.length === 0) {
            throw new Error('No lyrics found in file');
        }
        
        // Update the lyrics and state
        lyrics = processedLyrics;
        state.idx = 0;
        
        // Save path information
        localStorage.setItem(LYRICS_PATH_KEY, filePath);
        localStorage.setItem(LAST_LYRICS_FILE_KEY, fileName);
        localStorage.setItem(LYRICS_SOURCE_KEY, 'playlist');
        
        // Update UI
        els.currentSource.textContent = `Playlist: ${fileName.replace(/\.[^/.]+$/, "")}`;
        els.resetBtn.hidden = false;
        
        // Hide loading, show content
        els.loading.hidden = true;
        els.content.hidden = false;
        
        // Render the lyrics
        render();
        
        // Update playlist active item if available
        if (window.playlistComponent) {
            window.playlistComponent.setActiveFile(filePath);
        }
        
        return true;
    } catch (error) {
        els.loading.hidden = true;
        els.error.hidden = false;
        els.content.hidden = true;
        
        els.error.textContent = error instanceof Error 
            ? `Error: ${error.message}` 
            : 'Failed to load lyrics file';
        console.error('Failed to load lyrics:', error);
        
        return false;
    }
}

(async function init(){
    try {
        // Make loadLyricsFromPath available globally
        window.loadLyricsFromPath = loadLyricsFromPath;
        
        // Check for custom lyrics first
        const lyricsSource = localStorage.getItem(LYRICS_SOURCE_KEY);
        
        if (lyricsSource === 'custom') {
            const customLyrics = localStorage.getItem(CUSTOM_LYRICS_KEY);
            if (customLyrics) {
                lyrics = JSON.parse(customLyrics);
                const lastFile = localStorage.getItem(LAST_LYRICS_FILE_KEY) || 'Custom Lyrics';
                els.currentSource.textContent = `Custom: ${lastFile}`;
                els.resetBtn.hidden = false;
            } else {
                // Fallback to default if custom lyrics are missing
                lyrics = await loadDefaultLyrics();
                els.currentSource.textContent = `Default: This is the Moment`;
            }
        } else {
            lyrics = await loadDefaultLyrics();
            els.currentSource.textContent = `Default: This is the Moment`;
        }
        
        if (!Array.isArray(lyrics) || lyrics.length === 0) {
            // noinspection ExceptionCaughtLocallyJS
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
        
        // Initialize the playlist component - we'll do this in a script tag instead
        // to avoid TypeScript module import issues
        setTimeout(() => {
            const currentPath = localStorage.getItem(LYRICS_PATH_KEY);
            if (currentPath && window.playlistComponent) {
                window.playlistComponent.setActiveFile(currentPath);
            }
        }, 100);
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
    els.themeToggle.onclick = toggleTheme;
    els.uploadBtn.onclick = () => {
        // Reset the input value before triggering click to ensure onchange fires
        els.fileInput.value = '';
        els.fileInput.click();
    };
    els.fileInput.onchange = handleFileUpload;
    els.resetBtn.onclick = resetToDefaultLyrics;
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