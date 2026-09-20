/**
 * YATIN JAIN - PROFESSIONAL DEVELOPER PORTFOLIO
 * Senior-Level Modular JavaScript Controller
 * Pure Vanilla ES6+ (No external JS libraries required)
 */

'use strict';

// ============================================================================
// 1. APPLICATION INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navigation.init();
  Typewriter.init();
  BackToTop.init();
});

// ============================================================================
// 2. THEME MANAGER (LIGHT / DARK THEME)
// ============================================================================
const ThemeManager = (() => {
  const STORAGE_KEY = 'yj_portfolio_theme';
  const toggleBtn = document.getElementById('theme-toggle');

  function init() {
    // Default to 'light' theme as requested
    const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
    apply(savedTheme);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
    }
  }

  function apply(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        toggleBtn.setAttribute('title', 'Switch to Light Mode');
        toggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
      }
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        toggleBtn.setAttribute('title', 'Switch to Dark Mode');
        toggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    const isDark = document.body.classList.contains('dark-theme');
    apply(isDark ? 'light' : 'dark');
  }

  return { init, apply, toggle };
})();

// ============================================================================
// 3. NAVIGATION (STICKY NAVBAR, ACTIVE SPY, MOBILE DRAWER)
// ============================================================================
const Navigation = (() => {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .dock-item[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  function init() {
    initScrollSpy();
    initMobileMenu();
    initNavbarElevation();
  }

  function initNavbarElevation() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 20) {
            navbar?.classList.add('scrolled');
          } else {
            navbar?.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function initMobileMenu() {
    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    // Close when a nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    if (navMenu?.classList.contains('open')) {
      navMenu.classList.remove('open');
      mobileToggle?.setAttribute('aria-expanded', 'false');
      if (mobileToggle) {
        mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    }
  }

  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  return { init };
})();

// ============================================================================
// 4. TYPEWRITER EFFECT (HERO SECTION)
// ============================================================================
const Typewriter = (() => {
  const targetEl = document.getElementById('typewriter');
  const phrases = [
    'Full-Stack & Backend Developer',
    'Python & Django Specialist',
    'Next.js & REST API Architect',
    'PostgreSQL & Cloud Integrator'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId = null;

  function init() {
    if (!targetEl) return;
    tick();
  }

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      targetEl.textContent = currentPhrase.substring(0, charIndex);
    } else {
      charIndex++;
      targetEl.textContent = currentPhrase.substring(0, charIndex);
    }

    let delta = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at end of phrase
      delta = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delta = 500;
    }

    timeoutId = setTimeout(tick, delta);
  }

  return { init };
})();

// ============================================================================
// 5. BACK TO TOP CONTROLLER
// ============================================================================
const BackToTop = (() => {
  const btn = document.getElementById('back-to-top');

  function init() {
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  return { init };
})();

// ============================================================================
// 6. RESUME 1-PAGE PRINT & DOWNLOAD HANDLER
// ============================================================================
function printResumePDF() {
  const pdfUrl = 'Yatin_Jain_Resume.pdf';

  // Create or reuse hidden iframe to trigger PDF print dialog
  let printFrame = document.getElementById('resume-print-iframe');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'resume-print-iframe';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.opacity = '0';
    document.body.appendChild(printFrame);
  }

  printFrame.src = pdfUrl;

  printFrame.onload = function() {
    try {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    } catch (err) {
      // Fallback: Open in new tab where browser's native PDF viewer enables instant 1-page print
      window.open(pdfUrl, '_blank');
    }
  };
}

// ============================================================================
// 7. CONTACT FORM (AJAX FORM SUBMISSION VIA FORMSUBMIT)
// ============================================================================
async function sendPortfolioMail() {
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const feedbackEl = document.getElementById('contact-feedback');

  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();
  const subject = subjectInput?.value.trim();
  const message = messageInput?.value.trim();

  if (!name || !email || !subject || !message) {
    showFeedback('Please fill out all fields before sending.', 'error');
    return;
  }

  // Set loading state on button
  const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  }
  showFeedback('', '');

  try {
    const response = await fetch('https://formsubmit.co/ajax/jainyatin693@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: `[Portfolio Contact] ${subject}`,
        message: message
      })
    });

    const result = await response.json();

    if (response.ok || result.success === 'true') {
      showFeedback('✓ Thank you! Your message has been sent successfully to Yatin Jain.', 'success');
      document.getElementById('contact-form')?.reset();
    } else {
      showFeedback('Could not send directly. Please click "Open in Gmail" below.', 'error');
    }
  } catch (err) {
    console.error('Submission error:', err);
    showFeedback('Network error. Click "Open in Gmail" to send directly from your email client.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  }
}

function showFeedback(msg, type) {
  const el = document.getElementById('contact-feedback');
  if (!el) return;
  el.textContent = msg;
  if (type === 'success') {
    el.style.color = 'var(--success, #10b981)';
  } else if (type === 'error') {
    el.style.color = 'var(--danger, #ef4444)';
  } else {
    el.style.color = '';
  }
}

// ============================================================================
// 8. DIRECT GMAIL COMPOSE FALLBACK
// ============================================================================
function openDirectGmail() {
  const subject = document.getElementById('contact-subject')?.value.trim() || 'Software Engineer Opportunity / Collaboration';
  const name = document.getElementById('contact-name')?.value.trim() || 'Colleague';
  const rawMsg = document.getElementById('contact-message')?.value.trim() || 'Hi Yatin,\n\nI reviewed your portfolio and would like to connect.';
  
  const body = `From: ${name}\n\n${rawMsg}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=jainyatin693@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.open(gmailUrl, '_blank');
}
