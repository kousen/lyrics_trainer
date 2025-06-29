import { test, expect } from '@playwright/test';
import { LyricsTrainerPage } from './page-objects/LyricsTrainerPage';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Lyrics Trainer - File Handling', () => {
  let lyricsPage: LyricsTrainerPage;

  test.beforeEach(async ({ page }) => {
    lyricsPage = new LyricsTrainerPage(page);
    await lyricsPage.goto();
    await lyricsPage.waitForLoad();
  });

  test('should upload custom lyrics file', async ({ page }) => {
    const testFile = path.join(__dirname, 'fixtures', 'test-lyrics.txt');
    
    // Upload the file
    await lyricsPage.uploadFile(testFile);
    
    // Wait for the file to be processed
    await page.waitForTimeout(500);
    
    // Verify the source label changed
    const sourceLabel = await lyricsPage.getSourceLabel();
    expect(sourceLabel).toContain('Custom:');
    
    // Verify reset button is visible
    await expect(lyricsPage.resetButton).toBeVisible();
    
    // Verify first line of custom lyrics
    const firstLine = await lyricsPage.getCurrentLine();
    expect(firstLine).toBe('Test Song Title');
    
    // Verify total lines
    const totalLines = await lyricsPage.getTotalLines();
    expect(totalLines).toBe(6); // 6 lines in test file
  });

  test('should reset to default lyrics', async ({ page }) => {
    const testFile = path.join(__dirname, 'fixtures', 'test-lyrics.txt');
    
    // First upload custom lyrics
    await lyricsPage.uploadFile(testFile);
    await page.waitForTimeout(500);
    
    // Verify custom lyrics are loaded
    let sourceLabel = await lyricsPage.getSourceLabel();
    expect(sourceLabel).toContain('Custom:');
    
    // Reset to default
    await lyricsPage.resetToDefault();
    await page.waitForTimeout(500);
    
    // Verify default lyrics are restored
    sourceLabel = await lyricsPage.getSourceLabel();
    expect(sourceLabel).toBe('Default: This is the Moment');
    
    // Verify reset button is hidden
    await expect(lyricsPage.resetButton).toBeHidden();
    
    // Verify we're back to line 1
    const currentIndex = await lyricsPage.getCurrentIndex();
    expect(currentIndex).toBe(1);
  });

  test('should persist custom lyrics on page reload', async ({ page }) => {
    const testFile = path.join(__dirname, 'fixtures', 'test-lyrics.txt');
    
    // Upload custom lyrics
    await lyricsPage.uploadFile(testFile);
    await page.waitForTimeout(500);
    
    // Navigate to line 3
    await lyricsPage.navigateNext();
    await lyricsPage.navigateNext();
    
    const lineBeforeReload = await lyricsPage.getCurrentLine();
    
    // Reload page
    await page.reload();
    await lyricsPage.waitForLoad();
    
    // Verify custom lyrics are still loaded
    const sourceLabel = await lyricsPage.getSourceLabel();
    expect(sourceLabel).toContain('Custom:');
    
    // Verify position is maintained
    const lineAfterReload = await lyricsPage.getCurrentLine();
    expect(lineAfterReload).toBe(lineBeforeReload);
  });

  test.skip('should handle invalid file gracefully', async ({ page }) => {
    // Skip: Alert functionality not implemented - app silently rejects non-.txt files
    // This test documents expected behavior for future implementation
    
    // Create a promise to wait for alert dialog
    const dialogPromise = page.waitForEvent('dialog');
    
    // Try to upload a non-text file (using the HTML file as example)
    const invalidFile = path.join(__dirname, '..', 'public', 'index.html');
    await lyricsPage.fileInput.setInputFiles(invalidFile);
    
    // Handle the alert
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toContain('Please upload a .txt file');
    await dialog.accept();
    
    // Verify lyrics didn't change
    const sourceLabel = await lyricsPage.getSourceLabel();
    expect(sourceLabel).toBe('Default: This is the Moment');
  });

  test('should handle empty file', async ({ page }) => {
    // Create an empty file for testing
    const emptyFile = path.join(__dirname, 'fixtures', 'empty.txt');
    
    // First create the empty file
    await page.evaluate(async () => {
      const fs = await import('fs').catch(() => null);
      if (fs) {
        fs.writeFileSync('/Users/kennethkousen/WebstormProjects/lyrics_trainer/e2e/fixtures/empty.txt', '');
      }
    }).catch(() => {
      // If fs is not available in browser context, create a Blob instead
    });
    
    // Create empty file using File API
    await page.evaluate(() => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' });
      const dt = new DataTransfer();
      dt.items.add(file);
      const fileInput = document.querySelector('#fileInput') as HTMLInputElement;
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await page.waitForTimeout(500);
    
    // Should show an error or keep default lyrics
    const sourceLabel = await lyricsPage.getSourceLabel();
    expect(sourceLabel).toBe('Default: This is the Moment');
  });

  test('should update counter when uploading new file', async ({ page }) => {
    const testFile = path.join(__dirname, 'fixtures', 'test-lyrics.txt');
    
    // Get initial counter
    const initialCounter = await lyricsPage.counter.textContent();
    
    // Upload new file
    await lyricsPage.uploadFile(testFile);
    await page.waitForTimeout(500);
    
    // Verify counter updated
    const newCounter = await lyricsPage.counter.textContent();
    expect(newCounter).not.toBe(initialCounter);
    expect(newCounter).toBe('Line 1 / 6');
  });
});