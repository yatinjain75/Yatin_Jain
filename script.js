/* ==========================================================================
   WINDOWS 10 OS PORTFOLIO - JAVASCRIPT LOGIC (YATIN JAIN)
   ========================================================================== */

let highestZIndex = 100;
let activeWindowId = null;
let commandHistory = [];
let historyIndex = -1;

// Search index database
const searchItems = [
  { name: 'About Yatin Jain', category: 'System Specification', app: 'about', icon: 'fa-desktop' },
  { name: 'Goldenhat Technologies', category: 'Work Experience', app: 'experience', icon: 'fa-briefcase' },
  { name: 'Navodita Infotech', category: 'Work Experience', app: 'experience', icon: 'fa-briefcase' },
  { name: 'SkillCraft Technology', category: 'Work Experience', app: 'experience', icon: 'fa-briefcase' },
  { name: 'Baba Ratna Plant Zone (Agricultural ERP)', category: 'Featured Projects', app: 'projects', icon: 'fa-seedling' },
  { name: 'Library & Seat Management System', category: 'Featured Projects', app: 'projects', icon: 'fa-book' },
  { name: 'Learning Tracker (Backend Microservice)', category: 'Featured Projects', app: 'projects', icon: 'fa-server' },
  { name: 'Python & Django Skills', category: 'Technical Skills', app: 'skills', icon: 'fa-microchip' },
  { name: 'Next.js & React Skills', category: 'Technical Skills', app: 'skills', icon: 'fa-microchip' },
  { name: 'PostgreSQL & Supabase Skills', category: 'Technical Skills', app: 'skills', icon: 'fa-microchip' },
  { name: 'Yatin_Jain_Resume.pdf', category: 'Documents', app: 'resume', icon: 'fa-file-pdf' },
  { name: 'Windows PowerShell Terminal', category: 'Developer Tools', app: 'terminal', icon: 'fa-terminal' },
  { name: 'Contact Yatin (jainyatin693@gmail.com)', category: 'Communication', app: 'contact', icon: 'fa-envelope' },
  { name: 'Notepad (welcome.txt)', category: 'Accessories', app: 'notepad', icon: 'fa-note-sticky' },
  { name: 'Personalization & Settings', category: 'Settings', app: 'settings', icon: 'fa-gear' }
];

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWindowManagement();
  initDesktopIcons();
  initStartMenu();
  initSearch();
  initActionCenter();
  initContextMenu();
  initTerminal();
  initDesktopSelection();
  initAndroidOS();

  // Open "About Me" on desktop by default
  if (window.innerWidth > 768) {
    openWindow('about');
  }
});

/* ==========================================================================
   1. REAL-TIME CLOCK & DATE
   ========================================================================== */

function initClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  function update() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    timeEl.textContent = `${hours}:${minutes} ${ampm}`;

    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    dateEl.textContent = `${month}/${day}/${year}`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. WINDOW MANAGER (DRAGGING, FOCUS, MIN/MAX/CLOSE)
   ========================================================================== */

function initWindowManagement() {
  const windows = document.querySelectorAll('.window');

  windows.forEach(win => {
    const appId = win.getAttribute('data-window');
    const header = win.querySelector('.window-header');
    const minBtn = win.querySelector('.win-min');
    const maxBtn = win.querySelector('.win-max');
    const closeBtn = win.querySelector('.win-close');

    // Click to focus window
    win.addEventListener('mousedown', () => {
      bringToFront(appId);
    });

    // Control buttons
    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeWindow(appId);
      });
    }

    if (maxBtn) {
      maxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMaximizeWindow(appId);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow(appId);
      });
    }

    // Dragging logic
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    if (header) {
      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        if (win.classList.contains('maximized')) return;

        isDragging = true;
        bringToFront(appId);

        startX = e.clientX;
        startY = e.clientY;
        initialLeft = win.offsetLeft;
        initialTop = win.offsetTop;

        function onMouseMove(moveEvent) {
          if (!isDragging) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          let newLeft = initialLeft + dx;
          let newTop = initialTop + dy;

          // Desktop boundaries
          const desktop = document.getElementById('desktop');
          const maxLeft = desktop.clientWidth - win.offsetWidth;
          const maxTop = desktop.clientHeight - 32;

          newLeft = Math.max(0, Math.min(newLeft, maxLeft));
          newTop = Math.max(0, Math.min(newTop, maxTop));

          win.style.left = `${newLeft}px`;
          win.style.top = `${newTop}px`;
        }

        function onMouseUp() {
          isDragging = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      // Double click header to toggle maximize
      header.addEventListener('dblclick', (e) => {
        if (e.target.closest('.window-controls')) return;
        toggleMaximizeWindow(appId);
      });
    }
  });

  // Taskbar buttons click handler
  const taskbarItems = document.querySelectorAll('.taskbar-item');
  taskbarItems.forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.getAttribute('data-app');
      toggleTaskbarApp(appId);
    });
  });

  // Peek Desktop
  const peekBtn = document.getElementById('peek-desktop');
  let areWindowsHidden = false;
  peekBtn.addEventListener('click', () => {
    windows.forEach(w => {
      if (!areWindowsHidden) {
        if (w.style.display === 'flex' && !w.classList.contains('minimized')) {
          w.setAttribute('data-was-visible', 'true');
          w.classList.add('minimized');
        }
      } else {
        if (w.getAttribute('data-was-visible') === 'true') {
          w.classList.remove('minimized');
          w.removeAttribute('data-was-visible');
        }
      }
    });
    areWindowsHidden = !areWindowsHidden;
  });
}

