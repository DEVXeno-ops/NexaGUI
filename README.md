# Eye-Friendly NW.js GUI

A modern, eye-friendly, and extensible NW.js GUI with customizable themes, background, sound, and language settings.

## Features
- Light/Dark mode (default: dark) with smooth transitions
- Language support (Thai/English)
- Custom background image and click sound
- Animated effects (particles, ripple, GSAP transitions)
- Modular code structure for easy maintenance
- Open-source dependencies (Inter font, FontAwesome, particles.js, GSAP)
- Extensible plugin system for adding new features

## Getting Started
1. Install NW.js: `npm install -g nw`
2. Clone this repository
3. Run the app: `nw .`
4. Ensure internet access for CDNs or include local copies of dependencies

## Project Structure
- `index.html`: Main HTML file
- `css/styles.css`: Stylesheet
- `js/app.js`: Core application logic
- `js/config.js`: Configuration (language data, defaults)
- `js/plugins.js`: Plugin system for extensibility
- `assets/`: Static assets (e.g., icons)
- `package.json`: NW.js configuration
- `README.md`: Documentation

## Extending the App
- **Add a new tab**: Create a new tab and content section in `index.html`, update `app.js` to handle the new tab.
- **Add a new language**: Update `CONFIG.langData` in `config.js`.
- **Add a plugin**: Register a new plugin in `plugins.js` (see example).
- **Customize animations**: Modify GSAP animations in `app.js` or add new ones in `styles.css`.

## Dependencies
- Inter font (Google Fonts, OFL)
- FontAwesome (MIT)
- particles.js (MIT)
- GSAP (MIT for non-commercial use)

## License
MIT