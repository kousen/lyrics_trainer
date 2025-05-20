import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock state and navigation functionality for testing
interface MockState {
  idx: number;
  delay: number;
}

// Test data for lyrics
const testLyrics = [
  'Line 1',
  'Line 2',
  'Line 3',
  'Line 4',
  'Line 5'
];

// Mock rendering function
function mockRender(state: MockState, lyrics: string[]): void {
  const box = document.getElementById('lyrics-box');
  const counter = document.getElementById('counter');
  const seek = document.getElementById('seek') as HTMLInputElement;
  const prev = document.getElementById('prevBtn') as HTMLButtonElement;
  const next = document.getElementById('nextBtn') as HTMLButtonElement;
  
  if (box) box.textContent = lyrics[state.idx];
  if (counter) counter.textContent = `Line ${state.idx + 1} / ${lyrics.length}`;
  if (prev) prev.disabled = state.idx === 0;
  if (next) next.textContent = (state.idx === lyrics.length - 1) ? 'Restart' : 'Next';
  if (seek) {
    seek.max = String(lyrics.length - 1);
    seek.value = String(state.idx);
  }
}

// Mock advance function
function mockAdvance(state: MockState, lyrics: string[]): void {
  state.idx = (state.idx === lyrics.length - 1) ? 0 : state.idx + 1;
  mockRender(state, lyrics);
}

describe('Navigation Features', () => {
  let state: MockState;
  
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = `
      <div id="lyrics-box"></div>
      <div id="counter"></div>
      <input id="seek" type="range" min="0" value="0">
      <button id="prevBtn">Previous</button>
      <button id="nextBtn">Next</button>
    `;
    
    // Reset state
    state = { idx: 0, delay: 3000 };
    
    // Initial render
    mockRender(state, testLyrics);
  });
  
  it('should display the current lyric line', () => {
    const box = document.getElementById('lyrics-box');
    expect(box?.textContent).toBe('Line 1');
  });
  
  it('should update counter with current position', () => {
    const counter = document.getElementById('counter');
    expect(counter?.textContent).toBe('Line 1 / 5');
  });
  
  it('should disable previous button at first line', () => {
    const prev = document.getElementById('prevBtn') as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
  });
  
  it('should advance to next line on next button click', () => {
    mockAdvance(state, testLyrics);
    
    const box = document.getElementById('lyrics-box');
    expect(box?.textContent).toBe('Line 2');
    expect(state.idx).toBe(1);
  });
  
  it('should enable previous button after advancing', () => {
    mockAdvance(state, testLyrics);
    
    const prev = document.getElementById('prevBtn') as HTMLButtonElement;
    expect(prev.disabled).toBe(false);
  });
  
  it('should update seek slider value on navigation', () => {
    mockAdvance(state, testLyrics);
    
    const seek = document.getElementById('seek') as HTMLInputElement;
    expect(seek.value).toBe('1');
  });
  
  it('should change next button text to Restart at last line', () => {
    // Navigate to last line
    state.idx = testLyrics.length - 1;
    mockRender(state, testLyrics);
    
    const next = document.getElementById('nextBtn') as HTMLButtonElement;
    expect(next.textContent).toBe('Restart');
  });
  
  it('should restart from beginning when reaching the end', () => {
    // Set to last line
    state.idx = testLyrics.length - 1;
    mockRender(state, testLyrics);
    
    // Advance past the end
    mockAdvance(state, testLyrics);
    
    // Should restart from beginning
    expect(state.idx).toBe(0);
    
    const box = document.getElementById('lyrics-box');
    expect(box?.textContent).toBe('Line 1');
  });
  
  it('should go to previous line when previous button would be clicked', () => {
    // First advance to line 2
    mockAdvance(state, testLyrics);
    expect(state.idx).toBe(1);
    
    // Then go back
    state.idx--;
    mockRender(state, testLyrics);
    
    expect(state.idx).toBe(0);
    const box = document.getElementById('lyrics-box');
    expect(box?.textContent).toBe('Line 1');
  });
  
  it('should update display when seeking directly to a position', () => {
    // Simulate seek to position 3
    state.idx = 3;
    mockRender(state, testLyrics);
    
    const box = document.getElementById('lyrics-box');
    expect(box?.textContent).toBe('Line 4');
    
    const counter = document.getElementById('counter');
    expect(counter?.textContent).toBe('Line 4 / 5');
  });
});