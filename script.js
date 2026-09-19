/**
 * YATIN JAIN - GEN-Z DEVELOPER PORTFOLIO
 * High-End Modular JavaScript Controller
 * Pure Vanilla ES6+
 */

'use strict';

// ============================================================================
// 1. INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  LiveClock.init();
  Typewriter.init();
  Navigation.init();
  BackToTop.init();
  KeyboardShortcuts.init();
});

// ============================================================================
// 2. THEME MANAGER (LIGHT BY DEFAULT)
// ============================================================================
const ThemeManager = (() => {
  const STORAGE_KEY = 'yj_genz_theme';
  const toggleBtn = document.getElementById('theme-toggle');

  function init() {
    // Default to 'light' theme
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
      }
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        toggleBtn.setAttribute('title', 'Switch to Dark Mode');
      }
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    const isDark = document.body.classList.contains('dark-theme');
    apply(isDark ? 'light' : 'dark');
    showToast(isDark ? 'Switched to Light Mode ☀️' : 'Switched to Dark Mode 🌙');
  }

  return { init, apply, toggle };
})();

// ============================================================================
// 3. LIVE CLOCK (JAIPUR / IST TIME)
// ============================================================================
const LiveClock = (() => {
  const clockEl = document.getElementById('live-clock');

  function init() {
    if (!clockEl) return;
    update();
    setInterval(update, 1000);
  }

  function update() {
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const now = new Date().toLocaleTimeString('en-US', options);
    clockEl.textContent = `${now} IST`;
  }

  return { init };
})();

// ============================================================================
// 4. TYPEWRITER EFFECT
// ============================================================================
const Typewriter = (() => {
  const target = document.getElementById('typewriter');
  const phrases = [
    'Software Engineer',
    'Full-Stack & Backend Dev',
    'Python & Django Specialist',
    'Next.js & REST API Architect'
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function init() {
    if (!target) return;
    tick();
  }

  function tick() {
    const current = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
      target.textContent = current.substring(0, charIdx);
    } else {
      charIdx++;
      target.textContent = current.substring(0, charIdx);
    }

    let speed = isDeleting ? 35 : 75;

    if (!isDeleting && charIdx === current.length) {
      speed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      speed = 450;
    }

    setTimeout(tick, speed);
  }

  return { init };
})();

// ============================================================================
// 5. NAVIGATION & SCROLL SPY
// ============================================================================
const Navigation = (() => {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  function init() {
    initScrollElevation();
    initScrollSpy();
    initMobileDrawer();
  }

  function initScrollElevation() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

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
    }, {
      rootMargin: '-25% 0px -65% 0px',
      threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
  }

  function initMobileDrawer() {
    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => closeDrawer());
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeDrawer();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  function closeDrawer() {
    if (navMenu?.classList.contains('open')) {
      navMenu.classList.remove('open');
      if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  }

  return { init };
})();

// ============================================================================
// 6. 1-CLICK EMAIL COPY & TOAST NOTIFICATION
// ============================================================================
function copyEmail() {
  const email = 'jainyatin693@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    showToast('Copied to clipboard! 🚀');
    const copyBtnText = document.getElementById('copy-email-text');
    if (copyBtnText) {
      const orig = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied! ✨';
      setTimeout(() => { copyBtnText.textContent = orig; }, 2000);
    }
  }).catch(() => {
    showToast('Email: jainyatin693@gmail.com');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ============================================================================
// 7. TOPIC SELECTION (CONTACT FORM CHIPS)
// ============================================================================
function selectTopic(buttonEl, topicName) {
  document.querySelectorAll('.topic-chip').forEach(b => b.classList.remove('active'));
  buttonEl.classList.add('active');

  const subjectInput = document.getElementById('contact-subject');
  if (subjectInput) {
    subjectInput.value = topicName;
  }
}

// ============================================================================
// 8. RESUME 1-PAGE PRINT & DOWNLOAD HANDLER
// ============================================================================
function printResumePDF() {
  const pdfUrl = 'Yatin_Jain_Resume.pdf';

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
      window.open(pdfUrl, '_blank');
    }
  };
}

// ============================================================================
// 9. CONTACT FORM HANDLER (FORMSUBMIT AJAX)
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

  const origBtnContent = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  }
  showFeedback('', '');

  try {
    const res = await fetch('https://formsubmit.co/ajax/jainyatin693@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: `[Gen-Z Portfolio] ${subject}`,
        message: message
      })
    });

    const result = await res.json();

    if (res.ok || result.success === 'true') {
      showFeedback('✓ Message sent successfully to Yatin! 🚀', 'success');
      showToast('Message delivered to Yatin! 📬');
      document.getElementById('contact-form')?.reset();
    } else {
      showFeedback('Could not send directly. Click "Open in Gmail" below.', 'error');
    }
  } catch (err) {
    console.error('Submission error:', err);
    showFeedback('Network error. Click "Open in Gmail" to connect directly.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
  }
}

function showFeedback(msg, type) {
  const el = document.getElementById('contact-feedback');
  if (!el) return;
  el.textContent = msg;
  if (type === 'success') {
    el.style.color = 'var(--radar-color, #10b981)';
  } else if (type === 'error') {
    el.style.color = '#ef4444';
  } else {
    el.style.color = '';
  }
}

// ============================================================================
// 10. DIRECT GMAIL COMPOSE FALLBACK
// ============================================================================
function openDirectGmail() {
  const subject = document.getElementById('contact-subject')?.value.trim() || 'Software Engineer Opportunity';
  const name = document.getElementById('contact-name')?.value.trim() || 'Recruiter / Engineer';
  const rawMsg = document.getElementById('contact-message')?.value.trim() || 'Hey Yatin,\n\nI checked out your portfolio and would love to connect.';

  const body = `From: ${name}\n\n${rawMsg}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=jainyatin693@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.open(gmailUrl, '_blank');
}

// ============================================================================
// 11. BACK TO TOP
// ============================================================================
const BackToTop = (() => {
  const btn = document.getElementById('back-to-top');

  function init() {
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();

// ============================================================================
// 12. KEYBOARD SHORTCUTS
// ============================================================================
const KeyboardShortcuts = (() => {
  function init() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger when user is typing in form inputs
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 't' || e.key === 'T') {
        ThemeManager.toggle();
      } else if (e.key === 'c' || e.key === 'C') {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'r' || e.key === 'R') {
        document.getElementById('resume')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  return { init };
})();
