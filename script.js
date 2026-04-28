/* =============================================================================
   LIMITLESS TRUEVIBE — script.js
   =============================================================================

   TABLE OF CONTENTS
   -----------------
   1.  Config              — URLs, counts, form endpoint
   2.  Current Challenge   — UPDATE THIS each month for a new challenge
   3.  Current Playlist    — UPDATE THIS when starting a new playlist
   4.  Playlist Archive    — Past SoundCloud playlists (embedded)
   5.  DOM Ready           — Entry point, wires everything up
   6.  Navigation          — Mobile hamburger menu
   7.  Hero Wave Canvas    — Animated waveform behind the hero logo
   8.  Particles           — Floating dots in hero background
   9.  Wave Strips         — Equalizer bar dividers between sections
   10. Scroll Reveal       — Fade-in on scroll
   11. Dynamic Year        — Auto-updates footer copyright year
   12. Challenge Banner    — Renders current challenge info
   13. Playlist Banner     — Renders current playlist info
   14. Playlist Embeds     — Renders SoundCloud embed iframes
   15. Challenge Form      — Validation + submission
   16. Playlist Form       — Validation + submission
   17. Submissions DB      — localStorage-based submission store
   18. Admin Panel         — ?admin=1 modal for updating content without code

============================================================================= */


/* =============================================================================
   1. CONFIG
   — Site-wide settings. Update URLs before going live.
============================================================================= */

const CONFIG = {
  discord:      'https://discord.gg/https://discord.gg/AFdeZHfDZNINVITE',
  youtube:      'http://youtube.com/@limitlesstruevibe',
  soundcloud:   'https://soundcloud.com/limitless_truevibe',
  bandcamp:     'https://limitlesstruevibe.bandcamp.com/album/starlit-signals-a-truevibe-compilation',
  supabaseUrl:  'https://bqcjabpybovkpdczfdbv.supabase.co',
  supabaseKey:  'sb_publishable_uyXl-TEe2bM0mOstjywkwg__eTiuyCW',

  // Formspree endpoint for form submissions (email delivery).
  // Leave empty to use the built-in localStorage database only.
  // To enable email: create a form at https://formspree.io, paste your endpoint here,
  // and see README.md for full setup instructions.
  formEndpoint: '',

  particleCount: 35,
  waveBarsCount: 90,
};


/* =============================================================================
   2. CURRENT CHALLENGE
   — This is what shows in the banner and drives the submission form.
   — UPDATE THIS OBJECT each month when you start a new challenge.
   —
   — Fields:
   —   id:        Unique slug — used as a folder key in the submissions DB.
   —              Change this when you start a new challenge so submissions
   —              don't mix with the previous month's.
   —   title:     The challenge name shown in the banner
   —   desc:      Description shown in the banner
   —   deadline:  Plain text deadline shown in the banner
   —   type:      "standard" = normal beat challenge
   —              "mimic"    = shows the "Who are you mimicking?" field
   —                          (e.g. for Doppelganger challenges)
   —
   — You can also update this via the Admin Panel (?admin=1 in the URL)
   — without touching this file — see README.md.
============================================================================= */

const CURRENT_CHALLENGE = {
  id:       'doppelganger-2026-05',
  title:    'Doppelganger',
  desc:     'Create a track in the style of any artist in the Discord. It could be their signature sound, their usual BPM, their go-to genre — just make us feel like it could have been them.',
  deadline: 'May 15, 2026',
  type:     'mimic',    // shows the "Who are you mimicking?" field
};


/* =============================================================================
   3. CURRENT PLAYLIST
   — Drives the banner above the playlists section and the submission form.
   — UPDATE THIS OBJECT when you start building a new playlist.
   —
   — Fields:
   —   id:        Unique slug — used as a folder key in the submissions DB
   —   title:     Playlist name shown in the banner
   —   desc:      Theme/description shown in the banner
   —   deadline:  Plain text submission deadline
============================================================================= */

const CURRENT_PLAYLIST = {
  id:       'fossil-eater-2026-04',
  title:    'Fossil Eater Sample Playlist',
  desc:     'Our next community playlist is open for submissions. Producer\'s must use at least 3 of 8 samples provided by Fossil Eater (check Discord)',
  deadline: 'April 30, 2026',
};


