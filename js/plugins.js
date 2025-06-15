// Plugin system for extending functionality
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

// Example plugin: Add a new tab
PLUGINS.register.push({
  init(app) {
    // Example: Add a custom tab dynamically
    // const newTab = document.createElement('div');
    // newTab.className = 'tab';
    // newTab.id = 'tab-custom';
    // newTab.setAttribute('role', 'tab');
    // newTab.setAttribute('aria-selected', 'false');
    // newTab.setAttribute('tabindex', '0');
    // newTab.setAttribute('data-tab', 'custom');
    // newTab.innerHTML = '<i class="fas fa-star"></i> Custom';
    // document.querySelector('.tabs').appendChild(newTab);
    // Add corresponding tab content and event listeners
  }
});