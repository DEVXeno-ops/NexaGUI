class AppState {
  constructor() {
    this.isNWJS = typeof nw !== 'undefined';
    this.fs = this.isNWJS ? require('fs') : null;
    this.path = this.isNWJS ? require('path') : null;
    this.currentLang = localStorage.getItem('lang') || CONFIG.defaultLang;
    this.currentTheme = localStorage.getItem('theme') || CONFIG.defaultTheme;
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.ambientEnabled = localStorage.getItem('ambientEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('volume') || '1');
    this.clickSoundURL = localStorage.getItem('clickSound') || '';
    this.ambientSoundURL = localStorage.getItem('ambientSound') || '';
    this.audio = document.getElementById('clickSound');
    this.ambientAudio = document.getElementById('ambientSound');
    this.tabs = document.querySelectorAll('.sidebar-item');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.eventListeners = new Map();
    this.showNotification = () => {};
    this.tray = null;
  }

  cleanup() {
    this.eventListeners.forEach((handler, key) => {
      if (typeof handler === 'function' && key !== 'typed' && key !== 'clock-interval' && key !== 'wallpaper-interval') {
        key.removeEventListener('click', handler);
        key.removeEventListener('keydown', handler);
      } else if (typeof handler === 'function') {
        handler();
      }
    });
    this.eventListeners.clear();
    gsap.killTweensOf('*');
  }

  switchTab(id) {
    try {
      this.cleanup();
      this.tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.tabIndex = 0;
      });
      this.tabContents.forEach(content => content.classList.remove('active'));
      const tab = document.getElementById(`tab-${id}`);
      const content = document.getElementById(id);
      if (tab && content) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.tabIndex = -1;
        content.classList.add('active');
        gsap.from(content, { opacity: 0, x: 20, duration: 0.5, ease: 'power3.out' });
        tab.focus();
      }
    } catch (err) {
      console.error(`Tab switch failed: ${err.message}`);
    }
  }

  setLang(lang) {
    try {
      if (!CONFIG.langData[lang]) lang = CONFIG.defaultLang;
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      const data = CONFIG.langData[lang];
      Object.keys(data).forEach(id => {
        const el = document.getElementById(id);
        if (el && id !== 'notifications') el.textContent = data[id];
      });
      const langSelect = document.getElementById('lang');
      if (langSelect) langSelect.value = lang;
      this.eventListeners.get('typed')?.();
      this.updateTrayMenu();
      this.showNotification(CONFIG.langData[lang].notifications.langChanged);
    } catch (err) {
      console.error(`Language change failed: ${err.message}`);
    }
  }

  setTheme(theme) {
    try {
      if (!['dark', 'light'].includes(theme)) theme = CONFIG.defaultTheme;
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      const toggleIcons = document.querySelectorAll('[data-action="toggleTheme"]');
      toggleIcons.forEach(icon => {
        icon.innerHTML = theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
      });
      const particleColor = theme === 'dark' ? '#5b21b6' : '#7c3aed';
      particlesJS('particles-js', {
        ...CONFIG.particlesConfig,
        particles: { ...CONFIG.particlesConfig.particles, color: { value: particleColor }, line_linked: { ...CONFIG.particlesConfig.particles.line_linked, color: particleColor } }
      });
      this.showNotification(CONFIG.langData[this.currentLang].notifications.themeChanged);
    } catch (err) {
      console.error(`Theme change failed: ${err.message}`);
    }
  }

  toggleTheme() {
    try {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(this.currentTheme);
      gsap.to('[data-action="toggleTheme"]', { rotation: 360, duration: 0.5, ease: 'power3.out' });
    } catch (err) {
      console.error(`Theme toggle failed: ${err.message}`);
    }
  }

  toggleLang() {
    try {
      this.currentLang = this.currentLang === 'th' ? 'en' : 'th';
      this.setLang(this.currentLang);
    } catch (err) {
      console.error(`Language toggle failed: ${err.message}`);
    }
  }

  toggleSound(enabled) {
    try {
      this.soundEnabled = typeof enabled === 'boolean' ? enabled : !this.soundEnabled;
      localStorage.setItem('soundEnabled', this.soundEnabled);
      this.audio.muted = !this.soundEnabled;
      const soundToggle = document.getElementById('sound-toggle');
      if (soundToggle) soundToggle.checked = this.soundEnabled;
      const soundBtn = document.querySelector('[data-action="toggleSound"]');
      if (soundBtn) soundBtn.innerHTML = `<i class="fas fa-volume-${this.soundEnabled ? 'up' : 'mute'}"></i>`;
      this.showNotification(CONFIG.langData[this.currentLang].notifications[`soundToggled${this.soundEnabled ? 'On' : 'Off'}`]);
    } catch (err) {
      console.error(`Sound toggle failed: ${err.message}`);
    }
  }

  toggleAmbient(enabled) {
    try {
      this.ambientEnabled = typeof enabled === 'boolean' ? enabled : !this.ambientEnabled;
      localStorage.setItem('ambientEnabled', this.ambientEnabled);
      const ambientToggle = document.getElementById('ambient-toggle');
      if (ambientToggle) ambientToggle.checked = this.ambientEnabled;
      const ambientBtn = document.querySelector('[data-action="toggleAmbient"]');
      if (ambientBtn) ambientBtn.innerHTML = `<i class="fas fa-headphones${this.ambientEnabled ? '' : '-alt'}"></i>`;
      if (this.ambientEnabled && this.ambientAudio.src) {
        this.ambientAudio.play().catch(err => console.error(`Ambient playback failed: ${err.message}`));
      } else {
        this.ambientAudio.pause();
      }
      this.showNotification(CONFIG.langData[this.currentLang].notifications[`ambientToggled${this.ambientEnabled ? 'On' : 'Off'}`]);
    } catch (err) {
      console.error(`Ambient toggle failed: ${err.message}`);
    }
  }

  setVolume(value) {
    try {
      this.volume = parseFloat(value) || 1;
      if (this.volume < 0 || this.volume > 1) this.volume = 1;
      localStorage.setItem('volume', this.volume);
      this.audio.volume = this.volume;
      this.ambientAudio.volume = this.volume;
      const volumeInput = document.getElementById('volume');
      if (volumeInput) volumeInput.value = this.volume;
      this.showNotification(CONFIG.langData[this.currentLang].notifications.volumeAdjusted);
    } catch (err) {
      console.error(`Volume change failed: ${err.message}`);
    }
  }

  playSoundAndAlert() {
    try {
      if (this.soundEnabled && this.audio.src) {
        this.audio.play().catch(err => console.error(`Audio playback failed: ${err.message}`));
      }
      const message = CONFIG.langData[this.currentLang].notifications.actionCompleted;
      if (this.isNWJS) {
        nw.Window.get().showNotification(message, {
          body: 'Action completed!',
          icon: 'assets/icon.png'
        });
      } else {
        alert(message);
      }
      this.showNotification(message);
    } catch (err) {
      console.error(`Play sound and alert failed: ${err.message}`);
    }
  }

  setClickSound(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('sound-error');
      if (errorEl) errorEl.style.display = 'none';
      if (!file || !file.type.startsWith('audio/')) {
        if (errorEl) errorEl.style.display = 'block';
        return;
      }

      if (this.isNWJS) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const filePath = this.path.join(nw.App.dataPath, `sound-${Date.now()}.${file.name.split('.').pop()}`);
            this.fs.writeFileSync(filePath, Buffer.from(reader.result));
            this.audio.src = filePath;
            localStorage.setItem('clickSound', filePath);
            this.showNotification(CONFIG.langData[this.currentLang].notifications.clickSoundSet);
          } catch (err) {
            if (errorEl) errorEl.style.display = 'block';
            console.error(`Click sound save failed: ${err.message}`);
          }
        };
        reader.onerror = () => {
          if (errorEl) errorEl.style.display = 'block';
        };
        reader.readAsArrayBuffer(file);
      } else {
        const url = URL.createObjectURL(file);
        this.audio.src = url;
        localStorage.setItem('clickSound', url);
        this.showNotification(CONFIG.langData[this.currentLang].notifications.clickSoundSet);
      }
    } catch (err) {
      console.error(`Click sound change failed: ${err.message}`);
    }
  }

  addBackground(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('bg-error');
      if (errorEl) errorEl.style.display = 'none';
      if (!file || !file.type.startsWith('image/')) {
        if (errorEl) errorEl.style.display = 'block';
        return;
      }

      if (this.isNWJS) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const filePath = this.path.join(nw.App.dataPath, `bg-${Date.now()}.${file.name.split('.').pop()}`);
            this.fs.writeFileSync(filePath, Buffer.from(reader.result));
            CONFIG.wallpapers.push(filePath);
            localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
            this.showNotification(CONFIG.langData[this.currentLang].notifications.backgroundAdded);
          } catch (err) {
            if (errorEl) errorEl.style.display = 'block';
            console.error(`Background save failed: ${err.message}`);
          }
        };
        reader.onerror = () => {
          if (errorEl) errorEl.style.display = 'block';
        };
        reader.readAsArrayBuffer(file);
      } else {
        const url = URL.createObjectURL(file);
        CONFIG.wallpapers.push(url);
        localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
        this.showNotification(CONFIG.langData[this.currentLang].notifications.backgroundAdded);
      }
    } catch (err) {
      console.error(`Background add failed: ${err.message}`);
    }
  }

  exportSettings() {
    try {
      const settings = {
        lang: this.currentLang,
        theme: this.currentTheme,
        soundEnabled: this.soundEnabled,
        ambientEnabled: this.ambientEnabled,
        volume: this.volume,
        wallpapers: CONFIG.wallpapers,
        clickSound: localStorage.getItem('clickSound'),
        ambientSound: localStorage.getItem('ambientSound')
      };
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nexagui-settings.json';
      a.click();
      URL.revokeObjectURL(url);
      this.showNotification(CONFIG.langData[this.currentLang].notifications.settingsExported);
    } catch (err) {
      console.error(`Settings export failed: ${err.message}`);
    }
  }

  importSettings(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('import-error');
      if (errorEl) errorEl.style.display = 'none';
      if (!file || file.type !== 'application/json') {
        if (errorEl) errorEl.style.display = 'block';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const settings = JSON.parse(reader.result);
          if (settings.lang) this.setLang(settings.lang);
          if (settings.theme) this.setTheme(settings.theme);
          if (typeof settings.soundEnabled === 'boolean') this.toggleSound(settings.soundEnabled);
          if (typeof settings.ambientEnabled === 'boolean') this.toggleAmbient(settings.ambientEnabled);
          if (typeof settings.volume === 'number') this.setVolume(settings.volume);
          if (Array.isArray(settings.wallpapers)) {
            CONFIG.wallpapers = settings.wallpapers.filter(wp => !this.isNWJS || (this.fs && this.fs.existsSync(wp)));
            localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
          }
          if (settings.clickSound && (!this.isNWJS || (this.fs && this.fs.existsSync(settings.clickSound)))) {
            localStorage.setItem('clickSound', settings.clickSound);
            this.audio.src = settings.clickSound;
          }
          if (settings.ambientSound && (!this.isNWJS || (this.fs && this.fs.existsSync(settings.ambientSound)))) {
            localStorage.setItem('ambientSound', settings.ambientSound);
            this.ambientAudio.src = settings.ambientSound;
            if (this.ambientEnabled) this.ambientAudio.play().catch(err => console.error(`Ambient playback failed: ${err.message}`));
          }
          this.showNotification(CONFIG.langData[this.currentLang].notifications.settingsImported);
        } catch (err) {
          if (errorEl) errorEl.style.display = 'block';
          console.error(`Settings import failed: ${err.message}`);
        }
      };
      reader.onerror = () => {
        if (errorEl) errorEl.style.display = 'block';
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(`Settings import failed: ${err.message}`);
    }
  }

  updateTrayMenu() {
    if (!this.isNWJS || !this.tray) return;
    try {
      this.tray.remove();
      this.tray = new nw.Tray({
        title: 'NexaGUI',
        icon: 'assets/icon.png'
      });
      const menu = new nw.Menu();
      menu.append(new nw.MenuItem({
        label: CONFIG.langData[this.currentLang].notifications.open || 'Open',
        click: () => nw.Window.get().show()
      }));
      menu.append(new nw.MenuItem({
        label: CONFIG.langData[this.currentLang].notifications.quit || 'Quit',
        click: () => nw.App.quit()
      }));
      this.tray.menu = menu;
    } catch (err) {
      console.error(`Tray menu update failed: ${err.message}`);
    }
  }

  init() {
    try {
      // System theme detection
      if (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
      }

      // Initialize wallpapers
      try {
        const savedWallpapers = localStorage.getItem('wallpapers');
        if (savedWallpapers) {
          CONFIG.wallpapers = JSON.parse(savedWallpapers).filter(wp => !this.isNWJS || (this.fs && this.fs.existsSync(wp)));
        }
        if (CONFIG.wallpapers.length === 0) {
          CONFIG.wallpapers = [...CONFIG.defaultWallpapers];
        }
        localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
      } catch (err) {
        CONFIG.wallpapers = [...CONFIG.defaultWallpapers];
        localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
        console.error(`Wallpaper initialization failed: ${err.message}`);
      }

      // Initialize ambient sound
      if (!this.ambientSoundURL && this.isNWJS && this.fs && this.path) {
        try {
          const defaultAmbient = this.path.join(nw.App.dataPath, 'ambient-default.mp3');
          if (this.fs.existsSync(defaultAmbient)) {
            this.ambientSoundURL = defaultAmbient;
            localStorage.setItem('ambientSound', defaultAmbient);
          }
        } catch (err) {
          console.error(`Ambient sound initialization failed: ${err.message}`);
        }
      }

      // Hide loading screen
      setTimeout(() => {
        gsap.to('#loading', {
          opacity: 0,
          duration: 0.5,
          onComplete: () => document.getElementById('loading')?.classList.add('hidden')
        });
      }, 1000);

      // Initialize theme and audio
      this.setTheme(this.currentTheme);
      this.audio.volume = this.volume;
      this.audio.muted = !this.soundEnabled;
      this.ambientAudio.volume = this.volume;
      if (this.clickSoundURL && (!this.isNWJS || (this.fs && this.fs.existsSync(this.clickSoundURL)))) {
        this.audio.src = this.clickSoundURL;
      }
      if (this.ambientSoundURL && this.ambientEnabled && (!this.isNWJS || (this.fs && this.fs.existsSync(this.ambientSoundURL)))) {
        this.ambientAudio.src = this.ambientSoundURL;
        this.ambientAudio.play().catch(err => console.error(`Ambient playback failed: ${err.message}`));
      }

      // Initialize UI elements
      const soundToggle = document.getElementById('sound-toggle');
      if (soundToggle) soundToggle.checked = this.soundEnabled;
      const ambientToggle = document.getElementById('ambient-toggle');
      if (ambientToggle) ambientToggle.checked = this.ambientEnabled;
      const volumeInput = document.getElementById('volume');
      if (volumeInput) volumeInput.value = this.volume;

      // Initialize language
      this.setLang(this.currentLang);

      // Custom cursor
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
      const trails = [];
      for (let i = 0; i < 5; i++) {
        const trail = document.createElement('div');
        trail.className = 'custom-cursor trail';
        document.body.appendChild(trail);
        trails.push(trail);
      }
      const moveCursor = (e) => {
        const ratio = window.devicePixelRatio || 1;
        gsap.to(cursor, { x: e.clientX / ratio - 10, y: e.clientY / ratio - 10, duration: 0.1 });
        trails.forEach((trail, i) => {
          gsap.to(trail, {
            x: e.clientX / ratio - 5,
            y: e.clientY / ratio - 5,
            duration: 0.2 + i * 0.05,
            delay: i * 0.03,
            opacity: 0.5 - i * 0.1
          });
        });
      };
      document.addEventListener('mousemove', moveCursor);
      this.eventListeners.set('cursor', () => document.removeEventListener('mousemove', moveCursor));

      // Tab event listeners
      this.tabs.forEach(tab => {
        const handler = () => this.switchTab(tab.dataset.tab);
        tab.addEventListener('click', handler);
        tab.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === 'Space') {
            e.preventDefault();
            handler();
          }
        });
        this.eventListeners.set(tab, handler);
      });

      // Card tilt effect
      this.tabContents.forEach(content => {
        const tiltHandler = (e) => {
          const rect = content.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(content, {
            rotationY: x / 100,
            rotationX: -y / 100,
            duration: 0.3,
            ease: 'power3.out'
          });
        };
        const resetTilt = () => {
          gsap.to(content, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.3,
            ease: 'power3.out'
          });
        };
        content.addEventListener('mousemove', tiltHandler);
        content.addEventListener('mouseleave', resetTilt);
        this.eventListeners.set(`${content.id}-tilt`, () => {
          content.removeEventListener('mousemove', tiltHandler);
          content.removeEventListener('mouseleave', resetTilt);
        });
      });

      // Action-based event delegation
      document.addEventListener('click', e => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action) {
          const handlers = {
            toggleLang: () => this.toggleLang(),
            toggleTheme: () => this.toggleTheme(),
            toggleSound: () => this.toggleSound(),
            toggleAmbient: () => this.toggleAmbient(),
            playSoundAndAlert: () => this.playSoundAndAlert(),
            exportSettings: () => this.exportSettings()
          };
          try {
            handlers[action]?.();
          } catch (err) {
            console.error(`Action ${action} failed: ${err.message}`);
          }
        }
      });

      document.addEventListener('change', e => {
        const action = e.target.dataset.action;
        const handlers = {
          setLang: () => this.setLang(e.target.value),
          toggleSound: () => this.toggleSound(e.target.checked),
          toggleAmbient: () => this.toggleAmbient(e.target.checked),
          setVolume: () => this.setVolume(e.target.value),
          addBackground: () => this.addBackground(e),
          setClickSound: () => this.setClickSound(e),
          importSettings: () => this.importSettings(e)
        };
        try {
          handlers[action]?.();
        } catch (err) {
          console.error(`Change action ${action} failed: ${err.message}`);
        }
      });

      // NW.js system tray
      if (this.isNWJS) {
        this.updateTrayMenu();
        const win = nw.Window.get();
        win.on('close', () => {
          try {
            localStorage.setItem('windowState', JSON.stringify({ width: win.width, height: win.height }));
            win.hide();
          } catch (err) {
            console.error(`Window close failed: ${err.message}`);
          }
        });
        try {
          const savedState = localStorage.getItem('windowState');
          if (savedState) {
            const { width, height } = JSON.parse(savedState);
            win.resizeTo(width, height);
          }
        } catch (err) {
          console.error(`Window state restore failed: ${err.message}`);
        }
      }

      // Initialize plugins
      PLUGINS.init(this);

      // Initial animations
      gsap.from('.sidebar', { x: -250, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.quick-settings', { y: -50, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.from('.tab-content.active', { opacity: 0, x: 20, duration: 1, delay: 0.4, ease: 'power3.out' });
    } catch (err) {
      console.error(`App initialization failed: ${err.message}`);
    }
  }
}

// Initialize app
const app = new AppState();
app.init();