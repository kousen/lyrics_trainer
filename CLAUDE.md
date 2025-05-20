# Lyrics Trainer - Claude Notes

This file contains information to help Claude Code assist effectively with this project.

## Project Overview

Lyrics Trainer is a Progressive Web App that displays song lyrics one line at a time. It allows uploading custom lyrics files, provides navigation controls, and remembers the last position.

## Key Directories and Files

- `/src/script.ts` - Main TypeScript source file
- `/public/` - Compiled assets and static files
- `/lyrics/` - Lyrics text files (source files)
- `/public/lyrics/` - Lyrics files accessible to the web app
- `/tests/` - Test files for Vitest
- `/vitest.config.ts` - Vitest configuration

## Common Commands

To run these commands, use the Bash tool:

```bash
# Build the project
npm run build

# Watch for changes during development
npm run watch

# Serve the app locally (http://localhost:5173)
npm run serve

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate test coverage
npm run test:coverage
```

## Testing

Tests are written using Vitest and located in the `/tests` directory. The tests use JSDOM for browser environment simulation and include mocks for:

- localStorage
- fetch
- DOM elements
- Event handling

When adding new features, always create corresponding tests.

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

## Project Improvements

Refer to `suggested_improvements.md` for planned enhancements and completed tasks.

## When Modifying Code

- Run tests after changes (`npm test`)
- Update documentation when adding features
- Follow TypeScript conventions used in `script.ts`
- Ensure the app works in both desktop and mobile environments