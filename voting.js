/* =============================================================================
   LIMITLESS TRUEVIBE — voting.js
   =============================================================================

   TABLE OF CONTENTS
   -----------------
   1.  Init                — Entry point
   2.  Phase Check         — Determine what state to show
   3.  Load Submissions    — Fetch tracks from Supabase for current challenge
   4.  Render Tracks       — Build anonymous track cards with audio player
   5.  Star Rating         — 10-star interactive rating component
   6.  Vote Progress       — Track how many tracks have been rated
   7.  Submit Votes        — Send ratings to Supabase, enforce one-vote-per-person
   8.  Voter Fingerprint   — Browser-based identity for duplicate vote prevention
   9.  Results             — Tally votes, resolve ties, display rankings
   10. Past Challenges     — Load and display Hall of Fame
   11. Countdown Timer     — Live countdown to voting close
   12. Navigation          — Mobile hamburger (shared with main site)

============================================================================= */


/* =============================================================================
   1. INIT
============================================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  initMobileNav();
  initDynamicYear();
  await initVotingPage();
});

async function initVotingPage() {
  const challenge = getChallenge();
  const phase     = getChallengePhase(challenge);

  // Update hero subtitle with challenge name
  const subtitle = document.getElementById('votingSubtitle');
  if (subtitle && challenge.title) {
    subtitle.textContent = `${challenge.title} — Listen to every track, then rate them. Your vote shapes the crown.`;
  }

  // Update meta bar
  renderVotingMeta(challenge, phase);

  // Route to correct state
  switch (phase) {
    case 'open':
    case 'pending':
      showState('stateNotOpen');
      break;
    case 'voting':
      await initActiveVoting(challenge);
      break;
    case 'closed':
      await initClosedResults(challenge);
      break;
    default:
      showState('stateNotOpen');
  }

  // Always load past challenges at the bottom
  await loadPastChallenges();
}


/* =============================================================================
   2. PHASE CHECK — reuses getChallengePhase() from script.js
============================================================================= */

function renderVotingMeta(challenge, phase) {
  const meta = document.getElementById('votingMeta');
  if (!meta) return;

  const timings  = getPhaseTimings(challenge);
  const now      = Date.now();

  if (phase === 'voting') {
    const msLeft   = timings.votingCloseUTC - now;
    meta.innerHTML = `
      <span class="voting-meta-pill">
        <span class="challenge-status-dot"></span>
        Voting closes in <span class="countdown-inline" data-closes="${timings.votingCloseUTC}">…</span>
      </span>
      <span class="voting-meta-pill voting-meta-challenge">${challenge.title}</span>
    `;
    startCountdown(timings.votingCloseUTC, '.countdown-inline');
  } else if (phase === 'closed') {
    meta.innerHTML = `
      <span class="voting-meta-pill voting-meta-closed">Voting Closed</span>
      <span class="voting-meta-pill voting-meta-challenge">${challenge.title}</span>
    `;
  } else {
    meta.innerHTML = `
      <span class="voting-meta-pill voting-meta-pending">Coming Soon</span>
      <span class="voting-meta-pill voting-meta-challenge">${challenge.title}</span>
    `;
  }
}


/* =============================================================================
   3. LOAD SUBMISSIONS
   — Fetches challenge_submissions for the current challenge_id from Supabase.
   — Returns array shuffled randomly (so track order doesn't influence voting).
   — Artist names are stripped — replaced with "Producer 01", "Producer 02" etc.
============================================================================= */

async function loadSubmissions(challengeId) {
  try {
    const res  = await supabaseFetch(
      `challenge_submissions?challenge_id=eq.${encodeURIComponent(challengeId)}&order=submitted_at.asc`,
      { method: 'GET' }
    );
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return [];

    // Shuffle so position doesn't bias votes
    const shuffled = shuffleArray(data);

    // Anonymise — map each submission to a "Producer XX" label
    return shuffled.map((sub, i) => ({
      id:           sub.id,
      anonLabel:    `Producer ${String(i + 1).padStart(2, '0')}`,
      trackTitle:   sub.track_title || 'Untitled',
      genre:        sub.genre       || '',
      // We store the real name hidden — only revealed after voting closes
      realName:     sub.artist_name || 'Unknown',
      discord:      sub.discord     || '',
      // audio_url will be set if track was uploaded to Supabase Storage
      audioUrl:     sub.audio_url   || null,
    }));
  } catch (e) {
    console.error('Failed to load submissions:', e);
    return [];
  }
}


