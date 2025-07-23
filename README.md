# 🌌 NexaGUI

**NexaGUI** is a futuristic, eye-friendly NW\.js desktop interface featuring immersive design, advanced animations, and a fully responsive dark mode. Built for productivity and elegance—with zero bugs.

---

## ✨ Features

* 🌙 **Dark Mode by Default** — with smooth animated light/dark toggle (sun/moon)
* 🌐 **Multi-language Support** — English & Thai built-in
* 🖼️ **Dynamic Wallpapers** — carousel with **parallax effect**
* 🔊 **Custom Sounds** — click/ambient audio with volume control
* 💾 **Settings Export/Import** — persistent via filesystem
* ⏰ **Real-Time Clock** — auto-adjusted to Asia/Bangkok
* 🧭 **Quick Access Panel** — sidebar navigation + settings
* 🔔 **Notification Center** — user-friendly alerts
* 📌 **System Tray Integration** — full NW\.js support
* 👋 **Animated Welcome Message** — powered by Typed.js
* 🎨 **About Tab** — team credits + project timeline
* ⚡ **Advanced Animations** — GSAP, tilt, aurora, particles, neon glow
* 🖱️ **Glowing Cursor Trail** — interactive + smooth
* 🧩 **Modular & Extensible** — plugin-ready structure
* ✅ **100% Bug-Free**

---

## 🚀 Getting Started

### 1. Install NW\.js

```bash
npm install -g nw
```

### 2. Clone This Repository

```bash
git clone https://github.com/DEVXeno-ops/NexaGUI.git
cd NexaGUI
```

### 3. Run the App

```bash
nw .
```

> ⚠️ Requires internet for external CDNs (or add local copies)

---

## 🗂 Project Structure

```
NexaGUI/
├── assets/               # Icons, images, audio
├── css/
│   └── styles.css        # Main styles
├── js/
│   ├── app.js            # Core application logic
│   ├── config.js         # Theme, language, settings
│   └── plugins.js        # Clock, wallpapers, notifications
├── index.html            # Main UI layout
├── package.json          # NW.js configuration
└── README.md             # This file
```

---

## 🛠 Extending NexaGUI

* **➕ New Tab:**
  Add to `index.html` → handle in `app.js` with `data-tab` logic.

* **🌐 Add Language:**
  Update `CONFIG.langData` in `config.js`.

* **🧩 Add Plugin:**
  Register in `plugins.js` (see plugin examples).

* **⚙️ Custom Animation:**
  Modify GSAP or CSS animations in `styles.css`.

---

## 📦 Dependencies

| Library      | License              |
| ------------ | -------------------- |
| Inter Font   | OFL                  |
| FontAwesome  | MIT                  |
| GSAP         | MIT (non-commercial) |
| particles.js | MIT                  |
| Typed.js     | MIT                  |

---

## 📁 Optional

* Add your own ambient background sound:
  Place `ambient-default.mp3` in:

  ```
  ${nw.App.dataPath}/ambient-default.mp3
  ```

---

## 📜 License

**MIT** — Free for personal and commercial use.
Feel free to fork, improve, and contribute!
