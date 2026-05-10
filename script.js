/* =============================================================================
   LIMITLESS TRUEVIBE — script.js
   =============================================================================

   TABLE OF CONTENTS
   -----------------
   1.  Config              — Challenge, playlist, and Google Form URLs
   2.  DOM Ready           — Entry point
   3.  Navigation          — Mobile hamburger menu
   4.  Hero Wave Canvas    — Animated waveform behind hero logo
   5.  Particles           — Floating dots in hero background
   6.  Wave Strips         — Equalizer bar dividers
   7.  Scroll Reveal       — Fade-in on scroll
   8.  Dynamic Year        — Footer copyright year
   9.  Challenge Banner    — Renders current challenge info
   10. Playlist Banner     — Renders current playlist info
   11. Challenge Card      — Submission + voting link card
   12. Playlist Card       — Submission link card
   13. Playlist Embeds     — SoundCloud iframes
   14. Admin Panel         — ?admin=1 controls

============================================================================= */


/* =============================================================================
   1. CONFIG
   — Update CURRENT_CHALLENGE and CURRENT_PLAYLIST each month.
   — Update FORMS with your Google Form URLs.
   — Toggle submissionsOpen / votingOpen to show or hide links.
============================================================================= */

const CURRENT_CHALLENGE = {
  title:           'Doppelganger',
  desc:            'Create a track in the style of any artist in the Discord. It could be their signature sound, their usual BPM, their go-to genre — just make us feel like it could have been them.',
  deadline:        'May 31, 2026',
  type:            'mimic',       // 'standard' or 'mimic'
  submissionsOpen: true,          // ← flip to false to hide the submission button
  votingOpen:      false,         // ← flip to true when voting is active
};

const CURRENT_PLAYLIST = {
  title:           'Coming Soon',
  desc:            'The next LTV community playlist is on its way. Keep an eye on Discord for the announcement.',
  deadline:        '',
  submissionsOpen: false,         // ← flip to true when accepting submissions
};

const FORMS = {
  challengeSubmit: 'https://forms.gle/9oFPNXYuXviJzNcP7',   // ← paste your Google Form URL here
  voting:          'YOUR_VOTING_GOOGLE_FORM_URL',                  // ← paste your voting Google Form URL here
  playlistSubmit:  'YOUR_PLAYLIST_SUBMISSION_GOOGLE_FORM_URL',     // ← paste your Google Form URL here
};

const PLAYLISTS = [
  {
    id:       'ltv-vol-4',
    title:    'LTV Vol. 4',
    subtitle: 'Community Mix',
    embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2202404786&color=%23d181a8&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
  },
  {
    id:       'can-you-feel-the-love',
    title:    'Can You Feel the Love',
    subtitle: 'Valentines Day Themed Playlist',
    embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2187240119&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
  },
  {
    id:       '90s-playlist',
    title:    'LTV TOTALLY 90\'s MUSIC PLAYLIST',
    subtitle: 'Our Most Popular Playlist',
    embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2091636739&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
  },
];


/* =============================================================================
   2. DOM READY
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  loadAdminOverrides();
  initMobileNav();
  initHeroWave();
  initParticles();
  initWaveStrips();
  initScrollReveal();
  initDynamicYear();
  renderChallengeBanner();
  renderChallengeCard();
  renderPlaylistBanner();
  renderPlaylistCard();
  renderPlaylistEmbeds();
  initAdminPanel();
});


/* =============================================================================
   3. NAVIGATION
============================================================================= */

