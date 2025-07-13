const PLUGINS = {
  register: [],
  init(app) {
    this.register.forEach(plugin => {
      if (typeof plugin.init === 'function') {
        try {
          plugin.init(app);
        } catch (err) {
          console.error(`Plugin initialization failed: ${err.message}`);
        }
      }
    });
  }
};

// Clock plugin
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
        console.error(`Clock update failed: ${err.message}`);
      }
    };
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    app.eventListeners.set('clock-interval', () => clearInterval(intervalId));
  }
});

// Typed.js welcome animation
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
        console.error(`Typed.js initialization failed: ${err.message}`);
      }
    };

    initTyped();
    app.eventListeners.set('typed', initTyped);
  }
});

// Wallpaper carousel
PLUGINS.register.push({
  init(app) {
    let currentWallpaper = 0;
    const changeWallpaper = () => {
      try {
        const wallpapers = CONFIG.wallpapers.length > 0 ? CONFIG.wallpapers : CONFIG.defaultWallpapers;
        if (wallpapers.length === 0) return;

        // แก้ไขกรณี wallpapers อาจเปลี่ยนระหว่างเรียกใช้
        currentWallpaper = currentWallpaper % wallpapers.length;

        const url = wallpapers[currentWallpaper];
        const img = new Image();
        img.src = url;
        img.onload = () => {
          document.body.style.backgroundImage = `url(${url})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
          gsap.fromTo(document.body, { opacity: 0.7 }, { opacity: 1, duration: 1, ease: 'power2.out' });
        };
        img.onerror = () => {
          // ลบ wallpaper ที่โหลดไม่ได้และอัปเดต localStorage
          if (CONFIG.wallpapers.includes(url)) {
            CONFIG.wallpapers = CONFIG.wallpapers.filter(wp => wp !== url);
            localStorage.setItem('wallpapers', JSON.stringify(CONFIG.wallpapers));
          }
        };
        currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
      } catch (err) {
        console.error(`Wallpaper change failed: ${err.message}`);
      }
    };

    changeWallpaper();
    const intervalId = setInterval(changeWallpaper, 30000);
    app.eventListeners.set('wallpaper-interval', () => clearInterval(intervalId));
  }
});

// Notification center
PLUGINS.register.push({
  init(app) {
    const notificationCenter = document.getElementById('notification-center');
    if (!notificationCenter) return;

    const notificationQueue = [];
    const maxNotifications = 3;
    let isAnimating = false;

    // ฟังก์ชันแสดง notification ทีละตัวอย่างสมูท
    const showNextNotification = () => {
      if (notificationQueue.length === 0 || isAnimating) return;
      isAnimating = true;
      const msg = notificationQueue[0];

      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = msg;
      notificationCenter.appendChild(notification);

      gsap.fromTo(notification, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });

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
            showNextNotification(); // แสดงตัวถัดไปถ้ามี
          }
        });
      }, 3000);
    };

    app.showNotification = (message) => {
      try {
        if (!message || typeof message !== 'string') return;
        if (notificationQueue.length >= maxNotifications) {
          // ถ้าคิวเต็มให้ลบตัวเก่าสุดก่อน
          notificationQueue.shift();
        }
        notificationQueue.push(message);
        showNextNotification();
      } catch (err) {
        console.error(`Notification failed: ${err.message}`);
      }
    };
  }
});