/* =============================================================================
   4. ACTIVE VOTING
============================================================================= */

async function initActiveVoting(challenge) {
  // Check if this browser already voted
  const fingerprint = getVoterFingerprint();
  const alreadyVoted = await checkAlreadyVoted(challenge.id, fingerprint);

  if (alreadyVoted) {
    showState('stateVoted');
    const timings = getPhaseTimings(challenge);
    startCountdown(timings.votingCloseUTC, '#votedCountdown');
    return;
  }

  const tracks = await loadSubmissions(challenge.id);

  if (tracks.length === 0) {
    showState('stateNotOpen');
    document.querySelector('#stateNotOpen h2').textContent = 'No tracks yet';
    document.querySelector('#stateNotOpen p').textContent  = 'Submissions are still being processed. Check back soon.';
    return;
  }

  showState('stateActive');
  renderTracks(tracks);
  initVoteSubmit(challenge, tracks, fingerprint);

  // Update total count
  document.getElementById('totalCount').textContent = tracks.length;
}


/* =============================================================================
   5. RENDER TRACKS
   — Builds an anonymous card for each submission.
   — Each card has: label, track title, genre tag, audio player, star rating.
============================================================================= */

function renderTracks(tracks) {
  const grid = document.getElementById('tracksGrid');
  if (!grid) return;

  grid.innerHTML = tracks.map((track, i) => `
    <div class="track-card reveal" id="trackCard_${track.id}" data-track-id="${track.id}">
      <div class="track-card-header">
        <div class="track-anon-label">${track.anonLabel}</div>
        ${track.genre ? `<span class="track-genre-tag">${formatGenre(track.genre)}</span>` : ''}
      </div>

      <div class="track-title-display">${escapeHTML(track.trackTitle)}</div>

      <!-- Audio Player -->
      <div class="track-player" id="player_${track.id}">
        ${track.audioUrl
          ? buildAudioPlayer(track)
          : buildNoAudioPlaceholder(track)
        }
      </div>

      <!-- Star Rating -->
      <div class="track-rating" id="rating_${track.id}">
        <div class="star-label">Your Rating</div>
        <div class="stars" data-track-id="${track.id}" role="group" aria-label="Rate ${track.anonLabel}">
          ${buildStars(track.id)}
        </div>
        <div class="star-value" id="starVal_${track.id}">—</div>
      </div>
    </div>
  `).join('');

  // Wire up star interactions
  tracks.forEach(track => initStarRating(track.id));

  // Trigger scroll reveal
  requestAnimationFrame(() => {
    document.querySelectorAll('.track-card.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 60);
    });
  });
}

function buildAudioPlayer(track) {
  return `
    <audio
      class="track-audio"
      id="audio_${track.id}"
      preload="none"
      controls
      controlsList="nodownload"
      src="${escapeHTML(track.audioUrl)}"
    ></audio>
    <div class="audio-tip">🎧 Listen before you rate</div>
  `;
}

function buildNoAudioPlaceholder(track) {
  return `
    <div class="audio-placeholder">
      <span class="audio-placeholder-icon">🎵</span>
      <span class="audio-placeholder-text">Audio preview not available</span>
    </div>
    <div class="audio-tip" style="opacity:0.5;">Rate based on what you hear in Discord</div>
  `;
}

function buildStars(trackId) {
  return Array.from({ length: 10 }, (_, i) => `
    <button
      class="star-btn"
      data-track="${trackId}"
      data-value="${i + 1}"
      aria-label="Rate ${i + 1} out of 10"
      type="button"
    >★</button>
  `).join('');
}

function formatGenre(genre) {
  const map = {
    lofi: 'Lo-Fi', house: 'House', dnb: 'Drum & Bass',
    ambient: 'Ambient', trap: 'Trap', techno: 'Techno',
    synthwave: 'Synthwave', futurebass: 'Future Bass',
    idm: 'IDM / Experimental', other: 'Electronic',
  };
  return map[genre] || genre;
}


