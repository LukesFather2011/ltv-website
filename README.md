# Limitless TrueVibe — Website

A community website for electronic music producers. Built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies.

---

## Project Structure

```
ltv-website/
├── index.html          ← Main site
├── styles.css          ← Main site styles
├── script.js           ← All interactivity and dynamic content
├── halloffame.html     ← Hall of Fame — all past challenge winners
├── halloffame.css      ← Hall of Fame styles + admin toggle styles
├── assets/
│   └── images/
│       ├── logo-hero.jpg     ← Purple mountain logo (hero + about)
│       └── logo-no-bg.png    ← Dark background logo (nav + footer)
└── README.md
```

---

## Hosting — Cloudflare Pages

The site is deployed via **Cloudflare Pages** connected to a GitHub repository.

### First-time setup
1. Push the project to a public GitHub repository
2. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
4. Select your GitHub repo
5. Build settings — leave everything blank (this is a static site, no build needed)
6. Click **Save and Deploy**

### Custom domain (limitlesstruevibe.com)
1. In Cloudflare Dashboard → your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter `limitlesstruevibe.com`
4. Cloudflare handles SSL automatically — no extra setup needed
5. If your domain is registered on Namecheap, point its nameservers to Cloudflare's (found in Cloudflare DNS settings)

### Deploying updates
Every push to your GitHub repo's main branch automatically redeploys the site. No manual steps needed.

---

## How the Site Works

The site is intentionally simple. No database. No backend. No automatic anything.

**You control everything manually through:**
1. Editing values in `script.js` (permanent changes)
2. Using the Admin Panel at `?admin=1` (temporary, browser-local changes)

### The basic monthly workflow

```
1. Start a new challenge → update CURRENT_CHALLENGE in script.js
2. Create a Google Form for submissions → paste URL in admin panel or script.js
3. Toggle submissions ON in admin panel
4. Challenge ends → toggle submissions OFF
5. Create a voting Google Form → paste URL, toggle voting ON
6. Voting ends → toggle voting OFF, announce winner in Discord
7. Add winner to halloffame.html
8. Repeat next month
```

---

## Updating the Current Challenge

Open `script.js` and find `CURRENT_CHALLENGE` near the top:

```js
const CURRENT_CHALLENGE = {
  title:           'Doppelganger',
  desc:            'Create a track in the style of any artist...',
  deadline:        'May 31, 2026',
  type:            'mimic',     // 'standard' or 'mimic'
  submissionsOpen: true,        // ← controls whether the submit button shows
  votingOpen:      false,       // ← controls whether the voting button shows
};
```

**`type` options:**
- `'standard'` — regular beat challenge
- `'mimic'` — adds a note on the card reminding submitters to name who they're mimicking

**Toggle logic:**
- `submissionsOpen: true` + `votingOpen: false` → Submit button shows
- `submissionsOpen: false` + `votingOpen: true` → Vote button shows
- Both `false` → "Submissions Closed" message shows

---

## Updating the Current Playlist

```js
const CURRENT_PLAYLIST = {
  title:           'LTV Vol. 5',
  desc:            'Theme or description...',
  deadline:        'June 15, 2026',
  submissionsOpen: true,   // ← flip to false when not accepting submissions
};
```

Set `submissionsOpen: false` when no playlist is active. The banner automatically shows "No Active Playlist Right Now."

---

## Google Form URLs

Paste your Google Form URLs into the `FORMS` object in `script.js`:

```js
const FORMS = {
  challengeSubmit: 'https://forms.google.com/your-challenge-form',
  voting:          'https://forms.google.com/your-voting-form',
  playlistSubmit:  'https://forms.google.com/your-playlist-form',
};
```

The site only shows a button for a form if:
1. The corresponding toggle (`submissionsOpen` or `votingOpen`) is `true`
2. A real URL is set in `FORMS` (not a placeholder)

If the toggle is on but no URL is set, the card shows a message directing people to Discord instead.

---

## Admin Panel

Add `?admin=1` to your site URL (e.g. `limitlesstruevibe.com/?admin=1`) to open the admin panel. A **⚙ Manage Content** button appears in the bottom-right corner.

### Challenge tab
- Edit challenge name, description, deadline, type
- Toggle **Submissions Open** on/off
- Toggle **Voting Active** on/off

### Playlist tab
- Edit playlist name, description, deadline
- Toggle **Submissions Open** on/off

### Links tab
- Paste Google Form URLs for challenge submissions, voting, and playlist submissions

**Important:** Admin panel changes save to your browser only. They apply immediately but are local to your device. To make changes permanent for everyone, copy the values back into `script.js` and push to GitHub.

---

## Adding a New Playlist Embed

When a playlist is posted on SoundCloud, add it to the `PLAYLISTS` array in `script.js`:

**Step 1** — Get the embed URL:
1. Go to your SoundCloud playlist
2. Click **Share** → **Embed**
3. Copy the URL from the `src` attribute of the iframe

**Step 2** — Add it (most recent first):

```js
const PLAYLISTS = [
  {
    id:       'ltv-vol-5',
    title:    'LTV Vol. 5',
    subtitle: 'Community Mix',
    embedUrl: 'https://w.soundcloud.com/player/?url=...',
  },
  // older playlists below
];
```

