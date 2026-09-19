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

  // Open "About Me" and "welcome.txt" by default on initial load for a great first impression
  openWindow('about');
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