function openWindow(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (!win) return;

  win.style.display = 'flex';
  win.classList.remove('minimized');
  bringToFront(appId);

  // Update taskbar icon
  const taskbarBtn = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
  if (taskbarBtn) {
    taskbarBtn.classList.add('running', 'active');
  }

  // Close menus
  closeStartMenu();
  closeActionCenter();
  closeSearchFlyout();
}

function closeWindow(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (!win) return;

  win.style.display = 'none';
  win.classList.remove('active');

  const taskbarBtn = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
  if (taskbarBtn) {
    taskbarBtn.classList.remove('running', 'active');
  }

  if (activeWindowId === appId) {
    activeWindowId = null;
    // Focus next available window
    const openWindows = Array.from(document.querySelectorAll('.window'))
      .filter(w => w.style.display === 'flex' && !w.classList.contains('minimized'))
      .sort((a, b) => (parseInt(b.style.zIndex) || 0) - (parseInt(a.style.zIndex) || 0));
    if (openWindows.length > 0) {
      bringToFront(openWindows[0].getAttribute('data-window'));
    }
  }
}

function minimizeWindow(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (!win) return;

  win.classList.add('minimized');
  win.classList.remove('active');

  const taskbarBtn = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
  if (taskbarBtn) {
    taskbarBtn.classList.remove('active');
  }

  if (activeWindowId === appId) {
    activeWindowId = null;
  }
}

function toggleMaximizeWindow(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (!win) return;

  win.classList.toggle('maximized');
  const maxBtn = win.querySelector('.win-max');
  if (maxBtn) {
    maxBtn.textContent = win.classList.contains('maximized') ? '🗗' : '🗖';
    maxBtn.title = win.classList.contains('maximized') ? 'Restore' : 'Maximize';
  }
}

function bringToFront(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (!win) return;

  highestZIndex++;
  win.style.zIndex = highestZIndex;

  // Set active class
  document.querySelectorAll('.window').forEach(w => {
    w.classList.remove('active');
    w.classList.add('inactive');
  });
  win.classList.add('active');
  win.classList.remove('inactive');

  // Update taskbar active indicator
  document.querySelectorAll('.taskbar-item').forEach(tb => tb.classList.remove('active'));
  const activeTb = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
  if (activeTb) {
    activeTb.classList.add('running', 'active');
  }

  activeWindowId = appId;
}

function toggleTaskbarApp(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (!win) {
    openWindow(appId);
    return;
  }

  const isVisible = win.style.display === 'flex' && !win.classList.contains('minimized');

  if (!isVisible) {
    openWindow(appId);
  } else if (activeWindowId === appId) {
    minimizeWindow(appId);
  } else {
    bringToFront(appId);
  }
}

/* ==========================================================================
   3. DESKTOP ICONS & SELECTION
   ========================================================================== */

function initDesktopIcons() {
  const icons = document.querySelectorAll('.desktop-icon');

  icons.forEach(icon => {
    // Single click: select
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      icons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });

    // Double click: open
    icon.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const appId = icon.getAttribute('data-app');
      openWindow(appId);
    });

    // Touch support (mobile tap to open)
    let lastTap = 0;
    icon.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 350 && tapLength > 0) {
        const appId = icon.getAttribute('data-app');
        openWindow(appId);
      } else {
        icons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
      }
      lastTap = currentTime;
    });
  });

  // Click desktop background to deselect icons
  document.getElementById('desktop').addEventListener('click', () => {
    icons.forEach(i => i.classList.remove('selected'));
    closeContextMenu();
  });
}

function initDesktopSelection() {
  const desktop = document.getElementById('desktop');
  const box = document.getElementById('selection-box');
  let isSelecting = false;
  let startX = 0, startY = 0;

  desktop.addEventListener('mousedown', (e) => {
    if (e.target !== desktop && e.target !== document.getElementById('desktop-icons')) return;
    if (e.button !== 0) return; // Only left click

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    box.style.left = `${startX}px`;
    box.style.top = `${startY}px`;
    box.style.width = '0px';
    box.style.height = '0px';
    box.style.display = 'block';

    function onMouseMove(moveEvent) {
      if (!isSelecting) return;
      const currentX = moveEvent.clientX;
      const currentY = moveEvent.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    }

    function onMouseUp() {
      isSelecting = false;
      box.style.display = 'none';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

/* ==========================================================================
   4. START MENU & ACTION CENTER
   ========================================================================== */

function initStartMenu() {
  const startBtn = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const expandBtn = document.getElementById('start-menu-expand');
  const sidebar = startMenu.querySelector('.start-sidebar');

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = startMenu.classList.contains('open');
    if (isOpen) {
      closeStartMenu();
    } else {
      closeActionCenter();
      closeSearchFlyout();
      startMenu.classList.add('open');
    }
  });

  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('expanded');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
      closeStartMenu();
    }
  });
}

function closeStartMenu() {
  const startMenu = document.getElementById('start-menu');
  if (startMenu) startMenu.classList.remove('open');
}

function initActionCenter() {
  const actionBtn = document.getElementById('action-center-btn');
  const actionCenter = document.getElementById('action-center');

  actionBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = actionCenter.classList.contains('open');
    if (isOpen) {
      closeActionCenter();
    } else {
      closeStartMenu();
      closeSearchFlyout();
      actionCenter.classList.add('open');
    }
  });

  document.addEventListener('click', (e) => {
    if (!actionCenter.contains(e.target) && !actionBtn.contains(e.target)) {
      closeActionCenter();
    }
  });
}

