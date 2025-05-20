/**
 * Playlist component for lyrics selection
 */
import { getAvailableLyrics } from './playlist-api.js';

export class PlaylistComponent {
  constructor(containerId, onFileSelect) {
    this.container = document.getElementById(containerId);
    this.onFileSelect = onFileSelect;
    this.isOpen = false;
    this.playlistEl = null;
    this.toggleBtn = null;
    this.filesList = [];
    
    this.initialize();
  }
  
  /**
   * Initialize the playlist component
   */
  async initialize() {
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'playlistToggleBtn';
    this.toggleBtn.className = 'secondary-btn';
    this.toggleBtn.textContent = 'Show Playlist';
    this.toggleBtn.setAttribute('aria-label', 'Toggle playlist view');
    this.toggleBtn.addEventListener('click', () => this.togglePlaylist());
    
    // Create playlist container
    this.playlistEl = document.createElement('div');
    this.playlistEl.id = 'playlist-container';
    this.playlistEl.className = 'playlist-container';
    this.playlistEl.hidden = true;
    
    // Append elements
    this.container.appendChild(this.toggleBtn);
    this.container.appendChild(this.playlistEl);
    
    // Load available lyrics
    await this.loadFiles();
  }
  
  /**
   * Load available lyrics files
   */
  async loadFiles() {
    try {
      this.filesList = await getAvailableLyrics();
      this.renderPlaylist();
    } catch (error) {
      console.error('Failed to load playlist:', error);
      this.playlistEl.innerHTML = '<p class="playlist-error">Unable to load playlist. Please try again.</p>';
    }
  }
  
  /**
   * Render the playlist UI
   */
  renderPlaylist() {
    // Create header
    const header = document.createElement('h2');
    header.textContent = 'Available Lyrics';
    
    // Create file list
    const list = document.createElement('ul');
    list.className = 'playlist-files';
    
    // Add each file to the list
    this.filesList.forEach(file => {
      const item = document.createElement('li');
      
      const button = document.createElement('button');
      button.className = 'playlist-file-btn';
      button.setAttribute('data-file-path', file.path);
      button.setAttribute('data-file-name', file.name);
      button.textContent = file.title;
      
      button.addEventListener('click', () => {
        this.handleFileSelection(file);
      });
      
      item.appendChild(button);
      list.appendChild(item);
    });
    
    // Create upload option
    const uploadItem = document.createElement('li');
    uploadItem.className = 'playlist-upload-item';
    
    const uploadLabel = document.createElement('span');
    uploadLabel.textContent = 'Upload a new file:';
    
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'playlist-upload-btn';
    uploadBtn.textContent = 'Upload';
    uploadBtn.addEventListener('click', () => {
      // Trigger the existing file upload functionality
      document.getElementById('uploadBtn').click();
    });
    
    uploadItem.appendChild(uploadLabel);
    uploadItem.appendChild(uploadBtn);
    
    // Clear and append all elements
    this.playlistEl.innerHTML = '';
    this.playlistEl.appendChild(header);
    this.playlistEl.appendChild(list);
    this.playlistEl.appendChild(uploadItem);
  }
  
  /**
   * Handle file selection
   * @param {Object} file - The selected file info
   */
  handleFileSelection(file) {
    if (this.onFileSelect) {
      this.onFileSelect(file.path, file.name);
    }
    
    // Update active state
    const buttons = this.playlistEl.querySelectorAll('.playlist-file-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-file-path') === file.path) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Close playlist after selection on mobile
    if (window.innerWidth < 768) {
      this.togglePlaylist(false);
    }
  }
  
  /**
   * Toggle playlist visibility
   * @param {boolean} [force] - Force a specific state
   */
  togglePlaylist(force) {
    this.isOpen = force !== undefined ? force : !this.isOpen;
    this.playlistEl.hidden = !this.isOpen;
    this.toggleBtn.textContent = this.isOpen ? 'Hide Playlist' : 'Show Playlist';
    this.toggleBtn.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
  }
  
  /**
   * Refresh the playlist
   */
  async refresh() {
    await this.loadFiles();
  }
  
  /**
   * Set active file in playlist
   * @param {string} filePath - Path of file to mark as active
   */
  setActiveFile(filePath) {
    const buttons = this.playlistEl.querySelectorAll('.playlist-file-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-file-path') === filePath) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}