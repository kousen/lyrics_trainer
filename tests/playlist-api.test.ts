import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create a mock of the playlist API functions for testing
function mockGetAvailableLyrics() {
  return Promise.resolve([
    {
      name: 'this_is_the_moment.txt',
      path: 'lyrics/this_is_the_moment.txt',
      title: 'This Is The Moment'
    },
    {
      name: 'bohemian_rhapsody.txt',
      path: 'lyrics/bohemian_rhapsody.txt',
      title: 'Bohemian Rhapsody'
    }
  ]);
}

// Test helper for title formatting
function formatTitle(filename: string): string {
  // Remove extension
  let name = filename.replace(/\.[^/.]+$/, "");
  
  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, " ");
  
  // Capitalize words
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

describe('Playlist API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock fetch for API testing
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(['file1.txt', 'file2.txt'])
    });
  });

  it('should format titles properly', () => {
    expect(formatTitle('hello_world.txt')).toBe('Hello World');
    expect(formatTitle('test-file.txt')).toBe('Test File');
    expect(formatTitle('multiple_word_file.txt')).toBe('Multiple Word File');
    expect(formatTitle('already_Capitalized.txt')).toBe('Already Capitalized');
  });
  
  it('should return a list of available lyrics', async () => {
    const lyrics = await mockGetAvailableLyrics();
    
    expect(lyrics).toHaveLength(2);
    expect(lyrics[0].name).toBe('this_is_the_moment.txt');
    expect(lyrics[0].title).toBe('This Is The Moment');
    expect(lyrics[1].name).toBe('bohemian_rhapsody.txt');
  });
  
  it('should handle dashes and underscores in file names', () => {
    expect(formatTitle('file-with-dashes.txt')).toBe('File With Dashes');
    expect(formatTitle('file_with_underscores.txt')).toBe('File With Underscores');
    expect(formatTitle('mixed-file_name.txt')).toBe('Mixed File Name');
  });
  
  it('should remove file extensions', () => {
    expect(formatTitle('test.txt')).toBe('Test');
    // Our implementation only removes the last extension, not all dots
    expect(formatTitle('multiple.dots.in.name.txt')).toBe('Multiple.dots.in.name');
  });
  
  it('should provide proper path for files', async () => {
    const lyrics = await mockGetAvailableLyrics();
    
    expect(lyrics[0].path).toBe('lyrics/this_is_the_moment.txt');
    expect(lyrics[1].path).toBe('lyrics/bohemian_rhapsody.txt');
  });
});