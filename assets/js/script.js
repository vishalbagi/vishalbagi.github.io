'use strict';

/*
 * Vishal Bagi — portfolio
 *
 *  1. Theme
 *  2. Header state & scroll-spy
 *  3. Mobile navigation
 *  4. Scroll reveal
 *  5. Impact count-up
 *  6. Skill filters
 *  7. Card pointer highlight
 *  8. Contact form
 *  9. Odds and ends
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


/* ------------------------------------------------------------------ 1. Theme
 * The initial value is applied by an inline script in <head> so the first
 * paint is already correct; this only handles switching afterwards.
 */

const themeToggle = $('[data-theme-toggle]');

const currentTheme = () =>
  document.documentElement.dataset.theme ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

const syncThemeButton = () => {
  const light = currentTheme() === 'light';
  themeToggle.setAttribute('aria-pressed', String(light));
  themeToggle.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
};

themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
  syncThemeButton();
});

syncThemeButton();

// follow the OS if the visitor has never expressed a preference here
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
  if (!stored) syncThemeButton();
});


/* ------------------------------------ 2. Header state & scroll-spy */

const header = $('[data-header]');
const navLinks = $$('[data-nav-link]');
const sections = navLinks
  .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
  .filter(Boolean);

const headerHeight = () => header.offsetHeight;

const setActiveSection = (id) => {
  navLinks.forEach((link) => {
    const match = link.getAttribute('href') === `#${id}`;
    if (match) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
};

const updateOnScroll = () => {
  header.classList.toggle('is-stuck', window.scrollY > 8);

  // a section counts as current once its top passes just under the header.
  // the offset is a fraction of the viewport rather than a fixed few pixels so
  // that landing on an anchor — which parks the section exactly at the
  // scroll-margin line — doesn't sit on an equality boundary.
  const probe = window.scrollY + headerHeight() + window.innerHeight * 0.18;
  let active = null;

  sections.forEach((section) => {
    const top = section.getBoundingClientRect().top + window.scrollY;
    if (top <= probe) active = section;
  });

  // the final section is often too short to reach the probe line
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) active = sections[sections.length - 1];

  setActiveSection(active ? active.id : '');
};

let scrollQueued = false;
const onScroll = () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    updateOnScroll();
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
updateOnScroll();


/* ---------------------------------------------- 3. Mobile navigation */

const nav = $('[data-nav]');
const navToggle = $('[data-nav-toggle]');
const navClose = $('[data-nav-close]');
const inertTargets = [$('#main'), $('.footer')].filter(Boolean);
let lastFocused = null;

const focusablesInNav = () =>
  $$('a[href], button:not([disabled])', nav).filter((el) => el.offsetParent !== null);

const openNav = () => {
  lastFocused = document.activeElement;
  nav.classList.add('is-open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  inertTargets.forEach((el) => el.setAttribute('inert', ''));
  navClose.focus();
};

const closeNav = ({ restoreFocus = true } = {}) => {
  if (!nav.classList.contains('is-open')) return;
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  inertTargets.forEach((el) => el.removeAttribute('inert'));
  if (restoreFocus && lastFocused) lastFocused.focus();
};

navToggle.addEventListener('click', openNav);
navClose.addEventListener('click', () => closeNav());

// picking a destination should close the menu, but focus belongs at the target
navLinks.forEach((link) => link.addEventListener('click', () => closeNav({ restoreFocus: false })));

document.addEventListener('keydown', (event) => {
  if (!nav.classList.contains('is-open')) return;

  if (event.key === 'Escape') {
    closeNav();
    return;
  }

  if (event.key !== 'Tab') return;

  // trap: cycle focus inside the overlay
  const items = focusablesInNav();
  if (!items.length) return;

  const first = items[0];
  const last = items[items.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// if the viewport grows past the breakpoint while open, drop back to the inline nav
window.matchMedia('(min-width: 48em)').addEventListener('change', (e) => {
  if (e.matches) closeNav({ restoreFocus: false });
});


/* ------------------------------------------------- 4. Scroll reveal */

const revealItems = $$('.reveal');

if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );

  revealItems.forEach((el) => revealObserver.observe(el));
}


/* --------------------------------------------- 5. Impact count-up */

const counters = $$('[data-count-to]');

const runCount = (el) => {
  const target = parseFloat(el.dataset.countTo);
  const decimals = parseInt(el.dataset.countDecimals || '0', 10);
  const suffix = el.dataset.countSuffix || '';
  const duration = 1100;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

// the markup already contains the final value, so with reduced motion — or no
// JS at all — the numbers are simply correct and static
if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => countObserver.observe(el));
}


/* ------------------------------------------------ 6. Skill filters */

const filters = $$('[data-filter]');
const skills = $$('.skill');
const skillsCount = $('[data-skills-count]');

const applyFilter = (value) => {
  let shown = 0;

  skills.forEach((skill) => {
    const match = value === 'all' || skill.dataset.category === value;
    skill.hidden = !match;
    if (match) shown += 1;
  });

  filters.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.filter === value)));

  const label = filters.find((btn) => btn.dataset.filter === value);
  skillsCount.textContent =
    value === 'all' ? `Showing all ${shown}` : `Showing ${shown} in ${label ? label.textContent : value}`;
};

