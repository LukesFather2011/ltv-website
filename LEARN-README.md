# Theory Lab — README

The Theory Lab is LTV's free music theory course for producers, at `limitlesstruevibe.com/learn.html`. It has 6 units and 22 bite-sized modules, taught in a piano roll with built-in sound, exercises, and ear training. Progress saves in each visitor's browser, with no accounts and no database.

---

## Files

```
ltv-website/
├── index.html
├── styles.css          ← the Theory Lab reuses this (nav, footer, colors)
├── learn.html          ← NEW: the Theory Lab page
├── learn.css           ← NEW: Theory Lab styles
├── learn-content.js    ← NEW: every lesson and exercise (the file you'll edit)
├── learn.js            ← NEW: the engine (you shouldn't need to touch this)
└── assets/images/...
```

All four new files go in the **same folder as `index.html`**. Nothing else is needed: no Supabase tables and no audio files. The sounds come from a tiny synth built into the browser.

---

## Going live (5 minutes)

1. Drop `learn.html`, `learn.css`, `learn.js`, and `learn-content.js` into your site folder.
2. Add a **Learn** link to `index.html` in three places (see below).
3. Deploy to Netlify like normal.
4. Visit `limitlesstruevibe.com/learn.html` and run `LTVLearn.check()` in the console (see "Checking for mistakes").

### Add the Learn link to index.html

**Desktop nav.** Inside `<ul class="nav-links">`, add this line right above the Discord link:
```html
<li><a href="learn.html">Learn</a></li>
```

**Mobile menu.** Inside `<div class="mobile-menu">`, add this above "Join the Discord":
```html
<li><a href="learn.html" class="mobile-link">Learn</a></li>
```

**Footer.** Inside `<nav class="footer-nav">`, add:
```html
<a href="learn.html">Learn</a>
```

> If your live nav has links that aren't in `learn.html` (like the voting page), copy those `<li>` lines into the nav at the top of `learn.html` too, so both pages match.

---

## How it works for visitors

- **Course map:** the page opens on the course map. It's laid out like a DAW arrangement: each unit is a track lane, and each module is a clip.
  - Finished modules turn solid.
  - The next module is outlined.
  - Locked modules are dashed.
- **Modules:** each module is 4–6 short steps. Lesson cards have a playable piano roll, and exercise steps must be solved before **Continue** unlocks.
- **Saving:** progress saves automatically after every step. Closing the tab mid-module brings them back to the same step next visit.
- **Order:** modules unlock in order. People who already know theory can click **Unlock all modules** at the bottom of the map.
- **Getting stuck:** after two wrong tries, a **Show answer** button appears on piano roll exercises, so nobody gets stuck.
- **Sharing a module:** every module has its own link, like `learn.html#/m/minor-scale`. You can post those in Discord.

> Progress is per browser, per device, just like the admin panel. Someone who switches from phone to laptop starts fresh on the new device (they can use "Unlock all modules" to jump ahead).

---

## Editing lessons

Everything is in **`learn-content.js`**. Open it, find the module by its title, and change the text. Save, deploy, done.

- Lesson text (`body`) is HTML. Use `<p>` for paragraphs and `<strong>` for bold.
- `<p class="tip">` makes a highlighted tip box.
- `<p class="formula">` shows a step pattern in monospace, like `whole, whole, half`.
- Inside text wrapped in single quotes, write apostrophes as `\'`, e.g. `'That\'s it'`. Inside backticks (the `body` blocks), apostrophes are fine as-is.

### Notes

Notes are written the way your DAW shows them: `C4`, `F#3`, `Bb2`. **C4 = middle C.** Sharps use `#`, flats use a lowercase `b`.

### A piano roll

```js
roll: {
  low:  'C4',                         // lowest row shown
  high: 'C5',                         // highest row shown
  notes: [['C4','E4','G4'], ['F4']],  // one array per column, left to right
  stepDur: 0.5,                       // seconds per column (optional)
  labels: 'all',                      // 'all', 'c' (only C rows), or 'none' (optional)
  highlight: ['C','E','G'],           // shade these rows (optional)
  backing: [['C3']],                  // quiet notes played underneath, not drawn (optional)
  sections: [['C major', 1], ['F', 1]],  // label groups of columns (optional)
}
```

`sections` labels groups of columns in the timeline ruler and in a "Now playing" caption under the roll. Each entry is `[label, how many columns it covers]`, and the numbers must add up to the total number of columns (`LTVLearn.check()` catches mismatches). Use `''` as the label for a silent gap. An optional third item sets a longer caption for "Now playing" (e.g. `['Perfect 5th', 1, 'Perfect 5th (7 half steps)']`), and `cellMin: 52` on the roll widens columns so single-column labels have room:
```js
sections: [['Octave', 4], ['Perfect 5th', 4], ['Tritone', 3]],
```

`backing` can be one column (repeats under every column) or one per column, like a bass part under chords.

---

## The four step types

**1. Lesson card**
```js
{
  type: 'learn',
  title: 'Every row is a note',
  body: `<p>Lesson text here.</p>`,
  roll: { ... },          // optional demo
}
```

**2. Multiple choice**
```js
{
  type: 'quiz',
  prompt: 'How many half steps in a major 3rd?',
  options: ['2', '3', '4', '5'],
  answer: 2,              // position of the right option, counting from 0
  explain: 'Shown after they get it right.',
}
```

**3. Piano roll exercise**
```js
{
  type: 'build',
  prompt: 'Build a C major triad.',
  hint: 'Shown after a wrong answer.',
  roll: { low: 'C4', high: 'C5', steps: 1 },
  answer: [['C4','E4','G4']],
  match: 'pitchClass',
  explain: 'Shown when they get it.',
}
```
Extra roll settings for exercises:
- `steps`: number of columns
- `mono: true`: one note per column (use it for scales and melodies)
- `given: [['C4'], []]`: locked notes already placed for them

