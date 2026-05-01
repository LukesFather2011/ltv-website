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
   12. Challenge Phase     — Computes current phase (open/voting/closed) from deadlines
   13. Challenge Banner    — Renders current challenge info + phase state
   14. Winner Banner       — Renders winner on main site after voting closes
   15. Playlist Banner     — Renders current playlist info
   16. Playlist Embeds     — Renders SoundCloud embed iframes
   17. Challenge Form      — Validation + submission (locks when not in open phase)
   18. Playlist Form       — Validation + submission
   19. Submissions DB      — Supabase-backed submission store
   20. Admin Panel         — ?admin=1 modal for updating content without code

============================================================================= */


/* =============================================================================
   1. CONFIG
============================================================================= */

const CONFIG = {
  discord:      'https://discord.gg/AFdeZHfDZN',
  youtube:      'http://youtube.com/@limitlesstruevibe',
  soundcloud:   'https://soundcloud.com/limitless_truevibe',
  bandcamp:     'https://limitlesstruevibe.bandcamp.com/album/starlit-signals-a-truevibe-compilation',
  supabaseUrl:  'https://bqcjabpybovkpdczfdbv.supabase.co',
  supabaseKey:  'sb_publishable_uyXl-TEe2bM0mOstjywkwg__eTiuyCW',
  formEndpoint: '',

  // Timing config
  // Submissions close at 11:59 PM CST on the deadline date.
  // Voting opens this many hours after the submission deadline.
  votingDelayHours: 24,
  // Voting stays open for this many hours after it opens.
  votingDurationHours: 48,

  particleCount: 35,
  waveBarsCount: 90,
};


/* =============================================================================
   2. CURRENT CHALLENGE
   — UPDATE THIS each month. Change `id` every new challenge.
   —
   — deadlineDate: ISO date string "YYYY-MM-DD" — submissions close at
   —              11:59 PM CST (UTC-6) on this date, automatically.
   —              Voting opens 24h later, runs for 48h, then closes.
   —
   — type: "standard" | "mimic"
============================================================================= */

const CURRENT_CHALLENGE = {
  id:           'doppelganger-2026-05',
  title:        'Doppelganger',
  desc:         'Create a track in the style of any artist in the Discord. It could be their signature sound, their usual BPM, their go-to genre — just make us feel like it could have been them.',
  deadline:     'May 15, 2026',
  deadlineDate: '2026-05-15',   // ← ISO date, used for automatic phase switching
  type:         'mimic',
};


/* =============================================================================
   3. CURRENT PLAYLIST
============================================================================= */

const CURRENT_PLAYLIST = {
  id:           'fossil-eater-2026-04',
  title:        'Fossil Eater Sample Playlist',
  desc:         'Our next community playlist is open for submissions. Producers must use at least 3 of 8 samples provided by Fossil Eater (check Discord)',
  deadline:     'April 30, 2026',
  deadlineDate: '2026-04-30',
};


/* =============================================================================
   4. PLAYLIST ARCHIVE
============================================================================= */

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
   5. DOM READY
============================================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  loadAdminOverrides();
  initMobileNav();
  initHeroWave();
  initParticles();
  initWaveStrips();
  initScrollReveal();
  initDynamicYear();
  renderChallengeBanner();
  await renderWinnerBanner();
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
   8. PARTICLES
============================================================================= */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#d181a8', '#fcffde', '#60376b'];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
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
        --h: ${h}px;
        animation-delay: ${Math.random() * 1.2}s;
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
   11. DYNAMIC YEAR
============================================================================= */

function initDynamicYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* =============================================================================
   12. CHALLENGE PHASE ENGINE
   — Computes the current phase based on deadlineDate + timing config.
   —
   — Phases:
   —   "open"    — submissions are being accepted right now
   —   "pending" — submissions closed, voting hasn't opened yet (24h window)
   —   "voting"  — voting page is live, submissions locked
   —   "closed"  — voting has ended, winner should be displayed
   —
   — All times are computed in CST (UTC-6). The deadline is set to
   — 23:59:59 CST on the deadlineDate.
