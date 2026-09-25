/* =============================================================================
   LIMITLESS TRUEVIBE — learn-content.js
   The Theory Lab curriculum. ALL lesson text and exercises live here.
   =============================================================================

   You can edit wording, fix typos, or add whole new modules in this file
   without touching learn.js. See LEARN-README.md for the full guide.

   QUICK REFERENCE
   ---------------
   Notes are written like DAW note names: 'C4', 'F#3', 'Bb2'.
   C4 = middle C. Sharps use #, flats use b.

   A "roll" (piano roll) looks like this:
     roll: {
       low:  'C4',            // lowest row shown
       high: 'C5',            // highest row shown
       notes: [               // one array per COLUMN (left to right)
         ['C4', 'E4', 'G4'],  // column 1 = a C major chord
         ['D4'],              // column 2 = a single note
         [],                  // column 3 = silence
       ],
       stepDur: 0.5,          // seconds per column when played (optional)
       labels: 'all',         // 'all' | 'c' (only C rows) | 'none'  (optional)
       highlight: ['C','D','E','F','G','A','B'], // shade these rows (optional)
       backing: [['C3','E3','G3']], // quiet notes played UNDER the roll but not drawn (optional)
     }

   STEP TYPES (each module is a list of steps, shown one at a time)
   ----------------------------------------------------------------
   { type: 'learn', title, body, roll? }
       A short lesson card. body is HTML. roll is an optional demo.

   { type: 'quiz', prompt, options: [...], answer: <index>, explain, roll? }
       Multiple choice. answer is the position of the right option,
       starting at 0. (First option = 0, second = 1, ...)

   { type: 'build', prompt, roll: {..., steps, given, mono}, answer, match, hint, explain }
       The learner places notes in the piano roll.
         steps:  number of columns
         given:  locked notes already placed (same format as notes)
         mono:   true = only one note per column (for scales/melodies)
         reminder: a formula shown on every wrong answer, e.g.
                 'whole, whole, half, whole, whole, whole, half'
         answer: the correct columns (also used for "Show answer")
         match:  'exact'      — exact rows must match
                 'pitchClass' — right note names, any octave (more forgiving)
                 'allowed'    — every column needs one note from `allowed`
         allowed: ['F','A','C']  (only for match: 'allowed')

   { type: 'drill', prompt, drill: '<name>', settings: {...}, pass: <number> }
       Randomized ear/eye training. Learner needs `pass` correct answers.
       Drill names: noteName, intervalEar, consonance, chordQuality,
                    scaleQuality, inKey  (settings listed in LEARN-README.md)

============================================================================= */

