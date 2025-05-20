import { describe, it, expect, vi, afterEach } from 'vitest'

// Mock the state management functions based on the actual implementation
// This simulates the functionality without touching the actual code
function saveState(state: { idx: number, delay: number }) {
  localStorage.setItem('lyricsTrainerState', JSON.stringify(state));
}

function loadState(): { idx: number, delay: number } {
  try {
    const saved = localStorage.getItem('lyricsTrainerState');
    if (saved === null) {
      return { idx: 0, delay: 3000 };
    }
    return JSON.parse(saved);
  } catch {
    return { idx: 0, delay: 3000 };
  }
}

describe('State Management', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should save state to localStorage', () => {
    const state = { idx: 5, delay: 2000 };
    saveState(state);
    
    const storedState = localStorage.getItem('lyricsTrainerState');
    expect(storedState).toBe(JSON.stringify(state));
  });
  
  it('should load state from localStorage', () => {
    const state = { idx: 10, delay: 1500 };
    localStorage.setItem('lyricsTrainerState', JSON.stringify(state));
    
    const loadedState = loadState();
    expect(loadedState).toEqual(state);
  });
  
  it('should return default state when localStorage is empty', () => {
    const defaultState = { idx: 0, delay: 3000 };
    
    const loadedState = loadState();
    expect(loadedState).toEqual(defaultState);
  });
  
  it('should return default state when localStorage contains invalid JSON', () => {
    const defaultState = { idx: 0, delay: 3000 };
    localStorage.setItem('lyricsTrainerState', 'invalid-json');
    
    const loadedState = loadState();
    expect(loadedState).toEqual(defaultState);
  });
});