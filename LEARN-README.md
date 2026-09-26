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
4. Visit `limitlesstruevibe.com/learn.html` and run `LTVLearn.check()` in the console (see "Checking your work").

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
## Contents of the editing guide

1. [Your editing workflow](#1-your-editing-workflow)
2. [How learn-content.js is organized](#2-how-learn-contentjs-is-organized)
3. [Five rules that prevent almost every error](#3-five-rules-that-prevent-almost-every-error)
4. [Notes and piano rolls](#4-notes-and-piano-rolls)
5. [Common edits, step by step](#5-common-edits-step-by-step)
6. [Step type reference](#6-step-type-reference)
7. [Editing the graduation page and toolkit](#7-editing-the-graduation-page-and-toolkit)
8. [How edits affect people's saved progress](#8-how-edits-affect-peoples-saved-progress)
9. [Checking your work and fixing errors](#9-checking-your-work-and-fixing-errors)

---

## 1. Your editing workflow

Every lesson, quiz, exercise, and toolkit page is in **one file: `learn-content.js`**. You never need to touch `learn.js` (the engine) or `learn.css` (the look) to change what the course teaches.

The loop, every time:

1. **Open** `learn-content.js` in VS Code (or any text editor).
2. **Find** the spot with `Ctrl+F` (Mac: `Cmd+F`). Search for words you can see on the page, like the module title or a sentence from the lesson.
3. **Edit** and save.
4. **Preview locally:** double-click `learn.html` in your site folder to open it in your browser. No server needed.
   - To jump straight to a module, add its id to the address: `learn.html#/m/minor-scale`.
   - Locked module? Open the console (F12) and run `LTVLearn.unlockAll()`.
5. **Check:** in the console, run `LTVLearn.check()`. You want "All 22 modules look good."
6. **Deploy** to Netlify like normal, then hard refresh the live site (`Ctrl+Shift+R`, Mac: `Cmd+Shift+R`).

> Your local preview saves progress separately from the live site, so testing never messes up anything real.

> Before a big edit, make a copy of `learn-content.js` (e.g. `learn-content-backup.js`). If something breaks and you can't find why, put the backup back.

---

## 2. How learn-content.js is organized

```
learn-content.js
│
├── LEARN_UNITS  ← the course
│   ├── Unit 1  { id, title, blurb, recap, color, modules: [...] }
│   │   ├── Module  { id, title, minutes, summary, steps: [...] }
│   │   │   ├── Step  { type: 'learn', ... }    ← a lesson card
│   │   │   ├── Step  { type: 'quiz', ... }     ← multiple choice
│   │   │   ├── Step  { type: 'build', ... }    ← piano roll exercise
│   │   │   └── Step  { type: 'drill', ... }    ← randomized practice
│   │   └── Module ...
│   └── Unit 2 ...
│
└── LEARN_EXTRAS  ← everything after the course
    ├── graduation   (Discord channel + role names, share message)
    ├── capstone     (the 8-step track checklist)
    ├── recipes      (genre recipes)
    ├── gym          (practice gym drills)
    └── cheatsheet   (the printable reference, plain HTML)
```

Steps show up in the order they're listed. Modules and units too. Whatever order you put them in the file is the order learners see.

**Unit fields**

| Field | What it does |
|---|---|
| `id` | Internal name. Never change it after launch. |
| `title` | Shown on the course map lane. |
| `blurb` | One-line description under the title on the course map. |
| `recap` | "What you can do now" line on the graduation page. |
| `color` | The lane color, e.g. `'#e39ab8'`. |
| `modules` | The list of modules. |

**Module fields**

| Field | What it does |
|---|---|
| `id` | Internal name and the module's link (`learn.html#/m/your-id`). Lowercase, dashes, no spaces. **Never change it after launch.** |
| `title` | Shown on the course map and at the top of the module. Safe to change anytime. |
| `minutes` | Time estimate shown on the course map. |
| `summary` | Shown on the "Module complete" screen. Write it as "You can now...". |
| `steps` | The list of steps. |

---

## 3. Five rules that prevent almost every error

The file is JavaScript, which is picky about punctuation. One missing comma blanks the whole page. These five rules cover nearly every mistake.

**Rule 1: Every item in a list ends with a comma.** Steps, modules, options, notes: if something comes after it, it needs a comma. A comma after the last item is fine too, so when in doubt, add one.

```js
options: ['2', '3', '4', '5'],      // ✅ commas between items, comma after the ]
options: ['2' '3', '4', '5']        // ❌ missing comma after '2' and after ]
```

**Rule 2: Know your three kinds of quotes.**

| Quote | Used for | Watch out for |
|---|---|---|
| `'single'` | Short text: titles, hints, options, note names | An apostrophe inside ends the text early. Write `\'` instead: `'That\'s it'`. |
| `` `backtick` `` | Long text: every `body` | Apostrophes are fine inside. Don't put a backtick inside. |
| `"double"` | Inside HTML, e.g. `class="tip"` | Fine inside backticks. |

```js
hint: 'It\'s on a black key.',      // ✅ escaped apostrophe
hint: 'It's on a black key.',       // ❌ the ' in It's ends the text early
body: `<p>It's all white keys.</p>`, // ✅ apostrophes are fine inside backticks
```

**Rule 3: Every opener needs a closer.** `{` needs `}`, `[` needs `]`, `` ` `` needs `` ` ``. VS Code highlights the matching bracket when you click next to one. Use that to check.

**Rule 4: Never change an `id` after launch.** Saved progress is keyed to ids. Titles are safe to change; ids are not. (See section 8.)

**Rule 5: Quiz answers count from 0.** The first option is `0`, the second is `1`, and so on.

```js
options: ['7', '8', '12', '24'],
answer: 2,          // → '12' (the third option)
```

---

## 4. Notes and piano rolls

### Note names

Write notes the way a DAW shows them: letter, optional `#` or `b`, then octave number.

- `C4` is middle C. `C5` is one octave up, `C3` one octave down.
- Sharps: `C#4`, `F#3`. Flats: `Bb3`, `Eb4` (lowercase `b`). `C#4` and `Db4` are the same row.
- The octave number goes up at **C**, not A. So the order is `A3, B3, C4, D4`.

### Working out notes for an answer

Use the same method the course teaches: start on the root (zero) and count rows up.

```
C  C#  D  D#  E  F  F#  G  G#  A  A#  B  C
0   1  2   3  4  5   6  7   8  9  10 11 12
```

Example: a minor 7th chord on A is `0 3 7 10` (from the cheat sheet). Starting at A3: 3 up is C4, 7 up is E4, 10 up is G4, so the answer is `['A3','C4','E4','G4']`.

### The piano roll settings

Any `learn`, `quiz`, or `build` step can have a `roll`. Only `low` and `high` are required.

```js
roll: {
  low:  'C4',                          // lowest row shown (required)
  high: 'C5',                          // highest row shown (required)
  notes: [['C4','E4','G4'], ['F4']],   // demo notes, one [ ] per column, left to right
  stepDur: 0.5,                        // seconds per column when played
  labels: 'all',                       // key labels: 'all', 'c' (only C rows), or 'none'
  highlight: ['C','E','G'],            // shade these rows (note names without numbers)
  backing: [['C3']],                   // quiet notes played under it, not drawn
  sections: [['C major', 1], ['F', 1]],// labels over groups of columns
  cellMin: 52,                         // wider columns (only if labels are cramped)
}
```

Details:
- **Columns:** each `[ ]` in `notes` is one column. Several notes in one column play together (a chord). An empty `[]` is a silent column.
- **Range:** every note must be between `low` and `high`, or `LTVLearn.check()` will flag it. Keep ranges tight: 12–16 rows fits nicely on phones.
- **`backing`:** one column repeats under every column, like a held bass note. Or give one per column, like a bassline under chords.
- **`sections`:** each entry is `[label, how many columns]`. The numbers must add up to the total columns. `''` labels a gap. An optional third item is a longer "Now playing" caption: `['Perfect 5th', 1, 'Perfect 5th (7 half steps)']`.

---

## 5. Common edits, step by step

### Fix wording or a typo

Search for the text, change it, save. Lesson text lives in `body`, between backticks. It's HTML:

| You want | Write |
|---|---|
| A paragraph | `<p>Text here.</p>` |
| Bold | `<strong>word</strong>` |
| A highlighted tip box | `<p class="tip">Tip text.</p>` |
| A formula box (monospace) | `<p class="formula">whole, whole, half</p>` |
| A line break | `<br>` |

### Rename a module or unit

Change `title` only. Leave `id` alone.

```js
id: 'twelve-notes',          // leave this alone
title: 'Meet the notes',     // change this freely
```

### Add a lesson card

Copy this, paste it into a module's `steps: [ ... ]` where you want it, and fill it in:

```js
{
  type: 'learn',
  title: 'Your card title',
  body: `
    <p>First paragraph.</p>
    <p>Second paragraph.</p>
  `,
  roll: { low: 'C4', high: 'C5', notes: [['C4'],['E4'],['G4']] },   // optional: delete this line for no demo
},
```

### Add a multiple-choice question

```js
{
  type: 'quiz',
  prompt: 'Your question?',
  options: ['First', 'Second', 'Third', 'Fourth'],
  answer: 1,                                  // counts from 0, so this is 'Second'
  explain: 'Shown after they pick the right one. Explain why.',
},
```

Options show in the order you write them, so vary where the right answer sits. Wrong picks say "Try another answer," and they can keep trying.

### Add a piano roll exercise

```js
{
  type: 'build',
  prompt: 'Build a <strong>G major</strong> triad.',
  hint: 'G, then up 4 half steps, then up 3 more.',        // shown after a wrong answer
  roll: { low: 'G3', high: 'G4', steps: 1 },
  answer: [['G3','B3','D4']],
  match: 'pitchClass',
  explain: 'Shown when they get it right.',
},
```

Choose the grading with `match`:

| `match` | Passes when | Good for |
|---|---|---|
| `'exact'` | Exactly the rows in `answer` | Scales, specific voicings, "place the note above X" |
| `'pitchClass'` | Right note names, any octave | Chords, where any voicing is fine |
| `'allowed'` | Every column has one note from `allowed` | Open-ended melodies. Add `allowed: ['F','A','C']`. |

Useful extras:
- `steps: 8` gives 8 columns. `mono: true` allows one note per column (scales and melodies).
- `given: [['D4'], []]` places locked notes they build on. Include given notes in `answer` too.
- `reminder: 'whole, whole, half, whole, whole, whole, half'` shows that formula in a box on every wrong answer.
- `answer` is always required, even with `'allowed'`, because it's what **Show answer** reveals.

`answer` needs one `[ ]` per column, the same count as `steps`. Run `LTVLearn.check()` after adding one: it confirms the answer passes its own grading.

### Add a practice drill

```js
{
  type: 'drill',
  prompt: 'Which interval did you hear?',
  drill: 'intervalEar',
  settings: { intervals: [12, 7, 4, 3] },
  pass: 5,                   // correct answers needed to finish
},
```

| `drill` | What it does | `settings` |
|---|---|---|
| `noteName` | Shows a note (only C labeled). Name it. | `{ accidentals: true }` or `false` for white keys only |
| `intervalEar` | Plays two notes. Name the interval. | `{ intervals: [12, 7, 5, 4, 3] }`, sizes in half steps |
| `consonance` | Stable or tense? | none |
| `chordQuality` | Plays a chord. Name the type. | `{ qualities: ['maj','min'] }`. Options: `maj` `min` `dim` `sus2` `sus4` `maj7` `m7` `dom7` `maj9` `m9` |
| `scaleQuality` | Plays a scale. Major or minor? | none |
| `inKey` | Shows a note and a key. In or out? | `{ keys: ['C major', 'A minor'] }`. Any root + `major` or `minor`. |

### Remove or reorder steps

Each step starts with `{` and ends with `},`. Select from the `{` to its matching `},` and cut or move it. Check the steps above and below still end in `},`.

### Add a new module

1. Find a module like the one you want. Select from its `{` (the line above `id:`) down to its closing `},`, and copy.
2. Paste it where the new module should go, inside a unit's `modules: [ ... ]`.
3. Give it a **new** `id`: lowercase, dashes, unique.
4. Change `title`, `minutes`, `summary`, and replace the `steps`.
5. Run `LTVLearn.check()`. It catches duplicate ids.

### Add a new unit

Copy a whole unit block (from `{` above `id: 'unit-6'` to its closing `},`) and paste it after the last unit, before the `];` that closes `LEARN_UNITS`. Give it a new `id` (like `'unit-7'`), a `title`, `blurb`, `recap`, `color`, and its `modules`.

> Adding modules to the course un-graduates people until they finish the new ones. See section 8.

---

## 6. Step type reference

| Type | Required | Optional |
|---|---|---|
| `learn` | `title`, `body` | `roll` |
| `quiz` | `prompt`, `options`, `answer`, `explain` | `roll` (a demo above the options) |
| `build` | `prompt`, `roll` (with `steps`), `answer`, `match` | `hint`, `reminder`, `explain`, `allowed` (for `'allowed'`), and in `roll`: `given`, `mono`, `labels`, `backing` |
| `drill` | `prompt`, `drill` | `settings`, `pass` (default 5) |

`prompt` can use HTML like `<strong>`. Learners see a small label above each step automatically: Lesson, Quick check, Try it, or Practice.

---

## 7. Editing the graduation page and toolkit

All of it is in the `LEARN_EXTRAS` block at the bottom of `learn-content.js`.

| Section | What to edit |
|---|---|
| `graduation` | `channel` and `role` (the Discord names shown on the grad page), `discordInvite`, and `shareMessage` (the copied Discord message). |
| `capstone` | `title`, `intro`, and `steps`. Each step has `title`, `body`, an optional `roll`, `tasks` (checkboxes: `{ id, text }`, ids must be unique and never change), and `modules` (a list of module ids for the "Refresh" links). |
| `recipes` | Each genre: `id`, `name`, `tagline`, `tempo`, `keys`, `body`, `roll`, `modules`. Copy one to add a genre. |
| `gym` | Each drill: `id`, `name`, `drill`, `settings`, `prompt`. Same drill types as section 5. Don't change ids (best streaks are saved by id). |
| `cheatsheet` | Plain HTML between backticks. Each box is a `<section class="cs-block">` with an `<h2>` and a table or list. |

The unit `recap` lines on the graduation page are on each unit at the top of the file.

**Setting up the Discord role (one time):** create a **#theory-lab** channel and a **Theory Lab Grad** role. If you name them differently, change `channel` and `role` under `graduation` to match. When someone posts their grad card there, give them the role.

**Preview the grad page:** `LTVLearn.previewGraduation()` in the console marks everything done and opens it. `LTVLearn.reset()` clears it.

---

## 8. How edits affect people's saved progress

Progress lives in each visitor's browser and is keyed to ids.

| You change | What happens to learners |
|---|---|
| Any text, title, hint, or roll | Nothing. They see the new version. |
| Add, remove, or reorder steps in a module | Finished modules stay finished. Anyone mid-module resumes by step number, so they might land one step earlier or later. Harmless. |
| A module's `id` | Their completion for that module disappears, and later modules can lock again. **Avoid this.** |
| Add a new module | It appears in place. It's unlocked for anyone who finished the module before it. |
| Add a module after they've graduated | The graduation page shows "Almost there" until they finish the new module. The home page tells them what's left. |
| Remove a module | Their other progress is unaffected. |
| A capstone task `id` or gym drill `id` | That checkbox unchecks, or that best streak resets. |

---

## 9. Checking your work and fixing errors

### Run the checker after every edit

Open `learn.html`, press **F12** → **Console**, and run:

```js
LTVLearn.check()
```

It lists anything off, with the module id and step number:
- misspelled note names
- notes outside a roll's range
- quiz answer numbers with no matching option
- exercises whose own answer wouldn't pass
- section labels that don't add up
- duplicate ids
- Refresh links to modules that don't exist

"All 22 modules look good." means you're clear.

### If the page says "The Theory Lab is taking a quick break"

The course map is replaced with that message when `learn-content.js` has a typo, almost always a punctuation mistake from section 3. The browser stops reading the file at the error. `LTVLearn.check()` will also tell you the file didn't load.

1. Open the console. Look for a red message like:
   `Uncaught SyntaxError: Unexpected identifier 's'`
   with `learn-content.js:412` on the right side of that line.
2. The number after the file name is the **line** (412). Click it to jump there, or go to that line in VS Code (`Ctrl+G`, then type the number).
3. The mistake is on that line or the one just above it. Check for a missing comma, an unescaped apostrophe in single quotes, or a missing bracket.

(The `'s'` in that example error is a real one: `'E's your root'` ends the text at `E`, and the browser can't make sense of the `s` after it.)

If the console says **`LTVLearn is not defined`** instead, the problem is `learn.js` itself not loading. You're probably on a different page (check the address says `learn.html`), or the file didn't get uploaded.

| Error says | Usually means |
|---|---|
| `Unexpected identifier` or `Unexpected string` | A missing comma, or an apostrophe ending a `'single quoted'` text early |
| `Unexpected token '}'` or `']'` | An extra or missing bracket just above |
| `missing ) after argument list` | A bracket was never closed |
| `"X" isn't a note name` | A typo in a note, like `C#` with no octave, or `H4` |

VS Code also underlines most of these in red as you type. Hover over the squiggle to see what's wrong.

### Changes not showing up on the live site

Hard refresh with `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`). Browsers hold onto old copies of `learn-content.js`.

### Console helpers

```js
LTVLearn.check()              // scan the course for mistakes
LTVLearn.unlockAll()          // open every module in this browser
LTVLearn.progress()           // see what's saved in this browser
LTVLearn.reset()              // wipe progress in this browser
LTVLearn.previewGraduation()  // mark everything done and open the grad page
```

---

## Course outline

| Unit | Modules |
|---|---|
| 1. Reading the piano roll | Meet the notes · Half steps and whole steps · Sharps and flats |
| 2. Scales and keys | The major scale · The minor scale · Staying in key · Relative major and minor |
| 3. Intervals | Measuring intervals (incl. the tritone) · Hearing intervals · Stable and tense sounds |
| 4. Chords | Major and minor chords · The chords in a key · Chord numbers · Seventh chords · Inversions and voice leading |
| 5. Writing parts | Chord progressions · Basslines from chords · Writing melodies |
| 6. Going further | Modes for producers · Sus and extended chords · Borrowed chords · Tension and release |

After the course: graduation page (`#/complete`), capstone (`#/capstone`), genre recipes (`#/recipes`), practice gym (`#/gym`), and cheat sheet (`#/cheatsheet`).

---

## Ideas for later

- A "theory challenge" beat challenge type (e.g. "must use a borrowed chord") that links to the matching module.
- A MIDI download of each exercise's answer so people can drag it into their DAW.
- Optional cross-device progress via Supabase, using the same INSERT-only pattern as submissions.