const LEARN_UNITS = [

  /* ===========================================================================
     UNIT 1 — THE PIANO ROLL
  =========================================================================== */
  {
    id: 'unit-1',
    title: 'Reading the piano roll',
    blurb: 'Note names, octaves, and the distances between rows.',
    recap: 'Read any piano roll: name every row, count half and whole steps, and find C without labels.',   // shown on the graduation page
    color: '#e39ab8',
    modules: [

      {
        id: 'twelve-notes',
        title: 'The 12 notes',
        minutes: 5,
        summary: 'You know there are only 12 notes, that they repeat every octave, and how to find C in any piano roll.',
        steps: [
          {
            type: 'learn',
            title: 'Every row is a note',
            body: `
              <p>Open any piano roll and you'll see rows stacked from low to high. Each row is one note.</p>
              <p>Here's the part nobody tells you: there are only <strong>12 different notes</strong> in Western music. After 12 rows, the pattern starts over, just higher. Press play and listen to all 12, then the 13th, which is the first note again, one level up.</p>
            `,
            roll: {
              low: 'C4', high: 'C5',
              notes: [['C4'],['C#4'],['D4'],['D#4'],['E4'],['F4'],['F#4'],['G4'],['G#4'],['A4'],['A#4'],['B4'],['C5']],
              stepDur: 0.22,
            },
          },
          {
            type: 'learn',
            title: 'Octaves',
            body: `
              <p>That jump from one C to the next C is called an <strong>octave</strong>. Notes an octave apart share a name and sound like the same note, just higher or lower. That's why doubling a lead an octave up sounds bigger but not "different".</p>
              <p>The number after the letter tells you which octave you're in: C3 is below C4, C5 is above it.</p>
              <p class="tip">Heads up: DAWs don't agree on numbering. Some call middle C "C3", some "C4", and FL Studio calls it "C5". Same note, different label. This course uses C4.</p>
            `,
            roll: {
              low: 'C3', high: 'C5',
              notes: [['C3'],['C4'],['C5'],['C3','C4','C5']],
              sections: [['C3',1],['C4',1],['C5',1],['All three',1]],
              stepDur: 0.5,
            },
          },
          {
            type: 'learn',
            title: 'Letters and black keys',
            body: `
              <p>The white-key rows are named with the letters <strong>C D E F G A B</strong>, then back to C. The darker rows between them are the black keys. You'll name those in module 3.</p>
              <p>To find C fast, look at the key strip on the left. Black keys come in groups of two and three. <strong>C sits right below the group of two.</strong></p>
            `,
            roll: {
              low: 'C4', high: 'C5',
              notes: [['C4'],['D4'],['E4'],['F4'],['G4'],['A4'],['B4'],['C5']],
              stepDur: 0.3,
            },
          },
          {
            type: 'build',
            prompt: 'The labels are hidden. Place a note on <strong>every C</strong> you can find. Stack them all in the one column.',
            hint: 'C is the white-key row just below each group of two black keys. There are three in this range.',
            roll: { low: 'C3', high: 'C5', steps: 1, labels: 'none' },
            answer: [['C3','C4','C5']],
            match: 'exact',
            explain: 'Three Cs, three octaves. Play it back: they blend together because they are the same note.',
          },
          {
            type: 'drill',
            prompt: 'Name the highlighted note. Only the C row is labeled, like in most DAWs. Count up from C.',
            drill: 'noteName',
            settings: { accidentals: false },
            pass: 4,
          },
          {
            type: 'quiz',
            prompt: 'How many different notes are there before the pattern repeats?',
            options: ['7', '8', '12', '24'],
            answer: 2,
            explain: '12. Seven have letter names (the white keys) and five are the black keys in between.',
          },
        ],
      },

      {
        id: 'steps',
        title: 'Half steps and whole steps',
        minutes: 5,
        summary: 'You can measure distance in the piano roll using half steps and whole steps, the building blocks of every scale.',
        steps: [
          {
            type: 'learn',
            title: 'One row = one half step',
            body: `
              <p>Moving up or down by one row is a <strong>half step</strong> (also called a semitone). It's the smallest distance in the piano roll.</p>
              <p>Every row counts, black or white. From C to C# is one half step.</p>
            `,
            roll: { low: 'C4', high: 'E4', notes: [['C4'],['C#4'],['C4'],['C#4']], stepDur: 0.4 },
          },
          {
            type: 'learn',
            title: 'Two rows = one whole step',
            body: `
              <p>Two half steps make a <strong>whole step</strong> (a tone). C to D is a whole step because you skip over C#.</p>
              <p>You'll use half and whole steps constantly. They're the recipe for every scale in the next unit.</p>
            `,
            roll: { low: 'C4', high: 'E4', notes: [['C4'],['D4'],['C4'],['D4']], stepDur: 0.4 },
          },
          {
            type: 'learn',
            title: 'The two sneaky spots',
            body: `
              <p>Look at the key strip: there's no black key between <strong>E and F</strong>, or between <strong>B and C</strong>.</p>
              <p>So those white keys are only a half step apart. This is the single most useful fact for reading a piano roll, and it's why scales have their shape.</p>
            `,
            roll: { low: 'C4', high: 'C5', notes: [['E4'],['F4'],[],['B4'],['C5']], stepDur: 0.4, highlight: ['E','F','B','C'] },
          },
          {
            type: 'quiz',
            prompt: 'How many half steps is it from C up to E?',
            options: ['2', '3', '4', '5'],
            answer: 2,
            explain: 'C → C# → D → D# → E. Four rows, so four half steps (two whole steps).',
          },
          {
            type: 'build',
            prompt: 'D4 is placed for you. In column 2, place the note <strong>one whole step above</strong> it.',
            hint: 'A whole step is two rows up.',
            roll: { low: 'C4', high: 'C5', steps: 2, mono: true, given: [['D4'], []] },
            answer: [['D4'], ['E4']],
            match: 'exact',
            explain: 'D to E is a whole step. You skipped D#.',
          },
          {
            type: 'build',
            prompt: 'Now E4 is placed. In column 2, place the note <strong>one half step above</strong> it.',
            hint: 'One row up. Is there a black key between E and F?',
            roll: { low: 'C4', high: 'C5', steps: 2, mono: true, given: [['E4'], []] },
            answer: [['E4'], ['F4']],
            match: 'exact',
            explain: 'E to F is a half step with no black key in between, one of the two sneaky spots.',
          },
        ],
      },

      {
        id: 'sharps-flats',
        title: 'Sharps and flats',
        minutes: 5,
        summary: 'You can name every row in the piano roll, including the black keys, and you know one note can have two names.',
        steps: [
          {
            type: 'learn',
            title: 'Naming the black keys',
            body: `
              <p>Black keys are named after their neighbors.</p>
              <p><strong>Sharp (#)</strong> means one half step up. The black key above C is <strong>C#</strong>.</p>
              <p><strong>Flat (b)</strong> means one half step down. That same key, seen from D, is <strong>Db</strong>.</p>
            `,
            roll: { low: 'C4', high: 'D4', notes: [['C4'],['C#4'],['D4'],['C#4']], stepDur: 0.45, highlight: ['C#'] },
          },
          {
            type: 'learn',
            title: 'One row, two names',
            body: `
              <p>C# and Db are the <strong>same row, same sound</strong>. Musicians call these enharmonic notes. Which name gets used depends on the key you're in, which you'll see in Unit 2.</p>
              <p>For now, just know that when a tutorial says "Bb" and your DAW shows "A#", they mean the same thing.</p>
            `,
          },
          {
            type: 'quiz',
            prompt: 'Which note is the same row as F#?',
            options: ['G#', 'Gb', 'Fb', 'E'],
            answer: 1,
            explain: 'F# is one half step above F, which is also one half step below G. So F# = Gb.',
          },
          {
            type: 'quiz',
            prompt: 'What is one half step above B?',
            options: ['A#', 'C#', 'C', 'Bb'],
            answer: 2,
            explain: 'B to C is one of the sneaky spots with no black key between them.',
          },
          {
            type: 'drill',
            prompt: 'Name the highlighted note. Black keys count now too.',
            drill: 'noteName',
            settings: { accidentals: true },
            pass: 5,
          },
        ],
      },
    ],
  },

  /* ===========================================================================
     UNIT 2 — SCALES & KEYS
  =========================================================================== */
  {
    id: 'unit-2',
    title: 'Scales and keys',
    blurb: 'Pick notes that belong together, and stay in key on purpose.',
    recap: 'Build major and minor scales from any note, stay in key on purpose, and find relative keys.',   // shown on the graduation page
    color: '#c38ad6',
    modules: [

      {
        id: 'major-scale',
        title: 'The major scale',
        minutes: 6,
        summary: 'You can build a major scale from any starting note with the whole/half step recipe.',
        steps: [
          {
            type: 'learn',
            title: 'A scale is a menu of notes',
            body: `
              <p>A <strong>scale</strong> is a set of notes that sound good together. Instead of choosing from all 12 rows, you pick from 7. That's why melodies suddenly stop sounding random.</p>
              <p>The <strong>major scale</strong> sounds bright and uplifting. Here's C major:</p>
            `,
            roll: { low: 'C4', high: 'C5', notes: [['C4'],['D4'],['E4'],['F4'],['G4'],['A4'],['B4'],['C5']], stepDur: 0.3 },
          },
          {
            type: 'learn',
            title: 'The recipe',
            body: `
              <p>Every major scale uses the same pattern of steps:</p>
              <p class="formula">whole, whole, half, whole, whole, whole, half</p>
              <p>Start on any note, follow the recipe, and you get that note's major scale. C major happens to land on only white keys, which is why everyone learns it first.</p>
              <p class="tip">Many DAWs have a scale highlight or "fold to scale" mode that shades the rows in your key. The shaded rows below are exactly that.</p>
            `,
            roll: { low: 'C4', high: 'C5', notes: [], highlight: ['C','D','E','F','G','A','B'] },
          },
          {
            type: 'build',
            prompt: 'Draw the <strong>C major scale</strong> going up from C4 to C5, one note per column.',
            reminder: 'whole, whole, half, whole, whole, whole, half',
            hint: 'All white keys, in order: C D E F G A B C.',
            roll: { low: 'C4', high: 'C5', steps: 8, mono: true },
            answer: [['C4'],['D4'],['E4'],['F4'],['G4'],['A4'],['B4'],['C5']],
            match: 'exact',
            explain: 'That\'s the major scale. Play it back and hear how "finished" the last C sounds.',
          },
          {
            type: 'build',
            prompt: 'Now use the recipe starting from G. Build <strong>G major</strong> from G4 up to G5.',
            reminder: 'whole, whole, half, whole, whole, whole, half',
            hint: 'Count each step from the note before it. The 7th note lands on a black key.',
            roll: { low: 'G4', high: 'G5', steps: 8, mono: true },
            answer: [['G4'],['A4'],['B4'],['C5'],['D5'],['E5'],['F#5'],['G5']],
            match: 'exact',
            explain: 'G major has one sharp: F#. The recipe forced it. F would have been a half step too low.',
          },
          {
            type: 'quiz',
            prompt: 'Which note is NOT in the C major scale?',
            options: ['F', 'B', 'F#', 'A'],
            answer: 2,
            explain: 'C major is only white keys, so F# is out.',
          },
        ],
      },

      {
        id: 'minor-scale',
        title: 'The minor scale',
        minutes: 6,
        summary: 'You can build the natural minor scale and hear the difference between major and minor.',
        steps: [
          {
            type: 'learn',
            title: 'The moody one',
            body: `
              <p>The <strong>natural minor scale</strong> sounds darker and more emotional. Drum &amp; bass, techno, trap, and most lofi lean on it heavily.</p>
              <p class="formula">whole, half, whole, whole, half, whole, whole</p>
              <p>Here's A minor. Like C major, it's all white keys.</p>
            `,
            roll: { low: 'A3', high: 'A4', notes: [['A3'],['B3'],['C4'],['D4'],['E4'],['F4'],['G4'],['A4']], stepDur: 0.3 },
          },
          {
            type: 'learn',
            title: 'Major vs. minor from the same root',
            body: `
              <p>Listen to C major, then C minor. Minor drops three notes by a half step: the <strong>3rd, 6th, and 7th</strong>. That small change flips the whole mood.</p>
            `,
            roll: {
              low: 'C4', high: 'C5',
              notes: [['C4'],['D4'],['E4'],['F4'],['G4'],['A4'],['B4'],['C5'],[],['C4'],['D4'],['Eb4'],['F4'],['G4'],['Ab4'],['Bb4'],['C5']],
              sections: [['C major',9],['C minor',8]],
              stepDur: 0.24,
            },
          },
          {
            type: 'build',
            prompt: 'Draw <strong>A natural minor</strong> from A3 up to A4.',
            reminder: 'whole, half, whole, whole, half, whole, whole',
            hint: 'It uses only white keys.',
            roll: { low: 'A3', high: 'A4', steps: 8, mono: true },
            answer: [['A3'],['B3'],['C4'],['D4'],['E4'],['F4'],['G4'],['A4']],
            match: 'exact',
            explain: 'A minor. Same white keys as C major, but it feels like home on A instead of C. That comes back in module 7.',
          },
          {
            type: 'build',
            prompt: 'Build <strong>C minor</strong> from C4 up to C5.',
            reminder: 'whole, half, whole, whole, half, whole, whole',
            hint: 'Count each step from the note before it. You\'ll need three black keys.',
            roll: { low: 'C4', high: 'C5', steps: 8, mono: true },
            answer: [['C4'],['D4'],['Eb4'],['F4'],['G4'],['Ab4'],['Bb4'],['C5']],
            match: 'exact',
            explain: 'C minor: C D Eb F G Ab Bb C. Three flats.',
          },
          {
            type: 'drill',
            prompt: 'Listen to the scale. Major or minor?',
            drill: 'scaleQuality',
            pass: 4,
          },
        ],
      },

      {
        id: 'keys',
        title: 'Staying in key',
        minutes: 5,
        summary: 'You know what a key is, how to hear an out-of-key note, and how to check whether a note fits.',
        steps: [
          {
            type: 'learn',
            title: 'What "in key" means',
            body: `
              <p>When someone says a track is "in A minor", they mean it uses the A minor scale and <strong>A feels like home</strong>, the note everything resolves back to. That home note is called the <strong>root</strong> or tonic.</p>
              <p>Sample packs label loops with keys so you can combine them. Two loops in the same key will get along.</p>
            `,
            roll: {
              low: 'A3', high: 'A4',
              notes: [['E4'],['D4'],['C4'],['D4'],['E4'],['G4'],['E4'],['A3']],
              stepDur: 0.35,
              highlight: ['A','B','C','D','E','F','G'],
              backing: [['A2']],
            },
          },
          {
            type: 'learn',
            title: 'The sour note',
            body: `
              <p>Same melody, but the 6th note is replaced with one from outside the key. Hear how it sticks out?</p>
              <p>Out-of-key notes aren't illegal. Producers use them on purpose for tension. But when a melody sounds "wrong" and you can't tell why, an accidental out-of-key note is the first thing to check.</p>
            `,
            roll: {
              low: 'A3', high: 'A4',
              notes: [['E4'],['D4'],['C4'],['D4'],['E4'],['Eb4'],['E4'],['A3']],
              stepDur: 0.35,
              highlight: ['A','B','C','D','E','F','G'],
              backing: [['A2']],
            },
          },
          {
            type: 'drill',
            prompt: 'Is the highlighted note in the key shown?',
            drill: 'inKey',
            settings: { keys: ['C major', 'A minor', 'G major', 'E minor', 'F major', 'D minor'] },
            pass: 5,
          },
          {
            type: 'quiz',
            prompt: 'Your track is in E minor. Which of these notes fits?',
            options: ['F', 'F#', 'C#', 'G#'],
            answer: 1,
            explain: 'E minor = E F# G A B C D. It has one sharp, F#.',
          },
        ],
      },

      {
        id: 'relative',
        title: 'Relative major and minor',
        minutes: 5,
        summary: 'You can find the minor key that shares notes with any major key, and the reverse.',
        steps: [
          {
            type: 'learn',
            title: 'Same notes, different home',
            body: `
              <p>C major and A minor use <strong>exactly the same seven notes</strong>. The only difference is which note feels like home.</p>
              <p>Listen: first starting and landing on C, then on A. Same rows, different mood.</p>
              <p>Keys that share notes like this are <strong>relative</strong> keys. A minor is the relative minor of C major.</p>
            `,
            roll: {
              low: 'A3', high: 'C5',
              notes: [['C4'],['E4'],['G4'],['C5'],[],['A3'],['C4'],['E4'],['A4']],
              stepDur: 0.35,
            },
          },
          {
            type: 'learn',
            title: 'The shortcut',
            body: `
              <p>To find a major key's relative minor, <strong>count down 3 half steps</strong> from its root.</p>
              <p>C major → down 3 → A minor. G major → down 3 → E minor.</p>
              <p>Going the other way, count <strong>up</strong> 3 half steps from the minor root to find its relative major.</p>
              <p class="tip">Why this matters: if a sample pack only has "A minor" loops and your track is in C major, they'll fit. Same notes.</p>
            `,
          },
          {
            type: 'quiz',
            prompt: 'What is the relative minor of F major?',
            options: ['C minor', 'D minor', 'E minor', 'A minor'],
            answer: 1,
            explain: 'Count down 3 half steps from F: E, Eb, D. D minor.',
          },
          {
            type: 'quiz',
            prompt: 'What is the relative major of E minor?',
            options: ['G major', 'A major', 'C major', 'D major'],
            answer: 0,
            explain: 'Count up 3 half steps from E: F, F#, G. G major.',
          },
          {
            type: 'build',
            prompt: 'F major has one flat (Bb). Draw its relative minor, <strong>D minor</strong>, from D4 to D5.',
            reminder: 'whole, half, whole, whole, half, whole, whole',
            hint: 'Same notes as F major, just starting on D: D E F G A Bb C D.',
            roll: { low: 'D4', high: 'D5', steps: 8, mono: true },
            answer: [['D4'],['E4'],['F4'],['G4'],['A4'],['Bb4'],['C5'],['D5']],
            match: 'exact',
            explain: 'D minor shares all its notes with F major, including the Bb.',
          },
        ],
      },
    ],
  },

  /* ===========================================================================
     UNIT 3 — INTERVALS
  =========================================================================== */
  {
    id: 'unit-3',
    title: 'Intervals',
    blurb: 'The distance between two notes, and why some pairs clash.',
    recap: 'Name intervals by counting and by ear, and keep your low end clean.',   // shown on the graduation page
    color: '#9d8ef0',
    modules: [

      {
        id: 'intervals',
        title: 'Measuring intervals',
        minutes: 6,
        summary: 'You can name the distance between any two notes by counting half steps.',
        steps: [
          {
            type: 'learn',
            title: 'Intervals are distances',
            body: `
              <p>An <strong>interval</strong> is the distance between two notes, counted in half steps. Every chord and melody is really just intervals stacked or strung together.</p>
              <table class="interval-table">
                <tr><th>Half steps</th><th>Interval</th></tr>
                <tr><td>1</td><td>Minor 2nd</td></tr>
                <tr><td>2</td><td>Major 2nd</td></tr>
                <tr><td>3</td><td>Minor 3rd</td></tr>
                <tr><td>4</td><td>Major 3rd</td></tr>
                <tr><td>5</td><td>Perfect 4th</td></tr>
                <tr><td>6</td><td>Tritone</td></tr>
                <tr><td>7</td><td>Perfect 5th</td></tr>
                <tr><td>8</td><td>Minor 6th</td></tr>
                <tr><td>9</td><td>Major 6th</td></tr>
                <tr><td>10</td><td>Minor 7th</td></tr>
                <tr><td>11</td><td>Major 7th</td></tr>
                <tr><td>12</td><td>Octave</td></tr>
              </table>
              <p>Don't memorize it all now. You'll use the 3rds and the 5th the most.</p>
            `,
          },
          {
            type: 'learn',
            title: 'Major 3rd vs. minor 3rd',
            body: `
              <p>These two are the most important intervals in music. One row apart, completely different feeling.</p>
              <p>Major 3rd (4 half steps): bright. Minor 3rd (3 half steps): sad. You're hearing the core of major and minor chords.</p>
            `,
            roll: { low: 'C4', high: 'G4', notes: [['C4','E4'],[],['C4','Eb4']], stepDur: 0.8, sections: [['Major 3rd',2],['Minor 3rd',1]] },
          },
          {
            type: 'learn',
            title: 'Hear every interval',
            body: `
              <p>Here's every interval in order, from 1 half step up to 12. Each column is C4 plus one other note, so the gap between the two notes grows by one row each time.</p>
              <p>The interval's name sits above its column. As it plays, the name and its number of half steps show up under the roll.</p>
              <p>Column 6 is the one that sounds strangest. That's the <strong>tritone</strong>, and it gets its own card next.</p>
            `,
            roll: {
              low: 'C4', high: 'C5',
              notes: [['C4','C#4'],['C4','D4'],['C4','D#4'],['C4','E4'],['C4','F4'],['C4','F#4'],['C4','G4'],['C4','G#4'],['C4','A4'],['C4','A#4'],['C4','B4'],['C4','C5']],
              stepDur: 0.75,
              sections: [
                ['Minor 2nd', 1, 'Minor 2nd (1 half step)'],
                ['Major 2nd', 1, 'Major 2nd (2 half steps)'],
                ['Minor 3rd', 1, 'Minor 3rd (3 half steps)'],
                ['Major 3rd', 1, 'Major 3rd (4 half steps)'],
                ['Perfect 4th', 1, 'Perfect 4th (5 half steps)'],
                ['Tritone', 1, 'Tritone (6 half steps)'],
                ['Perfect 5th', 1, 'Perfect 5th (7 half steps)'],
                ['Minor 6th', 1, 'Minor 6th (8 half steps)'],
                ['Major 6th', 1, 'Major 6th (9 half steps)'],
                ['Minor 7th', 1, 'Minor 7th (10 half steps)'],
                ['Major 7th', 1, 'Major 7th (11 half steps)'],
                ['Octave', 1, 'Octave (12 half steps)'],
              ],
              cellMin: 52,
            },
          },
          {
            type: 'learn',
            title: 'The tritone',
            body: `
              <p>A <strong>tritone</strong> is 6 half steps, which is three whole steps. That's where the name comes from: tri-tone. It splits the octave exactly in half, C to F#, then F# to the next C.</p>
              <p>Because it sits dead center, it doesn't lean toward any home note. It sounds <strong>unstable, spooky, and unresolved</strong>. Medieval musicians called it "the devil in music."</p>
              <p>Producers use it on purpose: dark techno stabs, horror-film tension, and gritty bass riffs. It's also hiding inside every dominant 7th chord (G7 has B and F, a tritone apart). You'll see in Unit 6 why that makes G7 pull so hard toward C.</p>
              <p>Listen: C then F# one after the other, together, then the tritone B–F resolving into C–E.</p>
            `,
            roll: {
              low: 'B3', high: 'F#4',
              notes: [['C4'],['F#4'],['C4','F#4'],[],['B3','F4'],['C4','E4']],
              sections: [['C to F#',3],['',1],['B–F resolves to C–E',2]],
              stepDur: 0.7,
            },
          },
          {
            type: 'quiz',
            prompt: 'How many half steps are in a major 3rd?',
            options: ['2', '3', '4', '5'],
            answer: 2,
            explain: 'Major 3rd = 4 half steps. Minor 3rd = 3.',
          },
          {
            type: 'build',
            prompt: 'C4 is placed. In the same column, add a <strong>perfect 5th</strong> above it.',
            hint: 'A perfect 5th is 7 half steps up.',
            roll: { low: 'C4', high: 'C5', steps: 1, given: [['C4']] },
            answer: [['C4','G4']],
            match: 'exact',
            explain: 'C and G, the "power chord" sound. Strong, open, neither happy nor sad.',
          },
          {
            type: 'build',
            prompt: 'A3 is placed. Add a <strong>minor 3rd</strong> above it in the same column.',
            hint: 'Count 3 half steps up from A.',
            roll: { low: 'A3', high: 'A4', steps: 1, given: [['A3']] },
            answer: [['A3','C4']],
            match: 'exact',
            explain: 'A up to C is a minor 3rd. That\'s why A minor sounds minor.',
          },
          {
            type: 'build',
            prompt: 'C4 is placed. Add a <strong>tritone</strong> above it in the same column.',
            hint: 'A tritone is 6 half steps, three whole steps, exactly halfway to the next C.',
            roll: { low: 'C4', high: 'C5', steps: 1, given: [['C4']] },
            answer: [['C4','F#4']],
            match: 'exact',
            explain: 'C and F#. Press play and hear how it just hangs there, wanting to go somewhere.',
          },
        ],
      },

      {
        id: 'interval-ear',
        title: 'Hearing intervals',
        minutes: 6,
        summary: 'You can recognize octaves, 5ths, 4ths, 3rds, and the tritone by ear.',
        steps: [
          {
            type: 'learn',
            title: 'Train your ear',
            body: `
              <p>Recognizing intervals by ear is how producers figure out melodies without guessing row by row.</p>
              <p>Quick cues:</p>
              <p><strong>Octave:</strong> the same note, just higher.<br>
              <strong>Perfect 5th:</strong> hollow and strong.<br>
              <strong>Perfect 4th:</strong> open, a little "unfinished".<br>
              <strong>Major 3rd:</strong> sweet and bright.<br>
              <strong>Minor 3rd:</strong> soft and sad.<br>
              <strong>Tritone:</strong> spooky and unstable.</p>
              <p>Press play to hear all six, in the same order as the list. Each one plays the low note, the high note, then both together, and its name lights up above the group and below the roll as it plays.</p>
              <p>The drills that follow work the same way: two notes one after another, then together. Replay as many times as you like.</p>
            `,
            roll: {
              low: 'C4', high: 'C5',
              notes: [
                ['C4'],['C5'],['C4','C5'],[],
                ['C4'],['G4'],['C4','G4'],[],
                ['C4'],['F4'],['C4','F4'],[],
                ['C4'],['E4'],['C4','E4'],[],
                ['C4'],['Eb4'],['C4','Eb4'],[],
                ['C4'],['F#4'],['C4','F#4'],
              ],
              sections: [['Octave',4],['Perfect 5th',4],['Perfect 4th',4],['Major 3rd',4],['Minor 3rd',4],['Tritone',3]],
              stepDur: 0.5,
            },
          },
          {
            type: 'drill',
            prompt: 'Which interval did you hear?',
            drill: 'intervalEar',
            settings: { intervals: [12, 7, 4, 3] },
            pass: 5,
          },
          {
            type: 'drill',
            prompt: 'Level up: more options this time.',
            drill: 'intervalEar',
            settings: { intervals: [12, 7, 5, 4, 3, 6] },
            pass: 5,
          },
        ],
      },

      {
        id: 'consonance',
        title: 'Stable and tense sounds',
        minutes: 5,
        summary: 'You can tell stable intervals from tense ones, and you know which intervals muddy up your low end.',
        steps: [
          {
            type: 'learn',
            title: 'Consonance and dissonance',
            body: `
              <p>Some intervals sound <strong>stable</strong> and restful: octaves, 5ths, 4ths, 3rds and 6ths. Musicians call them consonant.</p>
              <p>Others sound <strong>tense</strong> and want to move: 2nds, 7ths, and the tritone. Those are dissonant.</p>
              <p>Tense isn't bad. Tension is what makes music move forward. A track with zero tension is a track that goes nowhere.</p>
            `,
            roll: { low: 'C4', high: 'G4', notes: [['C4','G4'],[],['C4','C#4'],[],['C4','E4'],[],['C4','F#4']], stepDur: 0.7, sections: [['Perfect 5th',2],['Minor 2nd',2],['Major 3rd',2],['Tritone',1]] },
          },
          {
            type: 'learn',
            title: 'Why your low end gets muddy',
            body: `
              <p>Low notes have long, slow waves. Stack two of them close together and they smear. Even a sweet 3rd sounds muddy down low.</p>
              <p>Listen: C2 with E2, then C2 with G2.</p>
              <p class="tip">Producer rule of thumb: below about C3, keep things to roots, octaves, and 5ths. Save the 3rds for higher up.</p>
            `,
            roll: { low: 'C2', high: 'G2', notes: [['C2','E2'],[],['C2','G2']], stepDur: 1, sections: [['C2 + E2 (3rd)',2],['C2 + G2 (5th)',1]] },
          },
          {
            type: 'drill',
            prompt: 'Does this interval sound stable or tense?',
            drill: 'consonance',
            pass: 5,
          },
          {
            type: 'quiz',
            prompt: 'Your bass holds C2. Which note stacked on top is least likely to sound muddy?',
            options: ['C#2', 'D#2', 'E2', 'G2'],
            answer: 3,
            explain: 'G2 is a perfect 5th above. Low 5ths and octaves stay clean. 2nds and 3rds turn to mud down there.',
          },
        ],
      },
    ],
  },

  /* ===========================================================================
     UNIT 4 — CHORDS
  =========================================================================== */
  {
    id: 'unit-4',
    title: 'Chords',
    blurb: 'Stacking notes into triads, 7ths, and smooth voicings.',
    recap: 'Build triads, 7ths, and inversions, and move between chords smoothly.',   // shown on the graduation page
    color: '#7fa8f5',
    modules: [

      {
        id: 'triads',
        title: 'Major and minor chords',
        minutes: 6,
        summary: 'You can build major and minor triads from any root note.',
        steps: [
          {
            type: 'learn',
            title: 'Three notes, one chord',
            body: `
              <p>A <strong>chord</strong> is three or more notes played together. The simplest kind is the <strong>triad</strong>: a root, a 3rd, and a 5th.</p>
              <p><strong>Major:</strong> root + 4 half steps + 3 more (C E G).<br>
              <strong>Minor:</strong> root + 3 half steps + 4 more (C Eb G).</p>
              <p>Only the middle note changes. That's the major 3rd vs. minor 3rd from Unit 3.</p>
            `,
            roll: { low: 'C4', high: 'G4', notes: [['C4','E4','G4'],[],['C4','Eb4','G4']], stepDur: 0.9, sections: [['C major',2],['C minor',1]] },
          },
          {
            type: 'learn',
            title: 'The skip-a-note trick',
            body: `
              <p>In any scale, you can build a chord by taking a note, <strong>skipping one</strong>, taking the next, skipping one, and taking the next.</p>
              <p>In C major: <strong>C</strong> d <strong>E</strong> f <strong>G</strong>. That gives you C major. In the piano roll, a triad on white keys looks like a little staircase with even gaps.</p>
            `,
            roll: { low: 'C4', high: 'C5', notes: [['C4'],['E4'],['G4'],['C4','E4','G4']], stepDur: 0.4, highlight: ['C','E','G'] },
          },
          {
            type: 'build',
            prompt: 'Build a <strong>C major</strong> triad in the one column.',
            hint: 'C, then up 4 half steps, then up 3 more.',
            roll: { low: 'C4', high: 'C5', steps: 1 },
            answer: [['C4','E4','G4']],
            match: 'pitchClass',
            explain: 'C E G. The most famous chord there is.',
          },
          {
            type: 'build',
            prompt: 'Build an <strong>A minor</strong> triad.',
            hint: 'A, then up 3 half steps (minor 3rd), then up 4 more.',
            roll: { low: 'A3', high: 'A4', steps: 1 },
            answer: [['A3','C4','E4']],
            match: 'pitchClass',
            explain: 'A C E. All white keys, same notes as the start of the A minor scale.',
          },
          {
            type: 'build',
            prompt: 'Build a <strong>D major</strong> triad. Careful, this one needs a black key.',
            hint: 'Major = up 4, then up 3. Four half steps above D is F#.',
            roll: { low: 'C4', high: 'C5', steps: 1 },
            answer: [['D4','F#4','A4']],
            match: 'pitchClass',
            explain: 'D F# A. With a plain F it would be D minor.',
          },
          {
            type: 'drill',
            prompt: 'Major or minor chord?',
            drill: 'chordQuality',
            settings: { qualities: ['maj', 'min'] },
            pass: 5,
          },
        ],
      },

      {
        id: 'diatonic',
        title: 'The chords in a key',
        minutes: 6,
        summary: 'You know the seven chords that belong to a key and the major/minor pattern they follow.',
        steps: [
          {
            type: 'learn',
            title: 'Seven chords for free',
            body: `
              <p>Use the skip-a-note trick on every note of a scale, and you get seven chords that all fit the key.</p>
              <p>In C major: <strong>C, Dm, Em, F, G, Am, Bdim</strong>.</p>
              <p>The pattern is the same in every major key:</p>
              <p class="formula">major, minor, minor, major, major, minor, diminished</p>
            `,
            roll: {
              low: 'C4', high: 'F5',
              notes: [['C4','E4','G4'],['D4','F4','A4'],['E4','G4','B4'],['F4','A4','C5'],['G4','B4','D5'],['A4','C5','E5'],['B4','D5','F5']],
              sections: [['C',1],['Dm',1],['Em',1],['F',1],['G',1],['Am',1],['Bdim',1]],
              stepDur: 0.6,
            },
          },
          {
            type: 'learn',
            title: 'The odd one out',
            body: `
              <p>The 7th chord of the key is <strong>diminished</strong>: two minor 3rds stacked (3 + 3 half steps). It sounds tense and unresolved.</p>
              <p>You'll hear it less in electronic music, but it's great as a quick passing chord to build suspense.</p>
            `,
            roll: { low: 'B3', high: 'F4', notes: [['B3','D4','F4']], stepDur: 1.2 },
          },
          {
            type: 'build',
            prompt: 'Build the chord that sits on the <strong>4th note of C major</strong>.',
            hint: 'The 4th note is F. Stack F, skip, A, skip, C.',
            roll: { low: 'C4', high: 'C5', steps: 1 },
            answer: [['F4','A4','C5']],
            match: 'pitchClass',
            explain: 'F major, the IV chord in C.',
          },
          {
            type: 'quiz',
            prompt: 'In C major, is the chord built on E major or minor?',
            options: ['Major', 'Minor', 'Diminished'],
            answer: 1,
            explain: 'The 3rd chord in any major key is minor: E G B.',
          },
          {
            type: 'build',
            prompt: 'In <strong>G major</strong>, build the chord on the 1st note in column 1, and the chord on the 6th note in column 2.',
            hint: 'G major = G A B C D E F#. The 1st note is G, the 6th is E. Skip-a-note from each.',
            roll: { low: 'D4', high: 'D5', steps: 2 },
            answer: [['G4','B4','D5'],['E4','G4','B4']],
            match: 'pitchClass',
            explain: 'G major and E minor. Chord 6 in a major key is always minor.',
          },
        ],
      },

      {
        id: 'numerals',
        title: 'Chord numbers',
        minutes: 5,
        summary: 'You can read Roman numeral chord names and use them in any key.',
        steps: [
          {
            type: 'learn',
            title: 'Why producers talk in numbers',
            body: `
              <p>Instead of chord names, musicians number chords by their spot in the key, using Roman numerals. That way a progression works in <strong>any key</strong>.</p>
              <p><strong>Uppercase</strong> = major. <strong>Lowercase</strong> = minor. <strong>°</strong> = diminished.</p>
              <p class="formula">I ii iii IV V vi vii°</p>
              <p>Here's I, IV, V in C major, then the exact same numbers in G major:</p>
            `,
            roll: {
              low: 'B3', high: 'D5',
              notes: [['C4','E4','G4'],['C4','F4','A4'],['B3','D4','G4'],[],['B3','D4','G4'],['C4','E4','G4'],['D4','F#4','A4']],
              sections: [['C major: I',1],['IV',1],['V',1],['',1],['G major: I',1],['IV',1],['V',1]],
              stepDur: 0.55,
            },
          },
          {
            type: 'learn',
            title: 'Numbers in minor keys',
            body: `
              <p>Natural minor keys follow their own pattern:</p>
              <p class="formula">i ii° III iv v VI VII</p>
              <p>In A minor: Am, Bdim, C, Dm, Em, F, G. Notice it's the same seven chords as C major, just numbered from A. Relative keys again.</p>
            `,
          },
          {
            type: 'quiz',
            prompt: 'In G major, which chord is the IV?',
            options: ['C major', 'D major', 'A minor', 'E minor'],
            answer: 0,
            explain: 'G major = G A B C D E F#. The 4th note is C, and IV is uppercase, so C major.',
          },
          {
            type: 'quiz',
            prompt: 'In A minor, which chord is the VI?',
            options: ['F minor', 'F major', 'G major', 'D minor'],
            answer: 1,
            explain: 'The 6th note of A minor is F, and VI is uppercase, so F major.',
          },
          {
            type: 'quiz',
            prompt: 'In F major, which chord is the vi?',
            options: ['D major', 'D minor', 'A minor', 'Bb major'],
            answer: 1,
            explain: 'F major = F G A Bb C D E. The 6th note is D, and vi is lowercase, so D minor.',
          },
        ],
      },

      {
        id: 'sevenths',
        title: 'Seventh chords',
        minutes: 6,
        summary: 'You can build major 7th, minor 7th, and dominant 7th chords, the lofi and house staples.',
        steps: [
          {
            type: 'learn',
            title: 'One more note',
            body: `
              <p>Stack one more 3rd on top of a triad and you get a <strong>7th chord</strong>. Four notes instead of three. This is the sound of lofi, deep house, and neo-soul.</p>
              <p><strong>Major 7th (maj7):</strong> dreamy, warm. C E G B<br>
              <strong>Minor 7th (m7):</strong> smooth, mellow. A C E G<br>
              <strong>Dominant 7th (7):</strong> bluesy, wants to move. G B D F</p>
            `,
            roll: { low: 'G3', high: 'B4', notes: [['C4','E4','G4','B4'],[],['A3','C4','E4','G4'],[],['G3','B3','D4','F4']], stepDur: 0.8, sections: [['Cmaj7',2],['Am7',2],['G7',1]] },
          },
          {
            type: 'learn',
            title: 'The ii–V–I',
            body: `
              <p>In a major key, the 7th chords come out as: Imaj7, ii7, iii7, IVmaj7, V7, vi7, and a half-diminished vii.</p>
              <p>The most famous move with them is <strong>ii–V–I</strong>: Dm7, G7, Cmaj7. It's all over jazz-influenced lofi.</p>
            `,
            roll: { low: 'C4', high: 'C5', notes: [['D4','F4','A4','C5'],['D4','F4','G4','B4'],['C4','E4','G4','B4']], stepDur: 0.9, sections: [['Dm7 (ii)',1],['G7 (V)',1],['Cmaj7 (I)',1]] },
          },
          {
            type: 'build',
            prompt: 'Build a <strong>Cmaj7</strong> chord.',
            hint: 'Start with C major (C E G), then add the note a major 3rd above G.',
            roll: { low: 'C4', high: 'C5', steps: 1 },
            answer: [['C4','E4','G4','B4']],
            match: 'pitchClass',
            explain: 'C E G B. Play it back. Instant lofi.',
          },
          {
            type: 'build',
            prompt: 'Build an <strong>Am7</strong> chord.',
            hint: 'A minor (A C E), plus the note a minor 3rd above E.',
            roll: { low: 'A3', high: 'A4', steps: 1 },
            answer: [['A3','C4','E4','G4']],
            match: 'pitchClass',
            explain: 'A C E G. Fun fact: it contains a full C major chord inside it.',
          },
          {
            type: 'drill',
            prompt: 'Which kind of 7th chord?',
            drill: 'chordQuality',
            settings: { qualities: ['maj7', 'm7', 'dom7'] },
            pass: 4,
          },
        ],
      },

      {
        id: 'inversions',
        title: 'Inversions and voice leading',
        minutes: 7,
        summary: 'You can rearrange chord notes to make progressions flow smoothly instead of jumping around.',
        steps: [
          {
            type: 'learn',
            title: 'Same notes, new order',
            body: `
              <p>An <strong>inversion</strong> is a chord with a different note on the bottom. It's still the same chord, just rearranged.</p>
              <p>Here's C major three ways: C on the bottom (root position), then E on the bottom (1st inversion), then G on the bottom (2nd inversion).</p>
            `,
            roll: { low: 'C4', high: 'E5', notes: [['C4','E4','G4'],['E4','G4','C5'],['G4','C5','E5']], stepDur: 0.8, sections: [['Root position',1],['1st inversion',1],['2nd inversion',1]] },
          },
          {
            type: 'learn',
            title: 'Blocky vs. smooth',
            body: `
              <p>Beginners often play every chord in root position, so the whole block jumps up and down. It sounds stiff.</p>
              <p><strong>Voice leading</strong> means moving each note the shortest distance to the next chord, keeping shared notes in place. Listen to C, F, G played blocky, then smooth:</p>
            `,
            roll: {
              low: 'B3', high: 'D5',
              notes: [['C4','E4','G4'],['F4','A4','C5'],['G4','B4','D5'],[],['C4','E4','G4'],['C4','F4','A4'],['B3','D4','G4']],
              sections: [['Blocky: C',1],['F',1],['G',1],['',1],['Smooth: C',1],['F',1],['G',1]],
              stepDur: 0.7,
            },
          },
          {
            type: 'build',
            prompt: 'C major is given. In column 2, play <strong>F major</strong> with smooth voice leading: keep C4 where it is and move the other notes as little as possible.',
            hint: 'F major = F A C. C4 stays. E moves up one row to F, and G moves up two rows to A.',
            roll: { low: 'A3', high: 'C5', steps: 2, given: [['C4','E4','G4'], []] },
            answer: [['C4','E4','G4'], ['C4','F4','A4']],
            match: 'exact',
            explain: 'That\'s a 2nd-inversion F chord. The top notes barely move, so the change sounds silky.',
          },
          {
            type: 'build',
            prompt: 'Same idea, new target. From C major, move to <strong>G major</strong> smoothly. G stays put.',
            hint: 'G major = G B D. G4 stays. C4 drops one row to B3, and E4 drops two rows to D4.',
            roll: { low: 'A3', high: 'C5', steps: 2, given: [['C4','E4','G4'], []] },
            answer: [['C4','E4','G4'], ['B3','D4','G4']],
            match: 'exact',
            explain: 'Each note moved a step or less. This is how good pad parts are written.',
          },
          {
            type: 'quiz',
            prompt: 'What is the lowest note of C major in 1st inversion?',
            options: ['C', 'E', 'G', 'B'],
            answer: 1,
            explain: '1st inversion puts the 3rd on the bottom, so E.',
          },
        ],
      },
    ],
  },

  /* ===========================================================================
     UNIT 5 — PROGRESSIONS & WRITING
  =========================================================================== */
  {
    id: 'unit-5',
    title: 'Writing parts',
    blurb: 'Chord loops, basslines, and melodies that fit together.',
    recap: 'Write chord loops, basslines, and melodies that lock together.',   // shown on the graduation page
    color: '#d9b877',
    modules: [

      {
        id: 'progressions',
        title: 'Chord progressions',
        minutes: 6,
        summary: 'You know the loops behind a huge amount of electronic music and can write them in any key.',
        steps: [
          {
            type: 'learn',
            title: 'The four-chord loop',
            body: `
              <p>A <strong>progression</strong> is a sequence of chords, usually looped. Four-chord loops drive a huge amount of electronic music.</p>
              <p>The most famous one is <strong>I–V–vi–IV</strong>. In C major: C, G, Am, F.</p>
            `,
            roll: {
              low: 'A3', high: 'G4',
              notes: [['C4','E4','G4'],['B3','D4','G4'],['A3','C4','E4'],['A3','C4','F4']],
              sections: [['C (I)',1],['G (V)',1],['Am (vi)',1],['F (IV)',1]],
              stepDur: 0.8,
              backing: [['C3'],['G2'],['A2'],['F2']],
            },
          },
          {
            type: 'learn',
            title: 'Minor loops',
            body: `
              <p>In minor keys, <strong>i–VI–III–VII</strong> is the big one: Am, F, C, G. It's the emotional loop behind countless trance, future bass, and melodic dubstep drops.</p>
              <p>Also worth trying: <strong>i–iv–v</strong> (dark and simple) and <strong>i–VII–VI–VII</strong> (epic and driving).</p>
            `,
            roll: {
              low: 'G3', high: 'F4',
              notes: [['A3','C4','E4'],['A3','C4','F4'],['G3','C4','E4'],['G3','B3','D4']],
              stepDur: 0.8,
              backing: [['A2'],['F2'],['C3'],['G2']],
              sections: [['Am (i)',1],['F (VI)',1],['C (III)',1],['G (VII)',1]],
            },
          },
          {
            type: 'build',
            prompt: 'Write <strong>vi–IV–I–V</strong> in C major, one chord per column. Any voicing works.',
            hint: 'In C major: vi = Am (A C E), IV = F (F A C), I = C (C E G), V = G (G B D).',
            roll: { low: 'A3', high: 'C5', steps: 4 },
            answer: [['A3','C4','E4'],['A3','C4','F4'],['C4','E4','G4'],['B3','D4','G4']],
            match: 'pitchClass',
            explain: 'Am, F, C, G. The same four chords as I–V–vi–IV, just starting in a different spot.',
          },
          {
            type: 'quiz',
            prompt: 'C–G–Am–F is I–V–vi–IV in C major. What is the same progression in G major?',
            options: ['G–D–Em–C', 'G–C–D–Em', 'G–D–Am–C', 'G–E–Am–D'],
            answer: 0,
            explain: 'In G major: I = G, V = D, vi = Em, IV = C. Same numbers, new key.',
          },
        ],
      },

      {
        id: 'basslines',
        title: 'Basslines from chords',
        minutes: 6,
        summary: 'You can write a bassline that locks to your chords using roots, octaves, and 5ths.',
        steps: [
          {
            type: 'learn',
            title: 'Start with the root',
            body: `
              <p>The simplest bassline that always works: play the <strong>root note</strong> of each chord, down low.</p>
              <p>Chords Am, F, C, G → bass A, F, C, G.</p>
            `,
            roll: {
              low: 'C2', high: 'C3',
              notes: [['A2'],['F2'],['C3'],['G2']],
              stepDur: 0.8,
              sections: [['Am',1],['F',1],['C',1],['G',1]],
              backing: [['A3','C4','E4'],['A3','C4','F4'],['G3','C4','E4'],['G3','B3','D4']],
            },
          },
          {
            type: 'learn',
            title: 'Add movement',
            body: `
              <p>Once the roots are locked in, add movement with safe notes: the <strong>octave</strong> above the root and the <strong>5th</strong>. They'll never clash with the chord.</p>
              <p>This pattern goes root, 5th, octave, 5th:</p>
              <p class="tip">Remember Unit 3: keep 3rds out of the deep bass. Roots, 5ths, and octaves stay clean.</p>
            `,
            roll: {
              low: 'C2', high: 'A3',
              notes: [['A2'],['E3'],['A3'],['E3'],['F2'],['C3'],['F3'],['C3']],
              stepDur: 0.3,
            },
          },
          {
            type: 'build',
            prompt: 'The chords are <strong>Am, F, C, G</strong>. Write the root of each chord in the bass, one per column.',
            hint: 'The root is the note the chord is named after.',
            roll: { low: 'C2', high: 'C3', steps: 4, mono: true, stepDur: 0.6,
                    backing: [['A3','C4','E4'],['A3','C4','F4'],['G3','C4','E4'],['G3','B3','D4']] },
            answer: [['A2'],['F2'],['C3'],['G2']],
            match: 'pitchClass',
            explain: 'Press play. The chords play underneath your bass, and everything locks together.',
          },
          {
            type: 'build',
            prompt: 'Write <strong>root then 5th</strong> for A: A2 in column 1, and the perfect 5th above it in column 2.',
            hint: 'A perfect 5th is 7 half steps up.',
            roll: { low: 'A2', high: 'A3', steps: 2, mono: true },
            answer: [['A2'],['E3']],
            match: 'exact',
            explain: 'A to E. Bounce between these two and you have a working bassline for any A chord.',
          },
        ],
      },

      {
        id: 'melodies',
        title: 'Writing melodies',
        minutes: 6,
        summary: 'You know how to use chord tones and passing notes to write melodies that fit your chords.',
        steps: [
          {
            type: 'learn',
            title: 'Chord tones are safe landings',
            body: `
              <p>The notes inside the chord that's playing are called <strong>chord tones</strong>. A melody note that matches the chord will always sound right.</p>
              <p>Other notes from the scale work too, as <strong>passing notes</strong> that move between chord tones. Here the chord is C major (C E G), and the melody goes E, D, C, landing on chord tones E and C with D passing through.</p>
            `,
            roll: {
              low: 'C4', high: 'C5',
              notes: [['E4'],['D4'],['C4'],[],['G4'],['F4'],['E4'],[]],
              stepDur: 0.4,
              backing: [['C3','E3','G3']],
            },
          },
          {
            type: 'learn',
            title: 'Three habits of catchy melodies',
            body: `
              <p><strong>Land on chord tones on strong beats.</strong> Put passing notes in between.</p>
              <p><strong>Mostly steps, some leaps.</strong> Moving to neighboring scale notes sounds natural. A bigger leap now and then adds energy.</p>
              <p><strong>Repeat, then change.</strong> Play an idea, repeat it, then change the ending. It's call and response, and it's how hooks get stuck in heads.</p>
            `,
          },
          {
            type: 'build',
            prompt: 'An F major chord plays underneath. Write a 4-note melody using <strong>only chord tones</strong>, one note per column.',
            hint: 'F major = F, A, C. Any octave, any order.',
            roll: { low: 'C4', high: 'C5', steps: 4, mono: true, stepDur: 0.45, backing: [['F3','A3','C4']] },
            answer: [['A4'],['F4'],['C5'],['A4']],
            match: 'allowed',
            allowed: ['F', 'A', 'C'],
            explain: 'Every note fits the chord, so it can\'t sound wrong. Now try adding passing notes in your DAW.',
          },
          {
            type: 'quiz',
            prompt: 'An A minor chord is playing. Which melody note is a chord tone?',
            options: ['D', 'E', 'F', 'B'],
            answer: 1,
            explain: 'A minor = A C E, so E is a chord tone. The others would work as passing notes.',
          },
        ],
      },
    ],
  },

  /* ===========================================================================
     UNIT 6 — GOING FURTHER
  =========================================================================== */
  {
    id: 'unit-6',
    title: 'Going further',
    blurb: 'Modes, lush chords, borrowed color, and tension before the drop.',
    recap: 'Color a track with modes, sus and 9th chords, borrowed chords, and tension before the drop.',   // shown on the graduation page
    color: '#f0e3a6',
    modules: [

      {
        id: 'modes',
        title: 'Modes for producers',
        minutes: 7,
        summary: 'You know four modes and the mood each one gives a track.',
        steps: [
          {
            type: 'learn',
            title: 'Scales with a twist',
            body: `
              <p><strong>Modes</strong> are scales that are one note away from plain major or minor. That one note changes the mood.</p>
              <p><strong>Dorian</strong> is minor with a raised 6th. Funky and soulful: deep house, lofi.<br>
              <strong>Phrygian</strong> is minor with a lowered 2nd. Dark and menacing: techno, dubstep, trap.<br>
              <strong>Lydian</strong> is major with a raised 4th. Dreamy and floating: ambient, cinematic.<br>
              <strong>Mixolydian</strong> is major with a lowered 7th. Bluesy and bright: house, funk.</p>
            `,
          },
          {
            type: 'learn',
            title: 'Hear the one-note difference',
            body: `
              <p>First D natural minor, then D Dorian. Only the 6th note changes, Bb to B, and the mood gets lighter and groovier.</p>
            `,
            roll: {
              low: 'D4', high: 'D5',
              notes: [['D4'],['E4'],['F4'],['G4'],['A4'],['Bb4'],['C5'],['D5'],[],['D4'],['E4'],['F4'],['G4'],['A4'],['B4'],['C5'],['D5']],
              sections: [['D natural minor',9],['D Dorian',8]],
              stepDur: 0.24,
            },
          },
          {
            type: 'build',
            prompt: 'Build <strong>D Dorian</strong> from D4 to D5. Hint: it\'s all white keys.',
            reminder: 'whole, half, whole, whole, whole, half, whole (natural minor with a raised 6th)',
            hint: 'Start on D and use only white keys: D E F G A B C D.',
            roll: { low: 'C4', high: 'D5', steps: 8, mono: true },
            answer: [['D4'],['E4'],['F4'],['G4'],['A4'],['B4'],['C5'],['D5']],
            match: 'pitchClass',
            explain: 'Every white-key scale is a mode. Starting on D gives you Dorian.',
          },
          {
            type: 'build',
            prompt: 'Build <strong>E Phrygian</strong> from E4 to E5. Also all white keys.',
            reminder: 'half, whole, whole, whole, half, whole, whole (natural minor with a lowered 2nd)',
            hint: 'E F G A B C D E. That half step from E to F is the dark Phrygian flavor.',
            roll: { low: 'E4', high: 'E5', steps: 8, mono: true },
            answer: [['E4'],['F4'],['G4'],['A4'],['B4'],['C5'],['D5'],['E5']],
            match: 'pitchClass',
            explain: 'That lowered 2nd right above the root is the signature of dark techno and dubstep riffs.',
          },
          {
            type: 'quiz',
            prompt: 'Which mode best suits a dreamy, floating ambient pad?',
            options: ['Phrygian', 'Lydian', 'Dorian', 'Natural minor'],
            answer: 1,
            explain: 'Lydian\'s raised 4th gives major a weightless, starry feel.',
          },
        ],
      },

      {
        id: 'extended',
        title: 'Sus and extended chords',
        minutes: 6,
        summary: 'You can build sus2, sus4, and 9th chords for open, lush harmony.',
        steps: [
          {
            type: 'learn',
            title: 'Sus chords',
            body: `
              <p>Take out the 3rd of a chord and replace it with the 2nd or 4th. You get a <strong>sus</strong> (suspended) chord. With no 3rd, it's neither major nor minor. It's open and floaty.</p>
              <p><strong>Sus2:</strong> root, 2nd, 5th (C D G)<br>
              <strong>Sus4:</strong> root, 4th, 5th (C F G)</p>
              <p>Future bass and melodic dubstep use these constantly. Listen: Csus2, Csus4, then C major.</p>
            `,
            roll: { low: 'C4', high: 'G4', notes: [['C4','D4','G4'],[],['C4','F4','G4'],[],['C4','E4','G4']], stepDur: 0.8, sections: [['Csus2',2],['Csus4',2],['C major',1]] },
          },
          {
            type: 'learn',
            title: '9th chords',
            body: `
              <p>Keep stacking 3rds past the 7th and you reach the <strong>9th</strong>: the 2nd, an octave up. <strong>Maj9</strong> and <strong>m9</strong> chords are lush and wide, perfect for pads.</p>
              <p class="tip">Too muddy? Drop the 5th. It adds the least color, so you won't miss it.</p>
            `,
            roll: { low: 'A3', high: 'D5', notes: [['C4','E4','G4','B4','D5'],[],['A3','C4','E4','G4','B4']], stepDur: 1.1, sections: [['Cmaj9',2],['Am9',1]] },
          },
          {
            type: 'build',
            prompt: 'Build <strong>Csus4</strong>.',
            hint: 'Root, 4th, 5th. From C: 5 half steps up, then 2 more.',
            roll: { low: 'C4', high: 'C5', steps: 1 },
            answer: [['C4','F4','G4']],
            match: 'pitchClass',
            explain: 'C F G. Try resolving it to C major. That sus-to-major move is a classic.',
          },
          {
            type: 'build',
            prompt: 'Build <strong>Am9</strong>: A minor 7th plus the 9th.',
            hint: 'Am7 is A C E G. The 9th is B (the 2nd, an octave up).',
            roll: { low: 'A3', high: 'B4', steps: 1 },
            answer: [['A3','C4','E4','G4','B4']],
            match: 'pitchClass',
            explain: 'A C E G B. Five notes, very lofi.',
          },
          {
            type: 'drill',
            prompt: 'Name the chord type.',
            drill: 'chordQuality',
            settings: { qualities: ['maj', 'min', 'sus2', 'sus4'] },
            pass: 4,
          },
        ],
      },

      {
        id: 'borrowed',
        title: 'Borrowed chords',
        minutes: 5,
        summary: 'You can borrow chords from the parallel minor to add emotional color to a major-key track.',
        steps: [
          {
            type: 'learn',
            title: 'Stealing from minor',
            body: `
              <p>You're in C major, but you can <strong>borrow</strong> chords from C minor (same root, other scale). It instantly adds emotion.</p>
              <p>The favorite: turn the IV chord minor. F becomes Fm. Listen to C, Am, F, then Fm, that bittersweet moment at the end.</p>
            `,
            roll: {
              low: 'C4', high: 'A4',
              notes: [['C4','E4','G4'],['C4','E4','A4'],['C4','F4','A4'],['C4','F4','Ab4']],
              sections: [['C',1],['Am',1],['F',1],['Fm',1]],
              stepDur: 0.9,
              backing: [['C3'],['A2'],['F2'],['F2']],
            },
          },
          {
            type: 'learn',
            title: 'Other borrowed chords',
            body: `
              <p>From C minor you can also borrow <strong>Ab major</strong> (bVI) and <strong>Bb major</strong> (bVII). The "b" means the root is a half step lower than in the major key.</p>
              <p>C, Ab, Bb, C is a huge, cinematic move. You'll hear it in big-room and synthwave.</p>
            `,
            roll: {
              low: 'C4', high: 'Bb4',
              notes: [['C4','E4','G4'],['C4','Eb4','Ab4'],['D4','F4','Bb4'],['C4','E4','G4']],
              sections: [['C',1],['Ab (bVI)',1],['Bb (bVII)',1],['C',1]],
              stepDur: 0.8,
              backing: [['C3'],['Ab2'],['Bb2'],['C3']],
            },
          },
          {
            type: 'build',
            prompt: 'Write <strong>C, F, Fm, C</strong>, one chord per column.',
            hint: 'F major = F A C. F minor = F Ab C. Only one note changes.',
            roll: { low: 'C4', high: 'C5', steps: 4 },
            answer: [['C4','E4','G4'],['C4','F4','A4'],['C4','F4','Ab4'],['C4','E4','G4']],
            match: 'pitchClass',
            explain: 'That A to Ab drop is one of the most emotional moves in pop and electronic music.',
          },
          {
            type: 'quiz',
            prompt: 'In C major, which of these is a borrowed chord?',
            options: ['D minor', 'G major', 'Ab major', 'E minor'],
            answer: 2,
            explain: 'Ab isn\'t in C major. It comes from C minor.',
          },
        ],
      },

      {
        id: 'tension',
        title: 'Tension and release',
        minutes: 6,
        summary: 'You understand how the V chord pulls to I, and how to use that pull for resolutions and drops.',
        steps: [
          {
            type: 'learn',
            title: 'The strongest pull in music',
            body: `
              <p>The <strong>V chord</strong> (especially V7) wants to resolve to <strong>I</strong>. Musicians call V the dominant.</p>
              <p>Why? The V chord contains the 7th note of the scale, the <strong>leading tone</strong>, which sits a half step below home and wants to step up into it. In C major, that's B pulling to C.</p>
              <p>G7 also contains F, and B and F are a <strong>tritone</strong> apart, the unstable interval from Unit 3. B steps up to C, F steps down to E, and the tension collapses into a C chord.</p>
            `,
            roll: { low: 'G3', high: 'F4', notes: [['G3','B3','D4','F4'],['G3','C4','E4']], stepDur: 1.1, backing: [['G2'],['C3']], sections: [['G7 (V7)',1],['C (I)',1]] },
          },
          {
            type: 'learn',
            title: 'Borrowing tension in minor',
            body: `
              <p>In natural minor, the v chord is minor and its pull is weak. Producers often make it <strong>major</strong> instead. In A minor, Em becomes E major, which adds G#, a leading tone into A.</p>
              <p>Listen: Am, Dm, E, Am.</p>
              <p class="tip">Before a drop, sitting on the V chord (or holding its root in the bass) builds anticipation, and the drop landing on i or I releases it.</p>
            `,
            roll: {
              low: 'G3', high: 'F4',
              notes: [['A3','C4','E4'],['A3','D4','F4'],['G#3','B3','E4'],['A3','C4','E4']],
              sections: [['Am (i)',1],['Dm (iv)',1],['E (V)',1],['Am (i)',1]],
              stepDur: 0.8,
              backing: [['A2'],['D2'],['E2'],['A2']],
            },
          },
          {
            type: 'build',
            prompt: 'G7 (the V7 in C major) is given. <strong>Resolve it</strong>: put a C major chord in column 2.',
            hint: 'C E G. For a smooth move, B steps up to C and F steps down to E.',
            roll: { low: 'G3', high: 'C5', steps: 2, given: [['G3','B3','D4','F4'], []], backing: [['G2'],['C3']] },
            answer: [['G3','B3','D4','F4'], ['G3','C4','E4']],
            match: 'pitchClass',
            explain: 'Hear that sense of arriving home? That\'s release.',
          },
          {
            type: 'quiz',
            prompt: 'In A minor, which chord gives the strongest pull back to Am?',
            options: ['E minor', 'E major', 'G major', 'D minor'],
            answer: 1,
            explain: 'E major contains G#, the leading tone a half step below A.',
          },
        ],
      },
    ],
  },
];


