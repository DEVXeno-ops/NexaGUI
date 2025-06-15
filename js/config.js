const CONFIG = {
  langData: {
    th: {
      title: 'NexaGUI',
      welcome: '🔥 ยินดีต้อนรับสู่ NexaGUI! 🔥',
      'tab-home': 'หน้าหลัก',
      'tab-settings': 'ตั้งค่า',
      'tab-about': 'เกี่ยวกับ',
      'setting-title': 'การตั้งค่า',
      'lang-label': 'ภาษา:',
      'sound-toggle-label': 'เปิด/ปิดเสียง:',
      'volume-label': 'ระดับเสียง:',
      'ambient-label': 'เสียงแอมเบียนท์:',
      'bg-label': 'เพิ่มพื้นหลัง:',
      'sound-label': 'เสียงกดปุ่ม:',
      'export-settings': 'ส่งออกการตั้งค่า',
      'import-settings': 'นำเข้าการตั้งค่า'
    },
    en: {
      title: 'NexaGUI',
      welcome: '🔥 Welcome to NexaGUI! 🔥',
      'tab-home': 'Home',
      'tab-settings': 'Settings',
      'tab-about': 'About',
      'setting-title': 'Settings',
      'lang-label': 'Language:',
      'sound-toggle-label': 'Sound On/Off:',
      'volume-label': 'Volume:',
      'ambient-label': 'Ambient Sound:',
      'bg-label': 'Add Background:',
      'sound-label': 'Click Sound:',
      'export-settings': 'Export Settings',
      'import-settings': 'Import Settings'
    }
  },
  defaultLang: 'th',
  defaultTheme: 'dark',
  particlesConfig: {
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: '#5b21b6' },
      shape: { type: 'circle' },
      opacity: { value: 0.6, random: true },
      size: { value: 2.5, random: true },
      line_linked: { enable: true, distance: 100, color: '#5b21b6', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 2, direction: 'none', random: true }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
      modes: { grab: { distance: 180, line_linked: { opacity: 0.8 } }, push: { particles_nb: 5 } }
    }
  },
  typedConfig: {
    strings: ['🔥 ยินดีต้อนรับสู่ NexaGUI! 🔥', 'สัมผัส UI สุดล้ำแห่งอนาคต', 'ปรับแต่งได้ตามใจคุณ'],
    typeSpeed: 50,
    backSpeed: 30,
    loop: true
  },
  wallpapers: [] // Populated dynamically
};