function closeActionCenter() {
  const actionCenter = document.getElementById('action-center');
  if (actionCenter) actionCenter.classList.remove('open');
}

function clearNotifications() {
  const notifContainer = document.getElementById('action-notifications');
  if (notifContainer) {
    notifContainer.innerHTML = '<div style="color: #888; text-align: center; padding: 40px 10px;">No new notifications</div>';
  }
  const badge = document.querySelector('.notif-badge');
  if (badge) badge.style.display = 'none';
}

function toggleNightLight() {
  document.body.classList.toggle('night-light');
  const toggleBtn = document.getElementById('toggle-nightlight');
  if (toggleBtn) toggleBtn.classList.toggle('active');
}

/* ==========================================================================
   5. SEARCH FLYOUT
   ========================================================================== */

function initSearch() {
  const searchInput = document.getElementById('taskbar-search-input');
  const searchFlyout = document.getElementById('search-flyout');
  const resultsContainer = document.getElementById('search-results-list');

  searchInput.addEventListener('focus', () => {
    closeStartMenu();
    closeActionCenter();
    renderSearchResults(searchInput.value.trim());
    searchFlyout.classList.add('open');
  });

  searchInput.addEventListener('input', () => {
    renderSearchResults(searchInput.value.trim());
    searchFlyout.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!searchFlyout.contains(e.target) && !document.getElementById('taskbar-search-container').contains(e.target)) {
      closeSearchFlyout();
    }
  });

  function renderSearchResults(query) {
    resultsContainer.innerHTML = '';
    const filtered = query === '' 
      ? searchItems.slice(0, 6)
      : searchItems.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) || 
          item.category.toLowerCase().includes(query.toLowerCase())
        );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 16px; color: #888; text-align: center;">No matches found for "${query}"</div>`;
      return;
    }

    filtered.forEach(item => {
      const el = document.createElement('div');
      el.className = 'search-item';
      el.innerHTML = `
        <div class="search-item-icon"><i class="fa-solid ${item.icon}"></i></div>
        <div class="search-item-info">
          <strong>${item.name}</strong>
          <span>${item.category}</span>
        </div>
      `;
      el.addEventListener('click', () => {
        openWindow(item.app);
        closeSearchFlyout();
        searchInput.value = '';
      });
      resultsContainer.appendChild(el);
    });
  }
}

function closeSearchFlyout() {
  const flyout = document.getElementById('search-flyout');
  if (flyout) flyout.classList.remove('open');
}

/* ==========================================================================
   6. CONTEXT MENU (RIGHT CLICK)
   ========================================================================== */

function initContextMenu() {
  const desktop = document.getElementById('desktop');
  const contextMenu = document.getElementById('context-menu');

  desktop.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.style.display = 'flex';
  });

  document.addEventListener('click', () => {
    closeContextMenu();
  });
}

function closeContextMenu() {
  const contextMenu = document.getElementById('context-menu');
  if (contextMenu) contextMenu.style.display = 'none';
}

/* ==========================================================================
   7. POWERSHELL INTERACTIVE TERMINAL
   ========================================================================== */

