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
      'import-settings': 'นำเข้าการตั้งค่า',
      notifications: {
        langChanged: 'เปลี่ยนภาษาเรียบร้อย!',
        themeChanged: 'เปลี่ยนธีมเรียบร้อย!',
        soundToggledOn: 'เสียงเปิด!',
        soundToggledOff: 'เสียงปิด!',
        ambientToggledOn: 'เสียงแอมเบียนท์เปิด!',
        ambientToggledOff: 'เสียงแอมเบียนท์ปิด!',
        volumeAdjusted: 'ปรับระดับเสียงเรียบร้อย!',
        clickSoundSet: 'ตั้งค่าเสียงกดปุ่มเรียบร้อย!',
        backgroundAdded: 'เพิ่มพื้นหลังเรียบร้อย!',
        settingsExported: 'ส่งออกการตั้งค่าเรียบร้อย!',
        settingsImported: 'นำเข้าการตั้งค่าเรียบร้อย!',
        actionCompleted: 'คุณกดปุ่มแล้ว! 🎉'
      }
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
      'import-settings': 'Import Settings',
      notifications: {
        langChanged: 'Language changed!',
        themeChanged: 'Theme changed!',
        soundToggledOn: 'Sound on!',
        soundToggledOff: 'Sound off!',
        ambientToggledOn: 'Ambient sound on!',
        ambientToggledOff: 'Ambient sound off!',
        volumeAdjusted: 'Volume adjusted!',
        clickSoundSet: 'Click sound set!',
        backgroundAdded: 'Background added!',
        settingsExported: 'Settings exported!',
        settingsImported: 'Settings imported!',
        actionCompleted: 'You clicked the button! 🎉'
      }
    }
  },

  defaultLang: 'th',
  defaultTheme: 'dark',

  // Configuration สำหรับ particles.js
  particlesConfig: {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#5b21b6' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 2, random: true },
      lineLinked: { enable: true, distance: 100, color: '#5b21b6', opacity: 0.3, width: 1 },
      move: { enable: true, speed: 1.5, direction: 'none', random: true }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' }
      },
      modes: {
        grab: { distance: 180, line_linked: { opacity: 0.7 } },
        push: { particles_nb: 3 }
      }
    }
  },

  // การตั้งค่า Typed.js สำหรับ effect พิมพ์ข้อความ
  typedConfig: {
    strings: {
      th: [
        '🔥 ยินดีต้อนรับสู่ NexaGUI! 🔥',
        'สัมผัส UI สุดล้ำแห่งอนาคต',
        'ปรับแต่งได้ตามใจคุณ'
      ],
      en: [
        '🔥 Welcome to NexaGUI! 🔥',
        'Experience the Future of UI',
        'Customize Your Way'
      ]
    },
    typeSpeed: 50,
    backSpeed: 30,
    loop: true
  },

  wallpapers: [], // เก็บ wallpapers ที่โหลดเพิ่มหรือเลือกใช้งานภายหลัง

  // wallpapers เริ่มต้น สำหรับพื้นหลัง (background)
  defaultWallpapers: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920',
    'https://images.unsplash.com/photo-1511300636408-a63a2d319610?auto=format&fit=crop&w=1920'
  ]
};
