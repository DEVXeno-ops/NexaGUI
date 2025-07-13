const PLUGINS = {
  register: [],
  /**
   * เรียกใช้ init ของ plugin ทั้งหมด และจับ error หากเกิดปัญหา
   * @param {AppState} app 
   */
  init(app) {
    this.register.forEach(plugin => {
      if (typeof plugin.init === 'function') {
        try {
          plugin.init(app);
        } catch (err) {
          console.error(`Plugin initialization failed: ${err.message}`, err);
        }
      }
    });
  }
};

// Plugin: นาฬิกา
PLUGINS.register.push({
  init(app) {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;

    const updateClock = () => {
      try {
        const now = new Date();
        const options = {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false, timeZone: 'Asia/Bangkok'
        };
        clockEl.textContent = now.toLocaleString(app.currentLang === 'th' ? 'th-TH' : 'en-US', options);
      } catch (err) {
        console.error(`Clock update failed: ${err.message}`, err);
      }
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);

    // ลงทะเบียนฟังก์ชัน cleanup สำหรับล้าง interval
    app.otherEventListeners.set('clock-interval', () => clearInterval(intervalId));
  }
});

// Plugin: Typed.js animation แสดงข้อความต้อนรับ
PLUGINS.register.push({
  init(app) {
    let typedInstance = null;
    const typedEl = document.querySelector('.typed');
    if (!typedEl) return;

    const initTyped = () => {
      try {
        if (typedInstance) {
          typedInstance.destroy();
          typedInstance = null;
        }
        typedInstance = new Typed(typedEl, {
          strings: CONFIG.typedConfig.strings[app.currentLang] || CONFIG.typedConfig.strings.th,
          typeSpeed: CONFIG.typedConfig.typeSpeed,
          backSpeed: CONFIG.typedConfig.backSpeed,
          loop: CONFIG.typedConfig.loop
        });
      } catch (err) {
        console.error(`Typed.js initialization failed: ${err.message}`, err);
      }
    };

    initTyped();

    // ลงทะเบียนสำหรับเรียกใหม่เมื่อต้องอัปเดตภาษา
    app.otherEventListeners.set('typed', initTyped);
  }
});

// Plugin: สลับภาพพื้นหลังแบบ carousel
PLUGINS.register.push({
  init(app) {
    let currentWallpaper = 0;

    const changeWallpaper = () => {
      try {
        const wallpapers = CONFIG.wallpapers.length > 0 ? CONFIG.wallpapers : CONFIG.defaultWallpapers;
        if (wallpapers.length === 0) return;

        currentWallpaper = currentWallpaper % wallpapers.length;
        const url = wallpapers[currentWallpaper];
        const img = new Image();

        img.onload = () => {
          document.body.style.backgroundImage = `url(${url})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
          gsap.fromTo(document.body, { opacity: 0.7 }, { opacity: 1, duration: 1, ease: 'power2.out' });
        };

        img.onerror = () => {
          // ลบ wallpaper ที่โหลดไม่ได้ เพื่อป้องกัน error ซ้ำ
          if (CONFIG.wallpapers.includes(url)) {
            CONFIG.wallpapers = CONFIG.wallpapers.filter(wp => wp !== url);
            localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
          }
          console.warn(`Failed to load wallpaper: ${url}`);
        };

        img.src = url;

        currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
      } catch (err) {
        console.error(`Wallpaper change failed: ${err.message}`, err);
      }
    };

    changeWallpaper();

    const intervalId = setInterval(changeWallpaper, 30000);
    app.otherEventListeners.set('wallpaper-interval', () => clearInterval(intervalId));
  }
});

// Plugin: ระบบ Notification Center
PLUGINS.register.push({
  init(app) {
    const notificationCenter = document.getElementById('notification-center');
    if (!notificationCenter) return;

    const notificationQueue = [];
    const maxNotifications = 3;
    let isAnimating = false;

    /**
     * แสดง notification ถัดไปจากคิว (ถ้ามี)
     */
    const showNextNotification = () => {
      if (notificationQueue.length === 0 || isAnimating) return;
      isAnimating = true;

      const msg = notificationQueue[0];
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = msg;
      notificationCenter.appendChild(notification);

      gsap.fromTo(notification, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

      setTimeout(() => {
        gsap.to(notification, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            notification.remove();
            notificationQueue.shift();
            isAnimating = false;
            showNextNotification();
          }
        });
      }, 3000);
    };

    // ฟังก์ชันสำหรับเรียกแจ้งเตือนจากภายนอก
    app.showNotification = (message) => {
      try {
        if (!message || typeof message !== 'string') return;
        if (notificationQueue.length >= maxNotifications) {
          // ถ้าคิวเต็ม ลบ notification ตัวเก่าสุดก่อนเพิ่มใหม่
          notificationQueue.shift();
        }
        notificationQueue.push(message);
        showNextNotification();
      } catch (err) {
        console.error(`Notification failed: ${err.message}`, err);
      }
    };
  }
});
