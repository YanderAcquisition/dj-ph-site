# DJ PH website

The home page plays like a record with two sides. Side A is PH on the decks (a note from PH,
music, mixes, gigs). The record flips, night turns to day, and Side B is PH off the decks
(PHola, the camera roll, lately, the press kit, contact). The orange outro holds the guest list.

Designed and maintained by Yander Acquisition.

## Run it

Static HTML, no build step.

    python3 -m http.server 4520 --directory ~/dj-ph-site

Then open http://localhost:4520. Add `?skip` to the URL to jump past the loader while testing.

Host it on Netlify, connected to the GitHub repo, so every change to the repo goes live on its
own. `netlify.toml` is included. The guest list and contact forms use Netlify Forms, and the
gig manager logs in through Netlify, so neither works on GitHub Pages.

## Where things live

| What | Where |
| --- | --- |
| Page structure and copy | `index.html` |
| Design system (colours, type, layout) | `assets/css/site.css` |
| Gigs and the Save the Date poster | `content/gigs.json`, `content/next-up.json` (edit at `/admin`) |
| Gig posters uploaded through the admin | `content/media/` |
| Mixes, PHola editions, photo lists | top of `assets/js/site.js` (`MIXES`, `EDITIONS`, `ROLL`, `PRESS`) |
| Photos, cutouts, mix covers | `assets/img/` |
| Fonts (self hosted) | `assets/fonts/` (Archivo, Bodoni Moda, IBM Plex Mono) |
| Animation libraries (self hosted) | `assets/vendor/` (GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13) |

The mix archive also checks Mixcloud live on load: new uploads (Mix 276 onward) appear on their
own and play counts refresh. The static list is the fallback.

## Managing gigs

PH (or anyone he adds) manages gigs at **/admin** on the live site, for example
`https://iamph.co.za/admin`. It runs on Decap CMS, which is free and open source. Every save is
a commit in the GitHub repo, so nothing is ever lost and any change can be rolled back.

There are two things to edit:

- **Gig guide.** The list on the home page and the departures board on the Gigs page. Add a
  gig with **Add gig**, fill in the date, city and event, and press **Publish**. Upcoming
  dates sort themselves to the top, nearest first, and switch to Played the day after. Older
  gigs can show just the month or the year. **Show on the site** hides a gig without deleting
  it, and **Record-breaking set** shows a Record tag instead of Played.
- **Save the date.** The poster, countdown and buttons beside the gig list. Upload a new poster,
  set when the gates open (South African time) and the ticket link. The countdown hides itself
  once that time passes, and switching the poster off lets the gig list take the full width.

Changes are live a minute or two after **Publish**, once Netlify has redeployed.

### One-time setup (about 10 minutes)

1. **The repo** is already set in `admin/config.yml`: `YanderAcquisition/dj-ph-site`, branch
   `main`. Change it there if the site ever moves.
2. **Create a GitHub OAuth app.** On GitHub go to Settings, Developer settings, OAuth Apps,
   New OAuth App. Homepage URL: the site's address. Authorization callback URL:
   `https://api.netlify.com/auth/done`. Create it, then generate a client secret.
3. **Connect it to Netlify.** In the Netlify project go to Project configuration, Security,
   OAuth. Under Authentication Providers choose Install Provider, pick GitHub, and paste the
   Client ID and Client Secret.
4. **Give PH access.** PH needs a free GitHub account. Add it to the repo under Settings,
   Collaborators, with Write access.
5. **Log in.** Open `/admin` on the live site and choose Login with GitHub.

**If PH would rather log in with an email and password** instead of a GitHub account, Netlify
Identity with Git Gateway does that. Netlify has deprecated Git Gateway (it still works but
gets no new fixes), so it is the fallback, not the default. To switch: enable Identity and Git
Gateway in the Netlify project, invite PH by email, change the backend in `admin/config.yml` to
`name: git-gateway` (remove the `repo` line), and add
`<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>` to the
`<head>` of `admin/index.html` and `index.html`.

### Trying the admin locally

With the site running on port 4520, run `npx decap-server` in the site folder, then open
http://localhost:4520/admin/. Saves go straight to the files on your computer instead of GitHub.

## Music on arrival

Mix 275 is cued in the background while the loader counts up, and the site opens on its own as
soon as the count finishes. Browsers block sound until the visitor clicks, taps or presses a key,
and Mixcloud's player won't start without one, so the mix starts on the visitor's first click or
tap anywhere on the page. If a browser still refuses, a tap prompt appears under the player in
the nav so the visitor can press play on Mixcloud directly.

## Before this goes live: confirm with PH's team

1. **Photography.** Lifestyle photos are from the Dropbox "PH PR '26" set and press portraits
   from the Pixieset "Edited" set. Confirm usage rights for both.
2. **"A note from PH"** is written in his voice from the bio he supplied. He should approve it.
3. **"World record"** is how the press reported the 72 hour set with Shimza (December 2019,
   Icon, Soweto). No Guinness certificate was found, so confirm the exact wording PH uses.
4. **The Shady PHodcast.** PH's bio calls it "once loved", so the site doesn't say whether it is
   still running. Confirm.
5. **Social links:** Instagram `iamph`, X `iam_ph`, YouTube `PartyWithPH`, Mixcloud `iam_pH`.
   Check the YouTube URL resolves.
6. **Share image.** `og:image` is a relative path. Make it absolute once the domain is set
   (for example `https://iamph.co.za/assets/img/og.jpg`).

## Sources

- PH's own bio (supplied October 2026): roles, Party with PH on 5FM, PHola editions
- Sunday World, Nov 2023: started 2009, PHola began 2017, 4,000 in Cape Town
- Sowetan, Dec 2023: Eastern Cape, Bonza Bay six to six at eighteen
- TimesLive / DispatchLIVE, Dec 2019: 72 hours back to back with Shimza at Icon, Soweto
- SXSW 2019 artist listing and Mixcloud bio
- Mixcloud API (`iam_pH`): mix titles, dates, durations, tags, play counts