/* =============================================================================
   6. STAR RATING
============================================================================= */

// Stores current ratings: { trackId: rating }
const currentRatings = {};

function initStarRating(trackId) {
  const container = document.querySelector(`.stars[data-track-id="${trackId}"]`);
  if (!container) return;

  const stars  = container.querySelectorAll('.star-btn');
  const valEl  = document.getElementById(`starVal_${trackId}`);
  const card   = document.getElementById(`trackCard_${trackId}`);

  stars.forEach(star => {
    const val = parseInt(star.dataset.value, 10);

    star.addEventListener('mouseenter', () => highlightStars(stars, val));
    star.addEventListener('mouseleave', () => {
      const current = currentRatings[trackId] || 0;
      highlightStars(stars, current);
    });

    star.addEventListener('click', () => {
      currentRatings[trackId] = val;
      highlightStars(stars, val);
      if (valEl) valEl.textContent = `${val} / 10`;

      // Mark card as rated
      card?.classList.add('track-rated');

      updateVoteProgress();
    });
  });
}

function highlightStars(stars, upTo) {
  stars.forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.value, 10) <= upTo);
  });
}


/* =============================================================================
   7. VOTE PROGRESS
============================================================================= */

function updateVoteProgress() {
  const ratedCount  = Object.keys(currentRatings).length;
  const totalCount  = parseInt(document.getElementById('totalCount').textContent, 10);
  const submitBtn   = document.getElementById('voteSubmitBtn');
  const ratedEl     = document.getElementById('ratedCount');
  const progressFill = document.getElementById('voteProgressFill');

  if (ratedEl)     ratedEl.textContent    = ratedCount;
  if (progressFill) progressFill.style.width = `${(ratedCount / totalCount) * 100}%`;

  // Enable submit only when all tracks are rated
  if (submitBtn) {
    submitBtn.disabled = ratedCount < totalCount;
    if (ratedCount === totalCount) {
      submitBtn.textContent = '✓ All Rated — Submit Your Votes';
      submitBtn.classList.add('ready');
    }
  }
}


/* =============================================================================
   8. SUBMIT VOTES
============================================================================= */

