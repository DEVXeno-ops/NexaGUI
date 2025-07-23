// js/app.js
import { CONFIG } from './config.js';
import { PLUGINS } from './plugins.js';

class App {
  constructor() {
    this.isNWJS = typeof nw !== 'undefined';
    this.fs = this.isNWJS ? require('fs') : null;
    this.path = this.isNWJS ? require('path') : null;
    this.lang = localStorage.getItem('lang') || CONFIG.defaultLang;
    this.theme = localStorage.getItem('theme') || CONFIG.defaultTheme;
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.ambientEnabled = localStorage.getItem('ambientEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('volume') || '1');
    this.clickSound = localStorage.getItem('clickSound') || '';
    this.ambientSound = localStorage.getItem('ambientSound') || '';
    this.wallpapers = JSON.parse(localStorage.getItem('wallpapers') || '[]');
    this.audio = document.getElementById('click-sound');
    this.ambientAudio = document.getElementById('ambient-sound');
    this.tabs = document.querySelectorAll('.sidebar-item');
    this.panels = document.querySelectorAll('.tab-content');
    this.cleanup = new Set();
    this.urls = new Set();
    this.cursor = null;
    this.trail = [];
  }

  initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) {
      document.body.classList.add('no-custom-cursor');
      return;
    }

    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    document.body.appendChild(this.cursor);
    document.body.classList.add('no-custom-cursor');

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'custom-cursor trail';
      document.body.appendChild(dot);
      this.trail.push(dot);
    }

    const updateCursor = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const isInteractive = e.target.closest('button, [role="button"], input, select');
      this.cursor.classList.toggle('interactive', !!isInteractive);
      if (typeof gsap !== 'undefined') {
        gsap.to(this.cursor, { x: x - 7, y: y - 7, duration: 0.1 });
        this.trail.forEach((dot, i) => {
          gsap.to(dot, { x: x - 3, y: y - 3, duration: 0.15 + i * 0.05, delay: i * 0.02 });
        });
      } else {
        this.cursor.style.transform = `translate(${x - 7}px, ${y - 7}px)`;
        this.trail.forEach((dot, i) => {
          dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
          dot.style.transitionDelay = `${i * 0.02}s`;
        });
      }
    };

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
      this.trail.forEach(dot => (dot.style.opacity = '0.3'));
    });
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.trail.forEach(dot => (dot.style.opacity = '0'));
    });

    this.cleanup.add(() => {
      document.removeEventListener('mousemove', updateCursor);
      this.cursor.remove();
      this.trail.forEach(dot => dot.remove());
    });
  }

  switchTab(id) {
    try {
      this.panels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
        p.setAttribute('hidden', '');
      });
      this.tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      const tab = document.getElementById(`tab-${id}`);
      const panel = document.getElementById(`${id}-panel`);
      if (tab && panel) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        panel.classList.add('active');
        panel.setAttribute('aria-hidden', 'false');
        panel.removeAttribute('hidden');
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(panel, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.4 });
        }
        tab.focus();
      }
    } catch (err) {
      console.error('Tab switch error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  setLang(lang) {
    try {
      if (!CONFIG.langData[lang]) lang = CONFIG.defaultLang;
      this.lang = lang;
      localStorage.setItem('lang', lang);
      document.documentElement.setAttribute('lang', lang);
      Object.entries(CONFIG.langData[lang]).forEach(([id, text]) => {
        if (id === 'notifications') return;
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      });
      document.getElementById('lang').value = lang;
      if (this.cleanup.has('typed')) {
        this.cleanup.get('typed')();
        this.cleanup.delete('typed');
      }
      if (typeof Typed !== 'undefined') {
        const typed = new Typed('.typed', {
          strings: CONFIG.typedConfig.strings[lang],
          typeSpeed: CONFIG.typedConfig.typeSpeed,
          backSpeed: CONFIG.typedConfig.backSpeed,
          loop: CONFIG.typedConfig.loop
        });
        this.cleanup.add(() => typed.destroy(), 'typed');
      }
      this.notify(CONFIG.langData[lang].notifications.langChanged);
    } catch (err) {
      console.error('Language set error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  toggleTheme() {
    try {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', this.theme);
      document.documentElement.setAttribute('data-theme', this.theme);
      document.querySelector('[data-action="toggle-theme"]').setAttribute('aria-pressed', this.theme === 'dark');
      this.notify(CONFIG.langData[this.lang].notifications.themeChanged);
    } catch (err) {
      console.error('Theme toggle error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  toggleSound() {
    try {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('soundEnabled', this.soundEnabled);
      document.querySelector('[data-action="toggle-sound"]').setAttribute('aria-pressed', this.soundEnabled);
      document.getElementById('sound-toggle').checked = this.soundEnabled;
      this.notify(CONFIG.langData[this.lang].notifications[this.soundEnabled ? 'soundToggledOn' : 'soundToggledOff']);
    } catch (err) {
      console.error('Sound toggle error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  toggleAmbient() {
    try {
      this.ambientEnabled = !this.ambientEnabled;
      localStorage.setItem('ambientEnabled', this.ambientEnabled);
      document.querySelector('[data-action="toggle-ambient"]').setAttribute('aria-pressed', this.ambientEnabled);
      document.getElementById('ambient-toggle').checked = this.ambientEnabled;
      if (this.ambientEnabled && this.ambientAudio.src) {
        this.ambientAudio.play().catch(() => this.notify(CONFIG.langData[this.lang].notifications.error, 'error'));
      } else {
        this.ambientAudio.pause();
      }
      this.notify(CONFIG.langData[this.lang].notifications[this.ambientEnabled ? 'ambientToggledOn' : 'ambientToggledOff']);
    } catch (err) {
      console.error('Ambient toggle error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  setVolume(value) {
    try {
      this.volume = parseFloat(value);
      localStorage.setItem('volume', this.volume);
      this.audio.volume = this.volume;
      this.ambientAudio.volume = this.volume;
      this.notify(CONFIG.langData[this.lang].notifications.volumeAdjusted);
    } catch (err) {
      console.error('Volume set error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  setClickSound(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('sound-error');
      if (!file || !file.type.startsWith('audio/')) {
        errorEl?.removeAttribute('hidden');
        this.notify(CONFIG.langData[this.lang].notifications.invalidFile, 'error');
        return;
      }
      errorEl?.setAttribute('hidden', '');

      if (this.isNWJS) {
        const reader = new FileReader();
        reader.onload = () => {
          const filePath = this.path.join(nw.App.dataPath, `click-${Date.now()}.${file.name.split('.').pop()}`);
          this.fs.writeFileSync(filePath, Buffer.from(reader.result));
          this.clickSound = filePath;
          localStorage.setItem('clickSound', filePath);
          this.audio.src = filePath;
          this.audio.load();
          this.notify(CONFIG.langData[this.lang].notifications.clickSoundSet);
        };
        reader.readAsArrayBuffer(file);
      } else {
        const url = URL.createObjectURL(file);
        this.clickSound = url;
        localStorage.setItem('clickSound', url);
        this.audio.src = url;
        this.audio.load();
        this.urls.add(url);
        this.notify(CONFIG.langData[this.lang].notifications.clickSoundSet);
      }
    } catch (err) {
      console.error('Click sound set error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  setAmbientSound(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('ambient-sound-error');
      if (!file || !file.type.startsWith('audio/')) {
        errorEl?.removeAttribute('hidden');
        this.notify(CONFIG.langData[this.lang].notifications.invalidFile, 'error');
        return;
      }
      errorEl?.setAttribute('hidden', '');

      if (this.isNWJS) {
        const reader = new FileReader();
        reader.onload = () => {
          const filePath = this.path.join(nw.App.dataPath, `ambient-${Date.now()}.${file.name.split('.').pop()}`);
          this.fs.writeFileSync(filePath, Buffer.from(reader.result));
          this.ambientSound = filePath;
          localStorage.setItem('ambientSound', filePath);
          this.ambientAudio.src = filePath;
          this.ambientAudio.load();
          if (this.ambientEnabled) this.ambientAudio.play();
          this.notify(CONFIG.langData[this.lang].notifications.ambientSoundSet);
        };
        reader.readAsArrayBuffer(file);
      } else {
        const url = URL.createObjectURL(file);
        this.ambientSound = url;
        localStorage.setItem('ambientSound', url);
        this.ambientAudio.src = url;
        this.ambientAudio.load();
        this.urls.add(url);
        if (this.ambientEnabled) this.ambientAudio.play();
        this.notify(CONFIG.langData[this.lang].notifications.ambientSoundSet);
      }
    } catch (err) {
      console.error('Ambient sound set error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  setBackground(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('bg-error');
      if (!file || !file.type.startsWith('image/')) {
        errorEl?.removeAttribute('hidden');
        this.notify(CONFIG.langData[this.lang].notifications.invalidFile, 'error');
        return;
      }
      errorEl?.setAttribute('hidden', '');

      if (this.isNWJS) {
        const reader = new FileReader();
        reader.onload = () => {
          const filePath = this.path.join(nw.App.dataPath, `bg-${Date.now()}.${file.name.split('.').pop()}`);
          this.fs.writeFileSync(filePath, Buffer.from(reader.result));
          this.wallpapers.push(filePath);
          localStorage.setItem('wallpapers', JSON.stringify(this.wallpapers));
          localStorage.setItem('wallpaperIndex', (this.wallpapers.length - 1).toString());
          this.notify(CONFIG.langData[this.lang].notifications.backgroundAdded);
        };
        reader.readAsArrayBuffer(file);
      } else {
        const url = URL.createObjectURL(file);
        this.wallpapers.push(url);
        localStorage.setItem('wallpapers', JSON.stringify(this.wallpapers));
        localStorage.setItem('wallpaperIndex', (this.wallpapers.length - 1).toString());
        this.urls.add(url);
        this.notify(CONFIG.langData[this.lang].notifications.backgroundAdded);
      }
    } catch (err) {
      console.error('Background set error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  exportSettings() {
    try {
      const settings = {
        lang: this.lang,
        theme: this.theme,
        soundEnabled: this.soundEnabled,
        ambientEnabled: this.ambientEnabled,
        volume: this.volume,
        clickSound: this.clickSound,
        ambientSound: this.ambientSound,
        wallpapers: this.wallpapers,
        wallpaperIndex: localStorage.getItem('wallpaperIndex')
      };
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nexagui-settings.json';
      a.click();
      this.urls.add(url);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.urls.delete(url);
      }, 1000);
      this.notify(CONFIG.langData[this.lang].notifications.settingsExported);
    } catch (err) {
      console.error('Settings export error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  importSettings(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('import-error');
      if (!file || !file.name.endsWith('.json')) {
        errorEl?.removeAttribute('hidden');
        this.notify(CONFIG.langData[this.lang].notifications.invalidFile, 'error');
        return;
      }
      errorEl?.setAttribute('hidden', '');

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const settings = JSON.parse(reader.result);
          this.lang = settings.lang || CONFIG.defaultLang;
          this.theme = settings.theme || CONFIG.defaultTheme;
          this.soundEnabled = settings.soundEnabled !== false;
          this.ambientEnabled = settings.ambientEnabled || false;
          this.volume = parseFloat(settings.volume) || 1;
          this.clickSound = settings.clickSound || '';
          this.ambientSound = settings.ambientSound || '';
          this.wallpapers = settings.wallpapers || [];
          localStorage.setItem('lang', this.lang);
          localStorage.setItem('theme', this.theme);
          localStorage.setItem('soundEnabled', this.soundEnabled);
          localStorage.setItem('ambientEnabled', this.ambientEnabled);
          localStorage.setItem('volume', this.volume);
          localStorage.setItem('clickSound', this.clickSound);
          localStorage.setItem('ambientSound', this.ambientSound);
          localStorage.setItem('wallpapers', JSON.stringify(this.wallpapers));
          localStorage.setItem('wallpaperIndex', settings.wallpaperIndex || '0');
          this.setLang(this.lang);
          document.documentElement.setAttribute('data-theme', this.theme);
          document.querySelector('[data-action="toggle-theme"]').setAttribute('aria-pressed', this.theme === 'dark');
          document.querySelector('[data-action="toggle-sound"]').setAttribute('aria-pressed', this.soundEnabled);
          document.getElementById('sound-toggle').checked = this.soundEnabled;
          document.querySelector('[data-action="toggle-ambient"]').setAttribute('aria-pressed', this.ambientEnabled);
          document.getElementById('ambient-toggle').checked = this.ambientEnabled;
          document.getElementById('volume').value = this.volume;
          this.audio.volume = this.volume;
          this.ambientAudio.volume = this.volume;
          if (this.clickSound) {
            this.audio.src = this.clickSound;
            this.audio.load();
          }
          if (this.ambientSound) {
            this.ambientAudio.src = this.ambientSound;
            this.ambientAudio.load();
            if (this.ambientEnabled) this.ambientAudio.play();
          }
          this.notify(CONFIG.langData[this.lang].notifications.settingsImported);
        } catch (err) {
          console.error('Settings import error:', err);
          this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Settings import error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  playAction() {
    try {
      if (this.soundEnabled && this.audio.src) {
        this.audio.play();
      }
      this.notify(CONFIG.langData[this.lang].notifications.clickSoundSet);
    } catch (err) {
      console.error('Play action error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  initDragAndDrop() {
    const inputs = ['bg', 'sound', 'ambient-sound', 'import-settings'];
    inputs.forEach(id => {
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label) return;
      label.addEventListener('dragover', e => {
        e.preventDefault();
        label.classList.add('glow');
      });
      label.addEventListener('dragleave', () => label.classList.remove('glow'));
      label.addEventListener('drop', e => {
        e.preventDefault();
        label.classList.remove('glow');
        const file = e.dataTransfer.files[0];
        const input = document.getElementById(id);
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  init() {
    try {
      document.documentElement.setAttribute('data-theme', this.theme);
      document.querySelector('[data-action="toggle-theme"]').setAttribute('aria-pressed', this.theme === 'dark');
      document.querySelector('[data-action="toggle-sound"]').setAttribute('aria-pressed', this.soundEnabled);
      document.getElementById('sound-toggle').checked = this.soundEnabled;
      document.querySelector('[data-action="toggle-ambient"]').setAttribute('aria-pressed', this.ambientEnabled);
      document.getElementById('ambient-toggle').checked = this.ambientEnabled;
      document.getElementById('volume').value = this.volume;
      document.getElementById('lang').value = this.lang;
      this.audio.volume = this.volume;
      this.ambientAudio.volume = this.volume;
      if (this.clickSound) {
        this.audio.src = this.clickSound;
        this.audio.load();
      }
      if (this.ambientSound) {
        this.ambientAudio.src = this.ambientSound;
        this.ambientAudio.load();
        if (this.ambientEnabled) this.ambientAudio.play();
      }

      this.setLang(this.lang);
      if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', CONFIG.particlesConfig);
      }

      this.tabs.forEach(tab => {
        const handler = () => this.switchTab(tab.dataset.tab);
        tab.addEventListener('click', handler);
        tab.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
        this.cleanup.add(() => {
          tab.removeEventListener('click', handler);
          tab.removeEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') handler();
          });
        });
      });

      document.querySelector('[data-action="toggle-theme"]').addEventListener('click', () => this.toggleTheme());
      document.querySelector('[data-action="toggle-lang"]').addEventListener('click', () => this.setLang(this.lang === 'th' ? 'en' : 'th'));
      document.querySelector('[data-action="toggle-sound"]').addEventListener('click', () => this.toggleSound());
      document.querySelector('[data-action="toggle-ambient"]').addEventListener('click', () => this.toggleAmbient());
      document.getElementById('lang').addEventListener('change', e => this.setLang(e.target.value));
      document.getElementById('volume').addEventListener('input', e => this.setVolume(e.target.value));
      document.getElementById('bg').addEventListener('change', e => this.setBackground(e));
      document.getElementById('sound').addEventListener('change', e => this.setClickSound(e));
      document.getElementById('ambient-sound').addEventListener('change', e => this.setAmbientSound(e));
      document.getElementById('export-settings').addEventListener('click', () => this.exportSettings());
      document.getElementById('import-settings').addEventListener('change', e => this.importSettings(e));
      document.getElementById('play-action').addEventListener('click', () => this.playAction());

      document.querySelectorAll('.file-input').forEach(label => {
        label.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById(label.getAttribute('for')).click();
          }
        });
      });

      this.initCursor();
      this.initDragAndDrop();
      PLUGINS.init(this);

      setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('hidden');
      }, 1500);
    } catch (err) {
      console.error('App init error:', err);
      this.notify(CONFIG.langData[this.lang].notifications.error, 'error');
    }
  }

  cleanup() {
    this.cleanup.forEach(fn => fn());
    this.cleanup.clear();
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.urls.clear();
    this.audio.pause();
    this.ambientAudio.pause();
    document.body.classList.remove('no-custom-cursor');
  }
}

const app = new App();
app.init();