function initMobileNav() {
  const hamburger   = document.getElementById('navHamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}


/* =============================================================================
   4. HERO WAVE CANVAS
============================================================================= */

function initHeroWave() {
  const canvas = document.getElementById('heroWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;

  const waves = [
    { freq: 0.018, amp: 55, speed: 0.012, offset: 0,   color: 'rgba(209,129,168,0.55)', width: 2 },
    { freq: 0.025, amp: 35, speed: 0.018, offset: 2,   color: 'rgba(96,55,107,0.5)',    width: 1.5 },
    { freq: 0.012, amp: 70, speed: 0.008, offset: 4,   color: 'rgba(252,255,222,0.25)', width: 1 },
    { freq: 0.030, amp: 25, speed: 0.022, offset: 1,   color: 'rgba(209,129,168,0.3)',  width: 1 },
    { freq: 0.020, amp: 45, speed: 0.015, offset: 3.5, color: 'rgba(96,55,107,0.35)',   width: 1.5 },
  ];

  let tick = 0;

  function resize() {
    const hero = document.getElementById('hero');
    width  = canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    height = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);
    const centerY = height / 2;
    waves.forEach(wave => {
      ctx.beginPath();
      ctx.strokeStyle = wave.color;
      ctx.lineWidth   = wave.width;
      for (let x = 0; x <= width; x += 2) {
        const y = centerY + Math.sin(x * wave.freq + tick * wave.speed + wave.offset) * wave.amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    tick++;
    requestAnimationFrame(drawFrame);
  }

  resize();
  window.addEventListener('resize', resize);
  drawFrame();
}


/* =============================================================================
   5. PARTICLES
============================================================================= */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#d181a8', '#fcffde', '#60376b'];
  for (let i = 0; i < 35; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 3 + 1;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 40}%;
      width: ${size}px; height: ${size}px;
      animation-duration: ${6 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 8}s;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
    `;
    container.appendChild(p);
  }
}


/* =============================================================================
   6. WAVE STRIPS
============================================================================= */

function initWaveStrips() {
  ['ws1', 'ws2', 'ws3'].forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;
    for (let i = 0; i < 90; i++) {
      const bar     = document.createElement('div');
      bar.className = 'wbar';
      const h       = Math.random() * 34 + 5;
      bar.style.cssText = `
        --h: ${h}px;
        animation-delay: ${Math.random() * 1.2}s;
        animation-duration: ${0.6 + Math.random() * 0.9}s;
      `;
      container.appendChild(bar);
    }
  });
}


/* =============================================================================
   7. SCROLL REVEAL
============================================================================= */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );
  elements.forEach(el => observer.observe(el));
}


/* =============================================================================
   8. DYNAMIC YEAR
============================================================================= */

function initDynamicYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* =============================================================================
   9. CHALLENGE BANNER
============================================================================= */

function renderChallengeBanner() {
  const banner = document.getElementById('challengeBanner');
  if (!banner) return;
  const c = getChallenge();

  let statusHTML = '';
  if (c.votingOpen) {
    statusHTML = `
      <span class="challenge-status challenge-status--voting">
        <span class="challenge-status-dot"></span>
        Voting is Live
      </span>`;
  } else if (c.submissionsOpen) {
    statusHTML = `
      <span class="challenge-status">
        <span class="challenge-status-dot"></span>
        Open for Submissions
      </span>`;
  } else {
    statusHTML = `
      <span class="challenge-status challenge-status--closed">
        Submissions Closed
      </span>`;
  }

  banner.innerHTML = `
    <div class="challenge-banner-left">
      <span class="challenge-banner-tag">This Month's Challenge</span>
      <div class="challenge-banner-title">${c.title}</div>
      <div class="challenge-banner-desc">${c.desc}</div>
    </div>
    <div class="challenge-banner-meta">
      ${c.deadline ? '<span class="challenge-deadline">Deadline: ' + c.deadline + '</span>' : ''}
      ${statusHTML}
    </div>
  `;
}


/* =============================================================================
   10. PLAYLIST BANNER
============================================================================= */

function renderPlaylistBanner() {
  const banner = document.getElementById('playlistBanner');
  if (!banner) return;
  const p = getPlaylist();

  if (!p.submissionsOpen) {
    banner.innerHTML = `
      <span class="challenge-banner-tag">Playlist Submissions</span>
      <div class="challenge-banner-title">No Active Playlist Right Now</div>
      <div class="challenge-banner-desc">We're not currently building a playlist. Keep an eye on Discord — we'll announce the next one there first.</div>
    `;
    return;
  }

  banner.innerHTML = `
    <span class="challenge-banner-tag">Now Accepting Submissions</span>
    <div class="challenge-banner-title">${p.title}</div>
    <div class="challenge-banner-desc">${p.desc}</div>
    ${p.deadline ? '<div style="margin-top:0.8rem;"><span class="challenge-deadline">Deadline: ' + p.deadline + '</span></div>' : ''}
  `;
}


/* =============================================================================
   11. CHALLENGE CARD
   — Shows submission button, voting button, or closed message
   — based on the submissionsOpen and votingOpen flags.
============================================================================= */

function renderChallengeCard() {
  const card = document.getElementById('challengeFormCard');
  if (!card) return;
  const c     = getChallenge();
  const forms = getForms();

  let actionHTML = '';

  if (c.votingOpen && forms.voting && forms.voting !== 'YOUR_VOTING_GOOGLE_FORM_URL') {
    actionHTML = `
      <a href="${forms.voting}" target="_blank" rel="noopener" class="submit-btn submit-btn--voting">
        🗳 Cast Your Vote
      </a>
      <p class="form-note">Voting is open to the whole community. One vote per person.</p>
    `;
  } else if (c.submissionsOpen && forms.challengeSubmit && forms.challengeSubmit !== 'YOUR_CHALLENGE_SUBMISSION_GOOGLE_FORM_URL') {
    actionHTML = `
      <a href="${forms.challengeSubmit}" target="_blank" rel="noopener" class="submit-btn">
        Submit to This Month's Challenge →
      </a>
      <p class="form-note">Free forever. Opens in Google Forms. By submitting you confirm this is your original work.</p>
    `;
  } else if (c.votingOpen) {
    actionHTML = `
      <div class="form-lock-notice">Voting is active — check Discord for the voting link.</div>
      <button class="submit-btn" disabled>Voting in Progress</button>
    `;
  } else {
    actionHTML = `
      <div class="form-lock-notice">Submissions are currently closed. Stay tuned in Discord for the next challenge.</div>
      <button class="submit-btn" disabled>Submissions Closed</button>
    `;
  }

  card.innerHTML = `
    <h3>Submit Your Beat</h3>
    <p class="form-sub">
      ${c.submissionsOpen && !c.votingOpen
        ? 'Submit via Google Forms. Upload your WAV, fill in your details, and you\'re done.'
        : c.votingOpen
        ? 'Submissions are closed. The community is now voting on this month\'s tracks.'
        : 'Check back when the next challenge opens.'}
    </p>
    ${c.type === 'mimic' && c.submissionsOpen && !c.votingOpen
      ? '<div class="mimic-note">🎭 <strong>Mimic challenge:</strong> Include the name of the artist you\'re mimicking in your submission notes.</div>'
      : ''}
    ${actionHTML}
  `;
}


/* =============================================================================
   12. PLAYLIST CARD
============================================================================= */

function renderPlaylistCard() {
  const card = document.getElementById('playlistFormCard');
  if (!card) return;
  const p     = getPlaylist();
  const forms = getForms();

  let actionHTML = '';

  if (p.submissionsOpen && forms.playlistSubmit && forms.playlistSubmit !== 'YOUR_PLAYLIST_SUBMISSION_GOOGLE_FORM_URL') {
    actionHTML = `
      <a href="${forms.playlistSubmit}" target="_blank" rel="noopener" class="submit-btn">
        Submit for This Playlist →
      </a>
      <p class="form-note">Free forever. Opens in Google Forms. By submitting you confirm this is your original work.</p>
    `;
  } else if (p.submissionsOpen) {
    actionHTML = `
      <div class="form-lock-notice">Submissions are open — check Discord for the submission link.</div>
      <button class="submit-btn" disabled>Submission Link Coming Soon</button>
    `;
  } else {
    actionHTML = `
      <div class="form-lock-notice">No playlist is currently open for submissions. Watch Discord for the next one.</div>
      <button class="submit-btn" disabled>No Active Playlist</button>
    `;
  }

  card.innerHTML = `
    <h3>Submit a Track</h3>
    <p class="form-sub">
      ${p.submissionsOpen
        ? 'Submit via Google Forms. Upload your WAV and we\'ll take it from there.'
        : 'Playlist submissions are currently closed.'}
    </p>
    ${actionHTML}
  `;
}


/* =============================================================================
   13. PLAYLIST EMBEDS
============================================================================= */

function renderPlaylistEmbeds() {
  const container = document.getElementById('playlistEmbeds');
  if (!container) return;
  container.innerHTML = PLAYLISTS.map(pl => `
    <div class="soundcloud-embed-wrap">
      <div class="embed-label">
        <span class="embed-title">${pl.title}</span>
        <span class="embed-tag">${pl.subtitle}</span>
      </div>
      <iframe src="${pl.embedUrl}" height="166" allow="autoplay" loading="lazy" title="${pl.title} on SoundCloud"></iframe>
    </div>
  `).join('');
}


/* =============================================================================
   14. ADMIN PANEL
   — Accessible at ?admin=1
   — All changes save to localStorage and apply immediately.
   — To make permanent: copy values back into CONFIG at top of this file.
============================================================================= */

const ADMIN_CHALLENGE_KEY = 'ltv_admin_challenge';
const ADMIN_PLAYLIST_KEY  = 'ltv_admin_playlist';
const ADMIN_FORMS_KEY     = 'ltv_admin_forms';

function loadAdminOverrides() {
  try {
    const c = localStorage.getItem(ADMIN_CHALLENGE_KEY);
    const p = localStorage.getItem(ADMIN_PLAYLIST_KEY);
    const f = localStorage.getItem(ADMIN_FORMS_KEY);
    if (c) Object.assign(CURRENT_CHALLENGE, JSON.parse(c));
    if (p) Object.assign(CURRENT_PLAYLIST,  JSON.parse(p));
    if (f) Object.assign(FORMS,             JSON.parse(f));
  } catch {}
}

function getChallenge() { return CURRENT_CHALLENGE; }
function getPlaylist()  { return CURRENT_PLAYLIST; }
function getForms()     { return FORMS; }

function initAdminPanel() {
  const isAdmin  = new URLSearchParams(window.location.search).get('admin') === '1';
  if (!isAdmin) return;

  const fab      = document.getElementById('adminFab');
  const overlay  = document.getElementById('adminOverlay');
  const closeBtn = document.getElementById('adminClose');

  if (fab) fab.classList.add('visible');
  setAdminFields();

  fab?.addEventListener('click',     () => overlay?.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click',  e => { if (e.target === overlay) overlay.classList.remove('open'); });

  // Tab switching
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('adminPanel' + capitalize(tab.dataset.panel))?.classList.add('active');
    });
  });

  // Save challenge
  document.getElementById('saveChallenge')?.addEventListener('click', () => {
    const override = {
      title:           document.getElementById('adminChallengeTitle')?.value.trim()    || CURRENT_CHALLENGE.title,
      desc:            document.getElementById('adminChallengeDesc')?.value.trim()     || CURRENT_CHALLENGE.desc,
      deadline:        document.getElementById('adminChallengeDeadline')?.value.trim() || CURRENT_CHALLENGE.deadline,
      type:            document.getElementById('adminChallengeType')?.value            || CURRENT_CHALLENGE.type,
      submissionsOpen: document.getElementById('adminChallengeOpen')?.checked          ?? CURRENT_CHALLENGE.submissionsOpen,
      votingOpen:      document.getElementById('adminChallengeVoting')?.checked        ?? CURRENT_CHALLENGE.votingOpen,
    };
    localStorage.setItem(ADMIN_CHALLENGE_KEY, JSON.stringify(override));
    Object.assign(CURRENT_CHALLENGE, override);
    renderChallengeBanner();
    renderChallengeCard();
    flashSaved('saveChallenge');
  });

  // Save playlist
  document.getElementById('savePlaylist')?.addEventListener('click', () => {
    const override = {
      title:           document.getElementById('adminPlaylistTitle')?.value.trim()    || CURRENT_PLAYLIST.title,
      desc:            document.getElementById('adminPlaylistDesc')?.value.trim()     || CURRENT_PLAYLIST.desc,
      deadline:        document.getElementById('adminPlaylistDeadline')?.value.trim() || CURRENT_PLAYLIST.deadline,
      submissionsOpen: document.getElementById('adminPlaylistOpen')?.checked          ?? CURRENT_PLAYLIST.submissionsOpen,
    };
    localStorage.setItem(ADMIN_PLAYLIST_KEY, JSON.stringify(override));
    Object.assign(CURRENT_PLAYLIST, override);
    renderPlaylistBanner();
    renderPlaylistCard();
    flashSaved('savePlaylist');
  });

  // Save links
  document.getElementById('saveLinks')?.addEventListener('click', () => {
    const override = {
      challengeSubmit: document.getElementById('adminChallengeFormUrl')?.value.trim() || FORMS.challengeSubmit,
      voting:          document.getElementById('adminVotingFormUrl')?.value.trim()    || FORMS.voting,
      playlistSubmit:  document.getElementById('adminPlaylistFormUrl')?.value.trim()  || FORMS.playlistSubmit,
    };
    localStorage.setItem(ADMIN_FORMS_KEY, JSON.stringify(override));
    Object.assign(FORMS, override);
    renderChallengeCard();
    renderPlaylistCard();
    flashSaved('saveLinks');
  });
}

function setAdminFields() {
  const c = getChallenge();
  const p = getPlaylist();
  const f = getForms();
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

  setVal('adminChallengeTitle',    c.title);
  setVal('adminChallengeDesc',     c.desc);
  setVal('adminChallengeDeadline', c.deadline);
  setVal('adminChallengeType',     c.type);
  setChk('adminChallengeOpen',     c.submissionsOpen);
  setChk('adminChallengeVoting',   c.votingOpen);

  setVal('adminPlaylistTitle',     p.title);
  setVal('adminPlaylistDesc',      p.desc);
  setVal('adminPlaylistDeadline',  p.deadline);
  setChk('adminPlaylistOpen',      p.submissionsOpen);

  setVal('adminChallengeFormUrl',  f.challengeSubmit !== 'YOUR_CHALLENGE_SUBMISSION_GOOGLE_FORM_URL' ? f.challengeSubmit : '');
  setVal('adminVotingFormUrl',     f.voting          !== 'YOUR_VOTING_GOOGLE_FORM_URL'               ? f.voting          : '');
  setVal('adminPlaylistFormUrl',   f.playlistSubmit  !== 'YOUR_PLAYLIST_SUBMISSION_GOOGLE_FORM_URL'  ? f.playlistSubmit  : '');
}

function flashSaved(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const orig           = btn.textContent;
  btn.textContent      = '✓ Saved!';
  btn.style.background = 'linear-gradient(135deg, #2a6030, #1a4020)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
