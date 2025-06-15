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
  }

  switchTab(id) {
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
      content.classList.add('active');
      gsap.from(content, { opacity: 0, x: 20, duration: 0.5, ease: 'power3.out' });
    }
  }

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    const data = CONFIG.langData[lang];
    Object.keys(data).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = data[id];
    });
    document.getElementById('lang').value = lang;
    this.showNotification(this.currentLang === 'th' ? 'เปลี่ยนภาษาเรียบร้อย!' : 'Language changed!');
  }

  setTheme(theme) {
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
    this.showNotification(this.currentLang === 'th' ? 'เปลี่ยนธีมเรียบร้อย!' : 'Theme changed!');
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(this.currentTheme);
    gsap.to('[data-action="toggleTheme"]', { rotation: 360, duration: 0.5, ease: 'power3.out' });
  }

  toggleLang() {
    this.currentLang = this.currentLang === 'th' ? 'en' : 'th';
    this.setLang(this.currentLang);
  }

  toggleSound(e) {
    this.soundEnabled = typeof e === 'boolean' ? e : e.target.checked;
    localStorage.setItem('soundEnabled', this.soundEnabled);
    this.audio.muted = !this.soundEnabled;
    document.getElementById('sound-toggle').checked = this.soundEnabled;
    this.showNotification(this.currentLang === 'th' ? `เสียง${this.soundEnabled ? 'เปิด' : 'ปิด'}!` : `Sound ${this.soundEnabled ? 'on' : 'off'}!`);
  }

  toggleAmbient(e) {
    this.ambientEnabled = typeof e === 'boolean' ? e : e.target.checked;
    localStorage.setItem('ambientEnabled', this.ambientEnabled);
    if (this.ambientEnabled && this.ambientAudio.src) {
      this.ambientAudio.play().catch(err => console.error('Ambient playback failed:', err));
    } else {
      this.ambientAudio.pause();
    }
    document.getElementById('ambient-toggle').checked = this.ambientEnabled;
    this.showNotification(this.currentLang === 'th' ? `เสียงแอมเบียนท์${this.ambientEnabled ? 'เปิด' : 'ปิด'}!` : `Ambient sound ${this.ambientEnabled ? 'on' : 'off'}!`);
  }

  setVolume(e) {
    this.volume = parseFloat(e.target.value);
    localStorage.setItem('volume', this.volume);
    this.audio.volume = this.volume;
    this.ambientAudio.volume = this.volume;
    this.showNotification(this.currentLang === 'th' ? 'ปรับระดับเสียงเรียบร้อย!' : 'Volume adjusted!');
  }

  playSoundAndAlert() {
    if (this.soundEnabled && this.audio.src) {
      this.audio.play().catch(err => console.error('Audio playback failed:', err));
    }
    const message = this.currentLang === 'th' ? 'คุณกดปุ่มแล้ว! 🎉' : 'You clicked the button! 🎉';
    if (this.isNWJS) {
      nw.Window.get().showNotification(message, {
        body: 'Action completed!',
        icon: 'assets/icon.png'
      });
    } else {
      alert(message);
    }
    this.showNotification(message);
  }

  setClickSound(e) {
    const file = e.target.files[0];
    const errorEl = document.getElementById('sound-error');
    if (file && file.type.startsWith('audio/') && this.isNWJS) {
      const reader = new FileReader();
      reader.onload = () => {
        const filePath = this.path.join(nw.App.dataPath, `sound-${Date.now()}.${file.name.split('.').pop()}`);
        this.fs.writeFileSync(filePath, Buffer.from(reader.result));
        this.audio.src = filePath;
        localStorage.setItem('clickSound', filePath);
        errorEl.style.display = 'none';
        this.showNotification(this.currentLang === 'th' ? 'ตั้งค่าเสียงกดปุ่มเรียบร้อย!' : 'Click sound set!');
      };
      reader.readAsArrayBuffer(file);
    } else if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      this.audio.src = url;
      localStorage.setItem('clickSound', url);
      errorEl.style.display = 'none';
      this.showNotification(this.currentLang === 'th' ? 'ตั้งค่าเสียงกดปุ่มเรียบร้อย!' : 'Click sound set!');
    } else {
      errorEl.style.display = 'block';
    }
  }

  addBackground(e) {
    const file = e.target.files[0];
    const errorEl = document.getElementById('bg-error');
    if (file && file.type.startsWith('image/') && this.isNWJS) {
      const reader = new FileReader();
      reader.onload = () => {
        const filePath = this.path.join(nw.App.dataPath, `bg-${Date.now()}.${file.name.split('.').pop()}`);
        this.fs.writeFileSync(filePath, Buffer.from(reader.result));
        CONFIG.wallpapers.push(filePath);
        localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
        errorEl.style.display = 'none';
        this.showNotification(this.currentLang === 'th' ? 'เพิ่มพื้นหลังเรียบร้อย!' : 'Background added!');
      };
      reader.readAsArrayBuffer(file);
    } else if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      CONFIG.wallpapers.push(url);
      localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
      errorEl.style.display = 'none';
      this.showNotification(this.currentLang === 'th' ? 'เพิ่มพื้นหลังเรียบร้อย!' : 'Background added!');
    } else {
      errorEl.style.display = 'block';
    }
  }

  exportSettings() {
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
    const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexagui-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification(this.currentLang === 'th' ? 'ส่งออกการตั้งค่าเรียบร้อย!' : 'Settings exported!');
  }

  importSettings(e) {
    const file = e.target.files[0];
    const errorEl = document.getElementById('import-error');
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const settings = JSON.parse(reader.result);
          if (settings.lang) this.setLang(settings.lang);
          if (settings.theme) this.setTheme(settings.theme);
          if (typeof settings.soundEnabled === 'boolean') {
            this.toggleSound(settings.soundEnabled);
          }
          if (typeof settings.ambientEnabled === 'boolean') {
            this.toggleAmbient(settings.ambientEnabled);
          }
          if (typeof settings.volume === 'number') {
            this.volume = settings.volume;
            localStorage.setItem('volume', this.volume);
            document.getElementById('volume').value = this.volume;
            this.audio.volume = this.volume;
            this.ambientAudio.volume = this.volume;
          }
          if (settings.wallpapers) {
            CONFIG.wallpapers = settings.wallpapers.filter(wp => !this.isNWJS || this.fs.existsSync(wp));
            localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
          }
          if (settings.clickSound && (!this.isNWJS || this.fs.existsSync(settings.clickSound))) {
            localStorage.setItem('clickSound', settings.clickSound);
            this.audio.src = settings.clickSound;
          }
          if (settings.ambientSound && (!this.isNWJS || this.fs.existsSync(settings.ambientSound))) {
            localStorage.setItem('ambientSound', settings.ambientSound);
            this.ambientAudio.src = settings.ambientSound;
            if (this.ambientEnabled) this.ambientAudio.play().catch(err => console.error('Ambient playback failed:', err));
          }
          errorEl.style.display = 'none';
          this.showNotification(this.currentLang === 'th' ? 'นำเข้าการตั้งค่าเรียบร้อย!' : 'Settings imported!');
        } catch (err) {
          errorEl.style.display = 'block';
        }
      };
      reader.readAsText(file);
    } else {
      errorEl.style.display = 'block';
    }
  }

  init() {
    // System theme detection
    if (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.currentTheme = 'dark';
    }

    // Initialize wallpapers
    const savedWallpapers = localStorage.getItem('wallpapers');
    if (savedWallpapers) {
      CONFIG.wallpapers = JSON.parse(savedWallpapers).filter(wp => !this.isNWJS || this.fs.existsSync(wp));
    }

    // Initialize ambient sound (placeholder; user can upload custom)
    if (!this.ambientSoundURL && this.isNWJS) {
      const defaultAmbient = this.path.join(nw.App.dataPath, 'ambient-default.mp3');
      if (!this.fs.existsSync(defaultAmbient)) {
        // Placeholder: Assume a default ambient sound is copied to dataPath
        // For demo, leave empty or provide a sample audio file
      } else {
        this.ambientSoundURL = defaultAmbient;
        localStorage.setItem('ambientSound', defaultAmbient);
      }
    }

    // Hide loading screen
    setTimeout(() => {
      gsap.to('#loading', { opacity: 0, duration: 0.5, onComplete: () => {
        document.getElementById('loading').classList.add('hidden');
      }});
    }, 1000);

    // Initialize theme
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.setTheme(this.currentTheme);
    document.getElementById('sound-toggle').checked = this.soundEnabled;
    document.getElementById('ambient-toggle').checked = this.ambientEnabled;
    document.getElementById('volume').value = this.volume;
    this.audio.volume = this.volume;
    this.audio.muted = !this.soundEnabled;
    this.ambientAudio.volume = this.volume;
    if (this.ambientSoundURL && this.ambientEnabled) {
      this.ambientAudio.src = this.ambientSoundURL;
      this.ambientAudio.play().catch(err => console.error('Ambient playback failed:', err));
    }

    // Initialize sound
    if (this.clickSoundURL && (!this.isNWJS || this.fs.existsSync(this.clickSoundURL))) {
      this.audio.src = this.clickSoundURL;
    }

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
    document.addEventListener('mousemove', e => {
      gsap.to(cursor, { x: e.clientX - 10, y: e.clientY - 10, duration: 0.1 });
      trails.forEach((trail, i) => {
        gsap.to(trail, {
          x: e.clientX - 5,
          y: e.clientY - 5,
          duration: 0.2 + i * 0.05,
          delay: i * 0.03,
          opacity: 0.5 - i * 0.1
        });
      });
    });

    // Event listeners
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
      content.addEventListener('mousemove', e => {
        const rect = content.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(content, {
          rotationY: x / 100,
          rotationX: -y / 100,
          duration: 0.3,
          ease: 'power3.out'
        });
      });
      content.addEventListener('mouseleave', () => {
        gsap.to(content, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.3,
          ease: 'power3.out'
        });
      });
    });

    // Action-based event delegation
    document.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action) {
        const handlers = {
          toggleLang: () => this.toggleLang(),
          toggleTheme: () => this.toggleTheme(),
          toggleSound: () => this.toggleSound(e.target),
          toggleAmbient: () => this.toggleAmbient(e.target),
          playSoundAndAlert: () => this.playSoundAndAlert(),
          exportSettings: () => this.exportSettings()
        };
        handlers[action]?.();
      }
    });

    document.addEventListener('change', e => {
      const action = e.target.dataset.action;
      const handlers = {
        setLang: () => this.setLang(e.target.value),
        setVolume: () => this.setVolume(e),
        addBackground: () => this.addBackground(e),
        setClickSound: () => this.setClickSound(e),
        importSettings: () => this.importSettings(e)
      };
      handlers[action]?.();
    });

    // NW.js system tray
    if (this.isNWJS) {
      const tray = new nw.Tray({
        title: 'NexaGUI',
        icon: 'assets/icon.png'
      });
      const menu = new nw.Menu();
      menu.append(new nw.MenuItem({
        label: this.currentLang === 'th' ? 'เปิด' : 'Open',
        click: () => nw.Window.get().show()
      }));
      menu.append(new nw.MenuItem({
        label: this.currentLang === 'th' ? 'ออก' : 'Quit',
        click: () => nw.App.quit()
      }));
      tray.menu = menu;

      const win = nw.Window.get();
      win.on('close', () => {
        localStorage.setItem('windowState', JSON.stringify({ width: win.width, height: win.height }));
        win.hide(); // Minimize to tray
      });
      const savedState = localStorage.getItem('windowState');
      if (savedState) {
        const { width, height } = JSON.parse(savedState);
        win.resizeTo(width, height);
      }
    }

    // Initialize plugins
    PLUGINS.init(this);

    // Initial animations
    gsap.from('.sidebar', { x: -250, opacity: 0, duration: 1, ease: 'power3.out' });
    gsap.from('.quick-settings', { y: -50, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.tab-content.active', { opacity: 0, x: 20, duration: 1, delay: 0.4, ease: 'power3.out' });
  }
}

// Initialize app
const app = new AppState();
app.init();