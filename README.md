# The PAC Group — IT Security Training Portal (v4)

A fully branded, static security awareness training portal for The PAC Group, deployable on **Azure Static Web Apps**. No build step, no backend, no sign-in required.

---

## What's included

### Pages
| Page | Path | Description |
|------|------|-------------|
| Home | `index.html` | PAC-branded hero, learning path, PhishCraft game embed, "Do This Today" checklist |
| Phishing Modules | `modules/phishing/index.html` | 5 phishing tactic modules |
| IT Security Modules | `modules/it-security/index.html` | 8 IT security topic modules |
| Defence Strategies | `strategies.html` | Recognize → Rethink → Report + "PAC will never ask" list |
| Real Stories | `stories.html` | 5 real-world attack stories |
| Quiz | `quiz.html` | 10-question assessment, 80% pass threshold, PAC certificate |

### Phishing Modules (5)
- Urgency · Intimidation · Scarcity · Authority · Types of Phishing

### IT Security Modules (8)
- Clean Desk Policy · Password Hygiene · Acceptable Use Policy
- Physical Security & Tailgating · Social Media Safety
- Working Remotely & VPN · Incident Reporting · AI Acceptable Use

Each IT module includes a real-world story, red flags, and response steps.

### Features
- **PhishCraft game** embedded on the home page (hosted at sambeggs99.github.io/PAC_Phishcraft/)
- **Module completion tracking** — checkmarks appear on cards as modules are visited (localStorage)
- **Progress bar** — shows how many of 13 training modules have been completed (5 phishing + 8 IT)
- **"Do This Today" checklist** — 5 immediate actions on the home page
- **PAC certificate** — SVG certificate generated in-browser, downloadable and printable
- **Mobile-first responsive** — works on all screen sizes
- **PAC brand** — Carbon/Bright Red/Cherry/Concrete palette, PAC diamond SVG logo, Century Gothic body font

---

## Customizing content

All content is in `/data/`:

| File | Controls |
|------|---------|
| `data/phishing-modules.json` | All 5 phishing module content |
| `data/it-security.json` | All 7 IT security module content (with stories) |
| `data/quiz.json` | Quiz questions, answers, pass threshold |
| `data/stories.json` | Real-world story page content |

### Key things to personalize before launch

1. **Reporting email** — Search for `phishing@pacgroup.com` across the codebase and replace with your real IT security reporting address
2. **PhishCraft URL** — The game is embedded from `https://sambeggs99.github.io/PAC_Phishcraft/` — update if it moves
3. **Certificate version** — In `js/quiz.js`, update the Training Version label if desired
4. **Pass threshold** — In `data/quiz.json`, change `passThresholdPercent` (default: 80)

---

## File structure

```
/
├── index.html                          # Home
├── strategies.html                     # Defence strategies
├── stories.html                        # Real-world stories
├── quiz.html                           # Quiz + certificate
├── staticwebapp.config.json            # Azure SWA routing + security headers
│
├── modules/
│   ├── phishing/
│   │   ├── index.html
│   │   ├── urgency.html
│   │   ├── intimidation.html
│   │   ├── scarcity.html
│   │   ├── authority.html
│   │   ├── types-of-phishing.html
│   │   └── module-renderer.js
│   └── it-security/
│       ├── index.html
│       ├── clean-desk.html
│       ├── password-hygiene.html
│       ├── acceptable-use.html
│       ├── physical-security.html
│       ├── social-media.html
│       ├── remote-vpn.html
│       ├── incident-reporting.html
│       └── module-renderer.js
│
├── styles/
│   └── site.css                        # Full PAC brand CSS
│
├── js/
│   ├── shared.js                       # Utilities, progress tracking, nav
│   ├── header.js                       # Header + footer HTML templates
│   ├── stories.js                      # Stories page renderer
│   └── quiz.js                         # Quiz logic + certificate generator
│
├── data/
│   ├── phishing-modules.json
│   ├── it-security.json
│   ├── quiz.json
│   └── stories.json
│
└── .github/
    └── workflows/
        └── azure-static-web-apps.yml
```

---

## Deploying to Azure Static Web Apps

1. Push this repo to GitHub
2. In Azure Portal → Create → Static Web App
3. Connect your GitHub repo, set:
   - **App location**: `/`
   - **Output location**: `/`
   - **API location**: *(leave blank)*
4. Azure adds `AZURE_STATIC_WEB_APPS_API_TOKEN` to your repo secrets automatically
5. Push to `main` — the included workflow deploys automatically

---

## Brand compliance

Colors used:
- Bright Red `#AB2328` — primary accent, buttons, badges
- Cherry `#76232F` — hover states, gradient depth
- Carbon `#212322` — footer, dark surfaces
- Concrete `#D0D3D4` — subtle text, borders

Typography: DM Sans (web) + Century Gothic fallback (matches PAC brand guide for digital/web communications)

Logo: PAC diamond reproduced as inline SVG — no external image files required.

---

## Adding new content

- **New phishing module**: Add a topic to `data/phishing-modules.json` and create `modules/phishing/[slug].html`
- **New IT module**: Add a topic to `data/it-security.json` and create `modules/it-security/[slug].html`
- **New quiz questions**: Add to `data/quiz.json` — the renderer handles any number of questions
- **New stories**: Add to `data/stories.json`

Update `TOTAL_MODULES` in `js/shared.js` when adding new modules to keep the progress bar accurate.


---

## Language

The portal is **English only**. Shared UI labels and navigation strings live in `data/ui.json`. Training content is in `data/phishing-modules.json`, `data/it-security.json`, `data/quiz.json`, and `data/stories.json`.

---

## Module check-in questions (v5)

Every module now has 2 quick check-in questions at the bottom. These:
- Appear after the module content
- Give instant green/red feedback with an explanation
- Do NOT affect the certification quiz score
- Are stored in each module's data entry under the `checkIn` key

To add or edit check-in questions, find the module in `data/phishing-modules.json` or `data/it-security.json` and edit the `checkIn` array. Each question needs: `question`, `choices` (array of `{id, label}`), `correctChoiceId`, and `explanation`.