`match` sets how strict the grading is:
- `'exact'`: must be the exact rows in `answer`.
- `'pitchClass'`: right note names in any octave. This is forgiving and good for chords.
- `'allowed'`: every column needs one note from a list. Add `allowed: ['F','A','C']`. Good for open-ended melodies.

Add `reminder: 'whole, whole, half, whole, whole, whole, half'` to any exercise to show that formula in a highlighted box every time someone misses. All the scale-building exercises use it.

`answer` must always be filled in, even for `'allowed'`, because it's what **Show answer** displays.

**4. Drill (randomized practice)**
```js
{
  type: 'drill',
  prompt: 'Which interval did you hear?',
  drill: 'intervalEar',
  settings: { intervals: [12, 7, 4, 3] },
  pass: 5,                // correct answers needed to finish
}
```

| Drill | What it does | Settings |
|---|---|---|
| `noteName` | Shows a note, only C labeled. Name it. | `accidentals: true/false` |
| `intervalEar` | Plays two notes. Name the interval. | `intervals: [12, 7, 5, 4, 3]` (in half steps) |
| `consonance` | Stable or tense? | none |
| `chordQuality` | Plays a chord. Name the type. | `qualities: ['maj','min','dim','sus2','sus4','maj7','m7','dom7','maj9','m9']` |
| `scaleQuality` | Plays a scale. Major or minor? | none |
| `inKey` | Shows a note plus a key. In or out? | `keys: ['C major','A minor', ...]` |

Wrong answers never reset the drill. They just show the right answer and move on.

---

## Adding a new module

1. In `learn-content.js`, copy an existing module, everything from `{ id: ...` to its closing `},`.
2. Paste it where you want it inside a unit's `modules: [ ... ]` list.
3. Give it a new, unique `id` (lowercase, dashes, no spaces). **Never change an `id` after launch**, because people's saved progress is keyed to it.
4. Update `title`, `minutes`, `summary` (shown on the "Module complete" screen), and the `steps`.

To add a whole new unit, copy a unit block (`{ id: 'unit-6', title: ..., color: ..., modules: [...] }`) and give it a new `id` and a `color` for its lane.

---

## Checking for mistakes

After editing, open `learn.html`, press **F12** → **Console**, and type:

```js
LTVLearn.check()
```

It scans the whole course and lists anything off:
- misspelled note names
- notes outside a roll's range
- quiz answer numbers that don't exist
- exercises whose own answer wouldn't pass

"All 22 modules look good." means you're clear.

Other console helpers:

```js
LTVLearn.unlockAll()   // open every module in your browser (handy for proofreading)
LTVLearn.progress()    // see what's saved in this browser
LTVLearn.reset()       // wipe your own progress and start over
LTVLearn.previewGraduation()  // mark everything done and open the grad page
```

`LTVLearn.check()` also checks the extras. It flags broken module links, rolls with notes out of range, duplicate capstone task ids, and unknown gym drills.

---

## After the course: graduation + toolkit

Finishing all 22 modules takes learners to a **graduation page** (`learn.html#/complete`). It has:
- a big congratulations with their start and finish dates
- a "What you can do now" recap, one line per unit (the `recap:` line on each unit in `learn-content.js`)
- a downloadable **grad card**: a PNG with their name, sized for Discord
- a **Copy Discord message** button
- **What's next:** the toolkit below, plus links to the beat challenge and playlists

The home page also has a **Put it to work** row, so anyone can use the toolkit before finishing:

| Page | Link | What it is |
|---|---|---|
| Capstone | `#/capstone` | 8-step checklist for building a real track in their DAW. Each step has an example to play, all from one track in A minor. Checkboxes save. |
| Genre recipes | `#/recipes` | Lofi, deep house, future bass, techno, synthwave, and liquid DnB, each with a playable loop and links to the lessons behind it. |
| Practice gym | `#/gym` | Endless versions of every drill. Best streak per drill is saved. |
| Cheat sheet | `#/cheatsheet` | One-page reference with a Print / Save as PDF button. Prints clean on white. |

All of it is editable in the `LEARN_EXTRAS` block at the bottom of `learn-content.js`. The capstone steps, recipes, gym drills, and cheat sheet HTML are all there.

### Set up the Discord role (one time)

1. In Discord, create a channel called **#theory-lab** and a role called **Theory Lab Grad**.
2. If you pick different names, update `channel` and `role` in `LEARN_EXTRAS.graduation`.
3. When someone posts their grad card in the channel, give them the role.

### Preview the graduation page yourself

In the console: `LTVLearn.previewGraduation()` marks everything finished and opens the page. `LTVLearn.reset()` clears it afterwards.

---

## Course outline

| Unit | Modules |
|---|---|
| 1. Reading the piano roll | The 12 notes · Half steps and whole steps · Sharps and flats |
| 2. Scales and keys | The major scale · The minor scale · Staying in key · Relative major and minor |
| 3. Intervals | Measuring intervals (incl. the tritone) · Hearing intervals · Stable and tense sounds |
| 4. Chords | Major and minor chords · The chords in a key · Chord numbers · Seventh chords · Inversions and voice leading |
| 5. Writing parts | Chord progressions · Basslines from chords · Writing melodies |
| 6. Going further | Modes for producers · Sus and extended chords · Borrowed chords · Tension and release |

---

## Ideas for later

- A "theory challenge" beat challenge type (e.g. "must use a borrowed chord") that links to the matching module.
- A MIDI download of each exercise's answer so people can drag it into their DAW.
- Optional cross-device progress via Supabase, using the same INSERT-only pattern as submissions.
