# Postroom

A Gmail labelling system powered by Claude Haiku 4.5.

Postroom runs inside your Google account once a day and automatically labels your incoming emails using AI. It reads the sender address and subject line of each new email, asks Claude which label it belongs to, and applies that label. No manual tagging. No preset rules.

Built by [Ramy Najmeddine](https://ramy.au) · [From the Index](https://ramynaj.substack.com) · Entry 01

---

## What it does

- Labels new emails automatically every morning at 7:00am
- Uses Claude Haiku 4.5 to classify each email by sender and subject line
- Applies a colour-coded label structure you define
- Sends anything it cannot confidently classify to a REVIEW label
- Runs a monthly self-audit to keep your label structure in sync

## What it does not do

- Read email body content — only sender address and subject line are used
- Archive, delete, or move emails
- Create new labels automatically
- Require any external app or subscription beyond the Anthropic API

---

## Privacy

Postroom never reads your email body. Only the sender's email address and subject line are passed to the Anthropic API. Your actual email content stays in Gmail at all times. This is a deliberate decision — the sender and subject line are enough context to make a strong labelling decision in most cases.

---

## Cost

Postroom uses Claude Haiku 4.5 — Anthropic's most affordable model, built for classification tasks.

For 50 emails per day the projected cost is approximately USD $0.02 per day — less than USD $1.00 per month.

*Pricing based on Anthropic's published rates as of June 2026. Check [console.anthropic.com](https://console.anthropic.com) for current pricing.*

---

## Prerequisites

- A Google account with Gmail
- An Anthropic API account at [console.anthropic.com](https://console.anthropic.com)
- At least USD $5 in Anthropic API credits
- Your Anthropic API key (starts with `sk-ant-...`)

---

## Setup options

### Option A — DIY
Edit `Config.gs` with your own label structure and follow the setup steps below. No Claude account needed beyond the API.

### Option B — Guided setup
Run `auditInbox()` first. It scans your last 90 days of email and logs sender patterns to help you decide your label structure. Edit `Config.gs` based on the output, then run setup.

### Option C — Claude Assisted (recommended)
Connect Claude to your Gmail. Let Claude audit your inbox, suggest a personalised label structure based on what actually lives in your email, write a custom `Config.gs` tailored to your life, and walk you through the full setup.

Full walkthrough at [ramynaj.substack.com](https://ramynaj.substack.com)

---

## Installation

**1. Get the files**

Download or clone this repository.

**2. Open Google Apps Script**

Go to [script.google.com](https://script.google.com). Sign in with the Google account whose Gmail you want Postroom to organise. Create a new project and name it `Postroom`.

**3. Add the Gmail API service**

In the left sidebar, click **+** next to Services. Find **Gmail API** and click Add. This is required for label colours to apply correctly.

**4. Create the files**

Apps Script starts with one file called `Code.gs`. For each file below, click **+** next to Files, choose Script, name it exactly as shown, paste the contents, and save.

| File | Action |
|---|---|
| `Code.gs` | Replace existing content |
| `HaikuClient.gs` | Create new |
| `Config.gs` | Create new — edit your labels first (see below) |
| `Labels.gs` | Create new |
| `LabelAudit.gs` | Create new |
| `Audit.gs` | Create new |
| `ArchiveSweep.gs` | Create new |
| `BulkSweep.gs` | Create new |

**5. Update appsscript.json**

In Project Settings (gear icon), tick **Show appsscript.json in editor**. Replace all content with the `appsscript.json` file from this repo.

**6. Customise your labels**

Open `Config.gs`. Edit the `getLabelTaxonomy()` function with your own label structure. The default taxonomy is a starting point — replace it with categories that match your life.

Not sure what labels you need? Run `auditInbox()` first (see Audit.gs) to see a breakdown of your actual inbox before deciding.

**7. Save your API key**

Open `Code.gs`. Find `saveApiKey()`. Replace `sk-ant-your-key-here` with your actual Anthropic API key. Run `saveApiKey()`. Then delete the key from the code and save — it is now stored securely in Apps Script Properties.

**8. Run setup**

Select `setupPostroom` from the function dropdown and click Run. Authorise when Google prompts you. Postroom will create all your labels with colours and set up the daily trigger.

**9. Label your existing inbox**

Run `previewBulkSweep()` to see how many unlabelled emails you have. Then run `bulkSweep()` to label them all.

If you have a large inbox (900 emails or more), run `bulkSweep()` multiple times. Each run processes as many emails as it can within a 5-minute window. Already-labelled emails are automatically skipped. Check Gmail after each run to see progress, and repeat until everything is labelled.

**10. Done**

Postroom runs automatically every day at 7:00am. Check the REVIEW label once a week for anything it could not confidently place.

---

## Files

| File | Purpose | Notes |
|---|---|---|
| `Code.gs` | Main entry point and daily trigger | |
| `HaikuClient.gs` | Anthropic API classification call | |
| `Config.gs` | Label taxonomy and colour configuration | Edit this file to customise your labels |
| `Labels.gs` | Creates labels with colours in Gmail | Called by setupPostroom() |
| `LabelAudit.gs` | Monthly self-audit — keeps Gmail in sync with Config.gs | |
| `Audit.gs` | One-time inbox audit — logs sender patterns to help build your taxonomy | |
| `ArchiveSweep.gs` | One-time archive sweep — run after 1-2 weeks of testing | |
| `BulkSweep.gs` | One-time bulk labelling of existing inbox emails | |
| `appsscript.json` | OAuth scopes manifest | |

---

## How it runs

| Schedule | Function | What it does |
|---|---|---|
| Daily at 7:00am | `runPostroom()` | Labels new unlabelled emails from the last 2 days |
| 1st of every month at 8:00am | `auditLabels()` | Checks Config.gs and creates any missing labels |

---

## The REVIEW label

Any email Postroom cannot confidently place gets labelled REVIEW. Check it once a week and decide:

- Move it to the correct label manually
- Add a new label to Config.gs if the pattern keeps recurring
- Delete it if it is junk

Over the first month or two, REVIEW gets emptier as the label structure tightens.

---

## Coming features

- **Daily summary email** — a morning digest showing what was labelled and flagging emails that need your attention
- **REVIEW pattern scanning** — monthly analysis of what lands in REVIEW with suggested new labels

---

## Documentation

Full setup guide, build log, and architecture decisions:
[ramynaj.substack.com](https://ramynaj.substack.com)

---

## Contributing & Collaborating

Postroom is open source. If you improve it, extend it, or build something on top of it, feel free to open a pull request.

If you are working on something related and want to collaborate, I am open to it. Reach out at [ramy.au](https://ramy.au) or find me on [LinkedIn](https://www.linkedin.com/in/ramynajmeddine).

If you share or publish work derived from Postroom, a credit back to the original is appreciated.

---

## License

MIT — use it, modify it, share it.

---

*Built by Ramy Najmeddine · Melbourne · [ramy.au](https://ramy.au)*