============================================================================= */

function getChallengePhase(challenge) {
  if (!challenge.deadlineDate) return 'open';

  const CST_OFFSET_MS = 6 * 60 * 60 * 1000; // CST = UTC-6

  // Deadline: 11:59:59 PM CST on deadlineDate
  const deadlineUTC = new Date(`${challenge.deadlineDate}T23:59:59Z`).getTime() + CST_OFFSET_MS;

  // Voting opens: deadline + votingDelayHours
  const votingOpenUTC   = deadlineUTC + CONFIG.votingDelayHours   * 60 * 60 * 1000;
  // Voting closes: votingOpen + votingDurationHours
  const votingCloseUTC  = votingOpenUTC + CONFIG.votingDurationHours * 60 * 60 * 1000;

  const now = Date.now();

  if (now < deadlineUTC)   return 'open';
  if (now < votingOpenUTC)  return 'pending';
  if (now < votingCloseUTC) return 'voting';
  return 'closed';
}

function getPhaseTimings(challenge) {
  const CST_OFFSET_MS  = 6 * 60 * 60 * 1000;
  const deadlineUTC    = new Date(`${challenge.deadlineDate}T23:59:59Z`).getTime() + CST_OFFSET_MS;
  const votingOpenUTC  = deadlineUTC  + CONFIG.votingDelayHours    * 60 * 60 * 1000;
  const votingCloseUTC = votingOpenUTC + CONFIG.votingDurationHours * 60 * 60 * 1000;
  return { deadlineUTC, votingOpenUTC, votingCloseUTC };
}


/* =============================================================================
   13. CHALLENGE BANNER
============================================================================= */

function renderChallengeBanner() {
  const banner = document.getElementById('challengeBanner');
  if (!banner) return;

  const c     = getChallenge();
  const phase = getChallengePhase(c);

  const phaseHTML = {
    open: `
      <span class="challenge-status">
        <span class="challenge-status-dot"></span>
        Open for Submissions
      </span>`,
    pending: `
      <span class="challenge-status challenge-status--pending">
        <span class="challenge-status-dot challenge-status-dot--pending"></span>
        Submissions Closed — Voting Soon
      </span>`,
    voting: `
      <span class="challenge-status challenge-status--voting">
        <span class="challenge-status-dot"></span>
        <a href="voting.html" style="color:inherit;text-decoration:underline;">Voting is Live →</a>
      </span>`,
    closed: `
      <span class="challenge-status challenge-status--closed">
        Challenge Complete
      </span>`,
  };

  banner.innerHTML = `
    <div class="challenge-banner-left">
      <span class="challenge-banner-tag">This Month's Challenge</span>
      <div class="challenge-banner-title">${c.title}</div>
      <div class="challenge-banner-desc">${c.desc}</div>
    </div>
    <div class="challenge-banner-meta">
      <span class="challenge-deadline">Deadline: ${c.deadline}</span>
      ${phaseHTML[phase] || phaseHTML.open}
    </div>
  `;

  // Populate hidden form fields
  const idField   = document.getElementById('challengeId');
  const nameField = document.getElementById('challengeNameField');
  if (idField)   idField.value   = c.id;
  if (nameField) nameField.value = c.title;

  // Show mimic field
  const mimicField = document.getElementById('mimicField');
  if (mimicField) mimicField.classList.toggle('visible', c.type === 'mimic');
}


/* =============================================================================
   14. WINNER BANNER
   — Checks Supabase for a result for the current challenge.
   — If found, displays the winner section on the main page.
   — If there's a tie, winner was already randomly resolved at vote-close time
   — and stored in challenge_results.
============================================================================= */

