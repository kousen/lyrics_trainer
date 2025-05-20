import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock PlaylistComponent class for testing
class MockPlaylistComponent {
  container: HTMLElement;
  onFileSelect: Function;
  isOpen: boolean = false;
  playlistEl: HTMLElement;
  toggleBtn: HTMLButtonElement;
  filesList: any[] = [];
  
  constructor(containerId: string, onFileSelect: Function) {
    // Setup DOM
    document.body.innerHTML = `<div id="${containerId}"></div>`;
    
    this.container = document.getElementById(containerId) as HTMLElement;
    this.onFileSelect = onFileSelect;
    
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'playlistToggleBtn';
    this.toggleBtn.className = 'secondary-btn';
    this.toggleBtn.textContent = 'Show Playlist';
    
    // Create playlist container
    this.playlistEl = document.createElement('div');
    this.playlistEl.id = 'playlist-container';
    this.playlistEl.className = 'playlist-container';
    this.playlistEl.hidden = true;
    
    // Append elements
    this.container.appendChild(this.toggleBtn);
    this.container.appendChild(this.playlistEl);
    
    // Set initial files list
    this.filesList = [
      { name: 'file1.txt', path: 'lyrics/file1.txt', title: 'File 1' },
      { name: 'file2.txt', path: 'lyrics/file2.txt', title: 'File 2' }
    ];
    
    this.renderPlaylist();
  }
  
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
    
    // Clear and append elements
    this.playlistEl.innerHTML = '';
    this.playlistEl.appendChild(header);
    this.playlistEl.appendChild(list);
  }
  
  handleFileSelection(file: any) {
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
  }
  
  togglePlaylist(force?: boolean) {
    this.isOpen = force !== undefined ? force : !this.isOpen;
    this.playlistEl.hidden = !this.isOpen;
    this.toggleBtn.textContent = this.isOpen ? 'Hide Playlist' : 'Show Playlist';
  }
  
  setActiveFile(filePath: string) {
    const buttons = this.playlistEl.querySelectorAll('.playlist-file-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-file-path') === filePath) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  refresh() {
    // Mock implementation for refresh
    this.renderPlaylist();
  }
}

describe('Playlist Component', () => {
  let playlist: MockPlaylistComponent;
  let mockSelectFn: any;
  
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = '<div id="playlist-view"></div>';
    
    // Create a mock select function
    mockSelectFn = vi.fn();
    
    // Initialize the playlist component
    playlist = new MockPlaylistComponent('playlist-view', mockSelectFn);
  });
  
  it('should initialize with toggle button hidden playlist', () => {
    expect(playlist.toggleBtn.textContent).toBe('Show Playlist');
    expect(playlist.playlistEl.hidden).toBe(true);
    expect(playlist.isOpen).toBe(false);
  });
  
  it('should toggle playlist visibility when button is clicked', () => {
    playlist.togglePlaylist();
    
    expect(playlist.isOpen).toBe(true);
    expect(playlist.playlistEl.hidden).toBe(false);
    expect(playlist.toggleBtn.textContent).toBe('Hide Playlist');
    
    playlist.togglePlaylist();
    
    expect(playlist.isOpen).toBe(false);
    expect(playlist.playlistEl.hidden).toBe(true);
    expect(playlist.toggleBtn.textContent).toBe('Show Playlist');
  });
  
  it('should render playlist files correctly', () => {
    const fileElements = playlist.playlistEl.querySelectorAll('.playlist-file-btn');
    
    expect(fileElements.length).toBe(2);
    expect(fileElements[0].textContent).toBe('File 1');
    expect(fileElements[1].textContent).toBe('File 2');
    
    expect(fileElements[0].getAttribute('data-file-path')).toBe('lyrics/file1.txt');
    expect(fileElements[1].getAttribute('data-file-path')).toBe('lyrics/file2.txt');
  });
  
  it('should call selection callback when file is clicked', () => {
    const fileBtn = playlist.playlistEl.querySelector('.playlist-file-btn') as HTMLButtonElement;
    fileBtn.click();
    
    expect(mockSelectFn).toHaveBeenCalledTimes(1);
    expect(mockSelectFn).toHaveBeenCalledWith('lyrics/file1.txt', 'file1.txt');
  });
  
  it('should mark active file correctly', () => {
    playlist.setActiveFile('lyrics/file2.txt');
    
    const fileElements = playlist.playlistEl.querySelectorAll('.playlist-file-btn');
    expect(fileElements[0].classList.contains('active')).toBe(false);
    expect(fileElements[1].classList.contains('active')).toBe(true);
  });
  
  it('should refresh playlist content', () => {
    const renderSpy = vi.spyOn(playlist, 'renderPlaylist');
    
    playlist.refresh();
    
    expect(renderSpy).toHaveBeenCalled();
  });
});