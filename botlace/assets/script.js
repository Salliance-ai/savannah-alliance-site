// Botlace site interactions
(function() {
  const root = document.documentElement;

  // Theme toggle
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  }
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // Mobile drawer
  const menuToggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('mobileDrawer');
  if (menuToggle && drawer) {
    menuToggle.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });
  }

  // Smooth scroll for anchor links
  function smoothTo(targetId) {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (href.length > 1) {
        e.preventDefault();
        const id = href.slice(1);
        smoothTo(id);
        if (drawer && drawer.classList.contains('open')) drawer.classList.remove('open');
      }
    });
  });

  // Demo form submission
  const form = document.getElementById('demo-form');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = 'Submitting…';
      status.style.color = 'var(--muted)';
      const payload = Object.fromEntries(new FormData(form));
      try {
        const res = await fetch('https://your-serverless-endpoint.com/demo-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          status.textContent = 'Thanks! We will reach out shortly.';
          status.style.color = 'var(--ok)';
          form.reset();
        } else {
          status.textContent = 'Unable to send right now. Please try again.';
          status.style.color = 'var(--warn)';
        }
      } catch (err) {
        status.textContent = 'Network error. Please check your connection.';
        status.style.color = 'var(--danger)';
      }
    });
  }
})();