async function renderWinnerBanner() {
  const container = document.getElementById('winnerBanner');
  if (!container) return;

  const c = getChallenge();

  try {
    const res = await supabaseFetch(
      `challenge_results?challenge_id=eq.${encodeURIComponent(c.id)}&limit=1`,
      { method: 'GET' }
    );
    const results = await res.json();
    if (!results || !results.length) return;

    const result = results[0];
    container.innerHTML = `
      <div class="winner-banner-inner reveal">
        <div class="winner-crown" aria-hidden="true">👑</div>
        <div class="winner-banner-content">
          <span class="winner-banner-tag">Beat Master — ${result.challenge_title}</span>
          <h2 class="winner-banner-name">${result.winner_name}</h2>
          <p class="winner-banner-track">"${result.winner_track}"</p>
          ${result.winner_sc_url
            ? `<a href="${result.winner_sc_url}" target="_blank" rel="noopener" class="btn btn-discord winner-sc-btn">
                 Listen on SoundCloud →
               </a>`
            : ''}
        </div>
      </div>
    `;
    container.classList.add('active');

    // Re-run scroll reveal on the new element
    const newReveal = container.querySelector('.reveal');
    if (newReveal) {
      setTimeout(() => newReveal.classList.add('visible'), 100);
    }
  } catch (e) {
    // No result yet — silently do nothing
  }
}


/* =============================================================================
   15. PLAYLIST BANNER
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
  const sub = document.getElementById('playlistFormSub');
  if (sub) sub.textContent = `Submit a track for ${p.title}. We'll pick the best fits and post the playlist on SoundCloud.`;
  const idField   = document.getElementById('playlistId');
  const nameField = document.getElementById('playlistNameField');
  if (idField)   idField.value   = p.id;
  if (nameField) nameField.value = p.title;
}


/* =============================================================================
   16. PLAYLIST EMBEDS
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
   17. CHALLENGE FORM
   — Locks automatically when phase is not "open"
============================================================================= */

function initChallengeForm() {
  const form = document.getElementById('challengeForm');
  if (!form) return;

  initDropZone('challengeDropZone', 'trackFile', 'challengeFileSelected');

  const c     = getChallenge();
  const phase = getChallengePhase(c);

  if (phase !== 'open') {
    lockForm(form, phase);
    return;
  }

  form.addEventListener('submit', e => { e.preventDefault(); handleFormSubmit(e, 'challenge'); });
}


function lockForm(form, phase) {
  const messages = {
    pending: 'Submissions are now closed. Voting opens in 24 hours — check Discord for the link.',
    voting:  'Submissions are closed. <a href="voting.html" style="color:var(--accent);text-decoration:underline;">Voting is live — cast your vote →</a>',
    closed:  'This challenge has ended. Stay tuned for the next one in Discord.',
  };

  const btn = form.querySelector('.submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = phase === 'voting' ? 'Voting in Progress' : 'Submissions Closed';
  }

  // Add a lock notice above the button
  const notice = document.createElement('div');
  notice.className = 'form-lock-notice';
  notice.innerHTML = messages[phase] || 'Submissions are currently closed.';
  btn?.parentElement.insertBefore(notice, btn);

  // Disable all inputs
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.disabled = true;
    el.style.opacity = '0.5';
  });
}


/* =============================================================================
   18. PLAYLIST FORM
============================================================================= */

function initPlaylistForm() {
  const form = document.getElementById('playlistForm');
  if (!form) return;
  initDropZone('playlistDropZone', 'plTrackFile', 'playlistFileSelected');
  form.addEventListener('submit', e => { e.preventDefault(); handleFormSubmit(e, 'playlist'); });
}


/* =============================================================================
   FILE DROP ZONE
============================================================================= */

function initDropZone(zoneId, inputId, feedbackId) {
  const zone     = document.getElementById(zoneId);
  const input    = document.getElementById(inputId);
  const feedback = document.getElementById(feedbackId);
  if (!zone || !input || !feedback) return;

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) applyFile(file, input, zone, feedback);
  });
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) applyFile(file, input, zone, feedback);
  });
}