/* =============================================================================
   4. PLAYLIST ARCHIVE
   — Past community playlists displayed as SoundCloud embeds.
   — To add a new playlist after it's posted on SoundCloud:
   —   1. Copy the SoundCloud playlist URL
   —   2. Add a new object to this array (most recent first)
   —   3. Save the file — it appears automatically
   —
   — Getting the embed URL:
   —   Go to your SoundCloud playlist → Share → Embed
   —   Copy the URL from the iframe src attribute.
   —   It looks like: https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/XXXXXXXXX&...
   —   Paste that full URL as the embedUrl below.
============================================================================= */

const PLAYLISTS = [
  {
    id:       'ltv-vol-4',
    title:    'LTV Vol. 4',
    subtitle: 'Community Mix',
    // Replace with real SoundCloud embed URL from Share → Embed on your playlist
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
    title:    'LTV TOTALLY 90\’s MUSIC PLAYLIST',
    subtitle: 'Our Most Popular Playlist',
    embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2091636739&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
  },
];


/* =============================================================================
   5. DOM READY
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  loadAdminOverrides();       // Apply any admin-saved overrides first
  initMobileNav();
  initHeroWave();
  initParticles();
  initWaveStrips();
  initScrollReveal();
  initDynamicYear();
  renderChallengeBanner();
  renderPlaylistBanner();
  renderPlaylistEmbeds();
  initChallengeForm();
  initPlaylistForm();
  initAdminPanel();
});


/* =============================================================================
   6. NAVIGATION
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
   7. HERO WAVE CANVAS
   — Draws a multi-layered animated waveform across the full hero width.
   — Sits behind the logo at low opacity (controlled in CSS via .hero-wave-canvas).
   — Uses requestAnimationFrame for smooth 60fps animation.
============================================================================= */

function initHeroWave() {
  const canvas = document.getElementById('heroWaveCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, animFrame;

  // Wave layer definitions — each has its own speed, amplitude, and color
  const waves = [
    { freq: 0.018, amp: 55, speed: 0.012, offset: 0,    color: 'rgba(209,129,168,0.55)', width: 2 },
    { freq: 0.025, amp: 35, speed: 0.018, offset: 2,    color: 'rgba(96,55,107,0.5)',    width: 1.5 },
    { freq: 0.012, amp: 70, speed: 0.008, offset: 4,    color: 'rgba(252,255,222,0.25)', width: 1 },
    { freq: 0.030, amp: 25, speed: 0.022, offset: 1,    color: 'rgba(209,129,168,0.3)',  width: 1 },
    { freq: 0.020, amp: 45, speed: 0.015, offset: 3.5,  color: 'rgba(96,55,107,0.35)',   width: 1.5 },
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
    animFrame = requestAnimationFrame(drawFrame);
  }

  resize();
  window.addEventListener('resize', resize);
  drawFrame();
}


/* =============================================================================
   8. PARTICLES
============================================================================= */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = ['#d181a8', '#fcffde', '#60376b'];

  for (let i = 0; i < CONFIG.particleCount; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 3 + 1;
    p.style.cssText = `
      left:               ${Math.random() * 100}%;
      bottom:             ${Math.random() * 40}%;
      width:              ${size}px;
      height:             ${size}px;
      animation-duration: ${6 + Math.random() * 12}s;
      animation-delay:    ${Math.random() * 8}s;
      background:         ${colors[Math.floor(Math.random() * colors.length)]};
    `;
    container.appendChild(p);
  }
}


/* =============================================================================
   9. WAVE STRIPS
============================================================================= */

function initWaveStrips() {
  ['ws1', 'ws2', 'ws3'].forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;

    for (let i = 0; i < CONFIG.waveBarsCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'wbar';
      const h = Math.random() * 34 + 5;
      bar.style.cssText = `
        --h:                ${h}px;
        animation-delay:    ${Math.random() * 1.2}s;
        animation-duration: ${0.6 + Math.random() * 0.9}s;
      `;
      container.appendChild(bar);
    }
  });
}


/* =============================================================================
   10. SCROLL REVEAL
============================================================================= */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}