function initTerminal() {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  if (!input || !output) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawCmd = input.value.trim();
      if (rawCmd) {
        commandHistory.push(rawCmd);
        historyIndex = commandHistory.length;
        handleCommand(rawCmd);
      }
      input.value = '';
      document.getElementById('terminal-body').scrollTop = document.getElementById('terminal-body').scrollHeight;
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
    }
  });

  function handleCommand(cmd) {
    const entry = document.createElement('div');
    entry.className = 'term-entry';

    const cmdLine = document.createElement('div');
    cmdLine.className = 'term-cmd';
    cmdLine.innerHTML = `<span class="prompt-text">PS C:\\Users\\Yatin&gt;</span> ${escapeHtml(cmd)}`;
    entry.appendChild(cmdLine);

    const res = document.createElement('div');
    res.className = 'term-res';

    const lower = cmd.toLowerCase().trim();

    switch(lower) {
      case 'help':
        res.innerHTML = `Available Commands:
  <span class="term-highlight">whoami</span>       Display developer summary and credentials
  <span class="term-highlight">skills</span>       View technical proficiencies & stack
  <span class="term-highlight">projects</span>     List featured projects with architectures
  <span class="term-highlight">exp</span>          Show work history & internships
  <span class="term-highlight">contact</span>      Show contact information & social links
  <span class="term-highlight">cat resume</span>   Inspect complete resume document
  <span class="term-highlight">sudo hire</span>    Direct hire shortcut / contact prompt
  <span class="term-highlight">theme &lt;name&gt;</span>  Change theme (hero, dark, cyber, sunset)
  <span class="term-highlight">date</span>         Print current date and time
  <span class="term-highlight">clear</span>        Clear the terminal screen
  <span class="term-highlight">exit</span>         Close PowerShell window`;
        break;

      case 'whoami':
        res.innerHTML = `Yatin Jain
Role: Software Engineer | Full-Stack & Backend Developer
Location: Jaipur, Rajasthan, India
Education: B.Tech in CSE @ JECRC (Expected 2026, CGPA: 6.82)
Summary: Seeking entry-level opportunities to engineer robust, high-performance software systems.`;
        break;

      case 'skills':
        res.innerHTML = `Technical Skills:
- Languages: Python, JavaScript, C/C++, SQL (PostgreSQL, MySQL), HTML5, CSS3
- Frameworks: Next.js, React, Django, Django REST Framework, Tailwind CSS, Streamlit, Pandas
- Cloud & DB: PostgreSQL, MongoDB, Supabase, Git, Postman, Vercel, Railway
- Core CS: RESTful APIs, JWT Auth, RBAC, DSA, DBMS, OOP, Operating Systems`;
        break;

      case 'projects':
        res.innerHTML = `1. Baba Ratna Plant Zone (June 2026) [Production Deployed]
   - Stack: Next.js, React, Supabase, PostgreSQL, Tailwind CSS
   - Enterprise Agricultural ERP with RBAC, PIN credentials, and server actions.

2. Library & Seat Management System (Feb 2026) [Cloud Deployed]
   - Stack: Python, Streamlit, MongoDB, Werkzeug
   - Full-stack reservation and seat inventory analytics platform.

3. Learning Tracker Microservice (July 2025) [API Service]
   - Stack: Django REST Framework, JWT, Postman
   - Scalable RESTful API for goal management and automated testing.`;
        break;

      case 'exp':
        res.innerHTML = `Work Experience:
- Goldenhat Technologies (June 2026 – Present) | Software Engineer Intern
  Next.js, React, Python, PostgreSQL, REST APIs.
- Navodita Infotech (July 2025 – August 2025) | Python Developer Intern
  Python data scripts, 25% throughput optimization, API workflows.
- SkillCraft Technology (February 2025) | Data Science Intern
  Pandas, Scikit-learn, statistical analysis.`;
        break;

      case 'contact':
        res.innerHTML = `Contact Details:
- Email: jainyatin693@gmail.com
- Phone: +91 7357910535
- LinkedIn: https://linkedin.com/in/yatinjain75
- GitHub: https://github.com/yatinjain75`;
        break;

      case 'cat resume':
      case 'resume':
        openWindow('resume');
        res.innerHTML = `Opening Yatin_Jain_Resume.pdf in Edge Viewer...`;
        break;

      case 'sudo hire':
        openWindow('contact');
        res.innerHTML = `<span class="term-highlight">Access Granted!</span> Opening Mail to initiate collaboration with Yatin Jain...`;
        break;

      case 'clear':
      case 'cls':
        output.innerHTML = '';
        return;

      case 'date':
        res.textContent = new Date().toString();
        break;

      case 'exit':
        closeWindow('terminal');
        return;

      default:
        if (lower.startsWith('theme ')) {
          const t = lower.replace('theme ', '').trim();
          if (['hero', 'dark', 'cyber', 'sunset'].includes(t)) {
            setWallpaper(t);
            res.innerHTML = `Theme changed to: ${t}`;
          } else {
            res.innerHTML = `Unknown theme '${t}'. Available: hero, dark, cyber, sunset`;
          }
        } else {
          res.innerHTML = `The term '${escapeHtml(cmd)}' is not recognized as a cmdlet, function, script file, or operable program.
Type <span class="term-highlight">'help'</span> for a list of valid commands.`;
        }
    }

    entry.appendChild(res);
    output.appendChild(entry);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/* ==========================================================================
   8. PERSONALIZATION & WALLPAPER
   ========================================================================== */

function setWallpaper(name) {
  document.body.className = `theme-${name}`;
  document.querySelectorAll('.wp-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.querySelector(`.wp-${name}`)?.closest('.wp-card');
  if (activeCard) activeCard.classList.add('active');
}

/* ==========================================================================
   9. MAIL / CONTACT ACTIONS
   ========================================================================== */

async function sendMailAction() {
  const fromEmail = document.getElementById('sender-email').value.trim();
  const subject = document.getElementById('mail-subject').value.trim();
  const body = document.getElementById('mail-body-text').value.trim();
  const feedback = document.getElementById('mail-feedback');
  const sendBtn = document.getElementById('mail-send-btn');

  if (!fromEmail || !subject || !body) {
    feedback.style.color = '#e81123';
    feedback.textContent = 'Please fill in all fields.';
    return;
  }

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  }

  feedback.style.color = '#0078d7';
  feedback.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending email to jainyatin693@gmail.com...';

  try {
    const response = await fetch("https://formsubmit.co/ajax/jainyatin693@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: `[Portfolio Inquiry] ${subject} (From: ${fromEmail})`,
        from: fromEmail,
        replyto: fromEmail,
        email: fromEmail,
        subject: subject,
        message: body,
        _template: "table",
        _captcha: "false"
      })
    });

    const data = await response.json();

    if (response.ok || data.success === "true" || data.success === true) {
      feedback.style.color = '#107c10';
      feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Email successfully sent to jainyatin693@gmail.com!';
      document.getElementById('mail-subject').value = '';
      document.getElementById('mail-body-text').value = '';
    } else {
      throw new Error(data.message || 'Error occurred');
    }
  } catch (err) {
    console.warn('Direct send notice:', err);
    // Fallback if blocked by ad-blocker or network
    feedback.style.color = '#107c10';
    feedback.innerHTML = '<i class="fa-solid fa-envelope-open-text"></i> Opening in your mail app / Gmail...';
    const mailtoUrl = `mailto:jainyatin693@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + fromEmail + "\n\n" + body)}`;
    window.location.href = mailtoUrl;
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Email';
    }
  }
}

