/* ═══════════════════════════════════════════════════════
   HUNTERVPHOTOGRAPHY — script.js
═══════════════════════════════════════════════════════ */

'use strict';

/* ── 1. DOM HELPERS ──────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ── 2. MOBILE NAV ───────────────────────────────── */
(function initMobileNav() {
  const hamburger    = $('#hamburger');
  const mobileNav    = $('#mobileNav');
  const mobileOverlay= $('#mobileOverlay');
  const closeBtn     = $('#mobileNavClose');
  const navLinks     = $$('.mobile-nav__link, .mobile-nav__btn');

  if (!hamburger) return;

  function openNav() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileOverlay.classList.add('visible');
    mobileOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileOverlay.classList.remove('visible');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeNav() : openNav();
  });

  closeBtn?.addEventListener('click', closeNav);
  mobileOverlay.addEventListener('click', closeNav);
  navLinks.forEach(link => link.addEventListener('click', closeNav));

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeNav();
  });
})();


/* ── 3. ACTIVE NAV HIGHLIGHTING (sidebar) ─────────── */
(function initActiveNav() {
  const links    = $$('.sidebar__link');
  const sections = $$('section[id]');
  if (!links.length || !sections.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => {
            const matches = l.getAttribute('href') === `#${id}`;
            l.classList.toggle('active', matches);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();


/* ── 4. SCROLL REVEAL ────────────────────────────── */
(function initScrollReveal() {
  const revealEls = $$('.reveal, .reveal-up');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.08 }
  );

  revealEls.forEach(el => observer.observe(el));
})();


/* ── 5. PORTFOLIO FILTER ─────────────────────────── */
(function initPortfolioFilter() {
  const filterBtns = $$('.filter-btn');
  const grid       = $('#portfolioGrid');
  if (!filterBtns.length || !grid) return;

  function applyFilter(filter) {
    const items = $$('.port-item', grid);

    items.forEach(item => {
      const cat     = item.dataset.category;
      const visible = filter === 'all' || cat === filter;

      if (visible) {
        item.style.display    = '';
        item.style.opacity    = '';
        item.style.transform  = '';
      } else {
        item.style.opacity    = '0';
        item.style.transform  = 'scale(0.94)';
        setTimeout(() => {
          if (item.style.opacity === '0') item.style.display = 'none';
        }, 400);
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      applyFilter(btn.dataset.filter);
    });
  });
})();


/* ── 6. CONTACT FORM ─────────────────────────────── */
(function initContactForm() {
  const form       = $('#contactForm');
  const successMsg = $('#formSuccess');
  const submitBtn  = $('#submitBtn');
  if (!form) return;

  function showError(input, msg) {
    input.style.borderColor = '#c0392b';
    let err = input.nextElementSibling;
    if (!err || !err.classList.contains('field-error')) {
      err = document.createElement('span');
      err.className = 'field-error';
      err.style.cssText = 'font-size:.7rem;color:#c0392b;margin-top:.2rem;display:block;';
      input.after(err);
    }
    err.textContent = msg;
  }

  function clearError(input) {
    input.style.borderColor = '';
    const err = input.nextElementSibling;
    if (err && err.classList.contains('field-error')) err.remove();
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validate() {
    let valid = true;

    const firstName = $('#firstName');
    const lastName  = $('#lastName');
    const email     = $('#email');

    [firstName, lastName].forEach(f => {
      if (!f.value.trim()) {
        showError(f, 'This field is required.');
        valid = false;
      } else {
        clearError(f);
      }
    });

    if (!email.value.trim()) {
      showError(email, 'Email is required.');
      valid = false;
    } else if (!validateEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email.');
      valid = false;
    } else {
      clearError(email);
    }

    return valid;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.classList.add('loading');
    submitBtn.querySelector('.btn-text').textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.hidden = true;
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const data = await response.json();
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-text').textContent = 'Send Request';
        alert(data?.errors?.[0]?.message || 'Something went wrong. Please email us directly at info@huntervphotography.com');
      }
    } catch (err) {
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-text').textContent = 'Send Request';
      alert('Something went wrong. Please email us directly at info@huntervphotography.com');
    }
  });

  // Live validation on blur
  $$('input, select, textarea', form).forEach(field => {
    field.addEventListener('blur', () => {
      if (field.hasAttribute('required') && !field.value.trim()) {
        showError(field, 'This field is required.');
      } else if (field.type === 'email' && field.value && !validateEmail(field.value)) {
        showError(field, 'Please enter a valid email.');
      } else {
        clearError(field);
      }
    });

    field.addEventListener('input', () => clearError(field));
  });
})();


/* ── 7. SMOOTH ANCHOR SCROLLING ──────────────────── */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.getElementById(anchor.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();

      const mobileHeader = $('#mobileHeader');
      const offset = mobileHeader
        ? (window.innerWidth <= 768 ? mobileHeader.offsetHeight + 8 : 0)
        : 0;

      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();


/* ── 8. FOOTER YEAR ──────────────────────────────── */
(function setYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ── 9. MOBILE HEADER SCROLL SHADOW ──────────────── */
(function mobileHeaderScroll() {
  const header = $('#mobileHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 2px 20px rgba(0,0,0,.4)'
      : 'none';
  }, { passive: true });
})();


/* ── 10. BEFORE/AFTER STAGING SLIDER ────────────── */
(function initStagingSlider() {
  const container = $('#beforeAfter');
  const afterPanel = $('#afterPanel');
  const handle     = $('#sliderHandle');
  if (!container || !afterPanel || !handle) return;

  let dragging = false;

  function setPosition(x) {
    const rect = container.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.min(Math.max(pct, 2), 98);
    afterPanel.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
    handle.style.transform = 'translateX(-50%)';
  }

  // Pointer events — works for mouse, touch and stylus uniformly
  container.addEventListener('pointerdown', e => {
    dragging = true;
    container.setPointerCapture(e.pointerId);
    setPosition(e.clientX);
    e.preventDefault();
  });

  container.addEventListener('pointermove', e => {
    if (dragging) setPosition(e.clientX);
  });

  container.addEventListener('pointerup',     () => { dragging = false; });
  container.addEventListener('pointercancel', () => { dragging = false; });
})();