/* =============================================================================
   11. DYNAMIC YEAR
============================================================================= */

function initDynamicYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* =============================================================================
   12. CHALLENGE BANNER
   — Reads from CURRENT_CHALLENGE (or admin override in localStorage)
   — and injects the banner HTML into #challengeBanner.
   — Also populates the hidden form fields and shows/hides the mimic field.
============================================================================= */

function renderChallengeBanner() {
  const banner = document.getElementById('challengeBanner');
  if (!banner) return;

  const c = getChallenge();

  banner.innerHTML = `
    <div class="challenge-banner-left">
      <span class="challenge-banner-tag">This Month's Challenge</span>
      <div class="challenge-banner-title">${c.title}</div>
      <div class="challenge-banner-desc">${c.desc}</div>
    </div>
    <div class="challenge-banner-meta">
      <span class="challenge-deadline">Deadline: ${c.deadline}</span>
      <span class="challenge-status">
        <span class="challenge-status-dot"></span>
        Open for Submissions
      </span>
    </div>
  `;

  // Populate hidden form fields
  const idField   = document.getElementById('challengeId');
  const nameField = document.getElementById('challengeNameField');
  if (idField)   idField.value   = c.id;
  if (nameField) nameField.value = c.title;

  // Show mimic field if challenge type is "mimic"
  const mimicField = document.getElementById('mimicField');
  if (mimicField) {
    mimicField.classList.toggle('visible', c.type === 'mimic');
  }
}


/* =============================================================================
   13. PLAYLIST BANNER
   — Reads from CURRENT_PLAYLIST (or admin override) and injects the banner.
   — Also updates the form subtitle and hidden fields.
============================================================================= */

function renderPlaylistBanner() {
  const banner = document.getElementById('playlistBanner');
  if (!banner) return;

  const p = getPlaylist();

  banner.innerHTML = `
    <span class="challenge-banner-tag">Now Accepting Submissions</span>
    <div class="challenge-banner-title">${p.title}</div>
    <div class="challenge-banner-desc">${p.desc}</div>
    <div style="margin-top:0.8rem;">
      <span class="challenge-deadline">Submission Deadline: ${p.deadline}</span>
    </div>
  `;

  // Update form subtitle
  const sub = document.getElementById('playlistFormSub');
  if (sub) sub.textContent = `Submit a track for ${p.title}. We'll pick the best fits and post the playlist on SoundCloud.`;

  // Populate hidden fields
  const idField   = document.getElementById('playlistId');
  const nameField = document.getElementById('playlistNameField');
  if (idField)   idField.value   = p.id;
  if (nameField) nameField.value = p.title;
}


/* =============================================================================
   14. PLAYLIST EMBEDS
   — Reads the PLAYLISTS array and injects SoundCloud iframes.
   — Each iframe uses the SoundCloud embed player.
   — Visuals are enabled (visual=true) for the full artwork experience.
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
      <iframe
        src="${pl.embedUrl}"
        height="166"
        allow="autoplay"
        loading="lazy"
        title="${pl.title} on SoundCloud"
      ></iframe>
    </div>
  `).join('');
}


/* =============================================================================
   15. CHALLENGE FORM
============================================================================= */

function initChallengeForm() {
  const form = document.getElementById('challengeForm');
  if (!form) return;
  initDropZone('challengeDropZone', 'trackFile', 'challengeFileSelected');
  form.addEventListener('submit', e => handleFormSubmit(e, 'challenge'));
}


/* =============================================================================
   16. PLAYLIST FORM
============================================================================= */

function initPlaylistForm() {
  const form = document.getElementById('playlistForm');
  if (!form) return;
  initDropZone('playlistDropZone', 'plTrackFile', 'playlistFileSelected');
  form.addEventListener('submit', e => handleFormSubmit(e, 'playlist'));
}


/* =============================================================================
   FILE DROP ZONE
   — Wires up drag-and-drop and click-to-browse for a WAV file input.
   — Validates that the selected file is a .wav before accepting it.
   — zoneId:     the .file-drop-zone div id
   — inputId:    the hidden <input type="file"> id
   — feedbackId: the .file-selected div id for success/error messages
============================================================================= */

