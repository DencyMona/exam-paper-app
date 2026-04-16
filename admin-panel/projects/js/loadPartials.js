async function loadPartials() {
  try {
    const [header, sidebar, footer] = await Promise.all([
      fetch('/partials/header.html').then(r => r.ok ? r.text() : Promise.reject('Header load failed')),
      fetch('/partials/sidebar.html').then(r => r.ok ? r.text() : Promise.reject('Sidebar load failed')),
      fetch('/partials/footer.html').then(r => r.ok ? r.text() : Promise.reject('Footer load failed'))
    ]);

    // Inject partials
    document.getElementById('header-container').innerHTML = header;
    document.getElementById('sidebar-container').innerHTML = sidebar;
    document.getElementById('footer-container').innerHTML = footer;

    // Sidebar toggle
    const toggleBtn = document.querySelector('#header-container .bi-list');
    const closeBtn = document.querySelector('#sidebar-container .close-btn');

    if (toggleBtn) toggleBtn.addEventListener('click', window.toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', window.closeSidebar);

    // Highlight active link
    const currentPath = window.location.pathname;
    document.querySelectorAll('#sidebar-container a.nav-link').forEach(link => {
      if (link.getAttribute('href') === currentPath) link.classList.add('active');
      else link.classList.remove('active');
    });

    // Dispatch event so page JS can run
    document.dispatchEvent(new Event('partialsLoaded'));

    // Load admin count if element exists
    const adminCountEl = document.getElementById('adminCount');
    if (adminCountEl) {
      const res = await fetch('/api/admin-count');
      if (res.ok) {
        const data = await res.json();
        adminCountEl.innerText = data.total;
      }
    }

  } catch (err) {
    console.error('Error loading partials:', err);
  }
}

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', loadPartials);
