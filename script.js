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


/* ── 10. OPTIONAL: REAL IMAGE PORTFOLIO ──────────────
   
   When you add real images, replace the .port-item__img
   divs in HTML with actual <img> tags, or update the 
   background-image via CSS. Example:

   <div class="port-item" data-category="interior">
     <div class="port-item__img" style="background-image: url('assets/images/portfolio/living-room-1.jpg'); background-size: cover; background-position: center;">
       <div class="port-item__overlay">
         <span class="port-item__label">Interior · Southlake Estate</span>
       </div>
     </div>
   </div>

   For a lightbox, consider adding a library like
   GLightbox (CDN, no npm required):
   https://cdnjs.cloudflare.com/ajax/libs/glightbox/3.3.0/js/glightbox.min.js

   Then wrap each .port-item in:
   <a href="assets/images/portfolio/full-size.jpg" class="glightbox">

   And initialize after page load:
   const lightbox = GLightbox({ selector: '.glightbox' });

══════════════════════════════════════════════════════ */
