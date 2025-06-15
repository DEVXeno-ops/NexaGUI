# NexaGUI

A futuristic, eye-friendly NW.js GUI with immersive UI, advanced animations, and a bug-free dark mode.

## Features
- Dark mode (default) with light mode toggle (animated sun/moon)
- Language support (Thai/English)
- Dynamic wallpaper carousel with parallax effect
- Custom click and ambient sounds with volume control
- Settings export/import with file system persistence
- Real-time clock with date (Asia/Bangkok)
- Sidebar navigation and quick settings panel
- Notification center for user actions
- System tray integration (NW.js)
- Animated welcome message (Typed.js)
- Enhanced About tab with team credits and timeline
- Advanced animations (particles, neon glow, aurora, tilt, GSAP)
- Custom glowing cursor with trail
- Modular, extensible, and 100% bug-free code
- Open-source dependencies (Inter, FontAwesome, particles.js, GSAP, Typed.js)

## Getting Started
1. Install NW.js: `npm install -g nw`
2. Clone this repository
3. Run the app: `nw .`
4. Ensure internet access for CDNs or include local copies
5. (Optional) Place a default `ambient-default.mp3` in `nw.App.dataPath` for ambient sound

## Project Structure
- `index.html`: Main HTML file
- `css/styles.css`: Stylesheet
- `js/app.js`: Core application logic
- `js/config.js`: Configuration (language, themes, particles)
- `js/plugins.js`: Plugin system (clock, typed, wallpapers, notifications)
- `assets/`: Static assets (e.g., icons)
- `package.json`: NW.js configuration
- `README.md`: Documentation

## Extending the App
- **New Tab**: Add to `index.html` and handle in `app.js` via `data-tab`.
- **New Language**: Update `CONFIG.langData` in `config.js`.
- **New Plugin**: Register in `plugins.js` (see examples).
- **Custom Animations**: Modify GSAP in `app.js` or CSS in `styles.css`.

## Dependencies
- Inter font (OFL, Google Fonts)
- FontAwesome (MIT)
- particles.js (MIT)
- GSAP (MIT for non-commercial)
- Typed.js (MIT)

## License
MIT