/* =============================================================================
   EXTRAS — graduation page, capstone project, genre recipes, cheat sheet, gym
   =============================================================================
   Everything shown AFTER (or alongside) the course lives here.
   Same note/roll format as the lessons above. Module links use module ids
   (e.g. 'minor-scale'), which LTVLearn.check() verifies for you.
============================================================================= */

const LEARN_EXTRAS = {

  /* ---------------------------------------------------------------------------
     GRADUATION — the Discord role flow. Create the channel + role in Discord,
     then make sure these names match.
  --------------------------------------------------------------------------- */
  graduation: {
    discordInvite: 'https://discord.gg/AFdeZHfDZN',
    channel: '#theory-lab',
    role: 'Theory Lab Grad',
    shareMessage: 'I just finished all 22 modules of the LTV Theory Lab 🎓🎹 From reading a piano roll to borrowed chords and tension before the drop. Free for any producer:',
  },


  /* ---------------------------------------------------------------------------
     CAPSTONE — "Your first theory-first track". Done in the learner's own DAW.
     Every example follows one track in A minor so each step builds on the last.
       tasks:   checkboxes (saved in the browser). Each needs a unique id.
       modules: "Refresh" links back to the lessons.
  --------------------------------------------------------------------------- */
  capstone: {
    title: 'Your first theory-first track',
    intro: 'Open your DAW and build one loop-based track, step by step, using everything from the course. The examples all follow one track in A minor, so you can hear it come together. Check things off as you go. Your checkmarks save in this browser.',
    steps: [
      {
        title: 'Pick a key that matches the mood',
        body: `
          <p>Decide how the track should feel before you touch a note. Bright and uplifting points to <strong>major</strong>. Dark, moody, or emotional points to <strong>minor</strong>. Groovy and soulful? Try <strong>Dorian</strong>. Menacing? <strong>Phrygian</strong>.</p>
          <p>Then pick a root note and turn on your DAW's scale highlight so the in-key rows are shaded. The example uses A minor.</p>
        `,
        roll: {
          low: 'A3', high: 'A4',
          notes: [['A3'],['B3'],['C4'],['D4'],['E4'],['F4'],['G4'],['A4']],
          highlight: ['A','B','C','D','E','F','G'],
          stepDur: 0.28,
        },
        tasks: [
          { id: 'key-mood',  text: 'Choose major or minor (or a mode) based on the mood you want' },
          { id: 'key-root',  text: 'Pick a root note and write the key down somewhere you\'ll see it' },
          { id: 'key-daw',   text: 'Turn on scale highlighting in your piano roll' },
        ],
        modules: ['major-scale', 'minor-scale', 'keys', 'modes'],
      },
      {
        title: 'Write a 4-chord loop',
        body: `
          <p>Pick a progression by its numbers, then translate it into your key. Some safe starting points:</p>
          <p class="formula">I–V–vi–IV &nbsp; vi–IV–I–V &nbsp; i–VI–III–VII &nbsp; i–iv–v</p>
          <p>Give each chord one or two bars and loop it. The example is i–VI–III–VII in A minor: Am, F, C, G.</p>
        `,
        roll: {
          low: 'F3', high: 'G4',
          notes: [['A3','C4','E4'],['F3','A3','C4'],['C4','E4','G4'],['G3','B3','D4']],
          sections: [['Am (i)',1],['F (VI)',1],['C (III)',1],['G (VII)',1]],
          backing: [['A2'],['F2'],['C3'],['G2']],
          stepDur: 0.8,
        },
        tasks: [
          { id: 'loop-pick',   text: 'Pick a progression and write out its chord names in your key' },
          { id: 'loop-write',  text: 'Program the chords, one or two bars each' },
          { id: 'loop-listen', text: 'Loop it and make sure it feels like the mood you picked' },
        ],
        modules: ['diatonic', 'numerals', 'progressions'],
      },
      {
        title: 'Make the chords feel good',
        body: `
          <p>Root-position chords jumping up and down sound stiff. Rearrange each chord so its notes move as little as possible to the next one. Keep shared notes in place.</p>
          <p>Then add flavor: turn one or two chords into 7ths, or try a sus chord. The example voice-leads the loop and adds 7ths: Am7, Fmaj7, Cmaj7, G.</p>
        `,
        roll: {
          low: 'G3', high: 'G4',
          notes: [['A3','C4','E4','G4'],['A3','C4','E4','F4'],['G3','B3','C4','E4'],['G3','B3','D4']],
          sections: [['Am7',1],['Fmaj7',1],['Cmaj7',1],['G',1]],
          backing: [['A2'],['F2'],['C3'],['G2']],
          stepDur: 0.9,
        },
        tasks: [
          { id: 'voice-lead',  text: 'Re-voice the chords so each note moves a step or less' },
          { id: 'voice-color', text: 'Turn at least one chord into a 7th, 9th, or sus chord' },
        ],
        modules: ['inversions', 'sevenths', 'extended'],
      },
      {
        title: 'Lock in a bassline',
        body: `
          <p>Start with the root of each chord, down low. Once that works, add movement with the octave and the 5th. They never clash with the chord.</p>
          <p>Keep 3rds out of the deep bass, and check that the bass and kick aren't fighting. The example bounces root to 5th under each chord.</p>
        `,
        roll: {
          low: 'F2', high: 'G3',
          notes: [['A2'],['E3'],['F2'],['C3'],['C3'],['G3'],['G2'],['D3']],
          sections: [['Am7',2],['Fmaj7',2],['Cmaj7',2],['G',2]],
          backing: [['A3','C4','E4','G4'],['A3','C4','E4','G4'],['A3','C4','E4','F4'],['A3','C4','E4','F4'],['G3','B3','C4','E4'],['G3','B3','C4','E4'],['G3','B3','D4'],['G3','B3','D4']],
          stepDur: 0.42,
        },
        tasks: [
          { id: 'bass-roots', text: 'Program the root note of every chord in the bass' },
          { id: 'bass-move',  text: 'Add movement with octaves and 5ths' },
          { id: 'bass-clean', text: 'Check the low end: no 3rds below about C3' },
        ],
        modules: ['basslines', 'consonance'],
      },
      {
        title: 'Write the hook',
        body: `
          <p>Land on chord tones on the strong beats, and use scale notes to move between them. Mostly steps, with the odd leap for energy.</p>
          <p>Write a short idea, repeat it, then change the ending. The example lands on a chord tone at the start of every chord.</p>
        `,
        roll: {
          low: 'A4', high: 'G5',
          notes: [['E5'],['D5'],['C5'],['A4'],['E5'],['G5'],['D5'],['B4']],
          sections: [['Am7',2],['Fmaj7',2],['Cmaj7',2],['G',2]],
          backing: [['A2','A3','C4','E4','G4'],['A2','A3','C4','E4','G4'],['F2','A3','C4','E4','F4'],['F2','A3','C4','E4','F4'],['C3','G3','B3','C4','E4'],['C3','G3','B3','C4','E4'],['G2','G3','B3','D4'],['G2','G3','B3','D4']],
          stepDur: 0.42,
        },
        tasks: [
          { id: 'hook-tones',  text: 'Write a melody that lands on chord tones on the strong beats' },
          { id: 'hook-repeat', text: 'Repeat the idea, then change the ending (call and response)' },
        ],
        modules: ['melodies', 'modes'],
      },
      {
        title: 'Add one color move',
        body: `
          <p>Pick one move that makes the loop yours. Some options:</p>
          <p>A <strong>sus chord</strong> that resolves. A <strong>borrowed chord</strong>, like iv in a major key or bVI–bVII. One <strong>mode note</strong>, like Dorian's raised 6th.</p>
          <p>Just one. The example suspends the last chord (Gsus4) before it resolves to G.</p>
        `,
        roll: {
          low: 'G3', high: 'F4',
          notes: [['A3','C4','E4'],['A3','C4','F4'],['G3','C4','E4'],['G3','C4','D4'],['G3','B3','D4']],
          sections: [['Am',1],['F',1],['C',1],['Gsus4',1],['G',1]],
          backing: [['A2'],['F2'],['C3'],['G2'],['G2']],
          stepDur: 0.75,
        },
        tasks: [
          { id: 'color-try',  text: 'Try at least two color moves on your loop' },
          { id: 'color-keep', text: 'Keep the one that fits the mood best' },
        ],
        modules: ['extended', 'borrowed', 'modes'],
      },
      {
        title: 'Build tension into the drop',
        body: `
          <p>Before your drop or main section, set up a pull. Land on the <strong>V chord</strong>, or hold its root in the bass under a riser. Then land the drop on <strong>i</strong> or <strong>I</strong>.</p>
          <p>In minor keys, make the V <strong>major</strong> for a stronger pull. The example builds F, G, E, and the drop lands on Am.</p>
        `,
        roll: {
          low: 'G3', high: 'F4',
          notes: [['A3','C4','F4'],['G3','B3','D4'],['G#3','B3','E4'],['A3','C4','E4']],
          sections: [['F (VI)',1],['G (VII)',1],['E (V)',1],['Am: drop',1]],
          backing: [['F2'],['G2'],['E2'],['A2']],
          stepDur: 0.85,
        },
        tasks: [
          { id: 'drop-build',   text: 'End the section before your drop on the V chord' },
          { id: 'drop-resolve', text: 'Land the drop on i or I' },
        ],
        modules: ['tension'],
      },
      {
        title: 'Finish it and share it',
        body: `
          <p>Arrange the loop into a full track, bounce it, and get ears on it. Post it in the Discord for feedback, and enter it in the monthly beat challenge or submit it for a community playlist.</p>
          <p>A finished track teaches you more than ten perfect loops.</p>
        `,
        tasks: [
          { id: 'share-arrange', text: 'Arrange the loop into a full track and bounce it' },
          { id: 'share-post',    text: 'Post it in the Discord for feedback' },
          { id: 'share-submit',  text: 'Enter it in a beat challenge or submit it to a playlist' },
        ],
        modules: [],
      },
    ],
  },


  /* ---------------------------------------------------------------------------
     GENRE RECIPES — how the course maps onto styles LTV producers make.
  --------------------------------------------------------------------------- */
  recipes: [
    {
      id: 'lofi',
      name: 'Lofi hip hop',
      tagline: 'Warm, jazzy, a little sleepy.',
      tempo: '70–90 BPM',
      keys: 'Major keys with 7th chords, or Dorian',
      body: `
        <p>Lofi lives on <strong>7th and 9th chords</strong>. Plain triads sound too clean here. The ii–V–I (Dm7, G7, Cmaj7) is everywhere, and so is this slow walk down the scale: IVmaj7, iii7, ii7, Imaj7.</p>
        <p>Keep voicings close together, let chords ring, and use Dorian when you want a minor key that still feels warm instead of sad.</p>
      `,
      roll: {
        low: 'C3', high: 'E4',
        notes: [['F3','A3','C4','E4'],['E3','G3','B3','D4'],['D3','F3','A3','C4'],['C3','E3','G3','B3']],
        sections: [['Fmaj7 (IV)',1],['Em7 (iii)',1],['Dm7 (ii)',1],['Cmaj7 (I)',1]],
        backing: [['F2'],['E2'],['D2'],['C2']],
        stepDur: 1.0,
      },
      modules: ['sevenths', 'numerals', 'modes'],
    },
    {
      id: 'deep-house',
      name: 'Deep house',
      tagline: 'Smooth minor 7th stabs and a rolling groove.',
      tempo: '118–124 BPM',
      keys: 'Minor keys, often Dorian',
      body: `
        <p>Deep house loves <strong>minor 7th chords</strong> as short stabs or long pads, often just two chords back and forth. Dorian's raised 6th gives the classic move from i to a <strong>major IV</strong> chord.</p>
        <p>In A Dorian, that's Am7 to D. Dropping the D from the D chord gives a smooth "rootless" D9 that sits right next to the Am7 under your fingers.</p>
      `,
      roll: {
        low: 'A3', high: 'G4',
        notes: [['A3','C4','E4','G4'],['A3','C4','E4','F#4'],['A3','C4','E4','G4'],['A3','C4','E4','F#4']],
        sections: [['Am7',1],['D9',1],['Am7',1],['D9',1]],
        backing: [['A2'],['D2'],['A2'],['D2']],
        stepDur: 0.8,
      },
      modules: ['sevenths', 'modes', 'inversions'],
    },
    {
      id: 'future-bass',
      name: 'Future bass',
      tagline: 'Big, emotional, supersaw chords.',
      tempo: '130–160 BPM (often felt at half time)',
      keys: 'Major or minor, lots of 7ths, 9ths, and sus chords',
      body: `
        <p>Future bass is all about <strong>lush, wide chords</strong>. Stack 7ths and 9ths, use sus chords that resolve, and voice chords big and open for the drop.</p>
        <p>A favorite loop is IVmaj7, V, iii7, vi, sometimes called the "royal road" progression. In C major that's Fmaj7, G, Em7, Am. The minor loop i–VI–III–VII from Unit 5 works great here too.</p>
      `,
      roll: {
        low: 'E3', high: 'E4',
        notes: [['F3','A3','C4','E4'],['G3','B3','D4'],['E3','G3','B3','D4'],['A3','C4','E4']],
        sections: [['Fmaj7 (IV)',1],['G (V)',1],['Em7 (iii)',1],['Am (vi)',1]],
        backing: [['F2'],['G2'],['E2'],['A2']],
        stepDur: 0.8,
      },
      modules: ['extended', 'progressions', 'sevenths'],
    },
    {
      id: 'techno',
      name: 'Techno',
      tagline: 'Dark, hypnotic, barely any chords.',
      tempo: '125–140 BPM',
      keys: 'Minor, Phrygian, often one note or one chord',
      body: `
        <p>Techno often skips chord progressions entirely. Harmony comes from a <strong>single riff</strong> or one repeated stab. <strong>Phrygian</strong> is the go-to: that lowered 2nd right above the root sounds instantly menacing.</p>
        <p>Tritones make great stab chords for tension. Keep the bass on the root and let rhythm and sound design do the rest.</p>
      `,
      roll: {
        low: 'A2', high: 'C3',
        notes: [['A2'],['A2'],['Bb2'],['A2'],['C3'],['A2'],['Bb2'],['A2']],
        sections: [['A Phrygian bass riff',8]],
        stepDur: 0.2,
      },
      modules: ['modes', 'interval-ear', 'consonance'],
    },
    {
      id: 'synthwave',
      name: 'Synthwave',
      tagline: 'Neon, nostalgic, 80s drive.',
      tempo: '80–118 BPM',
      keys: 'Mostly minor, with borrowed chords',
      body: `
        <p>Synthwave loves the climb <strong>VI–VII–i</strong> in minor (F, G, Am in A minor). It sounds like a sunrise over a highway. In major keys, reach for the borrowed <strong>bVI–bVII–I</strong> (Ab, Bb, C in C major) for that cinematic lift.</p>
        <p>Arpeggiate the chords with a fast synth and double the bass in octaves.</p>
      `,
      roll: {
        low: 'F3', high: 'E4',
        notes: [['F3','A3','C4'],['G3','B3','D4'],['A3','C4','E4'],['A3','C4','E4']],
        sections: [['F (VI)',1],['G (VII)',1],['Am (i)',2]],
        backing: [['F2'],['G2'],['A2'],['A2']],
        stepDur: 0.8,
      },
      modules: ['borrowed', 'progressions', 'numerals'],
    },
    {
      id: 'liquid-dnb',
      name: 'Liquid drum & bass',
      tagline: 'Fast drums under slow, beautiful chords.',
      tempo: '170–175 BPM',
      keys: 'Minor keys with 9th chords',
      body: `
        <p>Liquid DnB pairs rolling breaks with <strong>slow-moving, lush chords</strong>, usually one per bar or two. Minor 9th and major 9th chords are the signature.</p>
        <p>Leave the root out of the pad and let the bass play it. The pad stays light and the low end stays clean. The example plays Am9, Fmaj9, Dm9, Em7 that way.</p>
      `,
      roll: {
        low: 'G3', high: 'B4',
        notes: [['C4','E4','G4','B4'],['A3','C4','E4','G4'],['A3','C4','E4','F4'],['G3','B3','D4','E4']],
        sections: [['Am9',1],['Fmaj9',1],['Dm9',1],['Em7',1]],
        backing: [['A2'],['F2'],['D2'],['E2']],
        stepDur: 1.0,
      },
      modules: ['extended', 'sevenths', 'basslines'],
    },
  ],


  /* ---------------------------------------------------------------------------
     PRACTICE GYM — endless versions of the course drills.
  --------------------------------------------------------------------------- */
  gym: [
    { id: 'notes-white',    name: 'Note names: white keys', drill: 'noteName',    settings: { accidentals: false }, prompt: 'Name the highlighted note.' },
    { id: 'notes-all',      name: 'Note names: all keys',   drill: 'noteName',    settings: { accidentals: true },  prompt: 'Name the highlighted note.' },
    { id: 'intervals-core', name: 'Intervals: the big four', drill: 'intervalEar', settings: { intervals: [12, 7, 4, 3] }, prompt: 'Which interval did you hear?' },
    { id: 'intervals-more', name: 'Intervals: six common',  drill: 'intervalEar', settings: { intervals: [12, 7, 5, 4, 3, 6] }, prompt: 'Which interval did you hear?' },
    { id: 'intervals-all',  name: 'Intervals: all twelve',  drill: 'intervalEar', settings: { intervals: [1,2,3,4,5,6,7,8,9,10,11,12] }, prompt: 'Which interval did you hear?' },
    { id: 'consonance',     name: 'Stable or tense',        drill: 'consonance',  prompt: 'Does this interval sound stable or tense?' },
    { id: 'triads',         name: 'Chords: triads',         drill: 'chordQuality', settings: { qualities: ['maj','min','dim'] }, prompt: 'Name the chord type.' },
    { id: 'sevenths',       name: 'Chords: 7ths',           drill: 'chordQuality', settings: { qualities: ['maj7','m7','dom7'] }, prompt: 'Name the chord type.' },
    { id: 'colors',         name: 'Chords: sus and 9ths',   drill: 'chordQuality', settings: { qualities: ['sus2','sus4','maj9','m9'] }, prompt: 'Name the chord type.' },
    { id: 'scales',         name: 'Major or minor scale',   drill: 'scaleQuality', prompt: 'Major or minor?' },
    { id: 'in-key',         name: 'In key or out',          drill: 'inKey', settings: { keys: ['C major','G major','D major','F major','A minor','E minor','D minor','G minor'] }, prompt: 'Is the highlighted note in the key shown?' },
  ],


  /* ---------------------------------------------------------------------------
     CHEAT SHEET — plain HTML. Prints cleanly on one or two pages.
  --------------------------------------------------------------------------- */
  cheatsheet: `
    <section class="cs-block">
      <h2>Scale recipes</h2>
      <p class="cs-note">W = whole step (2 rows), H = half step (1 row).</p>
      <table>
        <tr><th>Scale</th><th>Steps</th><th>Sound</th></tr>
        <tr><td>Major</td><td class="mono">W W H W W W H</td><td>Bright, uplifting</td></tr>
        <tr><td>Natural minor</td><td class="mono">W H W W H W W</td><td>Dark, emotional</td></tr>
        <tr><td>Dorian</td><td class="mono">W H W W W H W</td><td>Minor with a raised 6th. Soulful</td></tr>
        <tr><td>Phrygian</td><td class="mono">H W W W H W W</td><td>Minor with a lowered 2nd. Menacing</td></tr>
        <tr><td>Lydian</td><td class="mono">W W W H W W H</td><td>Major with a raised 4th. Dreamy</td></tr>
        <tr><td>Mixolydian</td><td class="mono">W W H W W H W</td><td>Major with a lowered 7th. Bluesy</td></tr>
      </table>
    </section>

    <section class="cs-block">
      <h2>Intervals</h2>
      <table>
        <tr><th>Half steps</th><th>Interval</th><th>Half steps</th><th>Interval</th></tr>
        <tr><td class="mono">1</td><td>Minor 2nd</td><td class="mono">7</td><td>Perfect 5th</td></tr>
        <tr><td class="mono">2</td><td>Major 2nd</td><td class="mono">8</td><td>Minor 6th</td></tr>
        <tr><td class="mono">3</td><td>Minor 3rd</td><td class="mono">9</td><td>Major 6th</td></tr>
        <tr><td class="mono">4</td><td>Major 3rd</td><td class="mono">10</td><td>Minor 7th</td></tr>
        <tr><td class="mono">5</td><td>Perfect 4th</td><td class="mono">11</td><td>Major 7th</td></tr>
        <tr><td class="mono">6</td><td>Tritone</td><td class="mono">12</td><td>Octave</td></tr>
      </table>
    </section>

    <section class="cs-block">
      <h2>Chord recipes</h2>
      <p class="cs-note">Half steps above the root.</p>
      <table>
        <tr><th>Chord</th><th>Recipe</th><th>In C</th></tr>
        <tr><td>Major</td><td class="mono">0 4 7</td><td>C E G</td></tr>
        <tr><td>Minor</td><td class="mono">0 3 7</td><td>C Eb G</td></tr>
        <tr><td>Diminished</td><td class="mono">0 3 6</td><td>C Eb Gb</td></tr>
        <tr><td>Sus2 / Sus4</td><td class="mono">0 2 7 / 0 5 7</td><td>C D G / C F G</td></tr>
        <tr><td>Major 7th</td><td class="mono">0 4 7 11</td><td>C E G B</td></tr>
        <tr><td>Minor 7th</td><td class="mono">0 3 7 10</td><td>C Eb G Bb</td></tr>
        <tr><td>Dominant 7th</td><td class="mono">0 4 7 10</td><td>C E G Bb</td></tr>
        <tr><td>Major 9th / Minor 9th</td><td class="mono">+ 14</td><td>Add the 2nd, an octave up</td></tr>
      </table>
    </section>

    <section class="cs-block">
      <h2>Chords in a key</h2>
      <table>
        <tr><th>Major key</th><td class="mono">I &nbsp; ii &nbsp; iii &nbsp; IV &nbsp; V &nbsp; vi &nbsp; vii°</td></tr>
        <tr><th>Minor key</th><td class="mono">i &nbsp; ii° &nbsp; III &nbsp; iv &nbsp; v &nbsp; VI &nbsp; VII</td></tr>
      </table>
      <p class="cs-note">Uppercase = major, lowercase = minor, ° = diminished. In minor, making v major (V) gives a stronger pull home.</p>
    </section>

    <section class="cs-block">
      <h2>Go-to progressions</h2>
      <table>
        <tr><td class="mono">I–V–vi–IV</td><td>The pop and EDM anthem loop</td></tr>
        <tr><td class="mono">vi–IV–I–V</td><td>Same chords, more emotional start</td></tr>
        <tr><td class="mono">i–VI–III–VII</td><td>Melodic EDM, trance, future bass</td></tr>
        <tr><td class="mono">i–iv–v</td><td>Dark and simple</td></tr>
        <tr><td class="mono">ii7–V7–Imaj7</td><td>Lofi and jazz</td></tr>
        <tr><td class="mono">IVmaj7–V–iii7–vi</td><td>Future bass "royal road"</td></tr>
        <tr><td class="mono">I–IV–iv–I</td><td>Borrowed minor iv. Bittersweet</td></tr>
        <tr><td class="mono">I–bVI–bVII–I</td><td>Borrowed. Cinematic, synthwave</td></tr>
      </table>
    </section>

    <section class="cs-block">
      <h2>Rules of thumb</h2>
      <ul>
        <li><strong>Relative keys:</strong> count down 3 half steps from a major root to find its relative minor.</li>
        <li><strong>Low end:</strong> below about C3, stick to roots, 5ths, and octaves.</li>
        <li><strong>Voice leading:</strong> move each chord note as little as possible. Keep shared notes still.</li>
        <li><strong>Melody:</strong> chord tones on strong beats, passing notes in between.</li>
        <li><strong>Tension:</strong> V pulls to I. The leading tone steps up, and the tritone in V7 closes inward.</li>
        <li><strong>DAW octave labels differ:</strong> middle C can show as C3, C4, or C5.</li>
      </ul>
    </section>
  `,
};
