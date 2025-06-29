# Lyrics Trainer - Claude Notes

This file contains information to help Claude Code assist effectively with this project.

## Project Overview

Lyrics Trainer is a Progressive Web App that displays song lyrics one line at a time. It allows uploading custom lyrics files, provides navigation controls, and remembers the last position.

## Key Directories and Files

- `/src/script.ts` - Main TypeScript source file
- `/public/` - Compiled assets and static files
- `/lyrics/` - Lyrics text files (source files)
- `/public/lyrics/` - Lyrics files accessible to the web app
- `/tests/` - Unit test files for Vitest
- `/e2e/` - End-to-end test files for Playwright
- `/.github/workflows/` - GitHub Actions CI/CD workflows
- `/vitest.config.ts` - Vitest configuration
- `/playwright.config.ts` - Playwright E2E configuration

## Common Commands

To run these commands, use the Bash tool:

```bash
# Build the project
npm run build

# Watch for changes during development
npm run watch

# Serve the app locally (http://localhost:5173)
npm run serve

# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Generate test coverage
npm run test:coverage

# Run Playwright E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Show E2E test report
npm run test:e2e:report
```

## Testing

### Unit Tests
Unit tests are written using Vitest and located in the `/tests` directory. The tests use JSDOM for browser environment simulation and include mocks for:

- localStorage
- fetch
- DOM elements
- Event handling

### E2E Integration Tests
End-to-end tests are written using Playwright and located in the `/e2e` directory. 

**Current Status: 125 tests passing, 20 skipped**

#### Test Structure:
- `/e2e/fixtures/` - Test data files (test-lyrics.txt, empty.txt)
- `/e2e/page-objects/` - Page object models for maintainability
  - `LyricsTrainerPage.ts` - Main app page object
  - `PlaylistPage.ts` - Playlist component page object
- `/e2e/basic-functionality.test.ts` - Core features (navigation, theme, persistence)
- `/e2e/file-handling.test.ts` - File upload, reset, custom lyrics
- `/e2e/playlist.test.ts` - Playlist visibility, file selection
- `/e2e/mobile.test.ts` - Mobile viewports, touch interactions

#### Browser Coverage:
Tests run across 5 configurations:
- Desktop: Chrome, Firefox, Safari
- Mobile: Mobile Chrome, Mobile Safari

#### Known Skipped Tests (20 total):
These tests document features not yet implemented:
- Alert dialogs for invalid file uploads
- Active file highlighting in playlist
- Playlist auto-hide after selection
- File selection persistence across reloads
- Swipe gesture support (manual testing recommended)

#### Test Patterns:
- Use page objects for better maintainability
- Tests expect "Default: This is the Moment" for default source label
- Slider is 0-indexed but display is 1-indexed
- Custom uploads show "Custom:" prefix in source label
- Counter format: "Line X / Y"

When adding new features, always create corresponding tests.

## CI/CD Workflows

### GitHub Actions Setup:
- `ci.yml` - Main CI pipeline for pushes to main
  - Runs unit tests and E2E tests
  - Tests across multiple OS (Ubuntu, Windows, macOS)  
  - Tests multiple browsers (Chrome, Firefox, Safari)
  - Generates coverage reports
  - Deploys to GitHub Pages on success
- `pr-check.yml` - Quick validation for PRs
  - Runs unit tests and critical E2E tests
  - Comments on PR with test results
  - Faster feedback loop for contributors
- `security.yml` - Security and maintenance
  - Weekly dependency audits
  - Automated dependency updates
  - Creates PRs for security fixes

### CI Best Practices:
- Unit tests run first (faster feedback)
- E2E tests only run after unit tests pass
- Cross-platform testing for browser compatibility
- Artifacts uploaded for failed tests (screenshots, videos)
- Coverage reports integrated with Codecov
- Automatic deployment only on main branch

## File Structure

Lyrics files are stored in the `/lyrics` directory with `.txt` format. When you edit or add lyrics files, remember to:

1. Add them to the `/lyrics` directory
2. Copy them to `/public/lyrics` for the app to access them
3. Update any references in the code if needed

## Key Features

- Loads lyrics from text files
- Remembers last used file and position
- Supports dark/light theme switching
- Mobile-friendly with swipe gestures
- Auto-advance with configurable delay

## Project Status (June 2025)

### ✅ Recently Completed:
- **Playwright E2E Testing:** 125 tests across 5 browser configurations
- **GitHub Actions CI/CD:** Full pipeline with cross-platform testing
- **Automatic Deployment:** Live app at https://kousen.github.io/lyrics_trainer
- **Documentation:** Comprehensive testing and CI/CD docs

### 🎯 Next Development Phase:
The 20 skipped tests provide a clear roadmap for feature implementation:
1. **Alert dialogs** for invalid file uploads (easiest start)
2. **Active file highlighting** in playlist component
3. **Playlist auto-hide** after file selection
4. **File selection persistence** across page reloads
5. **Swipe gesture verification** (may already work)

### 📋 Development Workflow:
1. Pick a `.skip` test → 2. Implement feature → 3. Un-skip test → 4. Verify CI passes

## Project Improvements

Refer to `suggested_improvements.md` for planned enhancements and completed tasks.

## When Modifying Code

- Run unit tests after changes (`npm test`)
- Run E2E tests for major changes (`npm run test:e2e`)
- Update documentation when adding features
- Follow TypeScript conventions used in `script.ts`
- Ensure the app works in both desktop and mobile environments
- Update corresponding tests when implementing skipped features

## Implementation Notes

### Source Label Behavior:
- Default lyrics: "Default: This is the Moment"
- Custom uploads: "Custom: [filename]" or "Custom Upload"
- Playlist files: "Playlist: [filename]"

### Playlist Component:
- Created via JavaScript in `public/playlist-component.js`
- Toggle button ID: `#playlistToggleBtn`
- Container ID: `#playlist-container`
- Files list class: `.playlist-files`
- File buttons class: `.playlist-file-btn`
- Currently doesn't auto-hide after selection
- Active file highlighting not implemented

### Test-Specific Considerations:
- File upload tests use ES modules (need `import.meta.url` for `__dirname`)
- Swipe gestures are difficult to test reliably in Playwright
- Mobile behavior may differ from desktop (playlist visibility)
- Alert dialogs for invalid files not implemented
- File persistence on reload not fully working