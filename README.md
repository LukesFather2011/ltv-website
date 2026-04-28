# Limitless TrueVibe — Website

A community website for electronic music producers. Built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies. Open the folder and go.

---

## Project Structure

```
ltv-website/
├── index.html          ← All page content and structure
├── styles.css          ← All visual styling (organized with table of contents)
├── script.js           ← All interactivity and dynamic content
├── assets/
│   └── images/
│       ├── logo-hero.jpg    ← Purple mountain logo (hero + about sections)
│       └── logo-no-bg.png    ← Dark background logo (nav + footer)
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

## First Things to Update

Search for `YOUR_` across all files and replace every placeholder. In VS Code: `Ctrl+Shift+H` (Mac: `Cmd+Shift+H`).

| Placeholder | Replace with |
|---|---|
| `https://discord.gg/YOUR_INVITE` | Your real Discord invite link |
| `https://youtube.com/@YOUR_CHANNEL` | Your YouTube channel URL |
| `https://soundcloud.com/YOUR_PAGE` | Your SoundCloud page URL |
| `https://bandcamp.com/YOUR_PAGE` | Your Bandcamp page URL |

---

## Updating Content (No Code Required)

### Admin Panel — the easy way

Add `?admin=1` to your site URL (e.g. `yoursite.com/?admin=1` or just `index.html?admin=1` locally).

A **⚙ Manage Content** button will appear in the bottom-right corner. Click it to update:
- The current **Beat Challenge** — name, description, deadline, and type
- The current **Playlist** — name, description, and submission deadline

Changes save to your browser instantly and show on the site immediately. They persist across page reloads.

> **To make changes permanent** (so they work for everyone, not just your browser): copy the updated values into `CURRENT_CHALLENGE` or `CURRENT_PLAYLIST` near the top of `script.js`.

---

## Updating the Current Beat Challenge

Open `script.js` and find `CURRENT_CHALLENGE` near the top:

```js
const CURRENT_CHALLENGE = {
  id:       'doppelganger-2025-05',   // ← Unique slug, change with each new challenge
  title:    'Doppelganger',
  desc:     'Create a track in the style of any artist in the Discord...',
  deadline: 'May 31, 2025',
  type:     'mimic',   // 'standard' or 'mimic'
};
```

**`type` options:**
- `'standard'` — regular beat challenge, no extra fields
- `'mimic'` — adds a "Who are you mimicking?" field on the form (used for Doppelganger-style challenges)

**Important:** Change the `id` every month so submissions from different challenges don't get mixed together in the database.

---

## Updating the Current Playlist

Open `script.js` and find `CURRENT_PLAYLIST`:

```js
const CURRENT_PLAYLIST = {
  id:       'ltv-vol-4-2025',   // ← Change this with each new playlist
  title:    'LTV Vol. 4',
  desc:     'Our next community playlist is open for submissions...',
  deadline: 'June 15, 2025',
};
```

---

## Adding a New Playlist Embed

When a playlist is finished and posted to SoundCloud, add it to the `PLAYLISTS` array in `script.js`:

**Step 1** — Get the SoundCloud embed URL:
1. Go to your SoundCloud playlist
2. Click **Share** → **Embed**
3. Copy the URL from the `src` attribute of the iframe code

**Step 2** — Add it to the array (most recent first):

```js
const PLAYLISTS = [
  {
    id:       'ltv-vol-4',
    title:    'LTV Vol. 4',
    subtitle: 'Community Mix',
    embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/YOUR_ID&color=%23d181a8&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true',
  },
  // ... older playlists below
];
```

The embed will appear automatically on the page.

---

## Viewing Submissions

All form submissions are saved to your browser's localStorage. To view them:

1. Open the site in your browser
2. Open **DevTools** → **Console** tab (press F12)
3. Type one of these commands:

```js
// View all challenge submissions
LTV.getSubmissions('challenge')

// View all playlist submissions
LTV.getSubmissions('playlist')

// Download everything as a JSON file
LTV.exportSubmissions()

// Clear submissions for a specific challenge (use the challenge id)
LTV.clearSubmissions('challenge', 'doppelganger-2025-05')
```

> **Note:** localStorage is per-browser, per-device. Submissions made by community members on their own devices won't appear in your console — they're stored on their end. See **"Setting Up a Real Database"** below to capture all submissions centrally.

---

## WAV File Uploads

Both submission forms accept `.wav` files only. The drop zone validates this client-side — any non-WAV file is rejected immediately with a clear error message before the form can be submitted. Max file size is 100MB.

### How it works locally
When someone submits the form, the file metadata (name, size) is logged to the localStorage database. The actual file bytes are **not** stored in localStorage — a real file needs a backend to land somewhere permanent.

### Receiving actual WAV files — your options