---

## Hall of Fame

The Hall of Fame (`halloffame.html`) is hardcoded — no database. When a new winner is announced, add a card manually.

### Adding a new winner

Open `halloffame.html` and add a new card at the **top** of the `.hof-grid` div (newest first). Copy the pattern from an existing card:

```html
<div class="hof-card reveal">
  <div class="hof-card-num">#15</div>
  <div class="hof-card-crown">👑</div>
  <div class="hof-card-challenge">Challenge Name</div>
  <div class="hof-card-winner">Artist Handle</div>
  <div class="hof-card-track">"Track Title"</div>
  <a href="https://soundcloud.com/artistname" target="_blank" rel="noopener" class="hof-sc-btn">SoundCloud →</a>
  <div class="hof-card-date">Month Year</div>
</div>
```

### Multi-win badges

If the winner has won before, add the badge inside `.hof-card-winner`:

```html
<div class="hof-card-winner">
  Artist Handle <span class="hof-multi-badge">2x Winner</span>
</div>
```

Update to `3x Winner`, `4x Winner` etc. as wins accumulate.

### Update the stats bar

After adding a new card, update the stats at the top of `halloffame.html`:

```html
<div class="hof-stats-bar">
  <div class="hof-stat"><span class="hof-stat-num">15</span><span class="hof-stat-lbl">Challenges</span></div>
  <div class="hof-stat"><span class="hof-stat-num">12</span><span class="hof-stat-lbl">Unique Winners</span></div>
  <div class="hof-stat"><span class="hof-stat-num">3</span><span class="hof-stat-lbl">Multi-Time Champs</span></div>
</div>
```

---

## Submissions — Google Forms Setup

Both challenge and playlist submissions go through Google Forms. This keeps files organized in Google Drive automatically.

### Recommended Google Form fields

**Challenge submission form:**
- Artist Name / Handle (short answer)
- Email (short answer)
- Discord Username (short answer, optional)
- Track Title (short answer)
- Genre (dropdown)
- Who are you mimicking? (short answer — only show for mimic challenges using conditional logic)
- File Upload (WAV preferred — Google Drive handles large files with no size issues)
- Anything else we should know? (paragraph, optional)

**Playlist submission form:**
- Artist Name / Handle
- Email
- Discord Username (optional)
- Track Title
- Genre (optional)
- File Upload
- Anything else we should know? (optional)

**Voting form:**
- Discord Username or Email (for identity)
- One question per track with a 1–10 rating scale or ranking

### Accessing submissions
All responses and uploaded files appear automatically in:
- **Google Forms** → Responses tab (spreadsheet view)
- **Google Drive** → a folder created automatically per form

---

## Brand Reference

| Name | Hex | Used for |
|---|---|---|
| Cream | `#fcffde` | Primary text |
| Dark | `#161b31` | Main background |
| Pink | `#d181a8` | Primary accent, CTAs |
| Purple | `#60376b` | Secondary accent, gradients |
| White | `#ffffff` | Pure white |
| Discord | `#5865F2` | Discord brand buttons |

All colors are CSS variables at the top of `styles.css`. Change one and it updates everywhere.

---

## Page Sections

| Section | File | What drives the content |
|---|---|---|
| Navigation | `index.html` | Static HTML + Hall of Fame link |
| Hero | `index.html` | Static HTML + canvas wave |
| About | `index.html` | Static HTML |
| Stats | `index.html` | Static HTML (edit numbers directly) |
| Beat Challenges | `index.html` | `CURRENT_CHALLENGE` in `script.js` |
| Playlists | `index.html` | `PLAYLISTS` array + `CURRENT_PLAYLIST` in `script.js` |
| Join | `index.html` | Static HTML |
| Footer | `index.html` | Static HTML |
| Hall of Fame | `halloffame.html` | Hardcoded cards — edit manually |

---

## Monthly Checklist

### Starting a new challenge
- [ ] Update `CURRENT_CHALLENGE` in `script.js` — new title, desc, deadline, type
- [ ] Create a Google Form for submissions
- [ ] Paste the URL into `FORMS.challengeSubmit` in `script.js` (or via admin panel)
- [ ] Set `submissionsOpen: true`, `votingOpen: false`
- [ ] Push to GitHub → auto-deploys to Cloudflare Pages
- [ ] Announce in Discord

### When submissions close
- [ ] Set `submissionsOpen: false` in `script.js` or admin panel
- [ ] Download submissions from Google Drive
- [ ] Create a voting Google Form
- [ ] Paste voting URL into `FORMS.voting`
- [ ] Set `votingOpen: true`
- [ ] Push to GitHub
- [ ] Post voting link in Discord

### When voting closes
- [ ] Set `votingOpen: false`
- [ ] Tally results from Google Forms response sheet
- [ ] Announce winner in Discord
- [ ] Add winner card to `halloffame.html`
- [ ] Update stats bar numbers in `halloffame.html`
- [ ] Push to GitHub

---

## Future Ideas

- Playlists archive page (`playlists.html`) with cover art cards linking to SoundCloud
- Discord member count widget
- Newsletter / email list integration
