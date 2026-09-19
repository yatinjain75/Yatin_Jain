/**
 * Yatin Jain - Developer Portfolio
 * Clean, lightweight, modern JavaScript controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initScrollEffects();
});

// ============================================================================
// 1. THEME TOGGLE (DARK / LIGHT MODE)
// ============================================================================
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('yj_theme') || 'light';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('yj_theme', newTheme);
  });
}

function applyTheme(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (theme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    }
  }
}

// ============================================================================
// 2. MOBILE NAVIGATION
// ============================================================================
function initMobileNav() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!mobileToggle || !navMenu) return;

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isOpen = navMenu.classList.contains('open');
    mobileToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Close when clicking nav links
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
      navMenu.classList.remove('open');
      mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  });
}

// ============================================================================
// 3. SCROLL EFFECTS & ACTIVE LINK HIGHLIGHTING
// ============================================================================
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  window.addEventListener('scroll', () => {
    // Navbar elevation
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Active link highlighting
    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ============================================================================
// 4. CONTACT FORM (AJAX FORM SUBMISSION VIA FORMSUBMIT)
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

  // Set loading state
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
      showFeedback('Could not send directly. Please use "Open in Gmail" button below.', 'error');
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
    el.style.color = '#10b981';
  } else if (type === 'error') {
    el.style.color = '#ef4444';
  } else {
    el.style.color = '';
  }
}

// ============================================================================
// 5. DIRECT GMAIL COMPOSE FALLBACK
// ============================================================================
function openDirectGmail() {
  const subject = document.getElementById('contact-subject')?.value.trim() || 'Software Engineer Opportunity / Collaboration';
  const name = document.getElementById('contact-name')?.value.trim() || 'Colleague';
  const rawMsg = document.getElementById('contact-message')?.value.trim() || 'Hi Yatin,\n\nI reviewed your portfolio and would like to connect.';
  
  const body = `From: ${name}\n\n${rawMsg}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=jainyatin693@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.open(gmailUrl, '_blank');
}

// ============================================================================
// 6. RESUME 1-PAGE PRINT HANDLER
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
