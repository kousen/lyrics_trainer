# Testing Approach for Lyrics Trainer

## Overview

This project uses [Vitest](https://vitest.dev/) as the primary testing framework. Vitest was chosen for its:

- Native ESM support (matches the project's module system)
- TypeScript integration
- Fast execution time
- Simple configuration
- JSDOM integration for browser-like environment testing

## Test Structure

The tests are organized as follows:

- `/tests` - Main test directory
  - `setup.ts` - Common test setup and mocks
  - `utils.test.ts` - Tests for utility functions
  - `state.test.ts` - Tests for state management
  - `theme.test.ts` - Tests for theme functionality

## Running Tests

Several npm scripts are available for testing:

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (rerun on changes)
- `npm run test:ui` - Run tests with UI dashboard
- `npm run test:coverage` - Generate test coverage report

## Test Strategy

The testing approach focuses on:

1. **Unit Testing** - Testing individual functions and components in isolation
2. **Mock-based Testing** - Using mock implementations of browser APIs (localStorage, fetch, etc.)
3. **DOM Testing** - Using JSDOM to test DOM manipulations
4. **State Management** - Verifying state transitions and persistence

## Writing New Tests

When adding new tests:

1. Place test files in the `/tests` directory
2. Name files with `.test.ts` suffix
3. Import necessary test utilities from Vitest
4. Use the setup helpers for common mock needs
5. Follow the existing pattern for creating mock functions based on the real implementations

## Current Test Coverage

The initial test suite covers:

- Lyrics processing functionality
- State management (save/load)
- Theme toggling
- UI element manipulation

## Future Testing Areas

Recommended areas for expanded test coverage:

- File upload handling
- Navigation (next/previous, seek)
- Auto-advancement (play/pause)
- Touch gestures
- Error handling
- Integration tests for the full application flow

## Best Practices

- Keep tests focused on a single piece of functionality
- Mock external dependencies
- Write tests before implementing new features (TDD approach)
- Run tests before committing changes
- Maintain high test coverage for critical functionality