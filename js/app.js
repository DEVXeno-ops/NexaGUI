class AppState {
  constructor() {
    this.isNWJS = typeof nw !== 'undefined';
    this.currentLang = localStorage.getItem('lang') || CONFIG.defaultLang;
    this.currentTheme = localStorage.getItem('theme') || CONFIG.defaultTheme;
    this.clickSoundURL = localStorage.getItem('clickSound') || '';
    this.audio = document.getElementById('clickSound');
    this.tabs = document.querySelectorAll('.tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.eventListeners = new Map();
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
      gsap.from(content, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
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
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.getElementById('theme').value = theme;
    const particleColor = theme === 'dark' ? '#40c4ff' : '#0288d1';
    particlesJS('particles-js', {
      ...CONFIG.particlesConfig,
      particles: { ...CONFIG.particlesConfig.particles, color: { value: particleColor } }
    });
  }

  toggleLang() {
    this.currentLang = this.currentLang === 'th' ? 'en' : 'th';
    this.setLang(this.currentLang);
  }

  playSoundAndAlert() {
    if (this.audio.src) {
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
  }

  setClickSound(e) {
    const file = e.target.files[0];
    const errorEl = document.getElementById('sound-error');
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      this.audio.src = url;
      localStorage.setItem('clickSound', url);
      errorEl.style.display = 'none';
    } else {
      errorEl.style.display = 'block';
    }
  }

  changeBackground(e) {
    const file = e.target.files[0];
    const errorEl = document.getElementById('bg-error');
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      document.body.style.backgroundImage = `url(${url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      localStorage.setItem('bgImage', url);
      errorEl.style.display = 'none';
    } else {
      errorEl.style.display = 'block';
    }
  }

  init() {
    // Hide loading screen after initialization
    setTimeout(() => {
      gsap.to('#loading', { opacity: 0, duration: 0.5, onComplete: () => {
        document.getElementById('loading').classList.add('hidden');
      }});
    }, 1000);

    // Initialize theme
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    document.getElementById('theme').value = this.currentTheme;
    this.setTheme(this.currentTheme);

    // Initialize sound and background
    if (this.clickSoundURL) this.audio.src = this.clickSoundURL;
    if (localStorage.getItem('bgImage')) {
      const bg = localStorage.getItem('bgImage');
      document.body.style.backgroundImage = `url(${bg})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }

    // Initialize language
    this.setLang(this.currentLang);

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

    // Action-based event delegation
    document.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action) {
        const handlers = {
          toggleLang: () => this.toggleLang(),
          playSoundAndAlert: () => this.playSoundAndAlert()
        };
        handlers[action]?.();
      }
    });

    document.addEventListener('change', e => {
      const action = e.target.dataset.action;
      const handlers = {
        setLang: () => this.setLang(e.target.value),
        setTheme: () => this.setTheme(e.target.value),
        changeBackground: () => this.changeBackground(e),
        setClickSound: () => this.setClickSound(e)
      };
      handlers[action]?.();
    });

    // NW.js specific integrations
    if (this.isNWJS) {
      const win = nw.Window.get();
      win.on('close', () => {
        localStorage.setItem('windowState', JSON.stringify({ width: win.width, height: win.height }));
        win.close(true);
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
    gsap.from('header', { y: -50, opacity: 0, duration: 0.8, ease: 'power2.out' });
    gsap.from('.tabs', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' });
    gsap.from('.tab-content.active', { opacity: 0, y: 20, duration: 0.8, delay: 0.4, ease: 'power2.out' });
  }
}

// Initialize app
const app = new AppState();
app.init();