function initDropZone(zoneId, inputId, feedbackId) {
  const zone     = document.getElementById(zoneId);
  const input    = document.getElementById(inputId);
  const feedback = document.getElementById(feedbackId);
  if (!zone || !input || !feedback) return;

  // Drag events
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) applyFile(file, input, zone, feedback);
  });

  // Native file picker change
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) applyFile(file, input, zone, feedback);
  });
}

/**
 * Validates the file is a .wav and updates UI accordingly.
 * If invalid, clears the input so the form won't submit it.
 */
function applyFile(file, input, zone, feedback) {
  const isWav = file.name.toLowerCase().endsWith('.wav') ||
                file.type === 'audio/wav' ||
                file.type === 'audio/x-wav';

  if (!isWav) {
    // Clear the input
    input.value = '';
    zone.classList.remove('has-file');
    zone.classList.add('has-error');
    feedback.className   = 'file-selected error';
    feedback.textContent = `"${file.name}" isn't a .wav file. Please export your track as WAV and try again.`;
    return;
  }

  const sizeMB = (file.size / 1024 / 1024).toFixed(1);
  if (file.size > 100 * 1024 * 1024) {
    input.value = '';
    zone.classList.remove('has-file');
    zone.classList.add('has-error');
    feedback.className   = 'file-selected error';
    feedback.textContent = `That file is ${sizeMB}MB — please keep WAVs under 100MB.`;
    return;
  }

  zone.classList.remove('has-error');
  zone.classList.add('has-file');
  feedback.className   = 'file-selected success';
  feedback.textContent = `${file.name} (${sizeMB} MB) — ready to submit`;
}


/* =============================================================================
   SHARED FORM HANDLER
   — Used by both challenge and playlist forms.
   — type: 'challenge' | 'playlist'
============================================================================= */

function handleFormSubmit(e, type) {
  e.preventDefault();
  const form  = e.target;
  const btnId = type === 'challenge' ? 'challengeBtn' : 'playlistBtn';
  const btn   = document.getElementById(btnId);

  clearErrors(form);
  const errors = validateForm(form, type);

  if (errors.length > 0) {
    errors.forEach(({ fieldId, message }) => showFieldError(fieldId, message));
    return;
  }

  // Collect text fields; file is handled separately for real uploads
  const data = {};
  new FormData(form).forEach((val, key) => {
    if (typeof val === 'string') data[key] = val;
  });
  data.submitted_at = new Date().toISOString();
  data.type         = type;

  // Grab file name for logging (actual upload needs a backend — see README)
  const fileInputId = type === 'challenge' ? 'trackFile' : 'plTrackFile';
  const fileInput   = document.getElementById(fileInputId);
  if (fileInput?.files?.[0]) {
    data.track_filename = fileInput.files[0].name;
    data.track_filesize = fileInput.files[0].size;
  }

  saveSubmission(type, data);

  if (CONFIG.formEndpoint) {
    submitToFormspree(form, btn, data, type);
  } else {
    setSubmitSuccess(btn, form, type);
  }
}

function validateForm(form, type) {
  const errors = [];

  const nameId  = type === 'playlist' ? 'plArtistName'  : 'artistName';
  const emailId = type === 'playlist' ? 'plArtistEmail' : 'artistEmail';
  const titleId = type === 'playlist' ? 'plTrackTitle'  : 'trackTitle';
  const fileId  = type === 'playlist' ? 'plTrackFile'   : 'trackFile';

  const name  = form.querySelector(`#${nameId}`);
  const email = form.querySelector(`#${emailId}`);
  const title = form.querySelector(`#${titleId}`);
  const file  = form.querySelector(`#${fileId}`);

  if (name  && !name.value.trim())
    errors.push({ fieldId: nameId,  message: 'Please enter your artist name.' });

  if (email && (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)))
    errors.push({ fieldId: emailId, message: 'Please enter a valid email address.' });

  if (title && !title.value.trim())
    errors.push({ fieldId: titleId, message: 'Please enter a track title.' });

  if (!file?.files?.length) {
    errors.push({ fieldId: fileId, message: 'Please upload your .wav file.' });
  } else {
    const f = file.files[0];
    const isWav = f.name.toLowerCase().endsWith('.wav') || f.type === 'audio/wav' || f.type === 'audio/x-wav';
    if (!isWav) errors.push({ fieldId: fileId, message: 'Only .wav files are accepted.' });
    if (f.size > 100 * 1024 * 1024) errors.push({ fieldId: fileId, message: 'File must be under 100MB.' });
  }

  return errors;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.borderColor = '#e05a5a';
  const err = document.createElement('span');
  err.className  = 'field-error';
  err.style.cssText = 'color:#e05a5a; font-size:0.75rem; margin-top:0.2rem; display:block;';
  err.textContent = message;
  field.parentElement.appendChild(err);
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('input, select, textarea').forEach(el => el.style.borderColor = '');
}