**Option 1 — Google Forms (simplest, what you've done before)**
Create a Google Form with a File Upload question set to accept audio files. Link to it from the submission form or replace the form entirely. Files go straight to your Google Drive in a folder per form response.

**Option 2 — Uploadcare (free tier, drop-in)**
[Uploadcare](https://uploadcare.com) gives you a file upload widget that stores files in the cloud. Free tier: 3GB storage, 30GB bandwidth/month.
1. Sign up and get a Public API Key
2. Replace the file input in `index.html` with their widget script
3. On submit, you get back a file URL you can save to your database

**Option 3 — Supabase Storage (recommended if using Supabase DB)**
If you set up the Supabase database (see "Setting Up a Real Database"), Supabase also has file storage built in:
1. In Supabase dashboard → **Storage** → create a bucket called `submissions`
2. In `script.js`, inside `handleFormSubmit()`, add this after collecting `data`:

```js
// Upload the WAV file to Supabase Storage
const fileInput = document.getElementById(type === 'challenge' ? 'trackFile' : 'plTrackFile');
const file = fileInput?.files?.[0];
if (file) {
  const path = `${type}/${data.challenge_id || data.playlist_id}/${Date.now()}_${file.name}`;
  await fetch(`${CONFIG.supabaseUrl}/storage/v1/object/submissions/${path}`, {
    method: 'POST',
    headers: {
      'apikey': CONFIG.supabaseKey,
      'Authorization': `Bearer ${CONFIG.supabaseKey}`,
      'Content-Type': 'audio/wav',
    },
    body: file,
  });
  data.track_file_path = path; // saved with the submission record
}
```

Files are organized automatically: `submissions/challenge/doppelganger-2025-05/timestamp_trackname.wav`



To receive submissions by email (free, no backend needed):

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form — copy the endpoint URL (looks like `https://formspree.io/f/abcdefgh`)
3. In `script.js`, paste it into `CONFIG`:

```js
const CONFIG = {
  formEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',
  // ...
};
```

Free tier: 50 submissions/month. Paid plans available if you grow past that.

---

## Setting Up a Real Database (Supabase — Free)

For submissions that are visible to you regardless of which browser or device a community member used, Supabase is the best free option. It gives you a real Postgres database with a simple API.

**Setup (one time, ~15 minutes):**

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the Supabase dashboard → **SQL Editor**, run this to create your tables:

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
  track_link      TEXT,
  genre           TEXT,
  mimic_artist    TEXT,
  notes           TEXT,
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
  track_link      TEXT,
  genre           TEXT,
  notes           TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);
```

3. In Supabase → **Settings → API**, copy your **Project URL** and **anon/public key**
4. In `script.js`, add these to `CONFIG`:

```js
const CONFIG = {
  supabaseUrl:  'https://YOUR_PROJECT.supabase.co',
  supabaseKey:  'YOUR_ANON_KEY',
  // ...
};
```

5. In `script.js`, find the `saveSubmission()` function and replace it with:

```js
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
```

6. View your submissions anytime in the Supabase dashboard → **Table Editor**

You can also export to CSV from there, filter by challenge ID, and more.

---

## Hero Waveform

The animated waveform behind the hero logo is drawn on an HTML5 canvas by `initHeroWave()` in `script.js`. It uses 5 layered sine waves with different frequencies, amplitudes, and speeds.

To adjust it, find the `waves` array in `initHeroWave()`:

```js
const waves = [
  { freq: 0.018, amp: 55, speed: 0.012, color: 'rgba(209,129,168,0.55)', width: 2 },
  // ...
];
```

- `freq` — how tightly packed the waves are (higher = more peaks)
- `amp` — height of the wave (higher = taller)
- `speed` — how fast it animates
- `color` — RGBA color (keep alpha low, e.g. 0.2–0.6, so it doesn't overpower the logo)

The overall opacity of the canvas is set in `styles.css`:
```css
.hero-wave-canvas {
  opacity: 0.18;  /* ← adjust this */
}
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

All colors are CSS variables at the top of `styles.css`. Change one and it updates everywhere:

```css
:root {
  --color-pink:   #d181a8;
  --color-purple: #60376b;
  /* ... */
}
```

---

## Page Sections

| Section | HTML id | What drives the content |
|---|---|---|
| Navigation | `#navbar` | Static HTML |
| Hero | `#hero` | Static HTML + canvas wave from `script.js` |
| About | `#about` | Static HTML |
| Stats | `#stats` | Static HTML (edit numbers directly) |
| Beat Challenges | `#challenges` | Banner from `CURRENT_CHALLENGE` in `script.js` |
| Playlists | `#playlists` | Embeds from `PLAYLISTS` array, banner from `CURRENT_PLAYLIST` |
| Join | `#join` | Static HTML |
| Footer | `#footer` | Static HTML |

---

## Future Ideas

- **Beat Masters Hall of Fame** — a section showing past monthly winners with their tracks
- **Discord member count widget** — live embed showing current server size
- **Newsletter / email list** — Mailchimp or similar integration
- **Voting page** — community voting on challenge submissions at end of month
- **Artist profiles** — simple pages for regular community members