function openInGmailWeb() {
  const fromEmail = document.getElementById('sender-email').value.trim();
  const subject = document.getElementById('mail-subject').value.trim();
  const body = document.getElementById('mail-body-text').value.trim();

  const fullBody = fromEmail ? `From: ${fromEmail}\n\n${body}` : body;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=jainyatin693@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
  window.open(gmailUrl, '_blank');
}

function copyContact() {
  navigator.clipboard.writeText('jainyatin693@gmail.com').then(() => {
    const feedback = document.getElementById('mail-feedback');
    feedback.style.color = '#107c10';
    feedback.textContent = 'Copied jainyatin693@gmail.com to clipboard!';
    setTimeout(() => {
      feedback.textContent = '';
    }, 3000);
  });
}

/* ==========================================================================
   10. ANDROID 10 OS LOGIC & MOBILE VIEWER
   ========================================================================== */

let currentOSMode = 'windows';

function initAndroidOS() {
  initAndroidClock();
  initAndroidDrawer();

  // Auto detect mobile screen
  if (window.innerWidth <= 768) {
    setOSMode('android');
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && currentOSMode !== 'android') {
      setOSMode('android');
    }
  });
}

function toggleOSMode() {
  if (currentOSMode === 'windows') {
    setOSMode('android');
  } else {
    setOSMode('windows');
  }
}

function setOSMode(mode) {
  currentOSMode = mode;
  const switchText = document.getElementById('os-switch-text');
  const switchBtn = document.getElementById('os-switch-btn');

  if (mode === 'android') {
    document.body.classList.add('os-android');
    if (switchText) switchText.textContent = 'Switch to Windows 10';
    if (switchBtn) switchBtn.querySelector('i').className = 'fa-brands fa-windows';
  } else {
    document.body.classList.remove('os-android');
    if (switchText) switchText.textContent = 'Switch to Android 10';
    if (switchBtn) switchBtn.querySelector('i').className = 'fa-solid fa-mobile-screen-button';
  }
}

function initAndroidClock() {
  const clockEl = document.getElementById('android-clock-time');
  const shadeTimeEl = document.getElementById('shade-time');
  const shadeDateEl = document.getElementById('shade-date');
  const glanceDateEl = document.getElementById('glance-date');

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (clockEl) clockEl.textContent = timeStr;
    if (shadeTimeEl) shadeTimeEl.textContent = timeStr;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const dateNum = now.getDate();

    if (shadeDateEl) shadeDateEl.textContent = `${dayName.slice(0, 3)}, ${monthName} ${dateNum}`;
    if (glanceDateEl) glanceDateEl.textContent = `${dayName}, ${monthName} ${dateNum}`;
  }

  update();
  setInterval(update, 1000);
}

function toggleAndroidNotificationShade() {
  const shade = document.getElementById('android-shade');
  if (shade) shade.classList.toggle('open');
}

function toggleAndroidNightLight() {
  document.body.classList.toggle('night-light');
  const tile = document.getElementById('android-night-tile');
  if (tile) tile.classList.toggle('active');
}

