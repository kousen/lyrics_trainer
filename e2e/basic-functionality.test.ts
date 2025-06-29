import { test, expect } from '@playwright/test';
import { LyricsTrainerPage } from './page-objects/LyricsTrainerPage';

test.describe('Lyrics Trainer - Basic Functionality', () => {
  let lyricsPage: LyricsTrainerPage;

  test.beforeEach(async ({ page }) => {
    lyricsPage = new LyricsTrainerPage(page);
    await lyricsPage.goto();
    await lyricsPage.waitForLoad();
  });

  test('should load default lyrics on initial visit', async () => {
    const currentLine = await lyricsPage.getCurrentLine();
    expect(currentLine).toBeTruthy();
    
    const sourceLabel = await lyricsPage.getSourceLabel();
    expect(sourceLabel).toBe('Default: This is the Moment');
  });

  test('should navigate to next line', async () => {
    const initialLine = await lyricsPage.getCurrentLine();
    const initialIndex = await lyricsPage.getCurrentIndex();
    
    await lyricsPage.navigateNext();
    
    const newLine = await lyricsPage.getCurrentLine();
    const newIndex = await lyricsPage.getCurrentIndex();
    
    expect(newLine).not.toBe(initialLine);
    expect(newIndex).toBe(initialIndex + 1);
  });

  test('should navigate to previous line', async () => {
    // First go to line 2
    await lyricsPage.navigateNext();
    const lineTwo = await lyricsPage.getCurrentLine();
    
    // Then go back
    await lyricsPage.navigatePrevious();
    const lineOne = await lyricsPage.getCurrentLine();
    const currentIndex = await lyricsPage.getCurrentIndex();
    
    expect(lineOne).not.toBe(lineTwo);
    expect(currentIndex).toBe(1);
  });

  test('should update position with seek slider', async () => {
    const totalLines = await lyricsPage.getTotalLines();
    const targetPosition = Math.floor(totalLines / 2);
    
    // Slider is 0-indexed, so we need to set position - 1
    await lyricsPage.setSeekPosition(targetPosition - 1);
    
    const currentIndex = await lyricsPage.getCurrentIndex();
    expect(currentIndex).toBe(targetPosition);
  });

  test('should toggle play/pause', async () => {
    const initialState = await lyricsPage.isPlaying();
    expect(initialState).toBe(false);
    
    await lyricsPage.togglePlayPause();
    const playingState = await lyricsPage.isPlaying();
    expect(playingState).toBe(true);
    
    await lyricsPage.togglePlayPause();
    const pausedState = await lyricsPage.isPlaying();
    expect(pausedState).toBe(false);
  });

  test('should auto-advance when playing', async ({ page }) => {
    // Set a short delay for testing
    await lyricsPage.setDelay(0.5);
    
    const initialIndex = await lyricsPage.getCurrentIndex();
    
    // Start playing
    await lyricsPage.togglePlayPause();
    
    // Wait for auto-advance
    await page.waitForTimeout(1000);
    
    const newIndex = await lyricsPage.getCurrentIndex();
    expect(newIndex).toBeGreaterThan(initialIndex);
    
    // Stop playing
    await lyricsPage.togglePlayPause();
  });

  test('should update delay value', async () => {
    await lyricsPage.setDelay(5);
    
    const delayText = await lyricsPage.getDelay();
    expect(delayText).toBe('5');
  });

  test('should persist state on page reload', async ({ page }) => {
    // Navigate to line 3
    await lyricsPage.navigateNext();
    await lyricsPage.navigateNext();
    
    const lineBeforeReload = await lyricsPage.getCurrentLine();
    const indexBeforeReload = await lyricsPage.getCurrentIndex();
    
    // Reload page
    await page.reload();
    await lyricsPage.waitForLoad();
    
    const lineAfterReload = await lyricsPage.getCurrentLine();
    const indexAfterReload = await lyricsPage.getCurrentIndex();
    
    expect(lineAfterReload).toBe(lineBeforeReload);
    expect(indexAfterReload).toBe(indexBeforeReload);
  });

  test('should toggle theme', async ({ page }) => {
    const initialDarkMode = await lyricsPage.isDarkMode();
    
    await lyricsPage.toggleTheme();
    
    const afterToggle = await lyricsPage.isDarkMode();
    expect(afterToggle).toBe(!initialDarkMode);
    
    // Verify theme persists on reload
    await page.reload();
    await lyricsPage.waitForLoad();
    
    const afterReload = await lyricsPage.isDarkMode();
    expect(afterReload).toBe(afterToggle);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const initialIndex = await lyricsPage.getCurrentIndex();
    
    // Press right arrow
    await page.keyboard.press('ArrowRight');
    let currentIndex = await lyricsPage.getCurrentIndex();
    expect(currentIndex).toBe(initialIndex + 1);
    
    // Press left arrow
    await page.keyboard.press('ArrowLeft');
    currentIndex = await lyricsPage.getCurrentIndex();
    expect(currentIndex).toBe(initialIndex);
    
    // Press space to toggle play
    await page.keyboard.press('Space');
    const isPlaying = await lyricsPage.isPlaying();
    expect(isPlaying).toBe(true);
    
    // Press space again to pause
    await page.keyboard.press('Space');
    const isPaused = await lyricsPage.isPlaying();
    expect(isPaused).toBe(false);
  });
});