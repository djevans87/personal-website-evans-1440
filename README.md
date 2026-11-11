# personal-website-evans-1440
My personal site for CIS 1440 (Front-End Development) at Oakland Community
College. Three pages: a home page with a bit about me, a falling-block puzzle
game I built from scratch, and a page of interactive class assignments.

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

**Assignments** — interactive versions of some of my CIS 1440 JavaScript assignments,
collected on one page:

- *Popup Storm* — a safe recreation of the 1990s "You Are An Idiot" site that
  spawned popup windows until the browser gave up. Pick how many (1–100) and
  they appear one at a time inside a contained stage instead of real windows.
  Each popup's position comes from a seeded sine/cosine formula, so the same
  count always produces the same layout. Every pending `setTimeout` is tracked,
  so Clear (or a second Unleash) cancels the rest of the storm cleanly.
- *Hunter Level Up System* — create a hunter with starting stats, pick 1–10
  levels with a slider, and level up. Every level applies the same buff
  (+30 health, +10 mana, +5 strength, +2 agility). The hunter is a plain object
  from a factory function with `applyBuff()` and `levelUp()` methods, and the
  character sheet shows each stat's before → after value with an animated bar.

Both forms use the browser's Constraint Validation API (`input.validity`) for
custom error messages, announced to screen readers through `role="alert"`.

All three pages have a light and dark theme you can toggle, and it sticks
between visits.

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

## Credits

- Weather data from [Open-Meteo](https://open-meteo.com/)
- Weather icons from [SVG Repo](https://www.svgrepo.com/)
- Hunter icons by Delapouite and Lorc from [game-icons.net](https://game-icons.net/),
  licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)
- Built for CIS 1440 at Oakland Community College

I used [Claude](https://claude.ai) as a tutor while building this — for concept
explanations, code review, and the initial stylesheet and README. The JavaScript
in `main.js` and `game.js` is my own, written stage by stage from explanations
rather than generated code. See [BUILD-LOG.md](BUILD-LOG.md) for the order I
built things in and the reasoning behind each decision.