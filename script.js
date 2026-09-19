/**
 * ANDROID OREO / 10 OS - SENIOR-LEVEL MODULAR JAVASCRIPT CONTROLLER
 * Developer: Yatin Jain | Software Engineer (Full-Stack & Backend)
 */

// ============================================================================
// 1. SOUND SYSTEM (WEB AUDIO API SYNTHESIZER)
// ============================================================================
const SoundSystem = (() => {
  let audioCtx = null;
  let isMuted = false;

  function getContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.08, volume = 0.15) {
    if (isMuted) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }

  return {
    click() { playTone(800, 'triangle', 0.04, 0.08); },
    dial(key) {
      const freqs = {
        '1': 697, '2': 770, '3': 852,
        '4': 697, '5': 770, '6': 852,
        '7': 697, '8': 770, '9': 852,
        '*': 941, '0': 941, '#': 941
      };
      playTone(freqs[key] || 750, 'sine', 0.1, 0.2);
    },
    lock() { playTone(350, 'sine', 0.06, 0.1); },
    unlock() { playTone(580, 'sine', 0.08, 0.12); },
    toggleMute() {
      isMuted = !isMuted;
      return isMuted;
    },
    get isMuted() { return isMuted; }
  };
})();

// ============================================================================
// 2. APPS DATABASE & REGISTRY
// ============================================================================
const APPS_DATABASE = [
  { id: 'phone', name: 'Phone', icon: 'fa-phone', color: 'icon-phone', category: 'Communication' },
  { id: 'gmail', name: 'Gmail', icon: 'fa-envelope', color: 'icon-gmail', category: 'Communication' },
  { id: 'chrome', name: 'Projects', icon: 'fa-brands fa-chrome', color: 'icon-chrome', category: 'Productivity' },
  { id: 'files', name: 'Resume', icon: 'fa-file-pdf', color: 'icon-files', category: 'Productivity' },
  { id: 'settings', name: 'Settings', icon: 'fa-gear', color: 'icon-settings', category: 'System' },
  { id: 'calendar', name: 'Experience', icon: 'fa-calendar-days', color: 'icon-calendar', category: 'Productivity' },
  { id: 'termux', name: 'Termux', icon: 'fa-terminal', color: 'icon-termux', category: 'Tools' },
  { id: 'keep', name: 'Notes', icon: 'fa-note-sticky', color: 'icon-keep', category: 'Productivity' },
  { id: 'calc', name: 'Calculator', icon: 'fa-calculator', color: 'icon-calc', category: 'Tools' },
  { id: 'clock', name: 'Clock', icon: 'fa-regular fa-clock', color: 'icon-clock', category: 'Tools' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', color: 'icon-linkedin', category: 'Social', link: 'https://linkedin.com/in/yatinjain75' },
  { id: 'github', name: 'GitHub', icon: 'fa-brands fa-github', color: 'icon-github', category: 'Social', link: 'https://github.com/yatinjain75' }
];

// ============================================================================
// 3. MAIN ANDROID OS CONTROLLER
// ============================================================================
const AndroidOS = (() => {
  let isLocked = false;
  let activeAppId = null;
  let backStack = [];
  let recentApps = [];
  let navMode = 'oreo'; // 'oreo' (3-button) or 'gesture' (Android 10 pill)

  function init() {
    initClock();
    initDrawer();
    initLockScreenGestures();
  }

  // Clock & Date Updates
  function initClock() {
    const statusClock = document.getElementById('status-clock');
    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');
    const shadeTime = document.getElementById('shade-time');
    const shadeDate = document.getElementById('shade-date');
    const glancePrimary = document.getElementById('glance-primary');

    function tick() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      if (statusClock) statusClock.textContent = timeStr;
      if (lockTime) lockTime.textContent = timeStr;
      if (shadeTime) shadeTime.textContent = timeStr;

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const shortMonth = shortMonths[now.getMonth()];
      const dateNum = now.getDate();

      if (lockDate) lockDate.textContent = `${dayName}, ${monthName} ${dateNum}`;
      if (shadeDate) shadeDate.textContent = `${dayName}, ${shortMonth} ${dateNum}`;
      if (glancePrimary) glancePrimary.textContent = `${dayName}, ${shortMonth} ${dateNum}`;
    }

    tick();
    setInterval(tick, 1000);
  }

  // Lock Screen Handling
  function initLockScreenGestures() {
    const lockScreen = document.getElementById('lock-screen');
    if (!lockScreen) return;

    let startY = 0;
    lockScreen.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    });

    lockScreen.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      if (startY - endY > 50) {
        unlockScreen();
      }
    });
  }

  function unlockScreen() {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
      lockScreen.classList.add('unlocked');
      isLocked = false;
      SoundSystem.unlock();
    }
  }

  function togglePower() {
    const lockScreen = document.getElementById('lock-screen');
    if (!lockScreen) return;

    if (lockScreen.classList.contains('unlocked')) {
      // Lock screen
      lockScreen.classList.remove('unlocked');
      isLocked = true;
      closeNotificationShade();
      closeAppDrawer();
      closeRecents();
      SoundSystem.lock();
    } else {
      unlockScreen();
    }
  }

  function unlockAndOpen(appId) {
    unlockScreen();
    setTimeout(() => openApp(appId), 200);
  }

  // Notification Shade
  function toggleNotificationShade() {
    if (isLocked) return;
    const shade = document.getElementById('notification-shade');
    if (shade) {
      shade.classList.toggle('open');
      SoundSystem.click();
    }
  }

  function closeNotificationShade() {
    const shade = document.getElementById('notification-shade');
    if (shade) shade.classList.remove('open');
  }

  function setBrightness(val) {
    document.documentElement.style.setProperty('--screen-brightness', `${val}%`);
  }

  function toggleNightLight() {
    document.body.classList.toggle('night-light');
    const tile = document.getElementById('qs-night-light');
    if (tile) tile.classList.toggle('active');
    SoundSystem.click();
  }

  function toggleSound() {
    const muted = SoundSystem.toggleMute();
    const tile = document.getElementById('qs-sound-tile');
    if (tile) {
      tile.classList.toggle('active', !muted);
      tile.querySelector('i').className = muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }
  }

  function toggleQS(el, name) {
    el.classList.toggle('active');
    SoundSystem.click();
  }

  // App Drawer
  function initDrawer() {
    renderDrawerGrid(APPS_DATABASE);
  }

  function renderDrawerGrid(apps) {
    const list = document.getElementById('drawer-apps-list');
    if (!list) return;

    list.innerHTML = '';
    apps.forEach(app => {
      const item = document.createElement('div');
      item.className = 'app-item';
      item.innerHTML = `
        <div class="app-icon-squircle ${app.color}"><i class="${app.icon}"></i></div>
        <span class="app-title">${app.name}</span>
      `;
      item.onclick = () => {
        if (app.link) {
          window.open(app.link, '_blank');
        } else {
          openApp(app.id);
        }
        closeAppDrawer();
      };
      list.appendChild(item);
    });
  }

  function filterDrawerApps(query) {
    const q = query.toLowerCase().trim();
    const filtered = APPS_DATABASE.filter(app => 
      app.name.toLowerCase().includes(q) || app.category.toLowerCase().includes(q)
    );
    renderDrawerGrid(filtered);
  }

  function toggleAppDrawer() {
    if (isLocked) return;
    const drawer = document.getElementById('app-drawer');
    if (drawer) {
      drawer.classList.toggle('open');
      SoundSystem.click();
    }
  }

  function closeAppDrawer() {
    const drawer = document.getElementById('app-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  // App Lifecycle & Window Manager
  function openApp(appId) {
    if (isLocked) return;
    SoundSystem.click();

    closeNotificationShade();
    closeAppDrawer();
    closeRecents();

    const viewer = document.getElementById('active-app-viewer');
    const title = document.getElementById('app-top-title');
    const content = document.getElementById('app-viewport-content');

    activeAppId = appId;
    backStack.push(appId);

    // Track in Recents
    if (!recentApps.includes(appId)) {
      recentApps.unshift(appId);
    } else {
      recentApps = [appId, ...recentApps.filter(id => id !== appId)];
    }

    // Render content from AppRegistry
    const appDef = APPS_DATABASE.find(a => a.id === appId);
    title.textContent = appDef ? appDef.name : 'Application';

    if (AppRegistry[appId]) {
      content.innerHTML = AppRegistry[appId].render();
      if (AppRegistry[appId].onMounted) {
        setTimeout(() => AppRegistry[appId].onMounted(), 30);
      }
    } else {
      content.innerHTML = `<div style="padding:20px; text-align:center;">App content unavailable</div>`;
    }

    viewer.classList.add('open');
  }

  function goBack() {
    SoundSystem.click();
    const shade = document.getElementById('notification-shade');
    const drawer = document.getElementById('app-drawer');
    const recents = document.getElementById('recents-overview');

    if (shade && shade.classList.contains('open')) {
      closeNotificationShade();
      return;
    }
    if (drawer && drawer.classList.contains('open')) {
      closeAppDrawer();
      return;
    }
    if (recents && recents.classList.contains('open')) {
      closeRecents();
      return;
    }

    const viewer = document.getElementById('active-app-viewer');
    if (viewer && viewer.classList.contains('open')) {
      backStack.pop();
      if (backStack.length > 0) {
        openApp(backStack[backStack.length - 1]);
      } else {
        goHome();
      }
    }
  }

  function goHome() {
    SoundSystem.click();
    closeNotificationShade();
    closeAppDrawer();
    closeRecents();

    const viewer = document.getElementById('active-app-viewer');
    if (viewer) viewer.classList.remove('open');
    activeAppId = null;
    backStack = [];
  }

  // Recents Overview (Multitasking ▢)
  function toggleRecents() {
    if (isLocked) return;
    SoundSystem.click();

    const recents = document.getElementById('recents-overview');
    if (!recents) return;

    if (recents.classList.contains('open')) {
      closeRecents();
    } else {
      closeNotificationShade();
      closeAppDrawer();
      renderRecentsCarousel();
      recents.classList.add('open');
    }
  }

  function closeRecents() {
    const recents = document.getElementById('recents-overview');
    if (recents) recents.classList.remove('open');
  }

  function renderRecentsCarousel() {
    const carousel = document.getElementById('recents-carousel');
    const empty = document.getElementById('recents-empty');
    if (!carousel) return;

    carousel.innerHTML = '';
    if (recentApps.length === 0) {
      if (empty) empty.style.display = 'flex';
      return;
    }
    if (empty) empty.style.display = 'none';

    recentApps.forEach(appId => {
      const appDef = APPS_DATABASE.find(a => a.id === appId);
      if (!appDef) return;

      const card = document.createElement('div');
      card.className = 'recents-card';
      card.innerHTML = `
        <div class="recents-card-top">
          <div class="recents-card-title">
            <i class="${appDef.icon}" style="color:var(--md-primary)"></i>
            <span>${appDef.name}</span>
          </div>
          <button class="recents-dismiss-btn" onclick="event.stopPropagation(); AndroidOS.dismissRecent('${appId}')">✕</button>
        </div>
        <div class="recents-card-preview">
          <p><strong>${appDef.name}</strong> • ${appDef.category}</p>
          <p style="margin-top:8px; color:#64748b;">Tap card to switch to this application.</p>
        </div>
      `;
      card.onclick = () => {
        closeRecents();
        openApp(appId);
      };
      carousel.appendChild(card);
    });
  }

  function dismissRecent(appId) {
    recentApps = recentApps.filter(id => id !== appId);
    if (activeAppId === appId) {
      const viewer = document.getElementById('active-app-viewer');
      if (viewer) viewer.classList.remove('open');
      activeAppId = null;
    }
    renderRecentsCarousel();
  }

  function clearAllRecents() {
    recentApps = [];
    const viewer = document.getElementById('active-app-viewer');
    if (viewer) viewer.classList.remove('open');
    activeAppId = null;
    backStack = [];
    renderRecentsCarousel();
  }

  // System Settings
  function setNavMode(mode) {
    navMode = mode;
    if (mode === 'gesture') {
      document.body.classList.remove('nav-oreo');
      document.body.classList.add('nav-gesture');
    } else {
      document.body.classList.remove('nav-gesture');
      document.body.classList.add('nav-oreo');
    }
    SoundSystem.click();
  }

  function setWallpaper(name) {
    document.body.className = `wallpaper-${name} nav-${navMode}`;
    SoundSystem.click();
  }

  function toggleFullscreen() {
    const frame = document.getElementById('phone-frame');
    const text = document.getElementById('fs-toggle-text');
    if (frame) {
      const isMax = frame.style.width === '100vw';
      if (!isMax) {
        frame.style.width = '100vw';
        frame.style.height = '100vh';
        frame.style.maxHeight = '100vh';
        frame.style.borderRadius = '0';
        frame.style.border = 'none';
        if (text) text.textContent = 'Exit Fullscreen';
      } else {
        frame.style.width = '';
        frame.style.height = '';
        frame.style.maxHeight = '';
        frame.style.borderRadius = '';
        frame.style.border = '';
        if (text) text.textContent = 'Fullscreen View';
      }
    }
  }

  return {
    init,
    togglePower,
    unlockScreen,
    unlockAndOpen,
    toggleNotificationShade,
    setBrightness,
    toggleNightLight,
    toggleSound,
    toggleQS,
    toggleAppDrawer,
    filterDrawerApps,
    toggleRecents,
    clearAllRecents,
    dismissRecent,
    openApp,
    goBack,
    goHome,
    setNavMode,
    setWallpaper,
    toggleFullscreen
  };
})();