filters.forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));


/* --------------------------------------- 7. Card pointer highlight */

if (window.matchMedia('(hover: hover)').matches && !prefersReducedMotion.matches) {
  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
}


/* -------------------------------------------------- 8. Contact form */

const form = $('[data-form]');
const formInputs = $$('[data-form-input]');
const formBtn = $('[data-form-btn]');
const formBtnLabel = $('[data-form-btn-label]');
const formStatus = $('[data-form-status]');
const formFrame = $('[data-form-frame]');

const setFormState = (state, message) => {
  formStatus.dataset.state = state;
  formStatus.textContent = message;
};

const refreshSubmitState = () => {
  formBtn.disabled = !form.checkValidity();
};

formInputs.forEach((input) => input.addEventListener('input', refreshSubmitState));

/*
 * The form posts into a hidden iframe, so there is no navigation to signal the
 * outcome. Success is the iframe's load event — which is also the only safe
 * moment to reset the fields, since resetting inside the submit handler would
 * clear them before the browser had serialised the values.
 */
let pending = false;
let pendingTimer = null;

form.addEventListener('submit', () => {
  pending = true;
  formBtn.disabled = true;
  formBtnLabel.textContent = 'Sending…';
  setFormState('sending', 'Sending your message…');

  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    if (!pending) return;
    pending = false;
    formBtnLabel.textContent = 'Send message';
    refreshSubmitState();
    setFormState(
      'error',
      'That didn’t go through. Please email vishalbagi44@gmail.com directly.'
    );
  }, 12000);
});

formFrame.addEventListener('load', () => {
  if (!pending) return; // ignore the initial about:blank load
  pending = false;
  clearTimeout(pendingTimer);

  form.reset();
  formBtnLabel.textContent = 'Send message';
  refreshSubmitState();
  setFormState('success', 'Thanks — your message is on its way. I’ll get back to you shortly.');
});


/* --------------------------------------------- 9. Odds and ends */

// links shared before the redesign still land somewhere sensible
const legacyHashes = {
  '#resume': '#experience',
  '#skillset': '#skills',
  '#certification': '#certifications',
};

if (legacyHashes[window.location.hash]) {
  const target = legacyHashes[window.location.hash];
  history.replaceState(null, '', target);
  const el = document.querySelector(target);
  if (el) el.scrollIntoView();
}

// <details> is collapsed by default, which would silently drop the earlier
// roles from a printed copy
window.addEventListener('beforeprint', () => {
  $$('details').forEach((el) => {
    el.dataset.wasOpen = String(el.open);
    el.open = true;
  });
});

window.addEventListener('afterprint', () => {
  $$('details').forEach((el) => {
    if (el.dataset.wasOpen === 'false') el.open = false;
    delete el.dataset.wasOpen;
  });
});

const year = $('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
