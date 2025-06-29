import { Page, Locator } from '@playwright/test';

export class PlaylistPage {
  readonly page: Page;
  readonly playlistView: Locator;
  readonly playlistContainer: Locator;
  readonly toggleButton: Locator;
  readonly filesList: Locator;
  readonly playlistHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.playlistView = page.locator('#playlist-view');
    this.playlistContainer = page.locator('#playlist-container');
    this.toggleButton = page.locator('#playlistToggleBtn');
    this.filesList = page.locator('.playlist-files');
    this.playlistHeader = page.locator('.playlist-container h2');
  }

  async isVisible() {
    return await this.playlistContainer.isVisible();
  }

  async toggle() {
    await this.toggleButton.click();
  }

  async getToggleButtonText() {
    return await this.toggleButton.textContent();
  }

  async getFileButtons() {
    return await this.filesList.locator('.playlist-file-btn').all();
  }

  async selectFile(fileName: string) {
    await this.filesList.locator(`.playlist-file-btn:has-text("${fileName}")`).click();
  }

  async getActiveFile() {
    const activeButton = this.filesList.locator('.playlist-file-btn.active');
    return await activeButton.textContent();
  }

  async waitForPlaylistLoad() {
    await this.playlistContainer.waitFor({ state: 'visible' });
    // Wait for at least one file button to appear
    await this.page.waitForSelector('.playlist-file-btn', { state: 'visible' });
  }
}