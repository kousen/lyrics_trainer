import { describe, it, expect, vi } from 'vitest'

// Helper function to mock file processing functionality
async function mockProcessLyricsFile(content: string): Promise<string[]> {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

describe('Lyrics Processing Functions', () => {
  it('should process text files correctly', async () => {
    const testLyrics = 'Line 1\nLine 2\n\nLine 3';
    const expected = ['Line 1', 'Line 2', 'Line 3'];
    
    const result = await mockProcessLyricsFile(testLyrics);
    expect(result).toEqual(expected);
  });
  
  it('should handle empty lines', async () => {
    const testLyrics = '\n\nLine 1\n\nLine 2\n\n';
    const expected = ['Line 1', 'Line 2'];
    
    const result = await mockProcessLyricsFile(testLyrics);
    expect(result).toEqual(expected);
  });
  
  it('should trim whitespace from lines', async () => {
    const testLyrics = '   Line 1   \n  Line 2\t  \n Line 3';
    const expected = ['Line 1', 'Line 2', 'Line 3'];
    
    const result = await mockProcessLyricsFile(testLyrics);
    expect(result).toEqual(expected);
  });
});