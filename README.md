# Lyrics Trainer

A feature-rich offline-capable Progressive Web App that steps you through song lyrics one line at a time. Includes "This Is the Moment" by default, with support for uploading custom lyrics from text files. Features manual and automatic navigation, keyboard support, persistent state, and mobile-friendly interface.

## Features

- **Display lyrics one line at a time** with enhanced visibility
- **Upload custom lyrics** from text files (.txt format) to the lyrics folder
- **Manual navigation** (Next, Previous, Seek slider, Keyboard shortcuts)
- **Mobile-friendly** with swipe gestures and responsive design
- **Theme support** with manual dark/light toggle and system preference detection
- **Auto-advance** with configurable delay (0.5-10 seconds)
- **Persistent state** via `localStorage` (remembers position, settings, and custom lyrics)
- **Offline support** via service worker (full PWA capabilities)
- **Error handling** with user-friendly messages
- **Touch-optimized** interface with proper touch targets
- **Stable layout** that doesn't jump with varying text lengths

## Getting Started

### Prerequisites

- Node.js (>=14)
- npm

### Installation

```bash
npm install
```

### Build

Compile the TypeScript sources to the `public/` directory:

```bash
npm run build
```

### Development

Rebuild on changes:

```bash
npm run watch
```

### Serve

Serve the compiled app locally on http://localhost:5173:

```bash
npm run serve
```

### Testing

The project includes comprehensive testing with both unit tests and end-to-end tests.

#### Unit Tests (Vitest)

Run unit tests:

```bash
npm test
```

Run tests in watch mode (for development):

```bash
npm run test:watch
```

Run tests with UI dashboard:

```bash
npm run test:ui
```

Generate test coverage report:

```bash
npm run test:coverage
```

#### End-to-End Tests (Playwright)

Run E2E tests across multiple browsers:

```bash
npm run test:e2e
```

Run E2E tests with interactive UI (recommended for debugging):

```bash
npm run test:e2e:ui
```

Run E2E tests in headed mode (see browsers):

```bash
npm run test:e2e:headed
```

Debug E2E tests step-by-step:

```bash
npm run test:e2e:debug
```

View E2E test report:

```bash
npm run test:e2e:report
```

The E2E tests cover:
- ✅ **125 tests passing** across Chrome, Firefox, Safari, and mobile browsers
- ✅ Core functionality (navigation, play/pause, seek slider)
- ✅ File handling (upload, reset, persistence)
- ✅ Theme switching and responsive design
- ✅ Mobile touch interactions
- ✅ Playlist/library features

#### Continuous Integration
The project includes GitHub Actions workflows for automated testing:
- **Full CI pipeline** runs on pushes to main branch
- **Quick PR checks** for faster feedback on pull requests
- **Cross-platform testing** across Ubuntu, Windows, and macOS
- **Security audits** and automated dependency updates
- **Automatic deployment** to GitHub Pages on successful builds

See [TESTING.md](TESTING.md) for more details on the testing approach.

### Mobile Access

To access on mobile devices on the same network:
1. Find your computer's IP address
2. Navigate to `http://[YOUR-IP]:5173` on your mobile device

## Usage

### Desktop
- **Navigate**: Use Previous/Next buttons, arrow keys, or the seek slider
- **Play/Pause**: Press spacebar or click the Play button
- **Theme**: Click the moon/sun icon to toggle dark/light mode
- **Keyboard shortcuts**:
  - `←` Previous line
  - `→` Next line
  - `Space` Play/Pause
  - `Home` First line
  - `End` Last line

### Mobile
- **Swipe gestures**: Swipe left/right on the lyrics to navigate
- **Touch-friendly**: All buttons are optimized for touch
- **Theme**: Tap the moon/sun icon to switch themes

### Custom Lyrics
- **Upload**: Click "Upload Lyrics (.txt)" and select a text file
- **Format**: One line per row in the text file
- **Lyrics Folder**: All lyrics files are stored in the `lyrics` folder
- **Reset**: Click "Reset to Default" to return to the original lyrics
- **Persistence**: Last used lyrics file is remembered between sessions

## Project Structure

```
.
├── .github/                    # GitHub Actions workflows
│   └── workflows/              # CI/CD automation
│       ├── ci.yml              # Main CI pipeline
│       ├── pr-check.yml        # Quick PR validation
│       └── security.yml        # Security audits & updates
├── lyrics/                     # Lyrics text files
│   ├── this_is_the_moment.txt  # Default lyrics
│   └── ...                     # User-added lyrics files
├── public/                     # Compiled assets & static files
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── lyrics/                 # Served lyrics files
│   │   └── this_is_the_moment.txt  # Default lyrics
│   ├── manifest.json
│   ├── service-worker.js
│   ├── icon-192.png            # PWA icon
│   └── icon-512.png            # PWA icon
├── src/                        # TypeScript source files
│   └── script.ts
├── tests/                      # Unit test files (Vitest)
│   ├── setup.ts                # Test setup and mocks
│   ├── utils.test.ts           # Utility function tests
│   ├── state.test.ts           # State management tests
│   └── theme.test.ts           # Theme functionality tests
├── e2e/                        # End-to-end test files (Playwright)
│   ├── fixtures/               # Test data and files
│   ├── page-objects/           # Page object models
│   ├── basic-functionality.test.ts  # Core feature tests
│   ├── file-handling.test.ts   # File upload/management tests
│   ├── playlist.test.ts        # Playlist/library tests
│   └── mobile.test.ts          # Mobile and responsive tests
├── suggested_improvements.md   # Roadmap & future enhancements
├── TESTING.md                  # Testing documentation
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright E2E configuration
├── package.json
├── tsconfig.json
└── README.md
```

## PWA / Offline Support

The app is a full Progressive Web App with:
- Service worker for offline functionality
- App manifest for installation
- Icons for home screen
- Network-first caching strategy for lyrics

## Recent Improvements

- ✅ Added loading states and error handling
- ✅ Implemented manual theme toggle
- ✅ Enhanced mobile experience with swipe gestures
- ✅ Improved lyrics visibility
- ✅ Fixed localStorage handling
- ✅ Added responsive design
- ✅ Created PWA icons
- ✅ Added custom lyrics upload from text files
- ✅ Created dedicated lyrics folder for better organization
- ✅ Fixed layout jumping with stable dimensions

## Suggested Improvements

See [suggested_improvements.md](suggested_improvements.md) for ideas on future enhancements, including:
- Multiple song support
- Lyrics search functionality
- Animation transitions
- Progress indicators
- And more...

## Deployment

This app can be deployed to any static hosting service:

- **GitHub Pages**: Push to a `gh-pages` branch or configure in repository settings
- **Netlify**: Connect your GitHub repo and deploy the `public` directory
- **Vercel**: Import your GitHub repository
- **Any web server**: Upload the contents of the `public` directory

The app is completely static after building and requires no backend services.

## License

MIT License - see [LICENSE](LICENSE) file for details.