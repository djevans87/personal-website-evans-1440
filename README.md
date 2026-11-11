# personal-website-evans-1440
My personal site for CIS 1440 (Front-End Development) at Oakland Community
College. Two pages: a home page with a bit about me, and a falling-block puzzle
game I built from scratch.

**Live site:** https://djevans87.github.io/personal-website-evans-1440/

## What's here

**Home page** — the usual introduction stuff, plus a greeting that figures out
what time it is in Eastern time, pulls the current weather for Detroit, and
remembers your name and when you last stopped by. First visit it asks for your
name, after that it just says hi.

**Block Drop** — a Tetris-style game. Pieces fall, you rotate and slide them,
full rows disappear. The board is a 10x20 CSS Grid and the game state lives in a
2D array, so all the collision checking is plain array math instead of canvas
drawing. High score is saved in your browser.

Both pages have a light and dark theme you can toggle, and it sticks between
visits.

## Built with

HTML, CSS, and vanilla JavaScript. No frameworks, no libraries, no build step.
Weather comes from the [Open-Meteo API](https://open-meteo.com/).

## Running it locally

Clone it and serve the folder over HTTP:

```bash
git clone https://github.com/djevans87/personal-website-evans-1440.git
cd personal-website-evans-1440
python3 -m http.server 8000
```

Then open http://localhost:8000.

Opening `index.html` straight from Finder mostly works but the weather fetch and
localStorage get blocked on `file://` URLs, so use the server.

## Notes

Started this in September 2026. The greeting and storage code came first, then
the game, which took considerably longer than I planned. The piece preview was difficult to get right because
of the nested arrays and for loops.

# Build log

Development order for this project, with the reasoning behind each stage.
Built for CIS 1440 at Oakland Community College.

Each stage was checked off only when it worked in the browser — the rule was
never to start a new stage while the previous one was broken, so any bug had
one likely cause instead of several.

---

## Site setup

- [x] WebStorm project created, folders scaffolded (`css/`, `js/`, `images/`)
- [x] `index.html` and `game.html` created with linked CSS and JS
- [x] Smoke test — a temporary CSS rule and `console.log` to prove the file
  paths resolve before writing real code
- [x] Git initialized, `.gitignore` for `.idea/` and `.DS_Store`
- [x] Pushed to GitHub (`personal-website-evans-1440`)

---

## Page 1 — `index.html`

### Stage 1 — Skeleton and navigation
- [x] Doctype, `<head>` with charset / viewport / description / title
- [x] `<header>`, `<nav>`, `<main>`, `<footer>` on both pages
- [x] Two-way nav links, `aria-current="page"` on the active link

### Stage 2 — Static content
- [x] Bio in `#about`, profile image in a `<figure>` with `<figcaption>`
- [x] Course schedule tables (Fall 2026, Winter 2027, Summer 2027) with
  `<caption>`, `<thead>`, and `scope` on every header cell
- [x] Project cards as a `<ul>` of `<article>` elements with screenshots and
  tech-stack pills
- [x] External links with `target="_blank"` + `rel="noopener noreferrer"`,
  an arrow glyph, and visually-hidden "opens in a new tab" text

### Stage 3 — `base.css`
- [x] `box-sizing: border-box` reset
- [x] Centered container, system font stack, readable line height
- [x] Header, nav as a horizontal flex row, footer
- [x] Line length capped at `68ch` for body copy
- [x] `:focus-visible` ring so keyboard navigation stays visible
- [x] Project grid with `repeat(auto-fit, minmax(280px, 1fr))` — responsive
  with no media query

### Stage 4 — Themes and the toggle
- [x] All colors moved to CSS custom properties
- [x] `theme-light.css` and `theme-dark.css` defining the same property names
- [x] `shared.js` swaps the `<link href>` and saves the choice to localStorage
- [x] Validates the stored value against a known list before using it

> Done before the harder JavaScript on purpose — it uses `getElementById`,
> `addEventListener`, and `localStorage` in about five lines, which are the
> same three things the greeting needs.

### Stage 5 — Static greeting
- [x] `<output id="greeting" aria-live="polite">` rendered from JS

### Stage 6 — Live clock
- [x] `formatDate()` helper returning `MM/DD/YYYY at hh:mm:ss AM/PM`
- [x] `setInterval(showGreeting, 1000)`

### Stage 7 — Time-of-day greeting
- [x] `getCurrentHour()` using `hourCycle: 'h23'` in `America/New_York`
- [x] `getTimeOfDayGreeting()` — morning / afternoon / evening

> `getHours()` returns the *visitor's* local hour, which would be wrong for
> anyone grading from another time zone. The hour is derived in Eastern time.

### Stage 8 — Name form and localStorage
- [x] `<form>` with a `<label for>`, submit listener, `event.preventDefault()`
- [x] Name trimmed, saved, and the form hidden once a name exists
- [x] Form hidden on load for returning visitors

### Stage 9 — Last visit
- [x] Stored timestamp read and displayed, then the current one written
- [x] First-visit message when nothing is stored

> Read before write. Reversing the two always displays the current time,
> which looks plausible and is hard to spot.

### Stage 10 — Weather fetch
- [x] `async` / `await` against the Open-Meteo JSON endpoint (Detroit)
- [x] `response.ok` checked, `try` / `catch` around the whole request
- [x] WMO weather codes mapped to descriptions with a fallback

### Stage 11 — Weather in the greeting
- [x] Description cached in a module-scope variable
- [x] Weather icons as SVG files, colored via CSS mask so they follow the theme
- [x] Greeting renders correctly before the fetch resolves and if it fails

> Fetched once on load, never inside `setInterval` — that would be 3,600
> requests an hour and Open-Meteo would rate-limit it.

### Stage 12 — Polish and deploy
- [x] Favicon, resized and optimized
- [x] W3C HTML and CSS validation
- [x] Responsive check at 375px
- [x] Deployed to GitHub Pages

---

## Page 2 — `game.html` (Block Drop)

### Stage 1 — Empty board renders
- [x] 200 cells generated into a CSS Grid from a JS loop
- [x] `board` as a 20×10 2D array — the single source of truth
- [x] `drawCells()` painting the array onto the DOM

> Built with `Array.from({length: ROWS}, () => Array(COLS).fill(0))`.
> `Array(20).fill(Array(10).fill(0))` puts the *same* array reference in every
> row, so writing to one row writes to all of them.

### Stage 2 — One piece on screen
- [x] Seven shapes defined as padded matrices
- [x] Active piece held as separate state, not written into `board`
- [x] `drawCells()` given a second pass that paints the piece on top

> The padding rows of zeros aren't waste — they center each piece in its
> matrix so rotation spins around the right point.

### Stage 3 — Movement and collision
- [x] `isValidPlacement(shape, row, col)` — walls, floor, occupied cells
- [x] `movePiece(rowOffset, colOffset)` — test, then commit
- [x] Arrow-key handler on `document` with `event.preventDefault()`

> `isValidPlacement` takes the shape and position as parameters rather than
> reading the current ones, so it can answer questions about positions the
> piece isn't in yet. Every later feature calls it.

### Stage 4 — Gravity and locking
- [x] `setInterval(gravityTick, DROP_INTERVAL)`
- [x] `lockPiece()` writes the piece's letter into `board`
- [x] Timer id stored so it can be cleared later

> There's no separate "has it landed?" check. `movePiece(1, 0)` returning
> `false` *is* the landing signal — floor and stack are the same event.

### Stage 5 — Bag randomizer and preview tray
- [x] Fisher-Yates shuffle
- [x] Seven-bag system — every piece appears once per bag before any repeats
- [x] Three-piece queue and preview tray rendered beside the board

> Pure random selection can go a dozen pieces without an I-piece. The bag
> caps the worst-case drought at 12 and keeps it playable.

---

## Remaining

### Stage 6 — Rotation
- [x] `rotate()` — transpose the matrix, reverse each row
- [x] Bind to ArrowUp; discard the rotation if `isValidPlacement` rejects it
- [x] Skip wall kicks — rejecting an invalid rotation is enough here

### Stage 7 — Line clearing and score
- [ ] Filter out full rows, pad the top back to 20
- [ ] Score element in the markup
- [ ] Scoring: 100 / 300 / 500 / 800 for 1–4 lines at once

### Stage 8 — Game over and restart
- [ ] `spawnNewPiece()` returns whether the new piece fits
- [ ] `clearInterval` and a `<dialog>` with `showModal()` when it doesn't
- [ ] `resetGame()` — clear the board, score, bag and queue; restart the timer
- [ ] "Play again" in the dialog and a standalone restart button both call it

> `resetGame()` must `clearInterval` the old timer first, or a second interval
> starts alongside the first and pieces fall at double speed.

### Stage 9 — Polish
- [ ] Pause — toggle the interval, and ignore movement keys while paused
- [ ] Auto-pause on `visibilitychange` (browsers throttle background timers)
- [ ] High score in localStorage
- [ ] Hard drop on Space
- [ ] Speed increase as the score climbs
- [ ] On-screen buttons for touch devices
- [ ] `<details>` controls legend using `<kbd>`

## Credits

- Weather data from [Open-Meteo](https://open-meteo.com/)
- Icons from [SVG Repo](https://www.svgrepo.com/)
- Built for CIS 1440 at Oakland Community College

I used [Claude](https://claude.ai) as a tutor while building this — for concept
explanations, code review, and the initial stylesheet and README. The JavaScript
in `main.js` and `game.js` is my own, written stage by stage from explanations
rather than generated code. See [BUILD-LOG.md](BUILD-LOG.md) for the order I
built things in and the reasoning behind each decision.