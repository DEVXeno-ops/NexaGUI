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

    // ใช้ Map เก็บ event listener แยก element กับชื่ออื่น ๆ
    this.elementEventListeners = new Map(); // key: HTMLElement, value: {type, handler}[]
    this.otherEventListeners = new Map();   // key: string, value: cleanup function

    this.tray = null;

    // ฟังก์ชันแสดง notification
    this.showNotification = (msg) => {
      if (!msg) return;
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
  }

  // ลบ event listeners ทั้งหมดที่เพิ่มไว้ เพื่อป้องกัน memory leak
  cleanup() {
    // ลบ event listeners ที่ผูกกับ element
    this.elementEventListeners.forEach((listeners, element) => {
      listeners.forEach(({ type, handler }) => {
        element.removeEventListener(type, handler);
      });
    });
    this.elementEventListeners.clear();

    // ลบ event listeners อื่น ๆ เช่น document event
    this.otherEventListeners.forEach(cleanupFn => {
      if (typeof cleanupFn === 'function') cleanupFn();
    });
    this.otherEventListeners.clear();

    // หยุด animation ของ gsap เฉพาะ elements ที่เราใช้จริง ๆ
    gsap.killTweensOf([...this.tabContents, ...this.tabs]);
  }

  // สลับแท็บ พร้อม animation และปรับ aria attribute
  switchTab(id) {
    try {
      this.cleanup();

      this.tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.tabIndex = 0;
      });

      this.tabContents.forEach(content => {
        content.classList.remove('active');
        content.setAttribute('hidden', 'true');
      });

      const tab = document.getElementById(`tab-${id}`);
      const content = document.getElementById(id);
      if (tab && content) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.tabIndex = -1;
        content.classList.add('active');
        content.removeAttribute('hidden');
        gsap.from(content, { opacity: 0, x: 20, duration: 0.5, ease: 'power3.out' });
        tab.focus();
      }
    } catch (err) {
      console.error('Tab switch failed:', err);
    }
  }

  // เปลี่ยนภาษา พร้อมอัปเดต UI และ localStorage
  setLang(lang) {
    try {
      if (!CONFIG.langData[lang]) lang = CONFIG.defaultLang || 'en';
      this.currentLang = lang;
      localStorage.setItem('lang', lang);

      const data = CONFIG.langData[lang];
      Object.keys(data).forEach(id => {
        if (id === 'notifications') return; // skip notifications
        const el = document.getElementById(id);
        if (el) el.textContent = data[id];
      });

      const langSelect = document.getElementById('lang');
      if (langSelect) langSelect.value = lang;

      // เคลียร์ typed.js ถ้ามี (ฟังก์ชัน cleanup ใน map)
      if (this.otherEventListeners.has('typed')) {
        this.otherEventListeners.get('typed')();
      }

      this.updateTrayMenu?.(); // เรียกถ้ามีฟังก์ชันนี้ใน context

      this.showNotification(data.notifications?.langChanged || 'Language changed');
    } catch (err) {
      console.error('Language change failed:', err);
    }
  }

  // ตัวอย่างการเพิ่ม event listener พร้อมเก็บ reference เพื่อ cleanup ทีหลัง
  addElementEventListener(element, type, handler) {
    element.addEventListener(type, handler);

    if (!this.elementEventListeners.has(element)) {
      this.elementEventListeners.set(element, []);
    }
    this.elementEventListeners.get(element).push({ type, handler });
  }

  init() {
    try {
      // เพิ่ม event listener สำหรับ sidebar tab
      this.tabs.forEach(tab => {
        const handler = () => this.switchTab(tab.dataset.tab);

        this.addElementEventListener(tab, 'click', handler);
        this.addElementEventListener(tab, 'keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
      });

      // event listener สำหรับ custom cursor ตามเมาส์
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

      // โหลดการตั้งค่าพื้นฐานอื่น ๆ (เสียง, ธีม ฯลฯ) ที่นี่

    } catch (err) {
      console.error('App initialization failed:', err);
    }
  }

  // เพิ่มภาพพื้นหลัง (background) โดยรองรับทั้ง NW.js และเบราว์เซอร์ปกติ
  addBackground(e) {
    try {
      const file = e.target.files[0];
      const errorEl = document.getElementById('bg-error');
      if (errorEl) errorEl.hidden = true;

      if (!file || !file.type.startsWith('image/')) {
        if (errorEl) errorEl.hidden = false;
        return;
      }

      if (this.isNWJS) {
        // บันทึกไฟล์แบบ NW.js
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const ext = file.name.split('.').pop();
            const filePath = this.path.join(nw.App.dataPath, `bg-${Date.now()}.${ext}`);
            this.fs.writeFileSync(filePath, Buffer.from(reader.result));
            CONFIG.wallpapers = CONFIG.wallpapers || [];
            CONFIG.wallpapers.push(filePath);
            localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
            this.showNotification(CONFIG.langData[this.currentLang].notifications.backgroundAdded);
          } catch (err) {
            if (errorEl) errorEl.hidden = false;
            console.error('Background save failed:', err);
          }
        };
        reader.onerror = () => {
          if (errorEl) errorEl.hidden = false;
        };
        reader.readAsArrayBuffer(file);
      } else {
        // ใช้ Object URL ใน browser
        const url = URL.createObjectURL(file);
        CONFIG.wallpapers = CONFIG.wallpapers || [];
        CONFIG.wallpapers.push(url);
        localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
        this.showNotification(CONFIG.langData[this.currentLang].notifications.backgroundAdded);

        // revoke URL หลัง 1 นาที ลดการรั่วไหลของหน่วยความจำ
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      console.error('Background add failed:', err);
    }
  }
}