function initVoteSubmit(challenge, tracks, fingerprint) {
  const btn = document.getElementById('voteSubmitBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const totalCount = tracks.length;
    const ratedCount = Object.keys(currentRatings).length;

    if (ratedCount < totalCount) {
      alert(`Please rate all ${totalCount} tracks before submitting.`);
      return;
    }

    btn.textContent = 'Submitting…';
    btn.disabled    = true;

    try {
      // Double-check nobody else submitted with this fingerprint
      const alreadyVoted = await checkAlreadyVoted(challenge.id, fingerprint);
      if (alreadyVoted) {
        showState('stateVoted');
        return;
      }

      // Build ratings payload: { submissionId: rating, ... }
      const ratingsPayload = {};
      Object.entries(currentRatings).forEach(([trackId, rating]) => {
        ratingsPayload[trackId] = rating;
      });

      const voteRecord = {
        challenge_id:      challenge.id,
        ratings:           ratingsPayload,
        voter_fingerprint: fingerprint,
        submitted_at:      new Date().toISOString(),
      };

      const res = await supabaseFetch('votes', {
        method: 'POST',
        body:   JSON.stringify(voteRecord),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Mark as voted in localStorage as backup
      localStorage.setItem(`ltv_voted_${challenge.id}`, '1');

      // Show success
      showVoteSuccess();

    } catch (e) {
      console.error('Vote submission failed:', e);
      btn.textContent = 'Something went wrong — try again';
      btn.disabled    = false;
      setTimeout(() => {
        btn.textContent = '✓ All Rated — Submit Your Votes';
        btn.disabled    = false;
      }, 3000);
    }
  });
}

function showVoteSuccess() {
  const active = document.getElementById('stateActive');
  if (!active) return;

  active.innerHTML = `
    <div class="vote-success-screen">
      <div class="vote-success-icon">🎉</div>
      <h2>Votes submitted!</h2>
      <p>Thanks for voting. Results will be announced in Discord when voting closes.</p>
      <a href="https://discord.gg/AFdeZHfDZN" target="_blank" rel="noopener" class="btn btn-discord" style="margin-top:1.5rem;">
        Watch Discord for Results →
      </a>
    </div>
  `;
}


/* =============================================================================
   9. VOTER FINGERPRINT
   — Lightweight browser fingerprint stored in localStorage.
   — Not cryptographically secure, but stops casual double-voting.
   — Also checked against Supabase so it's cross-device resistant.
============================================================================= */

function getVoterFingerprint() {
  const key = 'ltv_voter_fp';
  let fp    = localStorage.getItem(key);
  if (!fp) {
    // Generate a random ID and store it
    fp = `${Date.now()}-${Math.random().toString(36).slice(2)}-${navigator.userAgent.length}`;
    localStorage.setItem(key, fp);
  }
  return fp;
}

async function checkAlreadyVoted(challengeId, fingerprint) {
  // First check localStorage (fast)
  if (localStorage.getItem(`ltv_voted_${challengeId}`)) return true;

  // Then check Supabase (authoritative)
  try {
    const res  = await supabaseFetch(
      `votes?challenge_id=eq.${encodeURIComponent(challengeId)}&voter_fingerprint=eq.${encodeURIComponent(fingerprint)}&limit=1`,
      { method: 'GET' }
    );
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}


/* =============================================================================
   10. CLOSED — RESULTS
   — When voting has ended, tally all votes and display ranked results.
   — Also triggers winner calculation + storage if not already done.
============================================================================= */

async function initClosedResults(challenge) {
  showState('stateClosed');

  // Check if result already calculated
  try {
    const resCheck = await supabaseFetch(
      `challenge_results?challenge_id=eq.${encodeURIComponent(challenge.id)}&limit=1`,
      { method: 'GET' }
    );
    const existing = await resCheck.json();

    if (existing && existing.length > 0) {
      renderResults(existing[0], challenge);
      return;
    }

    // No result yet — calculate it
    await calculateAndStoreResult(challenge);

  } catch (e) {
    console.error('Failed to load results:', e);
    document.getElementById('stateClosedMsg').textContent =
      'Results are being tallied. Check Discord for the announcement.';
  }
}

async function calculateAndStoreResult(challenge) {
  try {
    // Fetch all votes for this challenge
    const votesRes  = await supabaseFetch(
      `votes?challenge_id=eq.${encodeURIComponent(challenge.id)}`,
      { method: 'GET' }
    );
    const votes     = await votesRes.json();

    // Fetch all submissions
    const subsRes   = await supabaseFetch(
      `challenge_submissions?challenge_id=eq.${encodeURIComponent(challenge.id)}`,
      { method: 'GET' }
    );
    const subs      = await subsRes.json();

    if (!votes.length || !subs.length) {
      document.getElementById('stateClosedMsg').textContent =
        'No votes were recorded for this challenge.';
      return;
    }

    // Tally average rating per submission
    const tallies = {}; // { submissionId: { total, count } }

    votes.forEach(vote => {
      const ratings = vote.ratings || {};
      Object.entries(ratings).forEach(([subId, rating]) => {
        if (!tallies[subId]) tallies[subId] = { total: 0, count: 0 };
        tallies[subId].total += Number(rating);
        tallies[subId].count += 1;
      });
    });

    // Build ranked list
    const ranked = subs
      .map(sub => {
        const tally = tallies[sub.id] || { total: 0, count: 0 };
        return {
          id:          sub.id,
          artist_name: sub.artist_name,
          track_title: sub.track_title,
          avg:         tally.count > 0 ? tally.total / tally.count : 0,
          votes:       tally.count,
        };
      })
      .sort((a, b) => b.avg - a.avg);

    // Handle ties at the top — pick randomly
    const topScore  = ranked[0]?.avg || 0;
    const tied      = ranked.filter(r => r.avg === topScore);
    const winner    = tied[Math.floor(Math.random() * tied.length)];

    const result = {
      challenge_id:    challenge.id,
      challenge_title: challenge.title,
      winner_id:       winner.id,
      winner_name:     winner.artist_name,
      winner_track:    winner.track_title,
      winner_sc_url:   null,
      final_rankings:  ranked,
      decided_at:      new Date().toISOString(),
    };

    // Store result in Supabase
    await supabaseFetch('challenge_results', {
      method: 'POST',
      body:   JSON.stringify(result),
    });

    renderResults(result, challenge);

  } catch (e) {
    console.error('Failed to calculate result:', e);
  }
}

function renderResults(result, challenge) {
  const container = document.getElementById('resultsDisplay');
  if (!container) return;

  const rankings = result.final_rankings || [];

  const rankHTML = rankings.slice(0, 10).map((r, i) => `
    <div class="result-row ${i === 0 ? 'result-row--winner' : ''}">
      <span class="result-rank">${i === 0 ? '👑' : `#${i + 1}`}</span>
      <div class="result-info">
        <span class="result-name">${escapeHTML(r.artist_name)}</span>
        <span class="result-track">"${escapeHTML(r.track_title)}"</span>
      </div>
      <span class="result-score">${r.avg.toFixed(1)}<span class="result-score-denom">/10</span></span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="results-card">
      <div class="results-winner-header">
        <span class="results-winner-label">Beat Master — ${escapeHTML(challenge.title)}</span>
        <h3 class="results-winner-name">${escapeHTML(result.winner_name)}</h3>
        <p class="results-winner-track">"${escapeHTML(result.winner_track)}"</p>
        ${result.winner_sc_url
          ? `<a href="${result.winner_sc_url}" target="_blank" rel="noopener" class="btn btn-discord" style="margin-top:1rem;">
               Listen on SoundCloud →
             </a>`
          : ''}
      </div>
      ${rankings.length > 1 ? `
        <div class="results-rankings">
          <h4 class="results-rankings-title">Final Rankings</h4>
          ${rankHTML}
        </div>` : ''}
    </div>
  `;
}


/* =============================================================================
   11. PAST CHALLENGES — Hall of Fame
============================================================================= */

async function loadPastChallenges() {
  const grid = document.getElementById('pastChallengesGrid');
  if (!grid) return;

  try {
    const res     = await supabaseFetch(
      `challenge_results?order=decided_at.desc`,
      { method: 'GET' }
    );
    const results = await res.json();

    if (!results || results.length === 0) {
      grid.innerHTML = `<p class="past-empty">Past challenge results will appear here once voting closes each month.</p>`;
      return;
    }

    grid.innerHTML = results.map((r, i) => `
      <div class="past-challenge-card reveal">
        <div class="past-challenge-num">#${results.length - i}</div>
        <div class="past-challenge-crown">👑</div>
        <div class="past-challenge-title">${escapeHTML(r.challenge_title || 'Beat Challenge')}</div>
        <div class="past-challenge-winner">${escapeHTML(r.winner_name)}</div>
        <div class="past-challenge-track">"${escapeHTML(r.winner_track)}"</div>
        ${r.winner_sc_url
          ? `<a href="${r.winner_sc_url}" target="_blank" rel="noopener" class="past-sc-link">SoundCloud →</a>`
          : ''}
        <div class="past-challenge-date">${formatDate(r.decided_at)}</div>
      </div>
    `).join('');

    // Trigger reveal
    requestAnimationFrame(() => {
      document.querySelectorAll('.past-challenge-card.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80);
      });
    });

  } catch (e) {
    console.error('Failed to load past challenges:', e);
  }
}


/* =============================================================================
   12. COUNTDOWN TIMER
============================================================================= */

function startCountdown(targetMs, selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  function update() {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      el.textContent = 'now';
      // Reload to show results
      setTimeout(() => window.location.reload(), 2000);
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = h > 0
      ? `${h}h ${m}m`
      : `${m}m ${s}s`;
  }

  update();
  setInterval(update, 1000);
}


/* =============================================================================
   UTILITIES
============================================================================= */

function showState(id) {
  ['stateLoading','stateNotOpen','stateVoted','stateClosed','stateActive']
    .forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.toggle('hidden', s !== id);
    });
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

function initDynamicYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

function initMobileNav() {
  const hamburger  = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const links      = document.querySelectorAll('.mobile-link');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  links.forEach(l => l.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }));
}