async function submitToFormspree(form, btn, data, type) {
  btn.textContent = 'Sending...';
  btn.disabled    = true;
  try {
    const res = await fetch(CONFIG.formEndpoint, {
      method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' },
    });
    res.ok ? setSubmitSuccess(btn, form, type) : setSubmitError(btn);
  } catch {
    setSubmitError(btn);
  }
}

function setSubmitSuccess(btn, form, type) {
  const msg = type === 'challenge' ? '✓ Beat submitted! Watch Discord for updates.' : '✓ Track submitted! We\'ll be in touch.';
  btn.textContent     = msg;
  btn.style.background = 'linear-gradient(135deg, #2a6030, #1a4020)';
  btn.disabled         = true;
  setTimeout(() => {
    btn.textContent     = type === 'challenge' ? "Submit to This Month's Challenge" : 'Submit for This Playlist';
    btn.style.background = '';
    btn.disabled         = false;
    form.reset();
  }, 4000);
}

function setSubmitError(btn) {
  btn.textContent      = 'Something went wrong — try again';
  btn.style.background = 'linear-gradient(135deg, #8b2020, #4a1010)';
  setTimeout(() => {
    btn.textContent      = btn.dataset.originalText || 'Submit';
    btn.style.background = '';
    btn.disabled         = false;
  }, 3000);
}


/* =============================================================================
   17. SUBMISSIONS DATABASE (localStorage)
   — All submissions are stored in the browser's localStorage as JSON.
   — This is a lightweight "database" that requires no backend.
   —
   — Data structure:
   —   ltv_submissions = {
   —     challenge: {
   —       "doppelganger-2025-05": [ { ...submission }, ... ],
   —       "previous-challenge-id": [ ... ],
   —     },
   —     playlist: {
   —       "ltv-vol-4-2025": [ { ...submission }, ... ],
   —     }
   —   }
   —
   — To VIEW submissions:
   —   1. Open the site in a browser
   —   2. Open DevTools → Console tab
   —   3. Type: LTV.getSubmissions('challenge') or LTV.getSubmissions('playlist')
   —   4. Or type: LTV.exportSubmissions() to get a full JSON export
   —
   — To CLEAR submissions for a specific challenge/playlist:
   —   LTV.clearSubmissions('challenge', 'doppelganger-2025-05')
   —
   — NOTE: localStorage is per-browser and per-device.
   — For a shared database visible to all, see README.md — "Going Further with
   — a Real Database" for instructions on using Supabase (free tier).
============================================================================= */

const DB_KEY = 'ltv_submissions';

function getDB() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || { challenge: {}, playlist: {} };
  } catch {
    return { challenge: {}, playlist: {} };
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

async function saveSubmission(type, data) {
  const table = type === 'challenge' ? 'challenge_submissions' : 'playlist_submissions';
  await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        CONFIG.supabaseKey,
      'Authorization': `Bearer ${CONFIG.supabaseKey}`,
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify(data),
  });
}

// Public API — accessible in browser console as LTV.*
window.LTV = {
  getSubmissions(type) {
    const db = getDB();
    console.table(Object.entries(db[type] || {}).flatMap(([id, subs]) =>
      subs.map(s => ({ challenge_or_playlist: id, ...s }))
    ));
    return db[type];
  },
  exportSubmissions() {
    const db   = getDB();
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ltv-submissions-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    console.log('Submissions exported!');
  },
  clearSubmissions(type, id) {
    const db = getDB();
    if (db[type] && db[type][id]) {
      delete db[type][id];
      saveDB(db);
      console.log(`Cleared ${type} submissions for "${id}"`);
    }
  },
};