const androidApps = [
  { id: 'phone', name: 'Phone', icon: 'fa-phone', color: 'phone' },
  { id: 'gmail', name: 'Gmail', icon: 'fa-envelope', color: 'gmail' },
  { id: 'chrome', name: 'Projects', icon: 'fa-brands fa-chrome', color: 'chrome' },
  { id: 'files', name: 'Resume', icon: 'fa-file-pdf', color: 'files' },
  { id: 'settings', name: 'Settings', icon: 'fa-gear', color: 'settings' },
  { id: 'calendar', name: 'Experience', icon: 'fa-calendar-days', color: 'calendar' },
  { id: 'termux', name: 'Termux', icon: 'fa-terminal', color: 'termux' },
  { id: 'keep', name: 'Notes', icon: 'fa-note-sticky', color: 'keep' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', color: 'linkedin', link: 'https://linkedin.com/in/yatinjain75' },
  { id: 'github', name: 'GitHub', icon: 'fa-brands fa-github', color: 'github', link: 'https://github.com/yatinjain75' }
];

function initAndroidDrawer() {
  const list = document.getElementById('drawer-apps-list');
  if (!list) return;

  renderDrawerApps(androidApps);
}

function renderDrawerApps(apps) {
  const list = document.getElementById('drawer-apps-list');
  if (!list) return;

  list.innerHTML = '';
  apps.forEach(app => {
    const el = document.createElement('div');
    el.className = 'android-icon';
    el.innerHTML = `
      <div class="icon-squircle ${app.color}"><i class="${app.icon.includes('fa-') ? app.icon : 'fa-solid ' + app.icon}"></i></div>
      <span>${app.name}</span>
    `;
    el.onclick = () => {
      if (app.link) {
        window.open(app.link, '_blank');
      } else {
        openAndroidApp(app.id);
      }
      toggleAndroidAppDrawer();
    };
    list.appendChild(el);
  });
}

function filterAndroidApps(query) {
  const filtered = androidApps.filter(app => app.name.toLowerCase().includes(query.toLowerCase()));
  renderDrawerApps(filtered);
}

function toggleAndroidAppDrawer() {
  const drawer = document.getElementById('android-drawer');
  if (drawer) drawer.classList.toggle('open');
}

function openAndroidApp(appId) {
  const viewer = document.getElementById('android-app-viewer');
  const title = document.getElementById('android-app-title');
  const content = document.getElementById('android-app-content');

  // Close drawer and shade if open
  const shade = document.getElementById('android-shade');
  if (shade) shade.classList.remove('open');
  const drawer = document.getElementById('android-drawer');
  if (drawer) drawer.classList.remove('open');

  switch(appId) {
    case 'phone':
      title.textContent = 'Phone - Yatin Jain';
      content.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #22c55e; color: #fff; font-size: 32px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);">
            YJ
          </div>
          <h2 style="font-size: 20px; color: #0f172a; margin-bottom: 4px;">Yatin Jain</h2>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Software Engineer | Jaipur, India</p>
          <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 24px;">+91 7357910535</div>

          <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 30px;">
            <a href="tel:+917357910535" style="width: 56px; height: 56px; border-radius: 50%; background: #22c55e; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; text-decoration: none; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);">
              <i class="fa-solid fa-phone"></i>
            </a>
            <a href="mailto:jainyatin693@gmail.com" style="width: 56px; height: 56px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; text-decoration: none; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">
              <i class="fa-solid fa-envelope"></i>
            </a>
            <a href="https://linkedin.com/in/yatinjain75" target="_blank" style="width: 56px; height: 56px; border-radius: 50%; background: #0a66c2; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; text-decoration: none;">
              <i class="fa-brands fa-linkedin-in"></i>
            </a>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: left;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Email</div>
            <div style="font-size: 14px; color: #0f172a; font-weight: 500;">jainyatin693@gmail.com</div>
            <div style="font-size: 12px; color: #64748b; margin: 12px 0 4px;">Status</div>
            <div style="font-size: 14px; color: #16a34a; font-weight: 600;"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> Available for Hire</div>
          </div>
        </div>
      `;
      break;

    case 'gmail':
      title.textContent = 'Gmail - Compose';
      content.innerHTML = `
        <form onsubmit="event.preventDefault(); sendAndroidMail();" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="border-bottom: 1px solid #e2e8f0; padding: 6px 0;">
            <label style="font-size: 11px; color: #64748b;">To:</label>
            <input type="text" value="Yatin Jain <jainyatin693@gmail.com>" readonly style="width: 100%; border: none; background: transparent; font-weight: 500; color: #0f172a; font-size: 13px; outline: none;">
          </div>
          <div style="border-bottom: 1px solid #e2e8f0; padding: 6px 0;">
            <label style="font-size: 11px; color: #64748b;">From:</label>
            <input type="email" id="android-from-email" placeholder="your.email@company.com" required style="width: 100%; border: none; font-size: 13px; outline: none; padding: 4px 0;">
          </div>
          <div style="border-bottom: 1px solid #e2e8f0; padding: 6px 0;">
            <label style="font-size: 11px; color: #64748b;">Subject:</label>
            <input type="text" id="android-subject" placeholder="Opportunity / Collaboration" required style="width: 100%; border: none; font-size: 13px; outline: none; padding: 4px 0;">
          </div>
          <div>
            <textarea id="android-body-text" placeholder="Compose email..." rows="6" required style="width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 13px; font-family: inherit; resize: none; outline: none;"></textarea>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <button type="submit" id="android-send-btn" style="padding: 10px; background: #ea4335; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <i class="fa-solid fa-paper-plane"></i> Send Email
            </button>
            <button type="button" onclick="openInGmailWeb()" style="padding: 10px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 500; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <i class="fa-brands fa-google"></i> Open in Gmail Web
            </button>
            <span id="android-mail-feedback" style="font-size: 12px; text-align: center; margin-top: 4px;"></span>
          </div>
        </form>
      `;
      break;

    case 'chrome':
      title.textContent = 'Chrome - Featured Projects';
      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Project 1 -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h3 style="font-size: 15px; color: #0f172a;">Baba Ratna Plant Zone</h3>
              <span style="background: #e8f5e9; color: #2e7d32; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Production</span>
            </div>
            <p style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">Next.js, React, Supabase, PostgreSQL, Tailwind CSS</p>
            <p style="font-size: 12px; color: #334155; line-height: 1.4; margin-bottom: 10px;">
              Enterprise Agricultural ERP with Role-Based Access Control (RBAC) across Admin, Expert, & Staff roles. Built with Next.js Server Actions & Supabase Admin API.
            </p>
            <a href="https://github.com/yatinjain75" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 500;">
              <i class="fa-brands fa-github"></i> View Repository &rarr;
            </a>
          </div>

          <!-- Project 2 -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h3 style="font-size: 15px; color: #0f172a;">Library & Seat Management</h3>
              <span style="background: #e1f0fc; color: #0078d7; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Cloud Deployed</span>
            </div>
            <p style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">Python, Streamlit, MongoDB, Werkzeug</p>
            <p style="font-size: 12px; color: #334155; line-height: 1.4; margin-bottom: 10px;">
              Full-stack library platform automating inventory tracking, book issuance, and real-time floor seat reservations with live occupancy analytics.
            </p>
            <a href="https://github.com/yatinjain75" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 500;">
              <i class="fa-brands fa-github"></i> View Repository &rarr;
            </a>
          </div>

          <!-- Project 3 -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h3 style="font-size: 15px; color: #0f172a;">Learning Tracker Microservice</h3>
              <span style="background: #ede7f6; color: #512da8; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600;">API Service</span>
            </div>
            <p style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">Django REST Framework, JWT, Postman</p>
            <p style="font-size: 12px; color: #334155; line-height: 1.4; margin-bottom: 10px;">
              RESTful backend API service for goal management, daily progress tracking, and milestone evaluations with JWT user authorization.
            </p>
            <a href="https://github.com/yatinjain75" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 500;">
              <i class="fa-brands fa-github"></i> View Repository &rarr;
            </a>
          </div>

        </div>
      `;
      break;

    case 'files':
      title.textContent = 'Files - Yatin_Jain_Resume.pdf';
      content.innerHTML = `
        <div>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <a href="Yatin_Jain_Resume.pdf" download="Yatin_Jain_Resume.pdf" style="flex: 1; padding: 8px; background: #0284c7; color: #fff; text-align: center; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
              <i class="fa-solid fa-download"></i> Download PDF
            </a>
            <button onclick="window.print()" style="flex: 1; padding: 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">
              <i class="fa-solid fa-print"></i> Print
            </button>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 11px; line-height: 1.45; color: #1e293b;">
            <h2 style="font-size: 16px; text-align: center; margin-bottom: 2px;">YATIN JAIN</h2>
            <p style="text-align: center; font-size: 10px; color: #64748b; margin-bottom: 8px;">Software Engineer | Full-Stack & Backend Developer</p>
            <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-bottom: 8px;">
              <strong>Summary:</strong> Seeking entry-level software engineering opportunity to apply academic foundation and strengthen full-stack expertise.
            </div>
            <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-bottom: 8px;">
              <strong>Skills:</strong> Python, JavaScript, Next.js, React, Django, PostgreSQL, MongoDB, Supabase, Git, Postman.
            </div>
            <div style="border-top: 1px solid #cbd5e1; padding-top: 8px;">
              <strong>Education:</strong> JECRC - B.Tech in CSE (Expected 2026, CGPA: 6.82)
            </div>
          </div>
        </div>
      `;
      break;

    case 'settings':
      title.textContent = 'Settings - Skills & Specs';
      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <h4 style="font-size: 13px; color: #0f172a; margin-bottom: 6px;"><i class="fa-solid fa-code" style="color: #3b82f6;"></i> Programming Languages</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <span class="skill-chip">Python</span>
              <span class="skill-chip">JavaScript</span>
              <span class="skill-chip">C / C++</span>
              <span class="skill-chip">SQL (PostgreSQL, MySQL)</span>
              <span class="skill-chip">HTML5 / CSS3</span>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <h4 style="font-size: 13px; color: #0f172a; margin-bottom: 6px;"><i class="fa-solid fa-cubes" style="color: #8b5cf6;"></i> Frameworks & Libraries</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <span class="skill-chip">Next.js</span>
              <span class="skill-chip">React</span>
              <span class="skill-chip">Django / DRF</span>
              <span class="skill-chip">Tailwind CSS</span>
              <span class="skill-chip">Framer Motion</span>
              <span class="skill-chip">Streamlit</span>
              <span class="skill-chip">Pandas</span>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <h4 style="font-size: 13px; color: #0f172a; margin-bottom: 6px;"><i class="fa-solid fa-database" style="color: #10b981;"></i> Databases & Cloud</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <span class="skill-chip">PostgreSQL</span>
              <span class="skill-chip">MongoDB</span>
              <span class="skill-chip">Supabase</span>
              <span class="skill-chip">Git & GitHub</span>
              <span class="skill-chip">Postman</span>
              <span class="skill-chip">Vercel</span>
              <span class="skill-chip">Railway</span>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <h4 style="font-size: 13px; color: #0f172a; margin-bottom: 6px;"><i class="fa-solid fa-award" style="color: #f59e0b;"></i> Certifications</h4>
            <ul style="margin-left: 18px; font-size: 12px; color: #334155; line-height: 1.5;">
              <li>MongoDB Python Developer Path (MongoDB Inc.)</li>
              <li>Python Crash Course (Campus Code)</li>
              <li>Music Recommendation Systems (Physics Wallah)</li>
            </ul>
          </div>
        </div>
      `;
      break;

    case 'calendar':
      title.textContent = 'Calendar - Work Experience';
      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
              <strong style="font-size: 13.5px; color: #0f172a;">Software Engineer Intern</strong>
              <span style="font-size: 10px; color: #3b82f6; background: #eff6ff; padding: 1px 6px; border-radius: 4px; font-weight: 600;">Current</span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">Goldenhat Technologies • June 2026 – Present (Remote)</div>
            <ul style="margin-left: 16px; font-size: 11.5px; color: #334155; line-height: 1.4;">
              <li>Developing responsive web apps and scalable backend services with Next.js, React, and Python.</li>
              <li>Architecting secure RESTful APIs and optimizing PostgreSQL queries.</li>
            </ul>
          </div>

          <div style="background: #f8fafc; border-left: 4px solid #10b981; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <strong style="font-size: 13.5px; color: #0f172a;">Python Developer Intern</strong>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">Navodita Infotech • July 2025 – August 2025 (Remote)</div>
            <ul style="margin-left: 16px; font-size: 11.5px; color: #334155; line-height: 1.4;">
              <li>Automated Python data processing scripts, increasing dataset processing throughput by 25%.</li>
              <li>Implemented backend application workflows and unit testing.</li>
            </ul>
          </div>

          <div style="background: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <strong style="font-size: 13.5px; color: #0f172a;">Data Science Intern</strong>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">SkillCraft Technology • February 2025 (Remote)</div>
            <ul style="margin-left: 16px; font-size: 11.5px; color: #334155; line-height: 1.4;">
              <li>Analyzed multi-dimensional datasets with Python, Pandas, and Scikit-learn.</li>
            </ul>
          </div>

        </div>
      `;
      break;

    case 'termux':
      title.textContent = 'Termux - Terminal';
      content.innerHTML = `
        <div style="background: #000; color: #22c55e; font-family: monospace; font-size: 12px; padding: 12px; border-radius: 8px; min-height: 280px; display: flex; flex-direction: column;">
          <div id="termux-output" style="flex: 1; overflow-y: auto; margin-bottom: 8px; line-height: 1.4;">
            Welcome to Termux (Android 10)!<br>
            Type <span style="color:#fff;">help</span> or <span style="color:#fff;">whoami</span> or <span style="color:#fff;">skills</span>.
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #38bdf8;">$</span>
            <input type="text" id="termux-input" autocomplete="off" spellcheck="false" style="flex: 1; background: transparent; border: none; color: #fff; font-family: inherit; font-size: 12px; outline: none;">
          </div>
        </div>
      `;
      setTimeout(() => {
        const tInput = document.getElementById('termux-input');
        const tOutput = document.getElementById('termux-output');
        if (tInput) {
          tInput.focus();
          tInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              const cmd = tInput.value.trim().toLowerCase();
              tOutput.innerHTML += `<div><span style="color:#38bdf8;">$</span> ${cmd}</div>`;
              if (cmd === 'help') {
                tOutput.innerHTML += `<div>Commands: whoami, skills, projects, exp, contact, clear</div>`;
              } else if (cmd === 'whoami') {
                tOutput.innerHTML += `<div>Yatin Jain | Software Engineer | Full-Stack & Backend</div>`;
              } else if (cmd === 'skills') {
                tOutput.innerHTML += `<div>Python, Next.js, React, Django, PostgreSQL, MongoDB, Supabase</div>`;
              } else if (cmd === 'projects') {
                tOutput.innerHTML += `<div>Baba Ratna ERP, Library Management, Learning Tracker API</div>`;
              } else if (cmd === 'exp') {
                tOutput.innerHTML += `<div>Goldenhat Tech (June 2026), Navodita Infotech, SkillCraft</div>`;
              } else if (cmd === 'contact') {
                tOutput.innerHTML += `<div>Email: jainyatin693@gmail.com | Phone: +91 7357910535</div>`;
              } else if (cmd === 'clear') {
                tOutput.innerHTML = '';
              } else {
                tOutput.innerHTML += `<div>command not found: ${cmd}</div>`;
              }
              tInput.value = '';
            }
          });
        }
      }, 50);
      break;

    case 'keep':
      title.textContent = 'Keep Notes - welcome.txt';
      content.innerHTML = `
        <div style="background: #fef08a; border-radius: 10px; padding: 14px; color: #713f12; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <h3 style="font-size: 14px; margin-bottom: 6px;">Welcome to my Portfolio!</h3>
          <p style="font-size: 12px; line-height: 1.5; margin-bottom: 8px;">
            Hi, I'm Yatin Jain. A Full-Stack & Backend Developer specializing in Python, Django, Next.js, and PostgreSQL.
          </p>
          <div style="font-size: 11px; color: #854d0e; border-top: 1px solid rgba(133, 77, 14, 0.2); padding-top: 6px;">
            📍 Jaipur, Rajasthan • 📞 +91 7357910535 • ✉️ jainyatin693@gmail.com
          </div>
        </div>
      `;
      break;
  }

  viewer.classList.add('open');
}

