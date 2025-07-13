class AppState {
  constructor() {
    this.isNWJS = typeof nw !== 'undefined';
    this.fs = this.isNWJS ? require('fs') : null;
    this.path = this.isNWJS ? require('path') : null;

    this.currentLang = localStorage.getItem('lang') || (CONFIG?.defaultLang || 'en');
    this.currentTheme = localStorage.getItem('theme') || (CONFIG?.defaultTheme || 'light');
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.ambientEnabled = localStorage.getItem('ambientEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('volume') || '1');
    this.clickSoundURL = localStorage.getItem('clickSound') || '';
    this.ambientSoundURL = localStorage.getItem('ambientSound') || '';

    this.audio = document.getElementById('clickSound');
    this.ambientAudio = document.getElementById('ambientSound');

    this.tabs = document.querySelectorAll('.sidebar-item');
    this.tabContents = document.querySelectorAll('.tab-content');

    // ใช้ Map สำหรับ element event listeners แยกกับ string keys
    this.elementEventListeners = new Map(); // key: element, value: handler function
    this.otherEventListeners = new Map();   // key: string, value: cleanup function

    this.showNotification = (msg) => {
      if (!msg) return;
      // แยกฟังก์ชันแสดง notification
      if (this.isNWJS && nw && nw.Window) {
        try {
          nw.Window.get().showNotification(msg, {
            body: '',
            icon: 'assets/icon.png'
          });
        } catch {
          alert(msg);
        }
      } else {
        alert(msg);
      }
    };

    this.tray = null;
  }

  cleanup() {
    // ลบ event listener ที่ผูกกับ element
    this.elementEventListeners.forEach((handler, element) => {
      if (element && handler) {
        element.removeEventListener('click', handler);
        element.removeEventListener('keydown', handler);
      }
    });
    this.elementEventListeners.clear();

    // ลบ event listener แบบอื่น (เช่น document)
    this.otherEventListeners.forEach(cleanupFn => {
      if (typeof cleanupFn === 'function') cleanupFn();
    });
    this.otherEventListeners.clear();

    // kill gsap animations เฉพาะ elements ที่เราใช้งานจริง ๆ
    gsap.killTweensOf([...this.tabContents, ...this.tabs]);
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
        tab.focus(); // focus ช่วย accessibility
      }
    } catch (err) {
      console.error('Tab switch failed:', err);
    }
  }

  // ตัวอย่างแก้ไข setLang ให้ log error แบบเต็ม
  setLang(lang) {
    try {
      if (!CONFIG.langData[lang]) lang = CONFIG.defaultLang || 'en';
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      const data = CONFIG.langData[lang];
      Object.keys(data).forEach(id => {
        if (id === 'notifications') return;
        const el = document.getElementById(id);
        if (el) el.textContent = data[id];
      });
      const langSelect = document.getElementById('lang');
      if (langSelect) langSelect.value = lang;
      this.otherEventListeners.get('typed')?.();
      this.updateTrayMenu();
      this.showNotification(data.notifications.langChanged);
    } catch (err) {
      console.error('Language change failed:', err);
    }
  }

  // ตัวอย่างเพิ่ม event listener ด้วย map ชัดเจน
  init() {
    try {
      // ...code เดิม...

      // เพิ่ม event listener tab แบบรวม
      this.tabs.forEach(tab => {
        const handler = () => this.switchTab(tab.dataset.tab);
        tab.addEventListener('click', handler);
        tab.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
        this.elementEventListeners.set(tab, handler);
      });

      // เพิ่ม event listener mousemove กับ cleanup
      const moveCursor = e => {
        const ratio = window.devicePixelRatio || 1;
        const cursor = document.querySelector('.custom-cursor');
        const trails = document.querySelectorAll('.custom-cursor.trail');
        if (!cursor) return;
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
      this.otherEventListeners.set('cursor', () => document.removeEventListener('mousemove', moveCursor));

      // ...โหลดค่าอื่นๆ ต่อ...

    } catch (err) {
      console.error('App initialization failed:', err);
    }
  }

  // ตัวอย่างปรับฟังก์ชัน addBackground ให้ revoke URL หลังใช้งาน
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
        // NW.js แบบเดิม
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
            console.error('Background save failed:', err);
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
        // Revoke URL หลัง 1 นาทีเพื่อป้องกัน memory leak
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      console.error('Background add failed:', err);
    }
  }
}
