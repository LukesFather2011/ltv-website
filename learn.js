/* =============================================================================
   LIMITLESS TRUEVIBE — learn.js  (Theory Lab engine)
   =============================================================================

   You normally DON'T need to edit this file. Lessons live in learn-content.js.

   TABLE OF CONTENTS
   -----------------
   1.  Theory helpers      — note names, scales, chords, intervals
   2.  Progress            — saves completed modules + resume spot (localStorage)
   3.  Synth               — tiny built-in keyboard sound (Web Audio, no files)
   4.  Transport           — plays a sequence of columns, drives the playhead
   5.  Piano roll          — the interactive grid used everywhere
   6.  Answer checking     — how "build" exercises are graded
   7.  Drills              — randomized ear/eye training generators
   8.  Step renderers      — learn / quiz / build / drill cards
   9.  Home view           — hero + course map (arrangement view)
   10. Module view         — step-by-step player with resume
   11. Router              — #/ for home, #/m/<module-id> for a module
   12. Site chrome         — mobile nav, footer year
   13. Console helpers     — LTVLearn.* for you to inspect or reset progress
   (between 10 and 11)     — Extras: graduation page, capstone, genre recipes,
                             cheat sheet, practice gym, share card

============================================================================= */

(() => {
  'use strict';

  const UNITS  = window.LEARN_UNITS || (typeof LEARN_UNITS !== 'undefined' ? LEARN_UNITS : []);
  const EXTRAS = window.LEARN_EXTRAS || (typeof LEARN_EXTRAS !== 'undefined' ? LEARN_EXTRAS : {});


  /* ===========================================================================
     1. THEORY HELPERS
  =========================================================================== */

  const SHARP  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const FLAT   = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const BLACK_PCS = [1, 3, 6, 8, 10];

  /** 'C#4' → 61. Numbers pass straight through. */
  function toMidi(name) {
    if (typeof name === 'number') return name;
    const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(String(name).trim());
    if (!m) throw new Error(`Theory Lab: "${name}" isn't a note name. Use formats like C4, F#3, Bb2.`);
    const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    return (parseInt(m[3], 10) + 1) * 12 + LETTER[m[1].toUpperCase()] + acc;
  }

  /** 'F#' or 'F#4' → 6 (pitch class, 0–11) */
  function parsePc(str) {
    const m = /^([A-Ga-g])([#b]?)/.exec(String(str).trim());
    if (!m) throw new Error(`Theory Lab: "${str}" isn't a note name.`);
    const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    return (LETTER[m[1].toUpperCase()] + acc + 12) % 12;
  }

  const pcOf    = m => ((m % 12) + 12) % 12;
  const octOf   = m => Math.floor(m / 12) - 1;
  const isBlack = m => BLACK_PCS.includes(pcOf(m));
  const midiName = m => SHARP[pcOf(m)] + octOf(m);

  /** Label for the key strip: white keys get octave numbers, black keys show both names. */
  function keyLabel(m) {
    const p = pcOf(m);
    return isBlack(m) ? `${SHARP[p]}/${FLAT[p]}` : `${SHARP[p]}${octOf(m)}`;
  }

  /** Answer-button name for a pitch class: 'C', 'C#/Db' … */
  function pcName(p) {
    return BLACK_PCS.includes(p) ? `${SHARP[p]} / ${FLAT[p]}` : SHARP[p];
  }

  /** Screen-reader friendly: 'C sharp 4' */
  function spokenName(m) {
    return `${SHARP[pcOf(m)].replace('#', ' sharp')} ${octOf(m)}`;
  }

  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
  };

  // Keys that are normally spelled with flats
  const FLAT_KEYS = new Set(['F major','Bb major','Eb major','Ab major','Db major','D minor','G minor','C minor','F minor','Bb minor']);

  /** 'G major' → { root, mode, pcs, spelled: ['G','A','B','C','D','E','F#'] } */
  function parseKey(str) {
    const [root, mode] = str.split(' ');
    const r   = parsePc(root);
    const pcs = SCALES[mode].map(i => (r + i) % 12);
    const names = FLAT_KEYS.has(str) ? FLAT : SHARP;
    return { root: r, mode, pcs, spelled: pcs.map(p => names[p]) };
  }

  const INTERVAL_NAMES = {
    0: 'Unison', 1: 'Minor 2nd', 2: 'Major 2nd', 3: 'Minor 3rd', 4: 'Major 3rd',
    5: 'Perfect 4th', 6: 'Tritone', 7: 'Perfect 5th', 8: 'Minor 6th',
    9: 'Major 6th', 10: 'Minor 7th', 11: 'Major 7th', 12: 'Octave',
  };

  const CHORDS = {
    maj:  { label: 'Major',        iv: [0, 4, 7] },
    min:  { label: 'Minor',        iv: [0, 3, 7] },
    dim:  { label: 'Diminished',   iv: [0, 3, 6] },
    sus2: { label: 'Sus2',         iv: [0, 2, 7] },
    sus4: { label: 'Sus4',         iv: [0, 5, 7] },
    maj7: { label: 'Major 7th',    iv: [0, 4, 7, 11] },
    m7:   { label: 'Minor 7th',    iv: [0, 3, 7, 10] },
    dom7: { label: 'Dominant 7th', iv: [0, 4, 7, 10] },
    maj9: { label: 'Major 9th',    iv: [0, 4, 7, 11, 14] },
    m9:   { label: 'Minor 9th',    iv: [0, 3, 7, 10, 14] },
  };

  // Small random helpers
  const rand    = n => Math.floor(Math.random() * n);
  const pick    = arr => arr[rand(arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };


  /* ===========================================================================
     2. PROGRESS  (localStorage — per browser, no account needed)
  =========================================================================== */

  const STORE_KEY = 'ltv_learn_progress';

  const blankProgress = () => ({
    completed: {},    // moduleId → ISO date finished
    position: {},     // moduleId → step index (resume spot)
    last: null,       // last module opened
    unlockAll: false,
    capstone: {},     // capstone task id → true
    gym: {},          // gym drill id → best streak
    gradName: '',     // name typed on the grad card
  });

  const Progress = {
    data: blankProgress(),

    load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) this.data = Object.assign(blankProgress(), JSON.parse(raw));
      } catch { /* storage blocked (private mode etc.) — progress just won't persist */ }
    },
    save() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch { /* ignore */ }
    },
    isDone(id)       { return !!this.data.completed[id]; },
    position(id)     { return this.data.position[id] || 0; },
    setPosition(id, step) {
      this.data.position[id] = step;
      this.data.last = id;
      this.save();
    },
    complete(id) {
      this.data.completed[id] = new Date().toISOString();
      delete this.data.position[id];
      this.data.last = id;
      this.save();
    },
    reset() {
      this.data = blankProgress();
      this.save();
    },
  };

  // Flat list of every module, in course order, with its unit attached
  const ALL = [];
  UNITS.forEach((unit, u) => {
    unit.modules.forEach((mod, k) => {
      ALL.push({ unit, unitIndex: u, mod, numInUnit: k, index: ALL.length });
    });
  });
  const findEntry = id => ALL.find(e => e.mod.id === id);

  function isUnlocked(entry) {
    if (Progress.data.unlockAll || entry.index === 0) return true;
    if (Progress.isDone(entry.mod.id) || Progress.position(entry.mod.id) > 0) return true;
    return Progress.isDone(ALL[entry.index - 1].mod.id);
  }

  /** Where "Continue" should take someone */
  function nextEntry() {
    const last = Progress.data.last && findEntry(Progress.data.last);
    if (last && !Progress.isDone(last.mod.id)) return last;
    return ALL.find(e => !Progress.isDone(e.mod.id)) || null;
  }

  const doneCount = () => ALL.filter(e => Progress.isDone(e.mod.id)).length;
  const courseComplete = () => ALL.length > 0 && doneCount() === ALL.length;


  /* ===========================================================================
     3. SYNTH  — a soft keys sound built from two oscillators.
     No audio files needed. Browsers only allow sound after a click/tap,
     which is fine: every sound here starts from a button press.
  =========================================================================== */

  const Synth = {
    ctx: null,
    out: null,
    voices: new Set(),

    init() {
      if (!this.ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        this.ctx = new Ctx();
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.ratio.value = 4;
        this.out = this.ctx.createGain();
        this.out.gain.value = 0.5;
        this.out.connect(comp);
        comp.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    /** Play one note. when/dur in seconds from now. vel 0–1. */
    note(midi, when = 0, dur = 0.5, vel = 0.8) {
      const ctx = this.init();
      if (!ctx) return;
      const t = ctx.currentTime + 0.03 + when;
      const f = 440 * Math.pow(2, (midi - 69) / 12);

      const o1 = ctx.createOscillator();
      o1.type = 'triangle';
      o1.frequency.value = f;

      const o2 = ctx.createOscillator();
      o2.type = 'sawtooth';
      o2.frequency.value = f;
      o2.detune.value = 7;
      const o2g = ctx.createGain();
      o2g.gain.value = 0.16;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 0.6;
      filter.frequency.setValueAtTime(Math.min(f * 7, 9000), t);
      filter.frequency.setTargetAtTime(Math.max(f * 2.2, 500), t, 0.25);

      const amp  = ctx.createGain();
      const peak = 0.32 * vel;
      amp.gain.setValueAtTime(0, t);
      amp.gain.linearRampToValueAtTime(peak, t + 0.012);
      amp.gain.setTargetAtTime(peak * 0.55, t + 0.012, 0.18);
      amp.gain.setTargetAtTime(0, t + dur, 0.1);

      o1.connect(filter);
      o2.connect(o2g).connect(filter);
      filter.connect(amp).connect(this.out);

      const stopAt = t + dur + 0.7;
      o1.start(t); o2.start(t);
      o1.stop(stopAt); o2.stop(stopAt);

      const voice = { amp, oscs: [o1, o2] };
      this.voices.add(voice);
      o1.onended = () => this.voices.delete(voice);
    },

    stopAll() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.voices.forEach(v => {
        try {
          v.amp.gain.cancelScheduledValues(now);
          v.amp.gain.setTargetAtTime(0, now, 0.02);
          v.oscs.forEach(o => o.stop(now + 0.15));
        } catch { /* already stopped */ }
      });
      this.voices.clear();
    },
  };


  /* ===========================================================================
     4. TRANSPORT — plays columns of notes left to right.
     Only one thing plays at a time; starting something new stops the old one.
  =========================================================================== */

  const Transport = {
    timers: [],
    onEnd: null,
    owner: null,

    /**
     * columns: [[midi, midi], [midi], []]
     * opts: { stepDur, backing, onStep(i), onEnd(), owner }
     */
    play(columns, opts = {}) {
      this.stop();
      if (!Synth.init()) return;
      const stepDur = opts.stepDur || 0.5;
      const backing = opts.backing || null;

      this.owner = opts.owner || null;
      this.onEnd = opts.onEnd || null;

      columns.forEach((col, i) => {
        const when = i * stepDur;
        const dur  = stepDur * 0.9;
        const vel  = 0.95 / Math.sqrt(Math.max(1, col.length));
        col.forEach(m => Synth.note(m, when, dur, vel));

        if (backing && backing.length) {
          const b = backing.length === 1 ? backing[0] : backing[i % backing.length];
          if (b) b.forEach(m => Synth.note(m, when, dur, 0.4 / Math.sqrt(b.length)));
        }
        if (opts.onStep) this.timers.push(setTimeout(() => opts.onStep(i), when * 1000 + 30));
      });

      this.timers.push(setTimeout(() => this.finish(), columns.length * stepDur * 1000 + 150));
    },

    finish() {
      const cb = this.onEnd;
      this.timers.forEach(clearTimeout);
      this.timers = [];
      this.onEnd = null;
      this.owner = null;
      if (cb) cb();
    },

    stop() {
      Synth.stopAll();
      this.finish();
    },
  };


  /* ===========================================================================
     5. PIANO ROLL
     cfg (from learn-content.js): low, high, notes, steps, given, mono,
                                  labels, highlight, backing, stepDur
     opts: { editable, tools (show Play/Clear), onChange }
  =========================================================================== */

  function h(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  class PianoRoll {
    constructor(cfg, opts = {}) {
      this.cfg      = cfg;
      this.editable = !!opts.editable;
      this.onChange = opts.onChange || null;
      this.showTools = opts.tools !== false;

      this.low  = toMidi(cfg.low);
      this.high = toMidi(cfg.high);
      const noteCols = (cfg.notes || []).map(col => (Array.isArray(col) ? col : [col]).map(toMidi));

      this.steps    = cfg.steps || Math.max(1, noteCols.length);
      this.mono     = !!cfg.mono;
      this.labels   = cfg.labels || 'all';
      this.highlight = new Set((cfg.highlight || []).map(parsePc));
      this.backing  = cfg.backing ? cfg.backing.map(col => col.map(toMidi)) : null;
      this.stepDur  = cfg.stepDur || (this.steps > 8 ? 0.3 : 0.5);

      // Optional labeled sections: [['Octave', 4], ['Perfect 5th', 4]]
      // Each entry = [label, number of columns it covers].
      this.sections = null;
      this.sectionOf = [];
      if (Array.isArray(cfg.sections) && cfg.sections.length) {
        this.sections = cfg.sections.map(([label, span, caption]) => ({ label: label || '', span: span || 1, caption: caption || label || '' }));
        this.sections.forEach((sec, k) => { for (let j = 0; j < sec.span; j++) this.sectionOf.push(k); });
      }

      this.given = Array.from({ length: this.steps }, (_, i) => new Set(((cfg.given || [])[i] || []).map(toMidi)));
      this.user  = Array.from({ length: this.steps }, (_, i) => new Set(this.editable ? [] : (noteCols[i] || [])));

      this.cells    = Array.from({ length: this.steps }, () => new Map());
      this.rulers   = [];
      this.playhead = -1;
      this.el = this.build();
      this.render();
    }

    build() {
      const root = h('div', 'roll' + (this.editable ? ' is-editable' : ''));
      root.style.setProperty('--steps', this.steps);
      if (this.cfg.cellMin) root.style.setProperty('--roll-cell-min', `${this.cfg.cellMin}px`);

      const scroller = h('div', 'roll-scroll');
      this.scroller = scroller;
      const grid = h('div', 'roll-grid');
      grid.style.gridTemplateColumns = `var(--roll-key-w) repeat(${this.steps}, minmax(var(--roll-cell-min), 1fr))`;
      grid.style.gridTemplateRows = 'auto';   // ruler row grows if a label wraps
      grid.setAttribute('role', this.editable ? 'grid' : 'img');
      if (!this.editable) grid.setAttribute('aria-label', this.describe());

      // Ruler: column numbers along the top, like a DAW timeline
      grid.appendChild(h('div', 'roll-corner'));
      if (this.sections) {
        // Labeled sections span several columns, like locators in a DAW
        this.sectionEls = this.sections.map((sec, k) => {
          const r = h('div', 'roll-ruler roll-section' + (k > 0 ? ' bar-start' : ''), sec.label);
          r.style.gridColumn = `span ${sec.span}`;
          if (sec.label) r.title = sec.label;
          grid.appendChild(r);
          return r;
        });
        for (let s = 0; s < this.steps; s++) {
          this.rulers.push(this.sectionEls[this.sectionOf[s]] || this.sectionEls[this.sectionEls.length - 1]);
        }
      } else {
        for (let s = 0; s < this.steps; s++) {
          const r = h('div', 'roll-ruler' + (s > 0 && s % 4 === 0 ? ' bar-start' : ''), String(s + 1));
          this.rulers.push(r);
          grid.appendChild(r);
        }
      }
      const sectionStart = new Set();
      if (this.sections) { let c = 0; this.sections.forEach(sec => { if (c > 0) sectionStart.add(c); c += sec.span; }); }

      for (let m = this.high; m >= this.low; m--) {
        const black = isBlack(m);
        const pc = pcOf(m);

        const key = h('button', 'roll-key' + (black ? ' is-black' : ' is-white') + (pc === 0 ? ' is-c' : ''));
        key.type = 'button';
        key.tabIndex = -1;
        key.setAttribute('aria-label', `Play ${spokenName(m)}`);
        if (this.labels === 'all' || (this.labels === 'c' && pc === 0)) {
          key.appendChild(h('span', 'roll-key-label', keyLabel(m)));
        }
        key.addEventListener('click', () => {
          Synth.note(m, 0, 0.6, 0.85);
          key.classList.add('is-pressed');
          setTimeout(() => key.classList.remove('is-pressed'), 220);
        });
        grid.appendChild(key);

        for (let s = 0; s < this.steps; s++) {
          const cls = 'roll-cell'
            + (black ? ' row-black' : '')
            + (this.highlight.has(pc) ? ' row-hl' : '')
            + (pc === 0 ? ' row-c' : '')
            + ((this.sections ? sectionStart.has(s) : (s > 0 && s % 4 === 0)) ? ' bar-start' : '');
          const cell = h(this.editable ? 'button' : 'div', cls);
          cell.appendChild(h('span', 'roll-note'));
          if (this.editable) {
            cell.type = 'button';
            cell.setAttribute('aria-label', `${spokenName(m)}, column ${s + 1}`);
            cell.addEventListener('click', () => this.toggle(s, m));
          }
          this.cells[s].set(m, cell);
          grid.appendChild(cell);
        }
      }

      scroller.appendChild(grid);
      root.appendChild(scroller);

      // "Now playing" caption for labeled demos
      if (this.sections) {
        this.nowEl = h('p', 'roll-now');
        this.nowEl.setAttribute('aria-live', 'polite');
        this.nowEl.textContent = 'Press play. Each label shows here as it plays.';
        root.appendChild(this.nowEl);
      }

      if (this.showTools) {
        const tools = h('div', 'roll-tools');
        this.playBtn = h('button', 'lab-btn lab-btn-play', 'Play');
        this.playBtn.type = 'button';
        this.playBtn.addEventListener('click', () => this.togglePlay());
        tools.appendChild(this.playBtn);

        if (this.editable) {
          const clear = h('button', 'lab-btn lab-btn-quiet', 'Clear');
          clear.type = 'button';
          clear.addEventListener('click', () => this.clear());
          tools.appendChild(clear);
        }
        this.toolsEl = tools;
        root.appendChild(tools);
      }
      return root;
    }

    describe() {
      const cols = this.columns().map(c => c.map(midiName).join(' ') || 'rest');
      return `Piano roll: ${cols.join(', then ')}`;
    }

    render() {
      for (let s = 0; s < this.steps; s++) {
        this.cells[s].forEach((cell, m) => {
          const given = this.given[s].has(m);
          const user  = this.user[s].has(m);
          cell.classList.toggle('has-note', given || user);
          cell.classList.toggle('is-given', given);
          if (this.editable) cell.setAttribute('aria-pressed', String(given || user));
        });
      }
    }

    toggle(s, m) {
      if (this.given[s].has(m)) {           // locked note: just play it
        Synth.note(m, 0, 0.5, 0.8);
        return;
      }
      if (this.user[s].has(m)) {
        this.user[s].delete(m);
      } else {
        if (this.mono) {
          if (this.given[s].size) {         // column already holds a locked note
            this.flash([s]);
            return;
          }
          this.user[s].clear();
        }
        this.user[s].add(m);
        Synth.note(m, 0, 0.45, 0.8);
      }
      this.clearMarks();
      this.render();
      if (this.onChange) this.onChange();
    }

    /** All notes (locked + placed) per column, as sorted MIDI arrays */
    columns() {
      return Array.from({ length: this.steps }, (_, s) =>
        [...new Set([...this.given[s], ...this.user[s]])].sort((a, b) => a - b));
    }

    /** Replace placed notes (used by "Show answer") */
    setNotes(cols) {
      this.user = Array.from({ length: this.steps }, (_, s) => {
        const want = (cols[s] || []).map(toMidi).filter(m => !this.given[s].has(m));
        return new Set(want);
      });
      this.clearMarks();
      this.render();
    }

    clear() {
      this.user.forEach(set => set.clear());
      this.clearMarks();
      this.render();
      if (this.onChange) this.onChange();
    }

    lock() {
      this.editable = false;
      this.el.classList.remove('is-editable');
      this.el.classList.add('is-locked');
      this.cells.forEach(map => map.forEach(cell => { cell.disabled = true; }));
      const clear = this.toolsEl && this.toolsEl.querySelector('.lab-btn-quiet');
      if (clear) clear.remove();
    }

    flash(stepList) {
      stepList.forEach(s => {
        this.rulers[s].classList.add('is-wrong');
        this.cells[s].forEach(cell => cell.classList.add('col-wrong'));
      });
    }

    clearMarks() {
      this.rulers.forEach(r => r.classList.remove('is-wrong'));
      this.cells.forEach(map => map.forEach(cell => cell.classList.remove('col-wrong')));
    }

    setPlayhead(i) {
      if (this.nowEl) {
        const sec = i >= 0 ? this.sections[this.sectionOf[i]] : null;
        if (sec && sec.caption) {
          this.nowEl.innerHTML = `Now playing: <strong>${sec.caption}</strong>`;
          this.nowEl.classList.add('is-live');
        } else if (i < 0) {
          this.nowEl.classList.remove('is-live');
        }
      }
      if (this.playhead >= 0) {
        this.rulers[this.playhead]?.classList.remove('is-playing');
        this.cells[this.playhead]?.forEach(c => c.classList.remove('is-playing'));
      }
      this.playhead = i;
      if (i >= 0) {
        this.rulers[i]?.classList.add('is-playing');
        this.cells[i]?.forEach(c => c.classList.add('is-playing'));
        this.followPlayhead(i);
      }
    }

    /** Keep the playing column visible when the roll is wider than the screen */
    followPlayhead(i) {
      const sc = this.scroller;
      if (!sc || sc.scrollWidth <= sc.clientWidth + 2) return;
      const cell = this.cells[i].values().next().value;
      if (!cell) return;
      const keyW = this.el.querySelector('.roll-key')?.offsetWidth || 60;
      const left = cell.offsetLeft;
      const right = left + cell.offsetWidth;
      if (left < sc.scrollLeft + keyW || right > sc.scrollLeft + sc.clientWidth - 8) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        sc.scrollTo({ left: Math.max(0, left - keyW - 12), behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    play() {
      if (this.scroller) this.scroller.scrollLeft = 0;
      Transport.play(this.columns(), {
        stepDur: this.stepDur,
        backing: this.backing,
        owner: this,
        onStep: i => this.setPlayhead(i),
        onEnd: () => {
          this.setPlayhead(-1);
          if (this.playBtn) { this.playBtn.textContent = 'Play'; this.playBtn.classList.remove('is-active'); }
        },
      });
      if (this.playBtn) { this.playBtn.textContent = 'Stop'; this.playBtn.classList.add('is-active'); }
    }

    togglePlay() {
      if (Transport.owner === this) Transport.stop();
      else this.play();
    }
  }


  /* ===========================================================================
     6. ANSWER CHECKING for "build" steps
     Returns { ok, bad: [column indexes that are wrong], empty }
  =========================================================================== */

  function sameSet(a, b) {
    const A = new Set(a), B = new Set(b);
    if (A.size !== B.size) return false;
    for (const x of A) if (!B.has(x)) return false;
    return true;
  }

  function checkBuild(step, cols) {
    const answer  = step.answer.map(col => col.map(toMidi));
    const allowed = new Set((step.allowed || []).map(parsePc));
    const match   = step.match || 'exact';
    const bad = [];

    for (let i = 0; i < cols.length; i++) {
      const got  = cols[i] || [];
      const want = answer[i] || [];
      let ok;
      if (match === 'pitchClass')   ok = got.length > 0 && sameSet(got.map(pcOf), want.map(pcOf));
      else if (match === 'allowed') ok = got.length === 1 && allowed.has(pcOf(got[0]));
      else                          ok = sameSet(got, want);
      if (!ok) bad.push(i);
    }
    return { ok: bad.length === 0, bad, empty: cols.every(c => c.length === 0) };
  }


  /* ===========================================================================
     7. DRILLS — each returns a fresh round:
       { key, options, answer, play(), roll?, context?, explain? }
     `key` is used to avoid asking the exact same thing twice in a row.
  =========================================================================== */

  const DRILLS = {

    // Show one note in the roll (only C labeled), name it
    noteName(settings = {}) {
      const pool = [];
      for (let m = 60; m <= 71; m++) if (settings.accidentals || !isBlack(m)) pool.push(m);
      const m = pick(pool);
      const correct = pcName(pcOf(m));
      const others = shuffle(pool.filter(x => x !== m)).slice(0, 3).map(x => pcName(pcOf(x)));
      const options = shuffle([correct, ...others]);
      return {
        key: m,
        options,
        answer: options.indexOf(correct),
        roll: { low: 'C4', high: 'B4', notes: [[m]], labels: 'c', highlight: [] },
        play: () => Transport.play([[m]], { stepDur: 0.8 }),
        explain: `That row is ${correct}.`,
      };
    },

    // Two notes: one after the other, then together
    intervalEar(settings = {}) {
      const set  = (settings.intervals || [12, 7, 4, 3]).slice().sort((a, b) => b - a);
      const iv   = pick(set);
      const root = 55 + rand(8);
      const options = set.map(n => INTERVAL_NAMES[n]);
      return {
        key: iv,
        options,
        answer: set.indexOf(iv),
        play: () => Transport.play([[root], [root + iv], [root, root + iv]], { stepDur: 0.65 }),
        explain: `${INTERVAL_NAMES[iv]}: ${iv} half steps, ${midiName(root)} to ${midiName(root + iv)}.`,
      };
    },

    // Stable (consonant) vs tense (dissonant)
    consonance() {
      const stable = [3, 4, 5, 7, 8, 9, 12];
      const tense  = [1, 2, 6, 10, 11];
      const isStable = Math.random() < 0.5;
      const iv   = pick(isStable ? stable : tense);
      const root = 55 + rand(8);
      return {
        key: iv,
        options: ['Stable', 'Tense'],
        answer: isStable ? 0 : 1,
        play: () => Transport.play([[root, root + iv]], { stepDur: 1.6 }),
        explain: `That was a ${INTERVAL_NAMES[iv].toLowerCase()}, which counts as ${isStable ? 'stable' : 'tense'}.`,
      };
    },

    // Block chord, then arpeggio, then block chord
    chordQuality(settings = {}) {
      const set  = settings.qualities || ['maj', 'min'];
      const q    = pick(set);
      const root = 57 + rand(8);
      const notes = CHORDS[q].iv.map(i => root + i);
      const options = set.map(k => CHORDS[k].label);
      return {
        key: q,
        options,
        answer: set.indexOf(q),
        play: () => Transport.play([notes, ...notes.map(n => [n]), notes], { stepDur: 0.42 }),
        explain: `${SHARP[pcOf(root)]} ${CHORDS[q].label.toLowerCase()}: ${notes.map(n => SHARP[pcOf(n)]).join(' ')}.`,
      };
    },

    // An ascending scale, major or natural minor
    scaleQuality() {
      const mode = Math.random() < 0.5 ? 'major' : 'minor';
      const root = 57 + rand(8);
      const cols = [...SCALES[mode].map(i => [root + i]), [root + 12]];
      return {
        key: mode + root,
        options: ['Major', 'Minor'],
        answer: mode === 'major' ? 0 : 1,
        play: () => Transport.play(cols, { stepDur: 0.24 }),
        explain: `That was ${SHARP[pcOf(root)]} ${mode}.`,
      };
    },

    // A note shown in the roll + a key: in or out?
    inKey(settings = {}) {
      const keyStr = pick(settings.keys || ['C major', 'A minor']);
      const k = parseKey(keyStr);
      const inside = Math.random() < 0.5;
      const pool = inside ? k.pcs : [...Array(12).keys()].filter(p => !k.pcs.includes(p));
      const p = pick(pool);
      const m = 60 + p;
      const tonic = [48 + k.root, 48 + k.root + (k.mode === 'major' ? 4 : 3), 48 + k.root + 7];
      return {
        key: keyStr + p,
        context: `Key: ${keyStr}`,
        options: ['In key', 'Out of key'],
        answer: inside ? 0 : 1,
        roll: { low: 'C4', high: 'B4', notes: [[m]], labels: 'all' },
        play: () => Transport.play([tonic, [m]], { stepDur: 0.8 }),
        explain: `${keyStr} = ${k.spelled.join(' ')}.`,
      };
    },
  };


  /* ===========================================================================
     8. STEP RENDERERS
     Each returns { el, passed } and calls done() when an exercise is solved.
  =========================================================================== */

  function kindLabel(type) {
    return { learn: 'Lesson', quiz: 'Quick check', build: 'Try it', drill: 'Practice' }[type] || '';
  }

  function stepHeader(step, text) {
    const wrap = h('div', 'step-head');
    wrap.appendChild(h('span', `step-kind kind-${step.type}`, kindLabel(step.type)));
    const title = h('h2', 'step-title');
    title.innerHTML = text;
    title.tabIndex = -1;
    wrap.appendChild(title);
    return wrap;
  }

  function feedbackBox() {
    const box = h('div', 'feedback');
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    return box;
  }

  function setFeedback(box, kind, html) {
    box.className = `feedback is-${kind}`;
    box.innerHTML = html;
  }

  // ── Learn ────────────────────────────────────────────────────────────────
  function renderLearn(step) {
    const el = h('div', 'lab-step step-learn');
    el.appendChild(stepHeader(step, step.title || ''));
    const body = h('div', 'prose');
    body.innerHTML = step.body || '';
    el.appendChild(body);
    if (step.roll) el.appendChild(new PianoRoll(step.roll).el);
    return { el, passed: true };
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  function renderQuiz(step, done) {
    const el = h('div', 'lab-step step-quiz');
    el.appendChild(stepHeader(step, step.prompt));
    if (step.roll) el.appendChild(new PianoRoll(step.roll).el);

    const opts = h('div', 'options');
    const fb = feedbackBox();
    step.options.forEach((label, i) => {
      const b = h('button', 'option', label);
      b.type = 'button';
      b.addEventListener('click', () => {
        if (i === step.answer) {
          b.classList.add('is-correct');
          opts.querySelectorAll('.option').forEach(o => { o.disabled = true; });
          setFeedback(fb, 'good', `<strong>Correct.</strong> ${step.explain || ''}`);
          done();
        } else {
          b.classList.add('is-wrong');
          b.disabled = true;
          setFeedback(fb, 'bad', 'Not that one. Try another answer.');
        }
      });
      opts.appendChild(b);
    });
    el.appendChild(opts);
    el.appendChild(fb);
    return { el, passed: false };
  }

  // ── Build (place notes in the piano roll) ────────────────────────────────
  function renderBuild(step, done) {
    const el = h('div', 'lab-step step-build');
    el.appendChild(stepHeader(step, step.prompt));

    let fails = 0;
    let solved = false;
    const fb = feedbackBox();

    const roll = new PianoRoll(step.roll, {
      editable: true,
      onChange: () => { if (!solved && fb.classList.contains('is-bad')) fb.className = 'feedback'; },
    });
    el.appendChild(roll.el);

    const check = h('button', 'lab-btn lab-btn-primary', 'Check answer');
    check.type = 'button';
    const reveal = h('button', 'lab-btn lab-btn-quiet', 'Show answer');
    reveal.type = 'button';
    reveal.hidden = true;
    roll.toolsEl.appendChild(check);
    roll.toolsEl.appendChild(reveal);

    function succeed(message) {
      solved = true;
      roll.lock();
      check.remove();
      reveal.remove();
      setFeedback(fb, 'good', message);
      done();
      setTimeout(() => roll.play(), 250);
    }

    check.addEventListener('click', () => {
      const result = checkBuild(step, roll.columns());
      if (result.ok) {
        succeed(`<strong>Nailed it.</strong> ${step.explain || ''}`);
        return;
      }
      fails++;
      if (result.empty) {
        setFeedback(fb, 'bad', 'Click the grid to place notes, then check again.');
        return;
      }
      roll.flash(result.bad);
      const where = roll.steps > 1
        ? ` Look at column${result.bad.length > 1 ? 's' : ''} ${result.bad.map(i => i + 1).join(', ')}.`
        : '';
      const reminder = step.reminder
        ? `<span class="reminder">Remember the recipe: <span class="reminder-formula">${step.reminder}</span></span>`
        : '';
      const hint = step.hint ? `<span class="hint">Hint: ${step.hint}</span>` : '';
      setFeedback(fb, 'bad', `Not quite yet.${where}${reminder}${hint}`);
      if (fails >= 2) reveal.hidden = false;
    });

    reveal.addEventListener('click', () => {
      roll.setNotes(step.answer);
      succeed(`<strong>Here's the answer.</strong> ${step.explain || ''} Press play to hear it, then keep going.`);
    });

    el.appendChild(fb);
    return { el, passed: false };
  }

  // ── Drill (randomized rounds) ────────────────────────────────────────────
  function renderDrill(step, done) {
    const el = h('div', 'lab-step step-drill');
    el.appendChild(stepHeader(step, step.prompt));

    const gen = DRILLS[step.drill];
    if (!gen) {
      el.appendChild(h('p', 'feedback is-bad', `Unknown drill "${step.drill}". Check learn-content.js.`));
      return { el, passed: true };
    }

    const endless = !!step.endless;       // practice gym: no finish line
    const need = step.pass || 5;
    let correct = 0;
    let streak = 0;
    let best = step.best || 0;
    let lastKey = null;
    let round = null;

    const score = h('div', 'drill-score');
    const pips = h('div', 'drill-pips');
    if (!endless) for (let i = 0; i < need; i++) pips.appendChild(h('span', 'pip'));
    const scoreText = h('span', 'drill-score-text');
    if (endless) score.classList.add('is-endless');
    score.append(pips, scoreText);

    const stage = h('div', 'drill-stage');
    const context = h('p', 'drill-context');
    const replay = h('button', 'lab-btn lab-btn-play', 'Play again');
    replay.type = 'button';
    replay.addEventListener('click', () => round && round.play());

    const opts = h('div', 'options');
    const fb = feedbackBox();
    const next = h('button', 'lab-btn lab-btn-quiet', 'Next round');
    next.type = 'button';
    next.hidden = true;
    next.addEventListener('click', newRound);

    el.append(score, context, stage, replay, opts, fb, next);

    function updateScore() {
      if (endless) {
        scoreText.innerHTML = `<span>Streak <strong>${streak}</strong></span><span>Best <strong>${best}</strong></span><span>Correct <strong>${correct}</strong></span>`;
        return;
      }
      scoreText.textContent = `${correct} of ${need} correct`;
      [...pips.children].forEach((p, i) => p.classList.toggle('is-on', i < correct));
    }

    function newRound() {
      let r, tries = 0;
      do { r = gen(step.settings || {}); tries++; } while (r.key === lastKey && tries < 8);
      round = r;
      lastKey = r.key;

      next.hidden = true;
      fb.className = 'feedback';
      fb.innerHTML = '';
      context.textContent = r.context || '';
      context.hidden = !r.context;

      stage.innerHTML = '';
      if (r.roll) stage.appendChild(new PianoRoll(r.roll, { tools: false }).el);

      opts.innerHTML = '';
      r.options.forEach((label, i) => {
        const b = h('button', 'option', label);
        b.type = 'button';
        b.addEventListener('click', () => answer(i, b));
        opts.appendChild(b);
      });

      setTimeout(() => { if (round === r) r.play(); }, 250);
    }

    function answer(i, btn) {
      const buttons = [...opts.querySelectorAll('.option')];
      buttons.forEach(b => { b.disabled = true; });
      if (i === round.answer) {
        btn.classList.add('is-correct');
        correct++;
        if (endless) {
          streak++;
          if (streak > best) { best = streak; if (step.onBest) step.onBest(best); }
          updateScore();
          setFeedback(fb, 'good', `<strong>Right.</strong> ${round.explain || ''}`);
          setTimeout(() => { if (el.isConnected) newRound(); }, 1100);
          return;
        }
        updateScore();
        if (correct >= need) {
          setFeedback(fb, 'good', `<strong>Drill complete.</strong> ${round.explain || ''}`);
          replay.hidden = true;
          done();
          return;
        }
        setFeedback(fb, 'good', `<strong>Right.</strong> ${round.explain || ''}`);
        setTimeout(() => { if (el.isConnected) newRound(); }, 1300);
      } else {
        btn.classList.add('is-wrong');
        buttons[round.answer].classList.add('is-correct');
        if (endless) { streak = 0; updateScore(); }
        setFeedback(fb, 'bad', `<strong>It was ${round.options[round.answer]}.</strong> ${round.explain || ''} Wrong answers don't cost you anything. Keep going.`);
        next.hidden = false;
      }
    }

    updateScore();
    newRound();
    return { el, passed: false };
  }

  const RENDERERS = { learn: renderLearn, quiz: renderQuiz, build: renderBuild, drill: renderDrill };


  /* ===========================================================================
     9. HOME VIEW — hero + course map drawn like a DAW arrangement
  =========================================================================== */

  // Hero loop: Am – F – C – G, with bass
  const HERO_ROLL = {
    low: 'G3', high: 'F4',
    notes: [['A3','C4','E4'], ['A3','C4','F4'], ['G3','C4','E4'], ['G3','B3','D4']],
    backing: [['A2'], ['F2'], ['C3'], ['G2']],
    stepDur: 0.75,
    sections: [['Am', 1], ['F', 1], ['C', 1], ['G', 1]],
  };

  /** Mini MIDI-clip thumbnail from the module's first piano roll */
  function clipThumb(mod) {
    let cols = null;
    for (const s of mod.steps) {
      if (s.roll && s.roll.notes && s.roll.notes.length) { cols = s.roll.notes; break; }
      if (s.type === 'build' && s.answer) { cols = s.answer; break; }
    }
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 40');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('clip-thumb');
    if (!cols) return svg;

    const midis = cols.map(c => c.map(toMidi));
    const flat = midis.flat();
    if (!flat.length) return svg;
    const lo = Math.min(...flat), hi = Math.max(...flat);
    const span = Math.max(hi - lo, 6);
    const w = 100 / midis.length;
    midis.forEach((col, i) => col.forEach(m => {
      const r = document.createElementNS(svgNS, 'rect');
      const y = 34 - ((m - lo) / span) * 28;
      r.setAttribute('x', (i * w + 0.8).toFixed(2));
      r.setAttribute('y', y.toFixed(2));
      r.setAttribute('width', Math.max(w - 1.6, 1).toFixed(2));
      r.setAttribute('height', '3.2');
      r.setAttribute('rx', '0.8');
      svg.appendChild(r);
    }));
    return svg;
  }

  function renderHome(app) {
    document.title = 'Theory Lab — Limitless TrueVibe';
    const done = doneCount();
    const total = ALL.length;
    const upNext = nextEntry();
    const started = done > 0 || Object.keys(Progress.data.position).length > 0;

    app.innerHTML = `
      <section class="lab-hero">
        <div class="lab-hero-text">
          <p class="lab-kicker">LTV Theory Lab</p>
          <h1 class="lab-h1">Music theory, taught in the piano roll.</h1>
          <p class="lab-lede">Short lessons for producers who know their way around a DAW but never learned the theory behind it. Each module takes 5 to 8 minutes, you learn by placing notes and training your ear, and your spot is saved so you can pick up whenever. Free, like everything at LTV.</p>
          <div class="lab-progress" id="labProgress"></div>
        </div>
        <figure class="lab-hero-roll" id="heroRoll">
          <figcaption>Am, F, C, G. By Unit 5 you'll know why this loop works and how to write your own.</figcaption>
        </figure>
      </section>

      <section class="arrangement" aria-labelledby="courseHeading">
        <div class="arrangement-head">
          <h2 id="courseHeading" class="lab-h2">The course</h2>
          <p>${UNITS.length} units, ${total} modules. Work through them in order: finishing one unlocks the next. Progress is saved in this browser.</p>
        </div>
        <div class="lanes" id="lanes"></div>
        <div class="arrangement-foot" id="arrangementFoot"></div>
      </section>

      <section class="toolkit" aria-labelledby="toolkitHeading">
        <div class="arrangement-head">
          <h2 id="toolkitHeading" class="lab-h2">Put it to work</h2>
          <p>Tools for using what you learn in your own tracks. Open to everyone, whenever you want them.</p>
        </div>
        <div class="tool-grid" id="toolGrid"></div>
      </section>
    `;

    // Progress + continue
    const prog = app.querySelector('#labProgress');
    const pct = Math.round((done / total) * 100);
    const cta = courseComplete()
      ? `<a class="lab-btn lab-btn-primary lab-btn-big" href="#/complete">See your graduation page</a>`
      : upNext
        ? `<a class="lab-btn lab-btn-primary lab-btn-big" href="#/m/${upNext.mod.id}">${started ? `Continue: ${upNext.mod.title}` : 'Start module 1'}</a>`
        : `<a class="lab-btn lab-btn-primary lab-btn-big" href="#/">Back to the course</a>`;
    prog.innerHTML = `
      ${cta}
      <div class="lab-meter" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="Course progress">
        <div class="lab-meter-fill" style="width:${pct}%"></div>
      </div>
      <p class="lab-meter-text">${done} of ${total} modules complete</p>
    `;

    // Hero roll
    app.querySelector('#heroRoll').prepend(new PianoRoll(HERO_ROLL).el);

    // Lanes
    const lanes = app.querySelector('#lanes');
    UNITS.forEach((unit, u) => {
      const entries = ALL.filter(e => e.unitIndex === u);
      const unitDone = entries.filter(e => Progress.isDone(e.mod.id)).length;

      const lane = h('div', 'lane');
      lane.style.setProperty('--lane', unit.color || '#d181a8');

      const head = h('div', 'lane-head');
      head.innerHTML = `
        <span class="lane-num" aria-hidden="true">${u + 1}</span>
        <div>
          <h3 class="lane-title"><span class="sr-only">Unit ${u + 1}: </span>${unit.title}</h3>
          <p class="lane-blurb">${unit.blurb}</p>
          <p class="lane-count">${unitDone} of ${entries.length} done</p>
        </div>
      `;
      lane.appendChild(head);

      const clips = h('ol', 'clips');
      entries.forEach(entry => {
        const { mod } = entry;
        const isDone = Progress.isDone(mod.id);
        const pos = Progress.position(mod.id);
        const unlocked = isUnlocked(entry);
        const isNext = upNext && upNext.mod.id === mod.id;

        const li = h('li');
        const clip = h(unlocked ? 'a' : 'div', 'clip');
        if (unlocked) clip.href = `#/m/${mod.id}`;
        if (isDone) clip.classList.add('is-done');
        else if (!unlocked) clip.classList.add('is-locked');
        if (isNext) clip.classList.add('is-next');

        let status;
        if (isDone) status = 'Done';
        else if (!unlocked) status = 'Locked';
        else if (pos > 0) status = `Step ${pos + 1} of ${mod.steps.length}`;
        else if (isNext) status = 'Up next';
        else status = `${mod.minutes} min`;

        const top = h('span', 'clip-top');
        top.appendChild(h('span', 'clip-num', String(entry.index + 1)));
        top.appendChild(h('span', 'clip-title', mod.title));
        clip.appendChild(top);

        const body = h('span', 'clip-body');
        if (pos > 0 && !isDone) body.style.setProperty('--fill', `${Math.round((pos / mod.steps.length) * 100)}%`);
        body.appendChild(clipThumb(mod));
        clip.appendChild(body);
        clip.appendChild(h('span', 'clip-status', status));

        li.appendChild(clip);
        clips.appendChild(li);
      });
      lane.appendChild(clips);
      lanes.appendChild(lane);
    });

    // Toolkit
    app.querySelector('#toolGrid').innerHTML = toolCards().join('');

    // Footer controls
    const foot = app.querySelector('#arrangementFoot');
    if (!Progress.data.unlockAll && done < total) {
      const p = h('p', 'foot-line');
      p.append('Already know some theory? ');
      const b = h('button', 'text-btn', 'Unlock all modules');
      b.type = 'button';
      b.addEventListener('click', () => { Progress.data.unlockAll = true; Progress.save(); renderHome(app); });
      p.appendChild(b);
      foot.appendChild(p);
    }
    if (started || Progress.data.unlockAll) {
      const p = h('p', 'foot-line');
      const b = h('button', 'text-btn text-btn-muted', 'Reset my progress');
      b.type = 'button';
      b.addEventListener('click', () => {
        if (confirm('Reset all Theory Lab progress in this browser? This can\'t be undone.')) {
          Progress.reset();
          renderHome(app);
        }
      });
      p.appendChild(b);
      foot.appendChild(p);
    }
  }


  /* ===========================================================================
     10. MODULE VIEW — one step at a time, resumes where you left off
  =========================================================================== */

  function renderLocked(app, entry) {
    const prev = ALL[entry.index - 1];
    app.innerHTML = `
      <div class="player">
        <a class="player-back" href="#/">All modules</a>
        <h1 class="player-title">${entry.mod.title}</h1>
        <div class="lab-step step-locked">
          <p>This module unlocks after <strong>${prev.mod.title}</strong>. The lessons build on each other, so it's worth going in order.</p>
          <div class="complete-actions">
            <a class="lab-btn lab-btn-primary" href="#/m/${prev.mod.id}">Go to ${prev.mod.title}</a>
            <a class="lab-btn lab-btn-quiet" href="#/">All modules</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderModule(app, entry) {
    const { mod, unit, unitIndex } = entry;
    document.title = `${mod.title} — Theory Lab`;

    if (!isUnlocked(entry)) { renderLocked(app, entry); return; }

    const total = mod.steps.length;
    let idx = Math.min(Progress.position(mod.id), total - 1);
    let maxReached = idx;
    const passed = new Set();
    for (let i = 0; i < idx; i++) passed.add(i);

    app.innerHTML = `
      <div class="player" style="--lane:${unit.color || '#d181a8'}">
        <div class="player-top">
          <a class="player-back" href="#/">All modules</a>
          <span class="player-where">Unit ${unitIndex + 1}, module ${entry.index + 1} of ${ALL.length}</span>
        </div>
        <h1 class="player-title">${mod.title}</h1>
        <div class="meter" id="meter" aria-hidden="true"></div>
        <div class="step-host" id="stepHost"></div>
        <div class="player-nav" id="playerNav">
          <button type="button" class="lab-btn lab-btn-quiet" id="backBtn">Back</button>
          <span class="player-count" id="stepCount"></span>
          <button type="button" class="lab-btn lab-btn-primary" id="nextBtn">Continue</button>
        </div>
      </div>
    `;

    const host    = app.querySelector('#stepHost');
    const meter   = app.querySelector('#meter');
    const backBtn = app.querySelector('#backBtn');
    const nextBtn = app.querySelector('#nextBtn');
    const count   = app.querySelector('#stepCount');
    const nav     = app.querySelector('#playerNav');

    mod.steps.forEach(s => meter.appendChild(h('span', `seg seg-${s.type}`)));

    function updateChrome() {
      [...meter.children].forEach((seg, i) => {
        seg.classList.toggle('is-done', i < idx || passed.has(i));
        seg.classList.toggle('is-current', i === idx);
      });
      count.textContent = `Step ${idx + 1} of ${total}`;
      backBtn.disabled = idx === 0;
      const canGo = mod.steps[idx].type === 'learn' || passed.has(idx) || idx < maxReached;
      nextBtn.disabled = !canGo;
      nextBtn.textContent = idx === total - 1 ? 'Finish module' : 'Continue';
      nextBtn.classList.toggle('is-ready', canGo && mod.steps[idx].type !== 'learn');
    }

    function show(i, focus = true) {
      Transport.stop();
      idx = i;
      maxReached = Math.max(maxReached, i);
      Progress.setPosition(mod.id, i);

      const step = mod.steps[i];
      const render = RENDERERS[step.type];
      host.innerHTML = '';
      const { el, passed: pre } = render
        ? render(step, () => { passed.add(i); updateChrome(); })
        : { el: h('p', 'feedback is-bad', `Unknown step type "${step.type}".`), passed: true };
      if (pre) passed.add(i);
      host.appendChild(el);
      updateChrome();

      if (focus) {
        const title = host.querySelector('.step-title');
        if (title) title.focus({ preventScroll: true });
        const top = app.querySelector('.player').getBoundingClientRect().top + window.scrollY - 90;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      }
    }

    function finish() {
      Transport.stop();
      const wasComplete = courseComplete();
      Progress.complete(mod.id);
      const nowComplete = courseComplete();
      if (nowComplete && (!wasComplete || !ALL[entry.index + 1])) {
        location.hash = '#/complete';
        return;
      }
      nav.hidden = true;
      [...meter.children].forEach(seg => { seg.classList.add('is-done'); seg.classList.remove('is-current'); });

      const nextE = ALL[entry.index + 1];
      const unitEnded = !nextE || nextE.unitIndex !== unitIndex;
      const courseEnded = !nextE;

      host.innerHTML = '';
      const card = h('div', 'lab-step complete');
      card.innerHTML = `
        <div class="complete-mark" aria-hidden="true"></div>
        <h2 class="step-title" tabindex="-1">${courseEnded ? 'That\'s the last module.' : unitEnded ? `Unit ${unitIndex + 1} complete.` : 'Module complete.'}</h2>
        <p class="complete-summary">${mod.summary || ''}</p>
        ${courseEnded ? `<p class="complete-summary">You have ${ALL.length - doneCount()} module${ALL.length - doneCount() === 1 ? '' : 's'} left before you graduate. Finish them to unlock your graduation page and grad card.</p>` : ''}
        <div class="complete-actions"></div>
      `;
      const actions = card.querySelector('.complete-actions');
      if (nextE) {
        const a = h('a', 'lab-btn lab-btn-primary', `Next: ${nextE.mod.title}`);
        a.href = `#/m/${nextE.mod.id}`;
        actions.appendChild(a);
      } else {
        const left = ALL.find(e => !Progress.isDone(e.mod.id));
        if (left) {
          const a = h('a', 'lab-btn lab-btn-primary', `Go to ${left.mod.title}`);
          a.href = `#/m/${left.mod.id}`;
          actions.appendChild(a);
        }
      }
      const back = h('a', 'lab-btn lab-btn-quiet', 'All modules');
      back.href = '#/';
      actions.appendChild(back);

      host.appendChild(card);
      card.querySelector('.step-title').focus({ preventScroll: true });
    }

    backBtn.addEventListener('click', () => { if (idx > 0) show(idx - 1); });
    nextBtn.addEventListener('click', () => {
      if (nextBtn.disabled) return;
      if (idx === total - 1) finish();
      else show(idx + 1);
    });

    show(idx, false);
  }



  /* ===========================================================================
     EXTRAS — graduation page, capstone, genre recipes, cheat sheet, gym
     Content for all of these lives in LEARN_EXTRAS (learn-content.js).
  =========================================================================== */

  const esc = str => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** "Refresh" links back to lessons */
  function moduleChips(ids = []) {
    const links = ids.map(findEntry).filter(Boolean)
      .map(e => `<a class="chip" href="#/m/${e.mod.id}">${e.index + 1}. ${e.mod.title}</a>`);
    return links.length ? `<div class="chips"><span class="chips-label">Refresh:</span>${links.join('')}</div>` : '';
  }

  function capstoneTaskIds() {
    return (EXTRAS.capstone?.steps || []).flatMap(st => (st.tasks || []).map(t => t.id));
  }
  function capstoneDoneCount() {
    return capstoneTaskIds().filter(id => Progress.data.capstone[id]).length;
  }

  /** Cards for the toolkit row (home) and the "What's next" section (graduation) */
  function toolCards({ featureCapstone = false } = {}) {
    const total = capstoneTaskIds().length;
    const done  = capstoneDoneCount();
    const cards = [];
    if (EXTRAS.capstone) {
      cards.push(`
        <a class="tool tool-capstone${featureCapstone ? ' is-feature' : ''}" href="#/capstone">
          <span class="tool-name">${esc(EXTRAS.capstone.title)}</span>
          <span class="tool-desc">A step-by-step checklist for building a real track in your DAW with everything from the course, with an example you can hear at every step.</span>
          <span class="tool-meta">${done ? `${done} of ${total} tasks done` : `${EXTRAS.capstone.steps.length} steps`}</span>
        </a>`);
    }
    if (EXTRAS.recipes) {
      cards.push(`
        <a class="tool" href="#/recipes">
          <span class="tool-name">Genre recipes</span>
          <span class="tool-desc">How lofi, house, future bass, techno, synthwave, and liquid DnB use the theory, with a loop to hear for each.</span>
          <span class="tool-meta">${EXTRAS.recipes.length} genres</span>
        </a>`);
    }
    if (EXTRAS.gym) {
      cards.push(`
        <a class="tool" href="#/gym">
          <span class="tool-name">Practice gym</span>
          <span class="tool-desc">Endless ear and note drills. Chase your best streak and keep your ear sharp.</span>
          <span class="tool-meta">${EXTRAS.gym.length} drills</span>
        </a>`);
    }
    if (EXTRAS.cheatsheet) {
      cards.push(`
        <a class="tool" href="#/cheatsheet">
          <span class="tool-name">Cheat sheet</span>
          <span class="tool-desc">Scale and chord recipes, chord numbers, and go-to progressions on one printable page.</span>
          <span class="tool-meta">Printable</span>
        </a>`);
    }
    return cards;
  }

  function pageTop(backLabel = 'All modules', backHref = '#/') {
    return `<div class="player-top"><a class="player-back" href="${backHref}">${backLabel}</a></div>`;
  }

  function fmtDate(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // ── Graduation page ──────────────────────────────────────────────────────
  function renderGraduation(app) {
    document.title = 'You graduated! — Theory Lab';
    const g = EXTRAS.graduation || {};

    if (!courseComplete()) {
      const left = ALL.find(e => !Progress.isDone(e.mod.id));
      app.innerHTML = `
        <div class="page">
          ${pageTop()}
          <h1 class="player-title">Almost there</h1>
          <div class="lab-step">
            <p class="complete-summary">Your graduation page unlocks when all ${ALL.length} modules are done. You've finished ${doneCount()} so far.</p>
            <div class="complete-actions">
              ${left ? `<a class="lab-btn lab-btn-primary" href="#/m/${left.mod.id}">Go to ${esc(left.mod.title)}</a>` : ''}
              <a class="lab-btn lab-btn-quiet" href="#/">All modules</a>
            </div>
          </div>
        </div>`;
      return;
    }

    const dates = Object.values(Progress.data.completed).map(v => new Date(v)).filter(d => !isNaN(d)).sort((a, b) => a - b);
    const started  = dates.length ? fmtDate(dates[0]) : '';
    const finished = dates.length ? fmtDate(dates[dates.length - 1]) : '';

    app.innerHTML = `
      <div class="grad">
        ${pageTop()}
        <section class="grad-hero">
          <p class="lab-kicker">LTV Theory Lab</p>
          <h1 class="grad-h1">Congratulations.</h1>
          <p class="grad-lede">You finished all ${ALL.length} modules. You went from finding C in a piano roll to borrowed chords and tension before the drop, and you did it one short module at a time.</p>
          ${started ? `<p class="grad-dates">Started ${started}. Finished ${finished}.</p>` : ''}
        </section>

        <section class="grad-recap" aria-labelledby="recapHeading">
          <h2 id="recapHeading" class="lab-h2">What you can do now</h2>
          <ol class="recap-list">
            ${UNITS.map((u, i) => `
              <li style="--lane:${u.color || '#d181a8'}">
                <span class="recap-num" aria-hidden="true">${i + 1}</span>
                <div><strong>${esc(u.title)}</strong><p>${esc(u.recap || u.blurb || '')}</p></div>
              </li>`).join('')}
          </ol>
        </section>

        <section class="grad-share" aria-labelledby="shareHeading">
          <div class="grad-share-text">
            <h2 id="shareHeading" class="lab-h2">Claim your grad role</h2>
            <p>Grab your graduate card and post it in <strong>${esc(g.channel || 'the Discord')}</strong>. A mod will give you the <strong>${esc(g.role || 'Theory Lab Grad')}</strong> role.</p>
            <label class="grad-field">
              <span>Name on your card</span>
              <input type="text" id="gradName" maxlength="32" placeholder="Your artist name" value="${esc(Progress.data.gradName || '')}">
            </label>
            <div class="complete-actions">
              <button type="button" class="lab-btn lab-btn-primary" id="downloadCard">Download card</button>
              <button type="button" class="lab-btn lab-btn-quiet" id="copyMsg">Copy Discord message</button>
              <a class="lab-btn lab-btn-discord" href="${esc(g.discordInvite || 'https://discord.gg/AFdeZHfDZN')}" target="_blank" rel="noopener">Open Discord</a>
            </div>
            <p class="grad-status" id="shareStatus" role="status" aria-live="polite"></p>
          </div>
          <canvas class="grad-card" id="gradCard" width="1200" height="630" role="img" aria-label="Your Theory Lab graduate card"></canvas>
        </section>

        <section class="grad-next" aria-labelledby="nextHeading">
          <h2 id="nextHeading" class="lab-h2">What's next</h2>
          <p class="grad-next-lede">Theory sticks when you use it. Start with the capstone: it walks you through one real track using everything you just learned.</p>
          <div class="tool-grid">${toolCards({ featureCapstone: true }).join('')}</div>
          <div class="grad-community">
            <a class="tool" href="index.html#challenges">
              <span class="tool-name">Enter this month's beat challenge</span>
              <span class="tool-desc">Put the new skills in front of the community and go for the Beat Master crown.</span>
            </a>
            <a class="tool" href="index.html#playlists">
              <span class="tool-name">Submit to a community playlist</span>
              <span class="tool-desc">Finished your capstone track? Send it in for the next LTV playlist.</span>
            </a>
          </div>
          <p class="foot-line"><a class="text-btn" href="#/">Review any module anytime</a></p>
        </section>
      </div>
    `;

    const canvas = app.querySelector('#gradCard');
    const nameInput = app.querySelector('#gradName');
    const status = app.querySelector('#shareStatus');
    const redraw = () => drawGradCard(canvas, nameInput.value.trim(), finished);
    redraw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

    nameInput.addEventListener('input', () => {
      Progress.data.gradName = nameInput.value.trim();
      Progress.save();
      redraw();
    });

    app.querySelector('#downloadCard').addEventListener('click', () => {
      canvas.toBlob(blob => {
        if (!blob) { status.textContent = 'Your browser couldn\'t save the image. Try a right-click on the card and "Save image".'; return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ltv-theory-lab-grad.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        status.textContent = `Card downloaded. Post it in ${g.channel || 'the Discord'}.`;
      }, 'image/png');
    });

    app.querySelector('#copyMsg').addEventListener('click', async () => {
      const url = location.protocol.startsWith('http') ? `${location.origin}${location.pathname}` : 'limitlesstruevibe.com/learn.html';
      const msg = `${g.shareMessage || 'I just finished the LTV Theory Lab!'} ${url}`;
      try {
        await navigator.clipboard.writeText(msg);
        status.textContent = 'Message copied. Paste it in Discord with your card.';
      } catch {
        window.prompt('Copy this message:', msg);
      }
    });
  }

  /** Draws the shareable graduate card (1200×630, good for Discord previews) */
  function drawGradCard(canvas, name, dateStr) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const roundRect = (x, y, w, h2, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h2, r);
      ctx.arcTo(x + w, y + h2, x, y + h2, r);
      ctx.arcTo(x, y + h2, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // Background + glow
    ctx.fillStyle = '#161b31';
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(260, 220, 20, 260, 220, 620);
    glow.addColorStop(0, 'rgba(96, 55, 107, 0.65)');
    glow.addColorStop(1, 'rgba(22, 27, 49, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Right side: the finished course as a filled arrangement (one lane per unit)
    const laneX = 720, laneW = 400, laneH = 52, gap = 12;
    const top = (H - (UNITS.length * laneH + (UNITS.length - 1) * gap)) / 2;
    ctx.fillStyle = '#1b2141';
    roundRect(laneX - 24, top - 24, laneW + 48, UNITS.length * (laneH + gap) - gap + 48, 14);
    ctx.fill();
    UNITS.forEach((u, i) => {
      const y = top + i * (laneH + gap);
      const n = u.modules.length;
      const clipGap = 8;
      const cw = (laneW - clipGap * (n - 1)) / n;
      u.modules.forEach((m, k) => {
        ctx.fillStyle = u.color || '#d181a8';
        roundRect(laneX + k * (cw + clipGap), y, cw, laneH, 6);
        ctx.fill();
        // tiny note marks inside each clip
        ctx.fillStyle = 'rgba(22, 27, 49, 0.35)';
        for (let t = 0; t < 4; t++) {
          const nx = laneX + k * (cw + clipGap) + 8 + t * ((cw - 16) / 4);
          const ny = y + 12 + ((t * 7 + k * 5 + i * 3) % 26);
          ctx.fillRect(nx, ny, Math.max((cw - 16) / 4 - 4, 4), 5);
        }
      });
    });

    // Left side: text
    const fit = (text, font, maxW, startSize) => {
      let size = startSize;
      do { ctx.font = font.replace('{s}', size); size -= 2; } while (ctx.measureText(text).width > maxW && size > 20);
    };

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#d181a8';
    ctx.font = '500 30px "DM Sans", system-ui, sans-serif';
    ctx.fillText('LTV Theory Lab', 80, 150);

    ctx.fillStyle = '#fcffde';
    ctx.font = '900 108px "Playfair Display", Georgia, serif';
    ctx.fillText('Graduate', 76, 262);

    const who = name || 'Producer';
    fit(who, 'italic 700 {s}px "Playfair Display", Georgia, serif', 560, 56);
    ctx.fillStyle = '#fcffde';
    ctx.fillText(who, 80, 348);

    ctx.fillStyle = 'rgba(252, 255, 222, 0.62)';
    ctx.font = '400 26px "DM Sans", system-ui, sans-serif';
    ctx.fillText(`${ALL.length} modules. ${UNITS.length} units.`, 80, 410);
    if (dateStr) ctx.fillText(`Finished ${dateStr}`, 80, 448);

    ctx.fillStyle = '#d181a8';
    ctx.font = '400 22px "Space Mono", monospace';
    ctx.fillText('limitlesstruevibe.com/learn.html', 80, 548);
  }

  // ── Capstone ─────────────────────────────────────────────────────────────
  function renderCapstone(app) {
    const cap = EXTRAS.capstone;
    document.title = `${cap.title} — Theory Lab`;
    const total = capstoneTaskIds().length;

    app.innerHTML = `
      <div class="page">
        ${pageTop()}
        <h1 class="player-title">${esc(cap.title)}</h1>
        <p class="page-lede">${cap.intro}</p>
        <div class="cap-meter">
          <div class="lab-meter"><div class="lab-meter-fill" id="capFill"></div></div>
          <p class="lab-meter-text" id="capText"></p>
        </div>
        <ol class="cap-steps" id="capSteps"></ol>
        <div class="lab-step cap-done" id="capDone" hidden>
          <div class="complete-mark" aria-hidden="true"></div>
          <h2 class="step-title">Track finished.</h2>
          <p class="complete-summary">You just used every unit of the course on a real track. Post it in the Discord, and enter it in the next beat challenge.</p>
          <div class="complete-actions">
            <a class="lab-btn lab-btn-primary" href="index.html#challenges">See this month's beat challenge</a>
            <a class="lab-btn lab-btn-discord" href="${esc(EXTRAS.graduation?.discordInvite || 'https://discord.gg/AFdeZHfDZN')}" target="_blank" rel="noopener">Share it in the Discord</a>
          </div>
        </div>
      </div>
    `;

    const list = app.querySelector('#capSteps');
    cap.steps.forEach((st, i) => {
      const li = h('li', 'cap-step');
      li.innerHTML = `
        <span class="cap-num" aria-hidden="true">${i + 1}</span>
        <div class="cap-body">
          <h2 class="cap-title"><span class="sr-only">Step ${i + 1}: </span>${esc(st.title)}</h2>
          <div class="prose">${st.body || ''}</div>
          <div class="cap-roll"></div>
          <ul class="tasks">
            ${(st.tasks || []).map(t => `
              <li><label class="task">
                <input type="checkbox" data-task="${esc(t.id)}" ${Progress.data.capstone[t.id] ? 'checked' : ''}>
                <span>${esc(t.text)}</span>
              </label></li>`).join('')}
          </ul>
          ${moduleChips(st.modules)}
        </div>`;
      if (st.roll) li.querySelector('.cap-roll').appendChild(new PianoRoll(st.roll).el);
      else li.querySelector('.cap-roll').remove();
      list.appendChild(li);
    });

    function update() {
      const done = capstoneDoneCount();
      app.querySelector('#capFill').style.width = `${total ? (done / total) * 100 : 0}%`;
      app.querySelector('#capText').textContent = `${done} of ${total} tasks done`;
      list.querySelectorAll('.cap-step').forEach(li => {
        const boxes = [...li.querySelectorAll('input[type=checkbox]')];
        li.classList.toggle('is-done', boxes.length > 0 && boxes.every(b => b.checked));
      });
      app.querySelector('#capDone').hidden = done < total;
    }

    list.addEventListener('change', e => {
      const id = e.target.dataset?.task;
      if (!id) return;
      if (e.target.checked) Progress.data.capstone[id] = true;
      else delete Progress.data.capstone[id];
      Progress.save();
      update();
    });
    update();
  }

  // ── Genre recipes ────────────────────────────────────────────────────────
  function renderRecipes(app) {
    document.title = 'Genre recipes — Theory Lab';
    const recipes = EXTRAS.recipes || [];
    app.innerHTML = `
      <div class="page page-wide">
        ${pageTop()}
        <h1 class="player-title">Genre recipes</h1>
        <p class="page-lede">How the course shows up in the styles LTV producers make. Each recipe has a loop you can play and links back to the lessons behind it. These are starting points, not rules.</p>
        <div class="jump" role="navigation" aria-label="Jump to a genre">
          ${recipes.map(r => `<button type="button" class="chip" data-jump="recipe-${esc(r.id)}">${esc(r.name)}</button>`).join('')}
        </div>
        <div class="recipes" id="recipes"></div>
      </div>
    `;
    const wrap = app.querySelector('#recipes');
    recipes.forEach(r => {
      const card = h('article', 'recipe lab-step');
      card.id = `recipe-${r.id}`;
      card.innerHTML = `
        <h2 class="recipe-name">${esc(r.name)}</h2>
        <p class="recipe-tag">${esc(r.tagline || '')}</p>
        <dl class="recipe-meta">
          ${r.tempo ? `<div><dt>Tempo</dt><dd>${esc(r.tempo)}</dd></div>` : ''}
          ${r.keys ? `<div><dt>Keys</dt><dd>${esc(r.keys)}</dd></div>` : ''}
        </dl>
        <div class="prose">${r.body || ''}</div>
        <div class="recipe-roll"></div>
        ${moduleChips(r.modules)}
      `;
      if (r.roll) card.querySelector('.recipe-roll').appendChild(new PianoRoll(r.roll).el);
      wrap.appendChild(card);
    });
    app.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => {
      const target = document.getElementById(b.dataset.jump);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }));
  }

  // ── Cheat sheet ──────────────────────────────────────────────────────────
  function renderCheatsheet(app) {
    document.title = 'Cheat sheet — Theory Lab';
    app.innerHTML = `
      <div class="page page-wide">
        ${pageTop()}
        <div class="cs-head">
          <div>
            <h1 class="player-title">Theory cheat sheet</h1>
            <p class="page-lede">Everything from the course on one page. Keep it open next to your DAW, or print it.</p>
          </div>
          <button type="button" class="lab-btn lab-btn-primary no-print" id="printBtn">Print or save as PDF</button>
        </div>
        <div class="cheatsheet">${EXTRAS.cheatsheet || ''}</div>
      </div>
    `;
    app.querySelector('#printBtn').addEventListener('click', () => window.print());
  }

  // ── Practice gym ─────────────────────────────────────────────────────────
  function renderGym(app) {
    document.title = 'Practice gym — Theory Lab';
    const drills = (EXTRAS.gym || []).filter(d => DRILLS[d.drill]);
    app.innerHTML = `
      <div class="page">
        ${pageTop()}
        <h1 class="player-title">Practice gym</h1>
        <p class="page-lede">Endless drills from the course. Pick one and see how long a streak you can build. Your best streak for each drill is saved.</p>
        <div class="gym-picker" id="gymPicker"></div>
        <div id="gymStage"></div>
      </div>
    `;
    const picker = app.querySelector('#gymPicker');
    const stage  = app.querySelector('#gymStage');

    function drawPicker(activeId) {
      picker.innerHTML = '';
      drills.forEach(d => {
        const best = Progress.data.gym[d.id] || 0;
        const b = h('button', 'gym-drill' + (d.id === activeId ? ' is-active' : ''));
        b.type = 'button';
        b.setAttribute('aria-pressed', String(d.id === activeId));
        b.innerHTML = `<span class="gym-name">${esc(d.name)}</span><span class="gym-best">${best ? `Best streak ${best}` : 'Not tried yet'}</span>`;
        b.addEventListener('click', () => start(d.id));
        picker.appendChild(b);
      });
    }

    function start(id) {
      Transport.stop();
      const d = drills.find(x => x.id === id) || drills[0];
      if (!d) return;
      Progress.data.gym._last = d.id;
      Progress.save();
      drawPicker(d.id);
      stage.innerHTML = '';
      const { el } = renderDrill({
        type: 'drill',
        prompt: d.prompt || d.name,
        drill: d.drill,
        settings: d.settings || {},
        endless: true,
        best: Progress.data.gym[d.id] || 0,
        onBest: best => {
          Progress.data.gym[d.id] = best;
          Progress.save();
          const tag = picker.querySelector('.gym-drill.is-active .gym-best');
          if (tag) tag.textContent = `Best streak ${best}`;
        },
      }, () => {});
      el.querySelector('.step-kind').textContent = d.name;
      stage.appendChild(el);
    }

    const last = Progress.data.gym._last;
    drawPicker(null);
    if (last && drills.some(d => d.id === last)) start(last);
    else if (drills[0]) start(drills[0].id);
  }

  /* ===========================================================================
     11. ROUTER — #/ = course map, #/m/<id> = a module
  =========================================================================== */

  function route() {
    Transport.stop();
    const app = document.getElementById('app');
    if (!app) return;
    const hash = location.hash;
    const m = /^#\/m\/([\w-]+)/.exec(hash);
    const entry = m && findEntry(m[1]);
    const pages = {
      '#/complete':   renderGraduation,
      '#/capstone':   EXTRAS.capstone   && renderCapstone,
      '#/recipes':    EXTRAS.recipes    && renderRecipes,
      '#/cheatsheet': EXTRAS.cheatsheet && renderCheatsheet,
      '#/gym':        EXTRAS.gym        && renderGym,
    };
    if (entry) renderModule(app, entry);
    else if (pages[hash]) pages[hash](app);
    else renderHome(app);
    window.scrollTo(0, 0);
  }


  /* ===========================================================================
     12. SITE CHROME — mobile menu + footer year (same behavior as main site)
  =========================================================================== */

  function initChrome() {
    const burger = document.getElementById('navHamburger');
    const menu   = document.getElementById('mobileMenu');
    if (burger && menu) {
      burger.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      menu.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => {
        menu.classList.remove('open');
        document.body.style.overflow = '';
      }));
    }
    const year = document.getElementById('footerYear');
    if (year) year.textContent = new Date().getFullYear();
  }


  /* ===========================================================================
     13. CONSOLE HELPERS  — open DevTools (F12) → Console and type:
       LTVLearn.progress()     see what's saved in this browser
       LTVLearn.reset()        wipe progress in this browser
       LTVLearn.unlockAll()    open every module (handy for testing lessons)
       LTVLearn.previewGraduation()  mark everything done and open the grad page
       LTVLearn.check()        scan learn-content.js for mistakes
  =========================================================================== */

  /** Sanity-checks the curriculum: note names, answer sizes, ranges, drills. */
  function validateContent() {
    const problems = [];
    const ids = new Set();
    ALL.forEach(({ mod }) => {
      if (ids.has(mod.id)) problems.push(`Duplicate module id "${mod.id}"`);
      ids.add(mod.id);
      mod.steps.forEach((s, i) => {
        const where = `${mod.id}, step ${i + 1}`;
        try {
          if (!RENDERERS[s.type]) problems.push(`${where}: unknown type "${s.type}"`);
          if (s.roll) {
            const lo = toMidi(s.roll.low), hi = toMidi(s.roll.high);
            const inRange = n => { const m = toMidi(n); return m >= lo && m <= hi; };
            (s.roll.notes || []).flat().forEach(n => { if (!inRange(n)) problems.push(`${where}: ${n} is outside ${s.roll.low}–${s.roll.high}`); });
            (s.roll.given || []).flat().forEach(n => { if (!inRange(n)) problems.push(`${where}: given ${n} is out of range`); });
            if (s.roll.sections) {
              const cols = (s.roll.steps || (s.roll.notes || []).length);
              const sum = s.roll.sections.reduce((t, sec) => t + (sec[1] || 1), 0);
              if (sum !== cols) problems.push(`${where}: sections cover ${sum} columns but the roll has ${cols}`);
            }
            if (s.type === 'build') {
              s.answer.flat().forEach(n => { if (!inRange(n)) problems.push(`${where}: answer ${n} is out of range`); });
              if (s.answer.length !== (s.roll.steps || 1)) problems.push(`${where}: answer has ${s.answer.length} columns but roll has ${s.roll.steps || 1}`);
              const roll = new PianoRoll(s.roll, { editable: true, tools: false });
              roll.setNotes(s.answer);
              if (!checkBuild(s, roll.columns()).ok) problems.push(`${where}: its own answer doesn't pass the check`);
            }
          }
          if (s.type === 'quiz' && !(s.answer >= 0 && s.answer < s.options.length)) problems.push(`${where}: quiz answer index is out of range`);
          if (s.type === 'drill' && !DRILLS[s.drill]) problems.push(`${where}: unknown drill "${s.drill}"`);
        } catch (err) {
          problems.push(`${where}: ${err.message}`);
        }
      });
    });

    // Extras: capstone + recipe rolls, module links, gym drills, task ids
    const checkRoll = (roll, where) => {
      try {
        const lo = toMidi(roll.low), hi = toMidi(roll.high);
        (roll.notes || []).flat().forEach(n => { const v = toMidi(n); if (v < lo || v > hi) problems.push(`${where}: ${n} is outside ${roll.low}–${roll.high}`); });
        (roll.backing || []).flat().forEach(n => toMidi(n));
        if (roll.sections) {
          const cols = roll.steps || (roll.notes || []).length;
          const sum = roll.sections.reduce((t, sec) => t + (sec[1] || 1), 0);
          if (sum !== cols) problems.push(`${where}: sections cover ${sum} columns but the roll has ${cols}`);
        }
      } catch (err) { problems.push(`${where}: ${err.message}`); }
    };
    const checkLinks = (ids, where) => (ids || []).forEach(id => { if (!findEntry(id)) problems.push(`${where}: no module with id "${id}"`); });
    const taskIds = new Set();
    (EXTRAS.capstone?.steps || []).forEach((st, i) => {
      const where = `capstone step ${i + 1}`;
      if (st.roll) checkRoll(st.roll, where);
      checkLinks(st.modules, where);
      (st.tasks || []).forEach(t => { if (taskIds.has(t.id)) problems.push(`${where}: duplicate task id "${t.id}"`); taskIds.add(t.id); });
    });
    (EXTRAS.recipes || []).forEach(r => {
      const where = `recipe "${r.id}"`;
      if (r.roll) checkRoll(r.roll, where);
      checkLinks(r.modules, where);
    });
    (EXTRAS.gym || []).forEach(d => { if (!DRILLS[d.drill]) problems.push(`gym "${d.id}": unknown drill "${d.drill}"`); });
    return problems;
  }

  window.LTVLearn = {
    progress() { console.log(Progress.data); return Progress.data; },
    reset()    { Progress.reset(); route(); console.log('Theory Lab progress reset.'); },
    unlockAll() { Progress.data.unlockAll = true; Progress.save(); route(); console.log('All modules unlocked.'); },
    previewGraduation() {
      // For testing: marks every module finished so you can see #/complete.
      // Use LTVLearn.reset() afterwards to clear it.
      ALL.forEach(e => { if (!Progress.isDone(e.mod.id)) Progress.data.completed[e.mod.id] = new Date().toISOString(); });
      Progress.save();
      location.hash = '#/complete';
      route();
      console.log('All modules marked complete in this browser. LTVLearn.reset() undoes it.');
    },
    check() {
      const problems = validateContent();
      if (problems.length) console.warn(`Found ${problems.length} problem(s):\n` + problems.join('\n'));
      else console.log(`All ${ALL.length} modules look good.`);
      return problems;
    },
  };


  /* ===========================================================================
     START
  =========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    Progress.load();
    initChrome();
    route();
    window.addEventListener('hashchange', route);
  });

})();