function closeAndroidApp() {
  const viewer = document.getElementById('android-app-viewer');
  if (viewer) viewer.classList.remove('open');
}

async function sendAndroidMail() {
  const fromEmail = document.getElementById('android-from-email').value.trim();
  const subject = document.getElementById('android-subject').value.trim();
  const body = document.getElementById('android-body-text').value.trim();
  const feedback = document.getElementById('android-mail-feedback');
  const sendBtn = document.getElementById('android-send-btn');

  if (!fromEmail || !subject || !body) {
    feedback.style.color = '#dc2626';
    feedback.textContent = 'Please fill in all fields.';
    return;
  }

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  }

  feedback.style.color = '#2563eb';
  feedback.textContent = 'Sending email to jainyatin693@gmail.com...';

  try {
    const response = await fetch("https://formsubmit.co/ajax/jainyatin693@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: `[Portfolio Mobile Inquiry] ${subject} (From: ${fromEmail})`,
        from: fromEmail,
        replyto: fromEmail,
        email: fromEmail,
        subject: subject,
        message: body,
        _template: "table",
        _captcha: "false"
      })
    });

    const data = await response.json();

    if (response.ok || data.success === "true" || data.success === true) {
      feedback.style.color = '#16a34a';
      feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Email sent successfully!';
      document.getElementById('android-subject').value = '';
      document.getElementById('android-body-text').value = '';
    } else {
      throw new Error(data.message || 'Error occurred');
    }
  } catch (err) {
    console.warn('Android send fallback:', err);
    feedback.style.color = '#16a34a';
    feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Dispatched to mail app!';
    const mailtoUrl = `mailto:jainyatin693@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + fromEmail + "\n\n" + body)}`;
    window.location.href = mailtoUrl;
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Email';
    }
  }
}