/* =============================================================================
   18. ADMIN PANEL
   — Shown when ?admin=1 appears in the URL (e.g. yoursite.com/?admin=1).
   — Lets you update the current challenge and playlist info without editing code.
   — Changes are saved to localStorage and take effect immediately.
   — To make changes permanent, copy the values into CURRENT_CHALLENGE /
   — CURRENT_PLAYLIST at the top of this file.
============================================================================= */

// Overrides live in localStorage under these keys
const ADMIN_CHALLENGE_KEY = 'ltv_admin_challenge';
const ADMIN_PLAYLIST_KEY  = 'ltv_admin_playlist';

function loadAdminOverrides() {
  try {
    const c = localStorage.getItem(ADMIN_CHALLENGE_KEY);
    const p = localStorage.getItem(ADMIN_PLAYLIST_KEY);
    if (c) Object.assign(CURRENT_CHALLENGE, JSON.parse(c));
    if (p) Object.assign(CURRENT_PLAYLIST,  JSON.parse(p));
  } catch {}
}

function getChallenge() { return CURRENT_CHALLENGE; }
function getPlaylist()  { return CURRENT_PLAYLIST; }

function initAdminPanel() {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
  if (!isAdmin) return;

  const fab     = document.getElementById('adminFab');
  const overlay = document.getElementById('adminOverlay');
  const closeBtn = document.getElementById('adminClose');

  if (fab) fab.classList.add('visible');

  // Pre-fill admin fields with current values
  setAdminFields();

  // Open modal
  fab?.addEventListener('click', () => overlay?.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  // Admin tab switching
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(`adminPanel${capitalize(tab.dataset.panel)}`);
      if (panel) panel.classList.add('active');
    });
  });

  // Save challenge
  document.getElementById('saveChallenge')?.addEventListener('click', () => {
    const override = {
      id:       CURRENT_CHALLENGE.id,
      title:    document.getElementById('adminChallengeTitle')?.value.trim() || CURRENT_CHALLENGE.title,
      desc:     document.getElementById('adminChallengeDesc')?.value.trim()  || CURRENT_CHALLENGE.desc,
      deadline: document.getElementById('adminChallengeDeadline')?.value.trim() || CURRENT_CHALLENGE.deadline,
      type:     document.getElementById('adminChallengeType')?.value || CURRENT_CHALLENGE.type,
    };
    localStorage.setItem(ADMIN_CHALLENGE_KEY, JSON.stringify(override));
    Object.assign(CURRENT_CHALLENGE, override);
    renderChallengeBanner();
    flashSaved('saveChallenge');
  });

  // Save playlist
  document.getElementById('savePlaylist')?.addEventListener('click', () => {
    const override = {
      id:       CURRENT_PLAYLIST.id,
      title:    document.getElementById('adminPlaylistTitle')?.value.trim()    || CURRENT_PLAYLIST.title,
      desc:     document.getElementById('adminPlaylistDesc')?.value.trim()     || CURRENT_PLAYLIST.desc,
      deadline: document.getElementById('adminPlaylistDeadline')?.value.trim() || CURRENT_PLAYLIST.deadline,
    };
    localStorage.setItem(ADMIN_PLAYLIST_KEY, JSON.stringify(override));
    Object.assign(CURRENT_PLAYLIST, override);
    renderPlaylistBanner();
    flashSaved('savePlaylist');
  });
}

function setAdminFields() {
  const c = getChallenge();
  const p = getPlaylist();

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  setVal('adminChallengeTitle',    c.title);
  setVal('adminChallengeDesc',     c.desc);
  setVal('adminChallengeDeadline', c.deadline);
  setVal('adminChallengeType',     c.type);
  setVal('adminPlaylistTitle',     p.title);
  setVal('adminPlaylistDesc',      p.desc);
  setVal('adminPlaylistDeadline',  p.deadline);
}

function flashSaved(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = '✓ Saved!';
  btn.style.background = 'linear-gradient(135deg, #2a6030, #1a4020)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