// ============================================================================
// 4. APPLICATION REGISTRY (RICH PRODUCTION APPS)
// ============================================================================
const AppRegistry = {

  // 4.1 PHONE & DIALER APP
  phone: {
    number: '',
    render() {
      return `
        <div class="dialer-screen">
          <div class="dialer-display">
            <div class="dialer-input-number" id="dialer-num-display">${this.number || 'Dial a number...'}</div>
            <div class="dialer-contact-hint">Yatin Jain • +91 7357910535</div>
          </div>
          <div class="dialer-keypad">
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('1')"><span class="key-num">1</span><span class="key-sub"></span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('2')"><span class="key-num">2</span><span class="key-sub">ABC</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('3')"><span class="key-num">3</span><span class="key-sub">DEF</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('4')"><span class="key-num">4</span><span class="key-sub">GHI</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('5')"><span class="key-num">5</span><span class="key-sub">JKL</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('6')"><span class="key-num">6</span><span class="key-sub">MNO</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('7')"><span class="key-num">7</span><span class="key-sub">PQRS</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('8')"><span class="key-num">8</span><span class="key-sub">TUV</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('9')"><span class="key-num">9</span><span class="key-sub">WXYZ</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('*')"><span class="key-num">*</span><span class="key-sub"></span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('0')"><span class="key-num">0</span><span class="key-sub">+</span></div>
            <div class="dial-key" onclick="AppRegistry.phone.pressKey('#')"><span class="key-num">#</span><span class="key-sub"></span></div>
          </div>
          <div class="dialer-actions">
            <a href="tel:+917357910535" class="call-btn-circle" title="Call Yatin"><i class="fa-solid fa-phone"></i></a>
            <button class="dial-del-btn" onclick="AppRegistry.phone.deleteKey()" title="Backspace"><i class="fa-solid fa-delete-left"></i></button>
          </div>
        </div>
      `;
    },
    pressKey(k) {
      SoundSystem.dial(k);
      this.number += k;
      const el = document.getElementById('dialer-num-display');
      if (el) el.textContent = this.number;
    },
    deleteKey() {
      this.number = this.number.slice(0, -1);
      const el = document.getElementById('dialer-num-display');
      if (el) el.textContent = this.number || 'Dial a number...';
    }
  },

  // 4.2 GMAIL APP (DIRECT EMAIL DISPATCH VIA FORMSUBMIT AJAX)
  gmail: {
    render() {
      return `
        <div style="padding: 16px;">
          <form onsubmit="event.preventDefault(); AppRegistry.gmail.sendMail();" style="display:flex; flex-direction:column; gap:12px;">
            <div style="border-bottom:1px solid #e2e8f0; padding:6px 0;">
              <label style="font-size:11px; color:#64748b;">To:</label>
              <input type="text" value="Yatin Jain <jainyatin693@gmail.com>" readonly style="width:100%; border:none; background:transparent; font-weight:600; color:#0f172a; font-size:13px; outline:none;">
            </div>
            <div style="border-bottom:1px solid #e2e8f0; padding:6px 0;">
              <label style="font-size:11px; color:#64748b;">From:</label>
              <input type="email" id="gmail-from-email" placeholder="your.email@company.com" required style="width:100%; border:none; font-size:13px; outline:none; padding:4px 0;">
            </div>
            <div style="border-bottom:1px solid #e2e8f0; padding:6px 0;">
              <label style="font-size:11px; color:#64748b;">Subject:</label>
              <input type="text" id="gmail-subject" placeholder="Opportunity / Project Collaboration" required style="width:100%; border:none; font-size:13px; outline:none; padding:4px 0;">
            </div>
            <div>
              <textarea id="gmail-body-text" placeholder="Hi Yatin, I reviewed your portfolio and would like to connect..." rows="7" required style="width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:10px; font-size:13px; font-family:inherit; resize:vertical; outline:none;"></textarea>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
              <button type="submit" id="gmail-send-btn" style="padding:12px; background:#ea4335; color:#fff; border:none; border-radius:8px; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                <i class="fa-solid fa-paper-plane"></i> Send Email Directly
              </button>
              <button type="button" onclick="AppRegistry.gmail.openInWeb()" style="padding:10px; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; border-radius:8px; font-weight:500; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                <i class="fa-brands fa-google"></i> Open in Gmail Web
              </button>
              <span id="gmail-status-feedback" style="font-size:12px; text-align:center; font-weight:500; min-height:18px;"></span>
            </div>
          </form>
        </div>
      `;
    },
    async sendMail() {
      const fromEmail = document.getElementById('gmail-from-email').value.trim();
      const subject = document.getElementById('gmail-subject').value.trim();
      const body = document.getElementById('gmail-body-text').value.trim();
      const feedback = document.getElementById('gmail-status-feedback');
      const sendBtn = document.getElementById('gmail-send-btn');

      if (!fromEmail || !subject || !body) return;

      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending email...';
      feedback.style.color = '#2563eb';
      feedback.textContent = 'Dispatching to jainyatin693@gmail.com...';

      try {
        const response = await fetch("https://formsubmit.co/ajax/jainyatin693@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            _subject: `[Portfolio Inquiry] ${subject} (From: ${fromEmail})`,
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
          feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Email successfully sent to jainyatin693@gmail.com!';
          document.getElementById('gmail-subject').value = '';
          document.getElementById('gmail-body-text').value = '';
        } else {
          throw new Error('Send failed');
        }
      } catch (e) {
        feedback.style.color = '#16a34a';
        feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Opening in your mail app...';
        const mailtoUrl = `mailto:jainyatin693@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + fromEmail + "\n\n" + body)}`;
        window.location.href = mailtoUrl;
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Email Directly';
      }
    },
    openInWeb() {
      const fromEmail = document.getElementById('gmail-from-email')?.value.trim() || '';
      const subject = document.getElementById('gmail-subject')?.value.trim() || '';
      const body = document.getElementById('gmail-body-text')?.value.trim() || '';

      const fullBody = fromEmail ? `From: ${fromEmail}\n\n${body}` : body;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=jainyatin693@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
      window.open(gmailUrl, '_blank');
    }
  },

  // 4.3 CHROME BROWSER (PROJECTS HUB)
  chrome: {
    render() {
      return `
        <div>
          <div class="browser-url-bar">
            <i class="fa-solid fa-lock"></i>
            <span>https://yatin.io/projects</span>
          </div>

          <div style="padding:0 16px 20px; display:flex; flex-direction:column; gap:16px;">
            
            <!-- Project 1: Baba Ratna -->
            <div style="border:1px solid #e2e8f0; border-radius:12px; padding:16px; background:#f8fafc;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h3 style="font-size:15px; color:#0f172a;">Baba Ratna Plant Zone</h3>
                <span style="background:#e8f5e9; color:#2e7d32; font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:10px;">Production Deployed</span>
              </div>
              <div style="font-size:11.5px; color:#64748b; margin-bottom:8px;">Agricultural ERP & Client Portal • June 2026</div>
              <p style="font-size:12.5px; color:#334155; line-height:1.45; margin-bottom:10px;">
                Enterprise Agricultural ERP system with Role-Based Access Control (RBAC) across Admin, Expert, & Staff roles. Built with Next.js Server Actions & Supabase Admin API with secure PIN credentials.
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Next.js</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">React</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Supabase</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">PostgreSQL</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Tailwind CSS</span>
              </div>
              <a href="https://github.com/yatinjain75" target="_blank" style="color:#1a73e8; font-size:12px; text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                <i class="fa-brands fa-github"></i> View on GitHub &rarr;
              </a>
            </div>

            <!-- Project 2: Library & Seat Management -->
            <div style="border:1px solid #e2e8f0; border-radius:12px; padding:16px; background:#f8fafc;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h3 style="font-size:15px; color:#0f172a;">Library & Seat Management</h3>
                <span style="background:#e1f0fc; color:#0078d7; font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:10px;">Cloud Deployed</span>
              </div>
              <div style="font-size:11.5px; color:#64748b; margin-bottom:8px;">Automation & Reservation Platform • February 2026</div>
              <p style="font-size:12.5px; color:#334155; line-height:1.45; margin-bottom:10px;">
                Full-stack library platform automating inventory tracking, book issuance, and real-time floor seat reservations with live occupancy analytics, fine calculation, and support ticket triage.
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Python</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Streamlit</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">MongoDB</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Werkzeug</span>
              </div>
              <a href="https://github.com/yatinjain75" target="_blank" style="color:#1a73e8; font-size:12px; text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                <i class="fa-brands fa-github"></i> View on GitHub &rarr;
              </a>
            </div>

            <!-- Project 3: Learning Tracker -->
            <div style="border:1px solid #e2e8f0; border-radius:12px; padding:16px; background:#f8fafc;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h3 style="font-size:15px; color:#0f172a;">Learning Tracker (Backend)</h3>
                <span style="background:#ede7f6; color:#512da8; font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:10px;">API Service</span>
              </div>
              <div style="font-size:11.5px; color:#64748b; margin-bottom:8px;">Backend Microservice • July 2025</div>
              <p style="font-size:12.5px; color:#334155; line-height:1.45; margin-bottom:10px;">
                Architected a RESTful backend API service for goal management, daily progress tracking, and milestone evaluations with JWT user authorization and automated Postman test suites.
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Django REST Framework</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">JWT</span>
                <span style="background:#e0f2fe; color:#0369a1; font-size:10.5px; padding:2px 6px; border-radius:4px;">Postman</span>
              </div>
              <a href="https://github.com/yatinjain75" target="_blank" style="color:#1a73e8; font-size:12px; text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                <i class="fa-brands fa-github"></i> View on GitHub &rarr;
              </a>
            </div>

          </div>
        </div>
      `;
    }
  },

  // 4.4 FILES & RESUME APP
  files: {
    render() {
      return `
        <div style="padding:16px;">
          <div style="display:flex; gap:8px; margin-bottom:14px;">
            <a href="Yatin_Jain_Resume.pdf" download="Yatin_Jain_Resume.pdf" style="flex:1; padding:10px; background:#1a73e8; color:#fff; border-radius:8px; text-decoration:none; text-align:center; font-size:12.5px; font-weight:600;">
              <i class="fa-solid fa-download"></i> Download PDF
            </a>
            <button onclick="window.print()" style="flex:1; padding:10px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; font-size:12.5px; font-weight:600; cursor:pointer;">
              <i class="fa-solid fa-print"></i> Print Resume
            </button>
          </div>

          <!-- Document Sheet -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; box-shadow:var(--elevation-1); font-size:12px; line-height:1.5; color:#1e293b;">
            <div style="text-align:center; border-bottom:1.5px solid #0f172a; padding-bottom:8px; margin-bottom:12px;">
              <h2 style="font-size:18px; font-weight:700;">YATIN JAIN</h2>
              <p style="font-size:11px; font-weight:600; color:#475569;">Software Engineer | Full-Stack & Backend Developer</p>
              <p style="font-size:10px; color:#64748b;">Jaipur, Rajasthan • +91 7357910535 • jainyatin693@gmail.com</p>
            </div>

            <div style="margin-bottom:12px;">
              <strong style="font-size:12px; border-bottom:1px solid #cbd5e1; display:block; margin-bottom:4px;">PROFESSIONAL SUMMARY</strong>
              <p style="font-size:11.5px; color:#334155;">Seeking an entry-level opportunity in software engineering to apply my academic foundation in computer science, strengthen my expertise in full-stack development, and contribute to innovative projects.</p>
            </div>

            <div style="margin-bottom:12px;">
              <strong style="font-size:12px; border-bottom:1px solid #cbd5e1; display:block; margin-bottom:4px;">TECHNICAL SKILLS</strong>
              <p><strong>Languages:</strong> Python, C, C++, JavaScript, SQL, HTML5, CSS3</p>
              <p><strong>Frameworks:</strong> Next.js, React, Django, DRF, Tailwind CSS, Streamlit, Pandas</p>
              <p><strong>Databases & Cloud:</strong> PostgreSQL, MongoDB, MySQL, Supabase, Git, Postman, Vercel</p>
            </div>

            <div style="margin-bottom:12px;">
              <strong style="font-size:12px; border-bottom:1px solid #cbd5e1; display:block; margin-bottom:4px;">EDUCATION</strong>
              <p><strong>B.Tech. in Computer Science & Engineering</strong> (Expected 2026)</p>
              <p style="color:#64748b;">Jaipur Engineering College and Research Centre (JECRC) | CGPA: 6.82</p>
            </div>
          </div>
        </div>
      `;
    }
  },

  // 4.5 SETTINGS APP
  settings: {
    render() {
      return `
        <div style="padding:16px; display:flex; flex-direction:column; gap:16px;">
          <!-- System Specs -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
            <h4 style="font-size:13px; color:#0f172a; margin-bottom:8px;"><i class="fa-solid fa-mobile-screen"></i> About Phone</h4>
            <div style="font-size:12px; display:flex; flex-direction:column; gap:4px; color:#334155;">
              <div><strong>Device Name:</strong> Yatin-Android-10</div>
              <div><strong>Developer:</strong> Yatin Jain (Software Engineer)</div>
              <div><strong>Android Version:</strong> 10.0 (Oreo 10 Edition)</div>
              <div><strong>Build:</strong> Senior-Level Production v2026.1</div>
            </div>
          </div>

          <!-- Navigation Style Toggle -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
            <h4 style="font-size:13px; color:#0f172a; margin-bottom:8px;"><i class="fa-solid fa-compass"></i> System Navigation</h4>
            <div style="display:flex; gap:10px;">
              <button onclick="AndroidOS.setNavMode('oreo')" style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; font-size:12px; font-weight:600; cursor:pointer;">
                Oreo 3-Button (◀ ⚪ ▢)
              </button>
              <button onclick="AndroidOS.setNavMode('gesture')" style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; font-size:12px; font-weight:600; cursor:pointer;">
                Android 10 Gesture Bar
              </button>
            </div>
          </div>

          <!-- Wallpaper Switcher -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
            <h4 style="font-size:13px; color:#0f172a; margin-bottom:8px;"><i class="fa-solid fa-palette"></i> Wallpaper & Theme</h4>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
              <button onclick="AndroidOS.setWallpaper('pixel')" style="padding:10px; background:#1e293b; color:#fff; border:none; border-radius:8px; font-size:11.5px; font-weight:600; cursor:pointer;">Google Pixel</button>
              <button onclick="AndroidOS.setWallpaper('oreo')" style="padding:10px; background:#0284c7; color:#fff; border:none; border-radius:8px; font-size:11.5px; font-weight:600; cursor:pointer;">Android Oreo</button>
              <button onclick="AndroidOS.setWallpaper('dark')" style="padding:10px; background:#000000; color:#fff; border:none; border-radius:8px; font-size:11.5px; font-weight:600; cursor:pointer;">AMOLED Dark</button>
              <button onclick="AndroidOS.setWallpaper('nature')" style="padding:10px; background:#4c1d95; color:#fff; border:none; border-radius:8px; font-size:11.5px; font-weight:600; cursor:pointer;">Neon Aurora</button>
            </div>
          </div>

          <!-- Technical Skills -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
            <h4 style="font-size:13px; color:#0f172a; margin-bottom:8px;"><i class="fa-solid fa-code"></i> Technical Stack</h4>
            <p style="font-size:12px; color:#475569; line-height:1.5;">
              <strong>Languages:</strong> Python, JavaScript, C/C++, SQL, HTML5, CSS3<br>
              <strong>Frameworks:</strong> Django, DRF, Next.js, React, Tailwind, Streamlit, Pandas<br>
              <strong>Databases:</strong> PostgreSQL, MongoDB, Supabase, Git, Postman, Vercel
            </p>
          </div>
        </div>
      `;
    }
  },

  // 4.6 CALENDAR / EXPERIENCE APP
  calendar: {
    render() {
      return `
        <div style="padding:16px; display:flex; flex-direction:column; gap:14px;">
          <div style="border-left:4px solid #1a73e8; background:#f8fafc; border-radius:8px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <strong style="font-size:14px; color:#0f172a;">Software Engineer Intern</strong>
              <span style="background:#eff6ff; color:#1a73e8; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px;">Present</span>
            </div>
            <div style="font-size:12px; color:#64748b; margin:2px 0 8px;">Goldenhat Technologies • June 2026 – Present (Remote)</div>
            <ul style="margin-left:16px; font-size:12px; color:#334155; line-height:1.45;">
              <li>Developing responsive web apps and scalable backend services with Next.js, React, and Python.</li>
              <li>Architecting secure RESTful API endpoints and optimizing PostgreSQL queries.</li>
              <li>Collaborating in agile sprints, peer code reviews, and writing maintainable code.</li>
            </ul>
          </div>

          <div style="border-left:4px solid #16a34a; background:#f8fafc; border-radius:8px; padding:14px;">
            <strong style="font-size:14px; color:#0f172a;">Python Developer Intern</strong>
            <div style="font-size:12px; color:#64748b; margin:2px 0 8px;">Navodita Infotech • July 2025 – August 2025 (Remote)</div>
            <ul style="margin-left:16px; font-size:12px; color:#334155; line-height:1.45;">
              <li>Engineered automated Python data processing scripts, increasing dataset processing throughput by 25%.</li>
              <li>Implemented backend application workflows and conducted unit testing.</li>
            </ul>
          </div>

          <div style="border-left:4px solid #f59e0b; background:#f8fafc; border-radius:8px; padding:14px;">
            <strong style="font-size:14px; color:#0f172a;">Data Science Intern</strong>
            <div style="font-size:12px; color:#64748b; margin:2px 0 8px;">SkillCraft Technology • February 2025 (Remote)</div>
            <ul style="margin-left:16px; font-size:12px; color:#334155; line-height:1.45;">
              <li>Analyzed multi-dimensional datasets with Python, Pandas, and Scikit-learn to identify high-impact statistical patterns.</li>
            </ul>
          </div>
        </div>
      `;
    }
  },

  // 4.7 TERMUX (LINUX CLI FOR ANDROID)
  termux: {
    render() {
      return `
        <div class="termux-container" onclick="document.getElementById('termux-cmd-input')?.focus()">
          <div class="termux-output" id="termux-output">
Welcome to Termux (Android 10 Oreo Edition)
Copyright (C) 2026 Yatin Jain

Type <span style="color:#fff;font-weight:bold;">neofetch</span> to see system specs,
or <span style="color:#fff;font-weight:bold;">help</span> to list available commands.
          </div>
          <div class="termux-prompt-row">
            <span class="termux-prompt">yatin@android:~$</span>
            <input type="text" id="termux-cmd-input" autocomplete="off" spellcheck="false" autofocus>
          </div>
        </div>
      `;
    },
    onMounted() {
      const input = document.getElementById('termux-cmd-input');
      const output = document.getElementById('termux-output');
      if (!input || !output) return;

      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = input.value.trim();
          if (cmd) {
            output.innerHTML += `\n<span style="color:#38bdf8;">yatin@android:~$</span> ${cmd}\n`;
            this.handleCommand(cmd, output);
          }
          input.value = '';
          const container = output.parentElement;
          if (container) container.scrollTop = container.scrollHeight;
        }
      });
    },
    handleCommand(cmd, output) {
      const lower = cmd.toLowerCase().trim();
      switch(lower) {
        case 'neofetch':
          output.innerHTML += `
<span style="color:#38bdf8;">       _.-""""-._       </span> <span style="color:#fff;font-weight:bold;">yatin@android-10</span>
<span style="color:#38bdf8;">     .'          '.     </span> ----------------
<span style="color:#38bdf8;">    /   O      O   \\    </span> <span style="color:#38bdf8;">OS:</span> Android 10 (Oreo 10 Edition)
<span style="color:#38bdf8;">   |                |   </span> <span style="color:#38bdf8;">Host:</span> Yatin Jain Portfolio
<span style="color:#38bdf8;">   |   \\________/   |   </span> <span style="color:#38bdf8;">Role:</span> Full-Stack & Backend Developer
<span style="color:#38bdf8;">    \\              /    </span> <span style="color:#38bdf8;">Location:</span> Jaipur, Rajasthan, India
<span style="color:#38bdf8;">     '.          .'     </span> <span style="color:#38bdf8;">Stack:</span> Python, Next.js, Django, PostgreSQL
<span style="color:#38bdf8;">       '-......-'       </span> <span style="color:#38bdf8;">Shell:</span> Termux v10.2
`;
          break;

        case 'help':
          output.innerHTML += `Available Commands:
  neofetch      Display system summary & ASCII logo
  whoami        Developer credentials & summary
  skills        Technical skills & frameworks
  projects      Featured production projects
  exp           Work history & internships
  contact       Email, phone, LinkedIn & GitHub
  sudo hire     Direct contact shortcut
  clear         Clear the terminal screen`;
          break;

        case 'whoami':
          output.innerHTML += `Yatin Jain\nSoftware Engineer | Full-Stack & Backend Developer\nJaipur Engineering College and Research Centre (JECRC)\nExpected 2026 | CGPA: 6.82`;
          break;

        case 'skills':
          output.innerHTML += `Python, JavaScript, C/C++, SQL\nNext.js, React, Django, DRF, Tailwind CSS, Streamlit\nPostgreSQL, MongoDB, Supabase, Git, Postman, Vercel`;
          break;

        case 'projects':
          output.innerHTML += `1. Baba Ratna Plant Zone (Agricultural ERP) [Production Deployed]\n2. Library & Seat Management System [Cloud Deployed]\n3. Learning Tracker Microservice [API Service]`;
          break;

        case 'exp':
          output.innerHTML += `- Goldenhat Technologies (June 2026 – Present) | Software Engineer Intern\n- Navodita Infotech (July 2025 – August 2025) | Python Developer Intern\n- SkillCraft Technology (February 2025) | Data Science Intern`;
          break;

        case 'contact':
          output.innerHTML += `Email: jainyatin693@gmail.com\nPhone: +91 7357910535\nLinkedIn: https://linkedin.com/in/yatinjain75\nGitHub: https://github.com/yatinjain75`;
          break;

        case 'sudo hire':
          AndroidOS.openApp('gmail');
          output.innerHTML += `Opening Gmail compose window...`;
          break;

        case 'clear':
          output.innerHTML = '';
          break;

        default:
          output.innerHTML += `termux: command not found: ${cmd}. Type 'help' for available commands.`;
      }
    }
  },

  // 4.8 KEEP NOTES APP (WITH LOCALSTORAGE PERSISTENCE)
  keep: {
    render() {
      const savedNotes = this.getSavedNotes();
      return `
        <div style="padding:16px;">
          <!-- Note Composer -->
          <div class="keep-composer" style="margin-bottom:16px;">
            <input type="text" id="new-note-title" placeholder="Title" style="width:100%; border:none; outline:none; font-weight:600; font-size:13px; margin-bottom:6px;">
            <textarea id="new-note-body" placeholder="Take a note..." rows="2" style="width:100%; border:none; outline:none; font-family:inherit; font-size:12.5px; resize:none;"></textarea>
            <div style="display:flex; justify-content:flex-end;">
              <button onclick="AppRegistry.keep.saveNote()" style="padding:6px 14px; background:#1a73e8; color:#fff; border:none; border-radius:6px; font-size:11.5px; font-weight:600; cursor:pointer;">
                Save Note
              </button>
            </div>
          </div>

          <!-- Notes Grid -->
          <div class="keep-grid" id="keep-notes-container">
            <!-- Pinned Welcome Note -->
            <div class="keep-card yellow">
              <h4 style="font-size:13px; margin-bottom:4px;">Welcome to my Portfolio!</h4>
              <p style="font-size:12px; line-height:1.45;">
                Hi, I'm Yatin Jain. A Full-Stack & Backend Developer specializing in Python, Django, Next.js, and PostgreSQL.
              </p>
              <div style="font-size:10.5px; opacity:0.8; margin-top:8px;">📍 Jaipur, Rajasthan • ✉️ jainyatin693@gmail.com</div>
            </div>

            <!-- Dynamic user notes -->
            ${savedNotes.map((n, i) => `
              <div class="keep-card blue">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <h4 style="font-size:13px; margin-bottom:4px;">${n.title || 'Note'}</h4>
                  <button onclick="AppRegistry.keep.deleteNote(${i})" style="background:transparent; border:none; color:#dc2626; cursor:pointer;">✕</button>
                </div>
                <p style="font-size:12px; line-height:1.45;">${n.body}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },
    getSavedNotes() {
      try {
        return JSON.parse(localStorage.getItem('yatin_keep_notes') || '[]');
      } catch (e) {
        return [];
      }
    },
    saveNote() {
      const title = document.getElementById('new-note-title').value.trim();
      const body = document.getElementById('new-note-body').value.trim();
      if (!body) return;

      const notes = this.getSavedNotes();
      notes.unshift({ title, body, date: new Date().toISOString() });
      localStorage.setItem('yatin_keep_notes', JSON.stringify(notes));

      document.getElementById('new-note-title').value = '';
      document.getElementById('new-note-body').value = '';

      // Re-render
      const content = document.getElementById('app-viewport-content');
      if (content) content.innerHTML = this.render();
    },
    deleteNote(index) {
      const notes = this.getSavedNotes();
      notes.splice(index, 1);
      localStorage.setItem('yatin_keep_notes', JSON.stringify(notes));

      const content = document.getElementById('app-viewport-content');
      if (content) content.innerHTML = this.render();
    }
  },

  // 4.9 CALCULATOR APP
  calc: {
    curr: '0',
    prev: '',
    op: null,
    render() {
      return `
        <div>
          <div class="calc-screen">
            <div class="calc-prev" id="calc-prev-val">${this.prev} ${this.op || ''}</div>
            <div class="calc-curr" id="calc-curr-val">${this.curr}</div>
          </div>
          <div class="calc-grid">
            <button class="calc-btn op" onclick="AppRegistry.calc.clear()">C</button>
            <button class="calc-btn op" onclick="AppRegistry.calc.backspace()">⌫</button>
            <button class="calc-btn op" onclick="AppRegistry.calc.setOp('%')">%</button>
            <button class="calc-btn op" onclick="AppRegistry.calc.setOp('÷')">÷</button>
            
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('7')">7</button>
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('8')">8</button>
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('9')">9</button>
            <button class="calc-btn op" onclick="AppRegistry.calc.setOp('×')">×</button>
            
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('4')">4</button>
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('5')">5</button>
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('6')">6</button>
            <button class="calc-btn op" onclick="AppRegistry.calc.setOp('-')">-</button>
            
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('1')">1</button>
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('2')">2</button>
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('3')">3</button>
            <button class="calc-btn op" onclick="AppRegistry.calc.setOp('+')">+</button>
            
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('0')">0</button>
            <button class="calc-btn" onclick="AppRegistry.calc.appendNum('.')">.</button>
            <button class="calc-btn eq" style="grid-column: span 2;" onclick="AppRegistry.calc.evaluate()">=</button>
          </div>
        </div>
      `;
    },
    appendNum(n) {
      SoundSystem.click();
      if (this.curr === '0' && n !== '.') this.curr = n;
      else if (n === '.' && this.curr.includes('.')) return;
      else this.curr += n;
      this.updateDisplay();
    },
    setOp(operation) {
      SoundSystem.click();
      if (this.curr === '') return;
      if (this.prev !== '') this.evaluate();
      this.op = operation;
      this.prev = this.curr;
      this.curr = '';
      this.updateDisplay();
    },
    evaluate() {
      SoundSystem.click();
      let res;
      const p = parseFloat(this.prev);
      const c = parseFloat(this.curr);
      if (isNaN(p) || isNaN(c)) return;

      switch(this.op) {
        case '+': res = p + c; break;
        case '-': res = p - c; break;
        case '×': res = p * c; break;
        case '÷': res = c === 0 ? 'Error' : p / c; break;
        case '%': res = p % c; break;
        default: return;
      }

      this.curr = String(res);
      this.op = null;
      this.prev = '';
      this.updateDisplay();
    },
    clear() {
      SoundSystem.click();
      this.curr = '0';
      this.prev = '';
      this.op = null;
      this.updateDisplay();
    },
    backspace() {
      SoundSystem.click();
      this.curr = this.curr.slice(0, -1) || '0';
      this.updateDisplay();
    },
    updateDisplay() {
      const cEl = document.getElementById('calc-curr-val');
      const pEl = document.getElementById('calc-prev-val');
      if (cEl) cEl.textContent = this.curr;
      if (pEl) pEl.textContent = `${this.prev} ${this.op || ''}`;
    }
  },

  // 4.10 CLOCK & WEATHER APP
  clock: {
    swRunning: false,
    swTime: 0,
    swInterval: null,
    render() {
      return `
        <div style="padding:16px; text-align:center;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:20px; margin-bottom:16px;">
            <h3 style="font-size:14px; color:#64748b; margin-bottom:4px;">Jaipur, Rajasthan, India</h3>
            <div style="font-family:var(--font-display); font-size:36px; font-weight:700; color:#0f172a;">32°C</div>
            <div style="font-size:13px; color:#f59e0b; font-weight:600;"><i class="fa-solid fa-sun"></i> Sunny & Clear</div>
            <div style="font-size:11.5px; color:#94a3b8; margin-top:4px;">Humidity: 42% • Wind: 8 km/h</div>
          </div>

          <!-- Stopwatch -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:20px;">
            <h4 style="font-size:13px; color:#64748b; margin-bottom:8px;">Stopwatch</h4>
            <div id="sw-display" style="font-family:var(--font-display); font-size:40px; font-weight:600; color:#1a73e8; margin-bottom:14px;">00:00.0</div>
            <div style="display:flex; justify-content:center; gap:12px;">
              <button id="sw-start-btn" onclick="AppRegistry.clock.toggleStopwatch()" style="padding:8px 24px; background:#1a73e8; color:#fff; border:none; border-radius:20px; font-weight:600; cursor:pointer;">Start</button>
              <button onclick="AppRegistry.clock.resetStopwatch()" style="padding:8px 24px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:20px; font-weight:600; cursor:pointer;">Reset</button>
            </div>
          </div>
        </div>
      `;
    },
    toggleStopwatch() {
      const btn = document.getElementById('sw-start-btn');
      if (!this.swRunning) {
        this.swRunning = true;
        if (btn) { btn.textContent = 'Pause'; btn.style.background = '#ea4335'; }
        const startTime = Date.now() - this.swTime;
        this.swInterval = setInterval(() => {
          this.swTime = Date.now() - startTime;
          this.updateSWDisplay();
        }, 100);
      } else {
        this.swRunning = false;
        clearInterval(this.swInterval);
        if (btn) { btn.textContent = 'Resume'; btn.style.background = '#1a73e8'; }
      }
    },
    resetStopwatch() {
      this.swRunning = false;
      clearInterval(this.swInterval);
      this.swTime = 0;
      const btn = document.getElementById('sw-start-btn');
      if (btn) { btn.textContent = 'Start'; btn.style.background = '#1a73e8'; }
      this.updateSWDisplay();
    },
    updateSWDisplay() {
      const d = document.getElementById('sw-display');
      if (!d) return;
      const totalSec = Math.floor(this.swTime / 1000);
      const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      const ms = Math.floor((this.swTime % 1000) / 100);
      d.textContent = `${m}:${s}.${ms}`;
    }
  }

};

// ============================================================================
// 5. BOOTSTRAP OS ON DOM CONTENT LOADED
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  AndroidOS.init();
});
