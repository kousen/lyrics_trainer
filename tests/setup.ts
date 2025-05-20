// Mock browser globals for tests
import { beforeEach } from 'vitest'

// Mock localStorage
class LocalStorageMock {
  store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

// Mock DOM elements
function setupDOMElements() {
  // Clear any existing elements
  document.body.innerHTML = '';
  
  // Create the basic structure needed for tests
  document.body.innerHTML = `
    <div id="loading">Loading...</div>
    <div id="error" hidden>Error message</div>
    <div id="content" hidden>
      <div id="lyrics-box"></div>
      <div id="counter"></div>
      <input id="seek" type="range" min="0" max="100" value="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <button id="prevBtn">Previous</button>
      <button id="nextBtn">Next</button>
      <button id="playPauseBtn" aria-pressed="false">Play ▶️</button>
      <input id="delayRange" type="range" min="0.5" max="10" step="0.5" value="3">
      <span id="delayLabel">3</span>
      <button id="themeToggle">🌙</button>
      <button id="uploadBtn">Upload Lyrics</button>
      <button id="resetBtn" hidden>Reset</button>
      <input id="fileInput" type="file" accept=".txt" hidden>
      <span id="currentSource">Default Lyrics</span>
    </div>
  `;
}

// Set up mocks before each test
beforeEach(() => {
  // Set up localStorage mock
  global.localStorage = new LocalStorageMock() as unknown as Storage;
  
  // Set up DOM elements
  setupDOMElements();
  
  // Mock fetch
  global.fetch = vi.fn();
  
  // Mock window.matchMedia
  global.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  
  // Make sure we have access to vi globally
  global.vi = vi;
  
  // Mock window.setInterval and clearInterval
  global.setInterval = vi.fn() as unknown as typeof setInterval;
  global.clearInterval = vi.fn() as unknown as typeof clearInterval;
});