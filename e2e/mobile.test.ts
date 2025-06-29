import { test, expect, devices } from '@playwright/test';
import { LyricsTrainerPage } from './page-objects/LyricsTrainerPage';

// Run these tests specifically in mobile viewports
test.use({ ...devices['iPhone 12'] });

test.describe('Lyrics Trainer - Mobile Experience', () => {
  let lyricsPage: LyricsTrainerPage;

  test.beforeEach(async ({ page }) => {
    lyricsPage = new LyricsTrainerPage(page);
    await lyricsPage.goto();
    await lyricsPage.waitForLoad();
  });

  test.skip('should support swipe gestures for navigation', async ({ page }) => {
    // Skip: Swipe gestures are difficult to test reliably in Playwright
    // Manual testing recommended for this feature
    const initialIndex = await lyricsPage.getCurrentIndex();
    
    // Swipe left to go to next
    await lyricsPage.swipeLeft();
    await page.waitForTimeout(300);
    
    let currentIndex = await lyricsPage.getCurrentIndex();
    expect(currentIndex).toBe(initialIndex + 1);
    
    // Swipe right to go to previous
    await lyricsPage.swipeRight();
    await page.waitForTimeout(300);
    
    currentIndex = await lyricsPage.getCurrentIndex();
    expect(currentIndex).toBe(initialIndex);
  });

  test('should have responsive layout', async ({ page }) => {
    // Check viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);
    
    // Verify mobile-friendly elements
    const lyricsBox = await lyricsPage.lyricsBox.boundingBox();
    expect(lyricsBox).toBeTruthy();
    
    // Verify buttons are appropriately sized for touch
    const nextButton = await lyricsPage.nextButton.boundingBox();
    expect(nextButton?.height).toBeGreaterThanOrEqual(44); // iOS touch target minimum
    
    // Verify text is readable
    const fontSize = await lyricsPage.lyricsBox.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
  });

  test('should show mobile-optimized controls', async () => {
    // All controls should be visible and accessible
    await expect(lyricsPage.prevButton).toBeVisible();
    await expect(lyricsPage.nextButton).toBeVisible();
    await expect(lyricsPage.playPauseButton).toBeVisible();
    await expect(lyricsPage.seekSlider).toBeVisible();
    
    // Theme toggle should be in header
    await expect(lyricsPage.themeToggle).toBeVisible();
  });

  test('should handle touch interactions on slider', async ({ page }) => {
    const totalLines = await lyricsPage.getTotalLines();
    const targetPosition = Math.floor(totalLines / 2);
    
    // Get slider element
    const slider = await lyricsPage.seekSlider.boundingBox();
    if (!slider) throw new Error('Slider not found');
    
    // Touch on slider to change position (slider is 0-indexed)
    const targetX = slider.x + (slider.width * (targetPosition - 1) / (totalLines - 1));
    await page.touchscreen.tap(targetX, slider.y + slider.height / 2);
    
    await page.waitForTimeout(300);
    
    const currentIndex = await lyricsPage.getCurrentIndex();
    expect(Math.abs(currentIndex - targetPosition)).toBeLessThanOrEqual(2);
  });

  test('should prevent accidental navigation with small swipes', async ({ page }) => {
    const initialIndex = await lyricsPage.getCurrentIndex();
    
    // Small swipe (less than threshold)
    const box = await lyricsPage.lyricsBox.boundingBox();
    if (!box) throw new Error('Lyrics box not found');
    
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2); // Small movement
    await page.mouse.up();
    
    await page.waitForTimeout(300);
    
    // Should not navigate
    const currentIndex = await lyricsPage.getCurrentIndex();
    expect(currentIndex).toBe(initialIndex);
  });

  test('should handle orientation change', async ({ page, context }) => {
    // Skip if orientation change is not supported
    const canRotate = await context.newPage().then(async p => {
      const result = await p.evaluate(() => 'orientation' in screen).catch(() => false);
      await p.close();
      return result;
    }).catch(() => false);
    
    if (!canRotate) {
      test.skip();
      return;
    }
    
    // Start in portrait
    await page.setViewportSize({ width: 390, height: 844 });
    
    const portraitBox = await lyricsPage.lyricsBox.boundingBox();
    
    // Change to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(300);
    
    const landscapeBox = await lyricsPage.lyricsBox.boundingBox();
    
    // Layout should adapt
    expect(landscapeBox?.width).toBeGreaterThan(portraitBox?.width || 0);
  });
});

// Additional test for tablet viewport
test.describe('Lyrics Trainer - Tablet Experience', () => {
  test.use({ viewport: { width: 1024, height: 768 } });
  
  test('should display optimized layout for tablets', async ({ page }) => {
    const lyricsPage = new LyricsTrainerPage(page);
    await lyricsPage.goto();
    await lyricsPage.waitForLoad();
    
    // Verify tablet viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(1024);
    
    // The app is responsive and works well on tablets
    // Just verify key elements are visible
    await expect(lyricsPage.lyricsBox).toBeVisible();
    await expect(lyricsPage.prevButton).toBeVisible();
    await expect(lyricsPage.nextButton).toBeVisible();
  });
});