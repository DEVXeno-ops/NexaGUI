// js/config.js
export const CONFIG = {
  defaultLang: 'th',
  defaultTheme: 'dark',
  defaultWallpapers: [],
  langData: {
    th: {
      'app-title': 'NexaGUI',
      'tab-home-label': 'หน้าหลัก',
      'tab-settings-label': 'ตั้งค่า',
      'tab-about-label': 'เกี่ยวกับ',
      'settings-title': 'การตั้งค่า',
      'lang-label': 'ภาษา:',
      'sound-toggle-label': 'เปิด/ปิดเสียง:',
      'volume-label': 'ระดับเสียง:',
      'ambient-toggle-label': 'เสียงแอมเบียนท์:',
      'bg-label': 'เพิ่มพื้นหลัง:',
      'sound-label': 'เสียงกดปุ่ม:',
      'ambient-sound-label': 'เสียงแอมเบียนท์:',
      'bg-error': 'กรุณาเลือกไฟล์ภาพที่ถูกต้อง',
      'sound-error': 'กรุณาเลือกไฟล์เสียงที่ถูกต้อง',
      'ambient-sound-error': 'กรุณาเลือกไฟล์เสียงที่ถูกต้อง',
      'export-settings': 'ส่งออกการตั้งค่า',
      'import-settings-label': 'นำเข้าการตั้งค่า',
      'import-error': 'กรุณาเลือกไฟล์ JSON ที่ถูกต้อง',
      notifications: {
        langChanged: 'เปลี่ยนภาษาเรียบร้อยแล้ว',
        themeChanged: 'เปลี่ยนธีมเรียบร้อยแล้ว',
        soundToggledOn: 'เปิดเสียงแล้ว',
        soundToggledOff: 'ปิดเสียงแล้ว',
        ambientToggledOn: 'เปิดเสียงแอมเบียนท์แล้ว',
        ambientToggledOff: 'ปิดเสียงแอมเบียนท์แล้ว',
        volumeAdjusted: 'ปรับระดับเสียงเรียบร้อยแล้ว',
        clickSoundSet: 'ตั้งค่าเสียงกดปุ่มเรียบร้อยแล้ว',
        ambientSoundSet: 'ตั้งค่าเสียงแอมเบียนท์เรียบร้อยแล้ว',
        backgroundAdded: 'เพิ่มพื้นหลังเรียบร้อยแล้ว',
        settingsExported: 'ส่งออกการตั้งค่าเรียบร้อยแล้ว',
        settingsImported: 'นำเข้าการตั้งค่าเรียบร้อยแล้ว',
        invalidFile: 'ไฟล์ไม่ถูกต้อง',
        error: 'เกิดข้อผิดพลาด'
      }
    },
    en: {
      'app-title': 'NexaGUI',
      'tab-home-label': 'Home',
      'tab-settings-label': 'Settings',
      'tab-about-label': 'About',
      'settings-title': 'Settings',
      'lang-label': 'Language:',
      'sound-toggle-label': 'Sound On/Off:',
      'volume-label': 'Volume:',
      'ambient-toggle-label': 'Ambient Sound:',
      'bg-label': 'Add Background:',
      'sound-label': 'Click Sound:',
      'ambient-sound-label': 'Ambient Sound:',
      'bg-error': 'Please select a valid image file',
      'sound-error': 'Please select a valid audio file',
      'ambient-sound-error': 'Please select a valid audio file',
      'export-settings': 'Export Settings',
      'import-settings-label': 'Import Settings',
      'import-error': 'Please select a valid JSON file',
      notifications: {
        langChanged: 'Language changed successfully',
        themeChanged: 'Theme changed successfully',
        soundToggledOn: 'Sound enabled',
        soundToggledOff: 'Sound disabled',
        ambientToggledOn: 'Ambient sound enabled',
        ambientToggledOff: 'Ambient sound disabled',
        volumeAdjusted: 'Volume adjusted successfully',
        clickSoundSet: 'Click sound set successfully',
        ambientSoundSet: 'Ambient sound set successfully',
        backgroundAdded: 'Background added successfully',
        settingsExported: 'Settings exported successfully',
        settingsImported: 'Settings imported successfully',
        invalidFile: 'Invalid file',
        error: 'An error occurred'
      }
    }
  },
  particlesConfig: {
    particles: {
      number: { value: 40, density: { enable: true, value_area: 1000 } },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: 0.3, random: true },
      size: { value: 2, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1, direction: 'none', random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: false }, onclick: { enable: false }, resize: true }
    },
    retina_detect: true
  },
  typedConfig: {
    strings: {
      th: ['ยินดีต้อนรับสู่ NexaGUI', 'ปรับแต่ง UI ได้ตามใจ', 'สัมผัสอนาคตของ UX'],
      en: ['Welcome to NexaGUI', 'Customize Your UI', 'Experience the Future of UX']
    },
    typeSpeed: 60,
    backSpeed: 30,
    loop: true
  }
};