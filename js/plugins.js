// js/plugins.js
export const PLUGINS = {
  init(app) {
    this.notification(app);
    this.clock(app);
    this.wallpaper(app);
    this.tray(app);
  },

  notification(app) {
    app.notify = (message, type = 'info') => {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.setAttribute('role', 'alert');
      notification.textContent = message;
      document.getElementById('notification-center').appendChild(notification);

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(notification, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
        setTimeout(() => {
          gsap.to(notification, { opacity: 0, y: 15, duration: 0.4, onComplete: () => notification.remove() });
        }, 3000);
      } else {
        notification.style.opacity = '1';
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 400);
        }, 3000);
      }

      if (app.isNWJS && typeof Notification !== 'undefined') {
        new Notification('NexaGUI', { body: message, icon: 'assets/icon.png' });
      }
    };
  },

  clock(app) {
    const update = () => {
      const clock = document.getElementById('clock');
      if (!clock) return;
      const now = new Date();
      const timeString = now.toLocaleTimeString(app.lang === 'th' ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      clock.textContent = timeString;
      clock.setAttribute('datetime', now.toISOString());
    };

    update();
    const interval = setInterval(update, 1000);
    app.cleanup.add(() => clearInterval(interval));
  },

  wallpaper(app) {
    const update = () => {
      const index = parseInt(localStorage.getItem('wallpaperIndex') || '0', 10);
      const wallpaper = app.wallpapers[index] || '';
      document.body.style.backgroundImage = wallpaper ? `url(${wallpaper})` : '';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    };

    update();
    const interval = setInterval(() => {
      let index = parseInt(localStorage.getItem('wallpaperIndex') || '0', 10);
      index = (index + 1) % (app.wallpapers.length || 1);
      localStorage.setItem('wallpaperIndex', index.toString());
      update();
    }, 60000);

    app.cleanup.add(() => clearInterval(interval));
  },

  tray(app) {
    if (!app.isNWJS) return;
    const tray = new nw.Tray({
      title: 'NexaGUI',
      icon: 'assets/icon.png',
      tooltip: 'NexaGUI Control'
    });

    const menu = new nw.Menu();
    menu.append(new nw.MenuItem({
      label: app.lang === 'th' ? 'สลับธีม' : 'Toggle Theme',
      click: () => app.toggleTheme()
    }));
    menu.append(new nw.MenuItem({
      label: app.lang === 'th' ? 'ออก' : 'Quit',
      click: () => nw.App.quit()
    }));

    tray.menu = menu;
    app.cleanup.add(() => tray.remove());
  }
};