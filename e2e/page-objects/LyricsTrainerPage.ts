import { Page, Locator } from '@playwright/test';

export class LyricsTrainerPage {
  readonly page: Page;
  readonly lyricsBox: Locator;
  readonly counter: Locator;
  readonly seekSlider: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly playPauseButton: Locator;
  readonly delayRange: Locator;
  readonly delayLabel: Locator;
  readonly themeToggle: Locator;
  readonly uploadButton: Locator;
  readonly fileInput: Locator;
  readonly resetButton: Locator;
  readonly currentSource: Locator;
  readonly loading: Locator;
  readonly error: Locator;
  readonly content: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lyricsBox = page.locator('#lyrics-box');
    this.counter = page.locator('#counter');
    this.seekSlider = page.locator('#seek');
    this.prevButton = page.locator('#prevBtn');
    this.nextButton = page.locator('#nextBtn');
    this.playPauseButton = page.locator('#playPauseBtn');
    this.delayRange = page.locator('#delayRange');
    this.delayLabel = page.locator('#delayLabel');
    this.themeToggle = page.locator('#themeToggle');
    this.uploadButton = page.locator('#uploadBtn');
    this.fileInput = page.locator('#fileInput');
    this.resetButton = page.locator('#resetBtn');
    this.currentSource = page.locator('#currentSource');
    this.loading = page.locator('#loading');
    this.error = page.locator('#error');
    this.content = page.locator('#content');
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoad() {
    await this.content.waitFor({ state: 'visible' });
    await this.loading.waitFor({ state: 'hidden' });
  }

  async getCurrentLine() {
    return await this.lyricsBox.textContent();
  }

  async getCurrentIndex() {
    const counterText = await this.counter.textContent();
    const match = counterText?.match(/(\d+) \/ \d+/);
    return match ? parseInt(match[1]) : 0;
  }

  async getTotalLines() {
    const counterText = await this.counter.textContent();
    const match = counterText?.match(/\d+ \/ (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async navigateNext() {
    await this.nextButton.click();
  }

  async navigatePrevious() {
    await this.prevButton.click();
  }

  async setSeekPosition(position: number) {
    await this.seekSlider.fill(position.toString());
  }

  async togglePlayPause() {
    await this.playPauseButton.click();
  }

  async isPlaying() {
    const pressed = await this.playPauseButton.getAttribute('aria-pressed');
    return pressed === 'true';
  }

  async setDelay(seconds: number) {
    await this.delayRange.fill(seconds.toString());
  }

  async getDelay() {
    return await this.delayLabel.textContent();
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async isDarkMode() {
    const bodyClass = await this.page.locator('body').getAttribute('class');
    return bodyClass?.includes('dark') ?? false;
  }

  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  async resetToDefault() {
    await this.resetButton.click();
  }

  async getSourceLabel() {
    return await this.currentSource.textContent();
  }

  async swipeLeft() {
    const box = await this.lyricsBox.boundingBox();
    if (!box) return;
    
    await this.page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await this.page.mouse.up();
  }

  async swipeRight() {
    const box = await this.lyricsBox.boundingBox();
    if (!box) return;
    
    await this.page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await this.page.mouse.up();
  }
}