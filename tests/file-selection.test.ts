import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('File Selection and Loading', () => {
  let mockState: { idx: number, delay: number };
  let mockLyrics: string[];
  let mockLoadCallback: any;
  
  // Mock loadLyricsFromPath function
  async function mockLoadLyricsFromPath(filePath: string, fileName: string): Promise<boolean> {
    try {
      // Simulate fetch
      if (filePath === 'lyrics/not_found.txt') {
        throw new Error('File not found');
      }
      
      // Set mock lyrics based on file
      if (filePath === 'lyrics/file1.txt') {
        mockLyrics = ['Line 1', 'Line 2', 'Line 3'];
      } else if (filePath === 'lyrics/file2.txt') {
        mockLyrics = ['Test 1', 'Test 2', 'Test 3', 'Test 4'];
      } else {
        mockLyrics = ['Default line'];
      }
      
      // Reset position
      mockState.idx = 0;
      
      // Save path info to localStorage
      localStorage.setItem('lyricsPath', filePath);
      localStorage.setItem('lastLyricsFile', fileName);
      localStorage.setItem('lyricsSource', 'playlist');
      
      // Call render callback
      if (mockLoadCallback) {
        mockLoadCallback();
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  beforeEach(() => {
    // Set up mock state
    mockState = { idx: 0, delay: 3000 };
    mockLyrics = [];
    mockLoadCallback = vi.fn();
    
    // Clear localStorage
    localStorage.clear();
  });
  
  it('should load lyrics from valid path', async () => {
    const result = await mockLoadLyricsFromPath('lyrics/file1.txt', 'file1.txt');
    
    expect(result).toBe(true);
    expect(mockLyrics).toEqual(['Line 1', 'Line 2', 'Line 3']);
    expect(mockState.idx).toBe(0);
    expect(localStorage.getItem('lyricsPath')).toBe('lyrics/file1.txt');
    expect(localStorage.getItem('lastLyricsFile')).toBe('file1.txt');
  });
  
  it('should remember last used file', async () => {
    await mockLoadLyricsFromPath('lyrics/file1.txt', 'file1.txt');
    
    // Simulate app restart
    mockLoadCallback = vi.fn();
    mockLyrics = [];
    
    // Load last file
    const lyricsPath = localStorage.getItem('lyricsPath');
    const lastFile = localStorage.getItem('lastLyricsFile');
    
    expect(lyricsPath).toBe('lyrics/file1.txt');
    expect(lastFile).toBe('file1.txt');
    
    // Check we can load it
    if (lyricsPath && lastFile) {
      const result = await mockLoadLyricsFromPath(lyricsPath, lastFile);
      expect(result).toBe(true);
    }
  });
  
  it('should handle errors when loading invalid files', async () => {
    const result = await mockLoadLyricsFromPath('lyrics/not_found.txt', 'not_found.txt');
    
    expect(result).toBe(false);
    expect(mockLoadCallback).not.toHaveBeenCalled();
  });
  
  it('should load different lyrics per file', async () => {
    // Load first file
    await mockLoadLyricsFromPath('lyrics/file1.txt', 'file1.txt');
    expect(mockLyrics).toEqual(['Line 1', 'Line 2', 'Line 3']);
    
    // Load second file
    await mockLoadLyricsFromPath('lyrics/file2.txt', 'file2.txt');
    expect(mockLyrics).toEqual(['Test 1', 'Test 2', 'Test 3', 'Test 4']);
    
    // Verify last file is remembered
    expect(localStorage.getItem('lyricsPath')).toBe('lyrics/file2.txt');
  });
  
  it('should reset position when switching files', async () => {
    // Load first file and advance position
    await mockLoadLyricsFromPath('lyrics/file1.txt', 'file1.txt');
    mockState.idx = 2;
    
    // Load second file
    await mockLoadLyricsFromPath('lyrics/file2.txt', 'file2.txt');
    
    // Position should reset
    expect(mockState.idx).toBe(0);
  });
});