function applyFile(file, input, zone, feedback) {
  const isWav = file.name.toLowerCase().endsWith('.wav') ||
                file.type === 'audio/wav' ||
                file.type === 'audio/x-wav';

  if (!isWav) {
    input.value = '';
    zone.classList.remove('has-file');
    zone.classList.add('has-error');
    feedback.className   = 'file-selected error';
    feedback.textContent = `"${file.name}" isn't a .wav file. Please export as WAV and try again.`;
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
============================================================================= */

async function handleFormSubmit(e, type) {
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

  // Collect all text fields
  const data = {};
  new FormData(form).forEach((val, key) => {
    if (typeof val === 'string') data[key] = val;
  });
  data.submitted_at = new Date().toISOString();

  // Grab the WAV file
  const fileInputId = type === 'challenge' ? 'trackFile' : 'plTrackFile';
  const fileInput   = document.getElementById(fileInputId);
  const file        = fileInput?.files?.[0];

  if (file) {
    data.track_filename = file.name;
    data.track_filesize = file.size;
  }

  // Lock the button and show uploading state
  btn.disabled    = true;
  btn.textContent = file ? 'Uploading track…' : 'Submitting…';

  // Upload WAV to Supabase Storage if we have a file
  if (file) {
    try {
      const folderId = data.challenge_id || data.playlist_id || type;
      // Sanitise filename — remove spaces and special chars
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path     = `${type}/${folderId}/${Date.now()}_${safeName}`;

      const uploadRes = await fetch(
        `${CONFIG.supabaseUrl}/storage/v1/object/submissions/${path}`,
        {
          method:  'POST',
          headers: {
            'apikey':        CONFIG.supabaseKey,
            'Authorization': `Bearer ${CONFIG.supabaseKey}`,
            'Content-Type':  'audio/wav',
          },
          body: file,
        }
      );

      if (uploadRes.ok) {
        // Public streaming URL — works because bucket is set to Public
        data.audio_url = `${CONFIG.supabaseUrl}/storage/v1/object/public/submissions/${path}`;
      } else {
        // Upload failed but we still save the metadata — don't block the submission
        console.warn('WAV upload failed:', await uploadRes.text());
      }
    } catch (uploadErr) {
      // Network error on upload — still save metadata, just without audio_url
      console.warn('WAV upload error:', uploadErr);
    }

    btn.textContent = 'Saving submission…';
  }

  // Save submission record to Supabase (with audio_url if upload succeeded)
  await saveSubmission(type, data);

  if (CONFIG.formEndpoint) {
    submitToFormspree(form, btn, data, type);
  } else {
    setSubmitSuccess(btn, form, type);
  }
}

function validateForm(form, type) {
  const errors  = [];
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
  err.className = 'field-error';
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
  btn.disabled = true;
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
  btn.textContent      = msg;
  btn.style.background = 'linear-gradient(135deg, #2a6030, #1a4020)';
  btn.disabled         = true;
  setTimeout(() => {
    btn.textContent      = type === 'challenge' ? "Submit to This Month's Challenge" : 'Submit for This Playlist';
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
   19. SUPABASE HELPERS + SUBMISSIONS
============================================================================= */

function supabaseFetch(path, options = {}) {
  return fetch(`${CONFIG.supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'apikey':        CONFIG.supabaseKey,
      'Authorization': `Bearer ${CONFIG.supabaseKey}`,
      'Prefer':        options.method === 'POST' ? 'return=minimal' : undefined,
      ...(options.headers || {}),
    },
  });
}

async function saveSubmission(type, data) {
  const table = type === 'challenge' ? 'challenge_submissions' : 'playlist_submissions';
  try {
    await supabaseFetch(`${table}`, {
      method: 'POST',
      body:   JSON.stringify(data),
    });
  } catch (e) {
    console.error('Submission save failed:', e);
  }
}

// Legacy localStorage API still available in console for debugging
const DB_KEY = 'ltv_submissions';
function getDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || { challenge: {}, playlist: {} }; }
  catch { return { challenge: {}, playlist: {} }; }
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

window.LTV = {
  async getSubmissions(type) {
    const table = type === 'challenge' ? 'challenge_submissions' : 'playlist_submissions';
    const res   = await supabaseFetch(`${table}?order=submitted_at.desc`, { method: 'GET' });
    const data  = await res.json();
    console.table(data);
    return data;
  },
  exportSubmissions() {
    const db   = getDB();
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `ltv-submissions-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  },
};


/* =============================================================================
   20. ADMIN PANEL
   — ?admin=1 in URL
   — Added: winner SC URL field so you can add a SoundCloud link after announcing
============================================================================= */

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

  const fab      = document.getElementById('adminFab');
  const overlay  = document.getElementById('adminOverlay');
  const closeBtn = document.getElementById('adminClose');

  if (fab) fab.classList.add('visible');
  setAdminFields();

  fab?.addEventListener('click',    () => overlay?.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click',  e => { if (e.target === overlay) overlay.classList.remove('open'); });

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`adminPanel${capitalize(tab.dataset.panel)}`)?.classList.add('active');
    });
  });

  document.getElementById('saveChallenge')?.addEventListener('click', () => {
    const override = {
      id:           CURRENT_CHALLENGE.id,
      title:        document.getElementById('adminChallengeTitle')?.value.trim()    || CURRENT_CHALLENGE.title,
      desc:         document.getElementById('adminChallengeDesc')?.value.trim()     || CURRENT_CHALLENGE.desc,
      deadline:     document.getElementById('adminChallengeDeadline')?.value.trim() || CURRENT_CHALLENGE.deadline,
      deadlineDate: document.getElementById('adminDeadlineDate')?.value             || CURRENT_CHALLENGE.deadlineDate,
      type:         document.getElementById('adminChallengeType')?.value            || CURRENT_CHALLENGE.type,
    };
    localStorage.setItem(ADMIN_CHALLENGE_KEY, JSON.stringify(override));
    Object.assign(CURRENT_CHALLENGE, override);
    renderChallengeBanner();
    flashSaved('saveChallenge');
  });

  document.getElementById('savePlaylist')?.addEventListener('click', () => {
    const override = {
      id:           CURRENT_PLAYLIST.id,
      title:        document.getElementById('adminPlaylistTitle')?.value.trim()    || CURRENT_PLAYLIST.title,
      desc:         document.getElementById('adminPlaylistDesc')?.value.trim()     || CURRENT_PLAYLIST.desc,
      deadline:     document.getElementById('adminPlaylistDeadline')?.value.trim() || CURRENT_PLAYLIST.deadline,
      deadlineDate: document.getElementById('adminPlaylistDeadlineDate')?.value    || CURRENT_PLAYLIST.deadlineDate,
    };
    localStorage.setItem(ADMIN_PLAYLIST_KEY, JSON.stringify(override));
    Object.assign(CURRENT_PLAYLIST, override);
    renderPlaylistBanner();
    flashSaved('savePlaylist');
  });

  // Winner SC URL — update an existing result record
  document.getElementById('saveWinnerSC')?.addEventListener('click', async () => {
    const url = document.getElementById('adminWinnerSC')?.value.trim();
    if (!url) return;
    const c = getChallenge();
    try {
      await supabaseFetch(
        `challenge_results?challenge_id=eq.${encodeURIComponent(c.id)}`,
        {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ winner_sc_url: url }),
        }
      );
      flashSaved('saveWinnerSC');
      renderWinnerBanner();
    } catch (e) {
      console.error('Failed to save SC URL:', e);
    }
  });
}

function setAdminFields() {
  const c = getChallenge();
  const p = getPlaylist();
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('adminChallengeTitle',        c.title);
  setVal('adminChallengeDesc',         c.desc);
  setVal('adminChallengeDeadline',     c.deadline);
  setVal('adminDeadlineDate',          c.deadlineDate);
  setVal('adminChallengeType',         c.type);
  setVal('adminPlaylistTitle',         p.title);
  setVal('adminPlaylistDesc',          p.desc);
  setVal('adminPlaylistDeadline',      p.deadline);
  setVal('adminPlaylistDeadlineDate',  p.deadlineDate);
}

function flashSaved(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent      = '✓ Saved!';
  btn.style.background = 'linear-gradient(135deg, #2a6030, #1a4020)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
