// Configuration file for language data and settings
const CONFIG = {
  langData: {
    th: {
      title: 'เมนู GUI',
      welcome: '🔥 ยินดีต้อนรับ! 🔥',
      'tab-home': 'หน้าหลัก',
      'tab-settings': 'ตั้งค่า',
      'tab-about': 'เกี่ยวกับ',
      'setting-title': 'การตั้งค่า',
      'lang-label': 'ภาษา:',
      'theme-label': 'ธีม:',
      'bg-label': 'เปลี่ยนพื้นหลัง:',
      'sound-label': 'เสียงกดปุ่ม:'
    },
    en: {
      title: 'GUI Menu',
      welcome: '🔥 Welcome! 🔥',
      'tab-home': 'Home',
      'tab-settings': 'Settings',
      'tab-about': 'About',
      'setting-title': 'Settings',
      'lang-label': 'Language:',
      'theme-label': 'Theme:',
      'bg-label': 'Background Image:',
      'sound-label': 'Click Sound:'
    }
  },
  defaultLang: 'th',
  defaultTheme: 'dark',
  particlesConfig: {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: '#40c4ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.3, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 0.5, direction: 'none', random: true }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
      modes: { grab: { distance: 200 }, push: { particles_nb: 2 } }
    }
  }
};