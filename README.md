# Limitless TrueVibe — Website

A community website for electronic music producers. Built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies. Open the folder and go.

---

## Project Structure

```
ltv-website/
├── index.html          ← Main site — all page sections
├── styles.css          ← Main site styles (organized with table of contents)
├── script.js           ← Main site interactivity, phase engine, dynamic content
├── voting.html         ← Standalone voting page (separate URL)
├── voting.js           ← All voting page logic
├── voting.css          ← Voting page styles + winner banner styles
├── assets/
│   └── images/
│       ├── logo-hero.jpg    ← Purple mountain logo (hero + about sections)
│       └── logo-no-bg.png   ← Dark background logo (nav + footer)
└── README.md           ← This file
```

---

## Getting Started

### View locally
Open `index.html` in any browser. No server or install needed.

### Deploy to the web
This site works with any static host. Recommended free options:

| Host | How to deploy |
|---|---|
| **Netlify** | Drag the project folder onto [netlify.com/drop](https://netlify.com/drop) |
| **GitHub Pages** | Push to a GitHub repo → Settings → Pages → Deploy from branch |
| **Vercel** | Import repo at [vercel.com](https://vercel.com), zero config needed |

---

## How the Challenge Lifecycle Works

The site fully automates the monthly beat challenge cycle. Once you set a deadline date, everything switches phases on its own — no action needed from you.

```
Submissions Open
      ↓  (deadline hits at 11:59 PM CST)
Submissions Closed — Voting Pending
      ↓  (24 hours later)
Voting Open  ←── voting.html goes live, nav link appears
      ↓  (48 hours later)
Voting Closed — Winner Calculated Automatically
      ↓
Winner Banner appears on homepage
      ↓  (you add their SoundCloud link via Admin Panel)
Hall of Fame updated on voting page
```

**Tie-breaking:** If two or more tracks share the top average rating, the winner is chosen randomly and silently from the tied entries. You'll see the result in the admin panel.

---

## Updating the Current Beat Challenge

Open `script.js` and find `CURRENT_CHALLENGE` near the top. Update all fields when starting a new challenge:

```js
const CURRENT_CHALLENGE = {
  id:           'your-challenge-slug-2026-06',  // ← Change every month, unique slug
  title:        'Challenge Name',
  desc:         'What producers need to make...',
  deadline:     'June 30, 2026',                // ← Display text shown on site
  deadlineDate: '2026-06-30',                   // ← ISO date used for auto phase-switching
  type:         'standard',                     // 'standard' or 'mimic'
};
```

**`id`** — change this every single month. It's the key used to group submissions and votes in the database. If you reuse an id, the new challenge will mix with the old one's data.

**`deadlineDate`** — this is what drives the entire automated lifecycle. Format is `YYYY-MM-DD`. The system closes submissions at exactly 11:59 PM CST on this date, opens voting 24 hours later, and closes voting 48 hours after that.

**`type` options:**
- `'standard'` — regular beat challenge, no extra fields
- `'mimic'` — adds a "Who are you mimicking?" field (used for Doppelganger-style challenges)

---

## Updating the Current Playlist

Open `script.js` and find `CURRENT_PLAYLIST`:

```js
const CURRENT_PLAYLIST = {
  id:           'ltv-vol-5-2026',    // ← Change with each new playlist
  title:        'LTV Vol. 5',
  desc:         'Theme or description...',
  deadline:     'June 15, 2026',
  deadlineDate: '2026-06-15',        // ← Used for auto-locking the playlist form
};
```

---

## Adding a New Playlist Embed

When a playlist is finished and posted to SoundCloud, add it to the `PLAYLISTS` array in `script.js` (most recent first):

**Step 1** — Get the embed URL from SoundCloud:
1. Go to your SoundCloud playlist
2. Click **Share** → **Embed**
3. Copy the URL from the `src` attribute of the iframe

**Step 2** — Add it to the array:

```js
const PLAYLISTS = [
  {
    id:       'ltv-vol-5',
    title:    'LTV Vol. 5',
    subtitle: 'Community Mix',
    embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/YOUR_ID...',
  },
  // ... older playlists below
];
```

---

## Admin Panel

Add `?admin=1` to your site URL (e.g. `yoursite.com/?admin=1`) to open the admin panel. A **⚙ Manage Content** button appears in the bottom-right corner.

The admin panel has three tabs:

**Beat Challenge tab**
- Update challenge name, description, display deadline, auto-lock date, and type
- Changes save to your browser and apply immediately

**Playlist tab**
- Update playlist name, description, display deadline, and auto-lock date

**Winner tab**
- After announcing the winner in Discord, paste their SoundCloud profile URL here
- The winner banner on the homepage will update to include the link

> **To make changes permanent** (so they apply for everyone, not just your browser): copy the updated values back into `CURRENT_CHALLENGE` or `CURRENT_PLAYLIST` in `script.js` and redeploy.

---

## The Voting Page (voting.html)

The voting page is a separate URL (`/voting.html`) that handles the full voting experience.

### What it does automatically
- Shows the correct state based on the current challenge phase (not open yet / voting active / results)
- Lists all submissions anonymously as "Producer 01", "Producer 02" etc. in randomised order to prevent position bias
- Streams audio directly in the browser if `audio_url` is set on the submission
- Enforces one vote per person using a browser fingerprint stored in Supabase
- Calculates final rankings and resolves ties when voting closes
- Displays the Hall of Fame (all past challenge winners) at the bottom

### How voters find it
When voting opens, a pulsing **🗳 Vote** link automatically appears in the nav on `index.html`. You also post the direct link in Discord.

### What you do after voting closes
Nothing — the winner is calculated automatically. Your only job is to go to `?admin=1` → Winner tab and add the winner's SoundCloud profile URL once you've made the Discord announcement.

---

## Supabase Database

All submissions, votes, and results are stored in Supabase (free tier). The database has four tables:

| Table | What it stores |
|---|---|
| `challenge_submissions` | Every beat challenge submission |
| `playlist_submissions` | Every playlist submission |
| `votes` | Every vote cast, with ratings per track |
| `challenge_results` | Final ranked results for each completed challenge |

### Viewing submissions

```js
// In browser DevTools console on your site:
LTV.getSubmissions('challenge')   // logs all challenge submissions
LTV.getSubmissions('playlist')    // logs all playlist submissions
LTV.exportSubmissions()           // downloads a JSON file
```

You can also browse and export data directly in the Supabase dashboard → **Table Editor**.

### Supabase config

Your credentials live at the top of `script.js`:

```js
const CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseKey: 'YOUR_ANON_KEY',
  // ...
};
```

### Timing config

Also in `CONFIG` at the top of `script.js`:

```js
votingDelayHours:    24,   // hours between submission deadline and voting opening
votingDurationHours: 48,   // how long voting stays open
```

Change these if you want a different window in future cycles.

### Full database setup (if starting from scratch)

Run this SQL in the Supabase SQL Editor:

```sql
-- Challenge submissions
CREATE TABLE challenge_submissions (
  id              SERIAL PRIMARY KEY,
  challenge_id    TEXT,
  challenge_name  TEXT,
  artist_name     TEXT,
  email           TEXT,
  discord         TEXT,
  track_title     TEXT,
  genre           TEXT,
  mimic_artist    TEXT,
  notes           TEXT,
  audio_url       TEXT,
  track_filename  TEXT,
  track_filesize  BIGINT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist submissions
CREATE TABLE playlist_submissions (
  id              SERIAL PRIMARY KEY,
  playlist_id     TEXT,
  playlist_name   TEXT,
  artist_name     TEXT,
  email           TEXT,
  discord         TEXT,
  track_title     TEXT,
  genre           TEXT,
  notes           TEXT,
  audio_url       TEXT,
  track_filename  TEXT,
  track_filesize  BIGINT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
  id                SERIAL PRIMARY KEY,
  challenge_id      TEXT NOT NULL,
  ratings           JSONB NOT NULL,
  voter_fingerprint TEXT NOT NULL,
  submitted_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge results (auto-populated when voting closes)
CREATE TABLE challenge_results (
  id               SERIAL PRIMARY KEY,
  challenge_id     TEXT NOT NULL UNIQUE,
  challenge_title  TEXT,
  winner_id        INTEGER,
  winner_name      TEXT,
  winner_track     TEXT,
  winner_sc_url    TEXT,
  final_rankings   JSONB,
  decided_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE challenge_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_results      ENABLE ROW LEVEL SECURITY;

-- Allow public read + insert on all tables
CREATE POLICY "allow_insert" ON challenge_submissions  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_select" ON challenge_submissions  FOR SELECT TO anon USING (true);
CREATE POLICY "allow_insert" ON playlist_submissions   FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_select" ON playlist_submissions   FOR SELECT TO anon USING (true);
CREATE POLICY "allow_insert" ON votes                  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_select" ON votes                  FOR SELECT TO anon USING (true);
CREATE POLICY "allow_insert" ON challenge_results      FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_select" ON challenge_results      FOR SELECT TO anon USING (true);
CREATE POLICY "allow_update" ON challenge_results      FOR UPDATE TO anon USING (true);
```

If your tables already exist and you just need to add the `audio_url` column:

```sql
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE playlist_submissions  ADD COLUMN IF NOT EXISTS audio_url TEXT;
```

---

## WAV File Uploads + Audio Streaming

Both forms accept `.wav` files only (validated client-side, max 100MB). The file metadata (name, size) is saved with each submission record in Supabase.

For audio to stream on the voting page, the actual WAV file needs to be stored somewhere and its URL saved to the `audio_url` column on the submission. The recommended approach is Supabase Storage.

### Setting up Supabase Storage for WAV files

1. In Supabase dashboard → **Storage** → create a new bucket called `submissions`
2. Set the bucket to **Public** so files can be streamed without auth
3. In `script.js`, inside `handleFormSubmit()`, add this block after `data.submitted_at` is set:

```js
const fileInputId = type === 'challenge' ? 'trackFile' : 'plTrackFile';
const fileInput   = document.getElementById(fileInputId);
const file        = fileInput?.files?.[0];

if (file) {
  const path     = `${type}/${data.challenge_id || data.playlist_id}/${Date.now()}_${file.name}`;
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
    data.audio_url = `${CONFIG.supabaseUrl}/storage/v1/object/public/submissions/${path}`;
  }
}
```

Files will be organised as: `submissions/challenge/challenge-id/timestamp_trackname.wav`

The `audio_url` saved with the submission record is what the voting page uses to stream audio.

---

## Backfilling Past Challenge Winners

To add historical winners to the Hall of Fame on the voting page, insert rows directly into `challenge_results` in the Supabase SQL Editor:

```sql
INSERT INTO challenge_results
  (challenge_id, challenge_title, winner_name, winner_track, winner_sc_url, final_rankings, decided_at)
VALUES
  (
    'your-old-challenge-id',
    'Challenge Name',
    'Artist Handle',
    'Track Title',
    'https://soundcloud.com/artistname',  -- or NULL if no link
    '[]',                                 -- empty array fine for backfills
    '2025-12-01T00:00:00Z'               -- approximate date
  );
```

Run one `INSERT` per past challenge. They'll appear in the Hall of Fame sorted by date, most recent first.

---

## Hero Waveform

The animated waveform behind the hero logo is drawn on an HTML5 canvas by `initHeroWave()` in `script.js`. To adjust it, find the `waves` array:

```js
const waves = [
  { freq: 0.018, amp: 55, speed: 0.012, color: 'rgba(209,129,168,0.55)', width: 2 },
  // ...
];
```

- `freq` — how tightly packed the waves are (higher = more peaks)
- `amp` — height of the wave
- `speed` — animation speed
- `color` — RGBA, keep alpha between 0.2–0.6

Overall canvas opacity is in `styles.css`:
```css
.hero-wave-canvas { opacity: 0.18; }
```

---

## Brand Reference

| Name | Hex | Used for |
|---|---|---|
| Cream | `#fcffde` | Primary text |
| Dark | `#161b31` | Main background |
| Pink | `#d181a8` | Primary accent, CTAs, highlights |
| Purple | `#60376b` | Secondary accent, gradients |
| White | `#ffffff` | Pure white |
| Discord | `#5865F2` | Discord brand buttons |

All colors are CSS variables at the top of `styles.css`:

```css
:root {
  --color-pink:   #d181a8;
  --color-purple: #60376b;
  /* ... */
}
```

---

## Page Sections

| Section | HTML id / file | What drives the content |
|---|---|---|
| Navigation | `#navbar` | Static HTML; voting link auto-shows during voting phase |
| Hero | `#hero` | Static HTML + canvas wave from `script.js` |
| Winner Banner | `#winnerBanner` | Auto-populated by `renderWinnerBanner()` in `script.js` |
| About | `#about` | Static HTML |
| Stats | `#stats` | Static HTML (edit numbers directly) |
| Beat Challenges | `#challenges` | Banner + form phase from `CURRENT_CHALLENGE` in `script.js` |
| Playlists | `#playlists` | Embeds from `PLAYLISTS` array, banner from `CURRENT_PLAYLIST` |
| Join | `#join` | Static HTML |
| Footer | `#footer` | Static HTML |
| Voting page | `voting.html` | Fully driven by `voting.js` + Supabase data |
| Hall of Fame | `voting.html` | Auto-populated from `challenge_results` table |

---

## Monthly Checklist

When starting a new challenge cycle, here's all you need to do:

- [ ] Update `CURRENT_CHALLENGE` in `script.js` — new `id`, `title`, `desc`, `deadline`, `deadlineDate`, `type`
- [ ] Redeploy the site (or save admin panel changes as permanent in `script.js`)
- [ ] Announce the new challenge in Discord
- [ ] *(Everything else is automatic)*

When the cycle ends:

- [ ] Wait for winner to be auto-calculated
- [ ] Announce the winner in Discord
- [ ] Go to `yoursite.com/?admin=1` → Winner tab → paste their SoundCloud URL → Save

---

## Future Ideas

- **Discord member count widget** — live embed showing current server size
- **Newsletter / email list** — Mailchimp or similar integration
- **Artist profiles** — simple pages for regular community members
- **Playlist voting** — extend the voting system to community playlist curation
