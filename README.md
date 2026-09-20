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
the game, which took considerably longer than I planned. The rotation math was
the fun part.

## Credits

- Weather data from [Open-Meteo](https://open-meteo.com/)
- Built for CIS 1440 at Oakland Community College