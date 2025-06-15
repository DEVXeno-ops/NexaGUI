const PLUGINS = {
  register: [],
  init(app) {
    this.register.forEach(plugin => {
      if (typeof plugin.init === 'function') {
        plugin.init(app);
      }
    });
  }
};

// Clock plugin
PLUGINS.register.push({
  init(app) {
    const updateClock = () => {
      const now = new Date();
      const options = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Asia/Bangkok'
      };
      const time = now.toLocaleString(app.currentLang === 'th' ? 'th-TH' : 'en-US', options);
      document.getElementById('clock').textContent = time;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }
});

// Typed.js welcome animation
PLUGINS.register.push({
  init(app) {
    const typedEl = document.querySelector('.typed');
    if (typedEl) {
      new Typed(typedEl, {
        strings: app.currentLang === 'th' ? CONFIG.typedConfig.strings : ['🔥 Welcome to NexaGUI! 🔥', 'Experience the Future of UI', 'Customize Your Way'],
        typeSpeed: CONFIG.typedConfig.typeSpeed,
        backSpeed: CONFIG.typedConfig.backSpeed,
        loop: CONFIG.typedConfig.loop
      });
    }
  }
});

// Wallpaper carousel
PLUGINS.register.push({
  init(app) {
    let currentWallpaper = 0;
    const changeWallpaper = () => {
      if (CONFIG.wallpapers.length > 0) {
        document.body.style.backgroundImage = `url(${CONFIG.wallpapers[currentWallpaper]})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        gsap.fromTo(document.body, { opacity: 0.7 }, { opacity: 1, duration: 1, ease: 'power2.out' });
        currentWallpaper = (currentWallpaper + 1) % CONFIG.wallpapers.length;
      }
    };
    setInterval(changeWallpaper, 30000); // Change every 30s
    changeWallpaper();
  }
});

// Notification center
PLUGINS.register.push({
  init(app) {
    app.showNotification = (message) => {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = message;
      document.getElementById('notification-center').appendChild(notification);
      gsap.fromTo(notification, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      setTimeout(() => {
        gsap.to(notification, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.in', onComplete: () => notification.remove() });
      }, 3000);
    };
  }
});