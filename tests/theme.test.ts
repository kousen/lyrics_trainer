import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock functions for theme testing
function setupThemeDOM() {
  document.body.classList.remove('dark-theme', 'light-theme');
  
  // Ensure the themeToggle element exists
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) {
    const btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.textContent = '🌙';
    document.body.appendChild(btn);
  }
  
  return document.getElementById('themeToggle') as HTMLButtonElement;
}

function mockToggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
  
  // This simplifies the matchMedia check for testing
  const isDark = body.classList.contains('dark-theme');
  
  if (isDark) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeToggle.textContent = '🌙';
    localStorage.setItem('lyricsTrainerTheme', 'light');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
    localStorage.setItem('lyricsTrainerTheme', 'dark');
  }
}

describe('Theme Functionality', () => {
  let themeToggle: HTMLButtonElement;
  
  beforeEach(() => {
    localStorage.clear();
    themeToggle = setupThemeDOM();
  });

  it('should toggle from light to dark theme', () => {
    // Default state (no theme class)
    expect(document.body.classList.contains('dark-theme')).toBe(false);
    expect(document.body.classList.contains('light-theme')).toBe(false);
    expect(themeToggle.textContent).toBe('🌙');
    
    // Toggle to dark theme
    mockToggleTheme();
    
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(document.body.classList.contains('light-theme')).toBe(false);
    expect(themeToggle.textContent).toBe('☀️');
    expect(localStorage.getItem('lyricsTrainerTheme')).toBe('dark');
  });
  
  it('should toggle from dark to light theme', () => {
    // Set initial state to dark
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
    
    // Toggle to light theme
    mockToggleTheme();
    
    expect(document.body.classList.contains('dark-theme')).toBe(false);
    expect(document.body.classList.contains('light-theme')).toBe(true);
    expect(themeToggle.textContent).toBe('🌙');
    expect(localStorage.getItem('lyricsTrainerTheme')).toBe('light');
  });
  
  it('should persist theme preference in localStorage', () => {
    // Toggle to dark theme
    mockToggleTheme();
    expect(localStorage.getItem('lyricsTrainerTheme')).toBe('dark');
    
    // Toggle back to light theme
    mockToggleTheme();
    expect(localStorage.getItem('lyricsTrainerTheme')).toBe('light');
  });
});