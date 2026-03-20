# PhishDefense Training Portal

A modern, static phishing education portal ready to deploy on **Azure Static Web Apps** (or any static host). No build step, no backend — just HTML, CSS, and vanilla JS modules.

---

## What's included

| Page | Path | Description |
|------|------|-------------|
| Home | `index.html` | Overview + quick links |
| Modules Index | `modules/index.html` | All 5 training modules |
| Urgency | `modules/urgency.html` | Time-pressure tactics |
| Intimidation | `modules/intimidation.html` | Fear/threat-based attacks |
| Scarcity | `modules/scarcity.html` | FOMO & limited-offer attacks |
| Authority | `modules/authority.html` | Impersonation attacks |
| Types of Phishing | `modules/types-of-phishing.html` | Credential, invoice, smishing, spear |
| Quiz | `quiz.html` | 10-question assessment · 80% to pass |
| Examples | `examples.html` | Real-world scenarios with red flags |

---

## Customizing content

All content is driven by three JSON files in `/data/`. Edit them — the pages render automatically.

### `data/modules.json`

Controls all 5 module pages. Structure:

```json
{
  "topics": {
    "urgency": {
      "type": "standard",
      "summary": "...",
      "redFlags": ["...", "..."],
      "responseSteps": ["...", "..."],
      "deeperLearning": {
        "title": "...",
        "points": ["...", "..."]
      }
    },
    "types-of-phishing": {
      "type": "types-of-phishing",
      "summary": "...",
      "types": [
        {
          "type": "Credential phishing",
          "description": "...",
          "signals": ["...", "..."]
        }
      ]
    }
  }
}
```

Topic keys: `urgency`, `intimidation`, `scarcity`, `authority`, `types-of-phishing`

### `data/quiz.json`

Controls all quiz questions. Add, remove, or reorder questions freely.

```json
{
  "title": "Phishing Awareness Quiz",
  "passThresholdPercent": 80,
  "questions": [
    {
      "id": "q1",
      "topic": "urgency",
      "question": "...",
      "choices": [
        { "id": "a", "label": "...", "hint": "..." },
        { "id": "b", "label": "...", "hint": "..." }
      ],
      "correctChoiceId": "b",
      "explanation": "..."
    }
  ]
}
```

### `data/examples.json`

Controls the Real-World Examples page.

```json
{
  "examples": [
    {
      "title": "...",
      "meta": "...",
      "scenario": "...",
      "redFlags": ["...", "..."],
      "whyItWasPhishing": "...",
      "whatToDo": "..."
    }
  ]
}
```

---

## File structure

```
/
├── index.html                          # Home
├── quiz.html                           # Quiz + certificate
├── examples.html                       # Real-world examples
├── staticwebapp.config.json            # Azure SWA config (routing, headers)
│
├── modules/
│   ├── index.html                      # Module listing
│   ├── urgency.html
│   ├── intimidation.html
│   ├── scarcity.html
│   ├── authority.html
│   └── types-of-phishing.html
│
├── styles/
│   └── site.css                        # All styles (dark theme)
│
├── js/
│   ├── shared.js                       # escapeHtml, setActiveNav
│   ├── modules.js                      # Module page renderer
│   ├── examples.js                     # Examples page renderer
│   ├── quiz.js                         # Quiz logic
│   └── certificate.js                  # SVG certificate generator
│
├── data/
│   ├── modules.json                    # Module content
│   ├── quiz.json                       # Quiz questions
│   └── examples.json                   # Real-world examples
│
└── .github/
    └── workflows/
        └── azure-static-web-apps.yml   # GitHub Actions deployment
```

---

## Deploying to Azure Static Web Apps

### Option A — GitHub Actions (recommended)

1. Push this repository to GitHub.
2. In the Azure Portal, create a new **Static Web App** resource.
3. During setup, connect it to your GitHub repo and set:
   - **App location**: `/`
   - **Output location**: `/`
   - **API location**: *(leave blank)*
4. Azure will add a deployment token to your repo secrets automatically as `AZURE_STATIC_WEB_APPS_API_TOKEN`.
5. Push to `main` — the workflow in `.github/workflows/azure-static-web-apps.yml` handles deployment.

### Option B — Azure CLI manual upload

```bash
az staticwebapp upload \
  --name <your-app-name> \
  --resource-group <your-rg> \
  --source ./
```

### Option C — Azure Blob Static Website (simpler alternative)

If you don't need preview environments or custom auth, Azure Blob Storage Static Website is simpler:

```bash
az storage blob upload-batch \
  --account-name <storage-account> \
  --destination '$web' \
  --source ./ \
  --overwrite
```

---

## Security headers

`staticwebapp.config.json` sets these response headers globally:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## Notes

- **Certificate**: generated entirely client-side as SVG — no data leaves the browser.
- **No tracking**: there is no analytics or telemetry included. Add Azure Application Insights or a third-party analytics tag if desired.
- **No backend required**: all logic runs in the browser using vanilla ES modules.
- **Accessibility**: pages use semantic HTML, `aria-current`, `aria-label`, and `aria-live` regions.
