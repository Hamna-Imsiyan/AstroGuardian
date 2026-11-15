# AstroGuardian verification

Interface-effects follow-up: 103 desktop browser checks and 101 phone/reduced-motion checks passed. Verified 12 spotlight cards, six enhanced native controls, pointer-local glow coordinates, keyboard and touch fallbacks, one shared WebGL context, rendered canvas pixels, shared motion pause, ripple cleanup, primary navigation, forms, reminders, responsive widths, and all 25 offline resources. All 13 application scripts pass syntax checks. The overview was also visually reviewed with an active card spotlight and metal action button. [Implementation details](interface-effects.md).

Location/reminder follow-up: 88 browser checks passed, including all three persistent location choices, shared selector synchronization, context-aware reminders, on/off settings, snooze, dismiss, reminder completion after today's record, original-location history, arrow removal, responsive widths, and offline caching. All 112 HTML IDs are unique and all 11 application scripts pass syntax checks. Focused engine checks also covered storage denial, legacy preferences, midnight transitions, cross-tab updates, and hidden-tab timer suspension.

Space-theme follow-up: 67 browser checks passed in normal and reduced-motion modes. Manual action controls were removed; automatic character motion, dark dialog surfaces, 30 responsive overflow checks, record workflows, and all 21 offline resources were verified. Desktop overview and phone chat screenshots were reviewed. The new 3D-style transparent character and orbital background were created with the built-in ImageGen tool; [asset prompts and saved paths](generated-assets.md) are documented separately.

The generic design-gate findings below are retained from the earlier page-structure change and are not a fresh assessment of the space-theme styling.

GATE: OPEN 48 (rounds used up)

The frontend skill’s generic landing-page checker remains open. Its required full-screen marketing sections, hero artwork, kit markup, display hierarchy, and anchor-only link assumptions differ from this existing application and its requested dropdown navigation. No checker or kit files were changed and no waivers were applied. The complete open findings are listed below.

The app preserves the existing navy/blue branding, uses local Bahnschrift/Aptos and Segoe UI typefaces, and adapts the attached navigation design to the existing static stack. The palette and component approach follow the user’s existing app rather than replacing it with a marketing-page template. Both supplied images are original, unchanged assets; the astronaut retains its sample markings. There are no stock-photo stand-ins, invented mission measurements, contact forms, or new brand names.

## Functional verification

- Final phone browser run passed 64 checks, including 30 overflow checks across six feature pages at 1440, 1024, 768, 390, and 320 pixels, composer visibility, offline service-worker activation, and caching all 20 application resources.
- 31 initial desktop browser interaction checks passed: all routes, dropdowns, mobile toggle, skip link, malformed bookmarks, record persistence/deletion, chart, body controls, chat, and preferences.
- Syntax checks passed for all 11 application JavaScript files. All 106 static HTML IDs are unique; all local asset references and 10 feature routes resolve.
- Reviewed desktop overview and phone body explorer screenshots; corrected launcher overlap, hotspot spacing, navigation alignment, focus rings, and dialog composer placement.
- Existing module checks also covered malformed storage, storage denial, duplicate prevention, and emergency flow.
- Browser voice recognition and actual microphone permissions were not exercised. No real emergency response or connected AI service is provided.

## Open generic design-gate findings

- **hero-fill** — main#mainContent > section.route-page.overview-page "Welcome aboard, Commander.": the next section shows on the first screen: it starts at 201px on a 900px screen (the hero ends at 158px)
- **nav** — header.site-header > div.header-inner > a.brand "a ✦ astroguardian YOUR ONBOARD COMPANION": nav link wraps to a second line
- **no-visual** — main#mainContent > section.route-page.overview-page "Welcome aboard, Commander.": no picture, effect or mock in this section; a feature section needs a visual
- **card-visual** — main#mainContent > section.route-page.overview-page > div.destination-grid "◎ Body explorer ↗ Turn the silhouette an": 3 cards hold only text: no picture, icon, UI fragment or effect in any of them
- **button-styles** — (one screen): 3 button styles on one screen: soft, fill #202d3e ("Overview"); soft, fill #a9cfff, outline #a9cfff ("Record a check-in ↗"); soft, outline #49617e ("Explore trends →"); the odd one out: "Explore trends →"
- **button-styles** — (the page): 3 button styles on the page: soft, fill #202d3e x1 ("Overview"); soft, fill #a9cfff, outline #a9cfff x1 ("Record a check-in ↗"); soft, outline #49617e x1 ("Explore trends →")
- **cta** — main#mainContent > div.workspace-bar: the hero has no button (the nav's does not count)
- **copy-headline** — h1#title-overview "Welcome aboard, Commander.": "Welcome aboard, Commander." does not name what is sold (astronaut wellness prototype, astronaut, wellness, prototype, from flags)
- **copy-headings** — section.route-page.overview-page > div.overview-grid > div.mission-welcome > h2 "Your mission. Your well-being.": "Your mission. Your well-being." names no product, part, place or section (2 headings like it; at most one brand line per page) (and 1 more like it: "Find your space")
- **heading-scale** — section.route-page.overview-page > div.overview-grid > div.mission-welcome > h2 "Your mission. Your well-being.": an h2 at 61.9px, as large as the h1 (46px) or larger
- **heading-scale** — strong#overviewRecordCount "0": the figure "0" is set at 33px, larger than the section headings (h2 22px)
- **links** — header.site-header > div.header-inner > a.brand "a ✦ astroguardian YOUR ONBOARD COMPANION": "a ✦ astroguardian YOUR ONBOARD COMPANION" goes to #/overview, which is not on this page
- **links** — nav#mainNavigation > a.nav-direct:nth-of-type(1) "Overview": "Overview" goes to #/overview, which is not on this page
- **links** — div#healthMenu > div.menu-intro > a.text-link "Record a check-in ↗": "Record a check-in ↗" goes to #/check-in, which is not on this page
- **links** — div#healthMenu > div.menu-links > a.menu-link:nth-of-type(1) "＋Daily check-inRecord today’s measuremen": "＋Daily check-inRecord today’s measuremen" goes to #/check-in, which is not on this page
- **links** — div#healthMenu > div.menu-links > a.menu-link:nth-of-type(2) "↗Trends & insightsExplore your recorded ": "↗Trends & insightsExplore your recorded " goes to #/trends, which is not on this page
- **links** — div#healthMenu > div.menu-links > a.menu-link:nth-of-type(3) "◎Body explorerTurn, select, and learn": "◎Body explorerTurn, select, and learn" goes to #/body, which is not on this page
- **links** — div#healthMenu > div.menu-links > a.menu-link:nth-of-type(4) "▤Health historyRevisit your saved check-": "▤Health historyRevisit your saved check-" goes to #/history, which is not on this page
- **links** — div#missionMenu > div.menu-links > a.menu-link:nth-of-type(1) "✧Wellness missionsSmall steps for your d": "✧Wellness missionsSmall steps for your d" goes to #/wellness, which is not on this page
- **links** — div#missionMenu > div.menu-links > a.menu-link:nth-of-type(2) "⌘Mission toolsMeasurement guides & remin": "⌘Mission toolsMeasurement guides & remin" goes to #/mission, which is not on this page
- **links** — div#missionMenu > div.menu-links > a.menu-link:nth-of-type(3) "◉Offline supportCheck application availa": "◉Offline supportCheck application availa" goes to #/offline, which is not on this page
- **links** — div#missionMenu > div.menu-links > a.menu-link:nth-of-type(4) "＋Emergency trainingExplore simulated sce": "＋Emergency trainingExplore simulated sce" goes to #/emergency, which is not on this page
- **links** — nav#mainNavigation > a.nav-direct:nth-of-type(2) "Meet ASTRA COMPANION": "Meet ASTRA COMPANION" goes to #/assistant, which is not on this page
- **links** — header.site-header > div.header-inner > div.header-actions > a.emergency-link "Emergency ↗": "Emergency ↗" goes to #/emergency, which is not on this page
- **links** — div.overview-grid > div.mission-welcome > div.hero-actions > a.button.button-primary "Record a check-in ↗": "Record a check-in ↗" goes to #/check-in, which is not on this page
- **links** — div.overview-grid > div.mission-welcome > div.hero-actions > a.button.button-secondary "Explore trends →": "Explore trends →" goes to #/trends, which is not on this page
- **links** — section.route-page.overview-page > div.overview-grid > aside.flight-plan > a.plan-step:nth-of-type(1) "01 Check in with yourself Log your daily": "01 Check in with yourself Log your daily" goes to #/check-in, which is not on this page
- **links** — section.route-page.overview-page > div.overview-grid > aside.flight-plan > a.plan-step:nth-of-type(2) "02 Get a new perspective Explore your bo": "02 Get a new perspective Explore your bo" goes to #/body, which is not on this page
- **links** — main#mainContent > section.route-page.overview-page > div.destination-grid > a.destination:nth-of-type(1) "◎ Body explorer ↗ Turn the silhouette an": "◎ Body explorer ↗ Turn the silhouette an" goes to #/body, which is not on this page
- **links** — main#mainContent > section.route-page.overview-page > div.destination-grid > a.destination:nth-of-type(2) "✧ Wellness missions ↗ A few small activi": "✧ Wellness missions ↗ A few small activi" goes to #/wellness, which is not on this page
- **links** — main#mainContent > section.route-page.overview-page > div.destination-grid > a.destination:nth-of-type(3) "⌘ Mission tools ↗ Measurement guides, mi": "⌘ Mission tools ↗ Measurement guides, mi" goes to #/mission, which is not on this page
- **links** — footer.site-footer > div > a.footer-brand "astroguardian✦": "astroguardian✦" goes to #/overview, which is not on this page
- **links** — footer.site-footer > a "Offline support ↗": "Offline support ↗" goes to #/offline, which is not on this page
- **moment-none** — (the page): a software page (--type) deals no moment: every kind carries one, two on a long page (moments.md)
- **hero-screen** — main#mainContent > div.workspace-bar "CREW WELLNESS WORKSPACESun, Nov 15, 2026": the hero ends at 158px on a 900px screen, 742px above the fold: it ends at the fold, 1px either way (SR-1)
- **hero-screen** — main#mainContent > section.route-page.overview-page "ASTROGUARDIAN / OVERVIEWWelcome aboard, ": 742px of the next section shows on the first screen (from 158px on a 900px screen): nothing below the hero shows at load (SR-1)
- **section-height** — footer.site-footer "astroguardian✦2026 SPACE APPS CHALLENGE ": the section is 195px tall (0.2 screens), 705px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2)
- **section-height** — main#mainContent > section.route-page.overview-page "ASTROGUARDIAN / OVERVIEWWelcome aboard, ": the section is 1085px tall (1.2 screens), 185px over one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2)
- **one-section** — footer.site-footer "astroguardian✦2026 SPACE APPS CHALLENGE ": the screen at scroll 570px (the top of section 3) shows 195px of section 3 and the content of 2 sections, over 24px each beside section 2: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)
- **one-section** — main#mainContent > div.workspace-bar "CREW WELLNESS WORKSPACESun, Nov 15, 2026": the screen at scroll 0px (stride 0) shows 69px of section 1 beside section 2: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)
- **one-section** — div#routeAnnouncement "Mission overview page": a <div> sits directly in <main>: every part of <main> is a <section> (SR-4)
- **one-heading** — main#mainContent > section.route-page.overview-page > div.explore-heading > h2 "Find your space": the section holds 2 h2 headings: one per section, first in its .wrap (SR-5)
- **container-edges** — header.site-header "Skip to content a✦astroguardianYOUR ONBO": the nav's content runs 20px from the left and 96px from the right (read from its outermost blocks: no .wrap): the page's container starts at 96px; 20 and 96px are not one margin; the margin is 64-120px at 1440px (one container, equal margins, 2px either way) (SR-6)
- **container-edges** — footer.site-footer "astroguardian✦2026 SPACE APPS CHALLENGE ": a <footer> at the top of the page, outside header.nav, main, footer.closing and nav.actionbar (SR-6)
- **container-edges** — aside.companion-dock "× A MOMENT WITH ASTRA Let's chat ↗ Turn ": a <aside> at the top of the page, outside header.nav, main, footer.closing and nav.actionbar (and 3 more like it: "CREW WELLNESS WORKSPACES", "ASTROGUARDIAN / OVERVIEW", "astroguardian✦2026 SPACE") (SR-6)
- **container-edges** — header.site-header > div.header-inner > a.skip-link "Skip to content": a box runs 20-167px, outside the container lines of the nav at 96-1344px: full width is for background layers and grounds only (SR-6)
- **container-edges** — section.route-page.overview-page > div.overview-grid > div.mission-welcome > h2 "Your mission.Your well-being.": the h2 starts 37px right of the container's left: every h1 and h2 starts on it, 2px either way (SR-6)
- **container** — page: no .wrap

## Retained checker warnings

- 1440px **flush**: its last line sits 27px above the rule on top of section.route-page.overview-page
- 1440px **flush**: its button sits 24px above the rule on top of the footer
- 1440px **copy-buttons**: "Overview" does not start with a verb (book, buy, try, start, get, see...) (and 1 more like it: "Record a check-in ↗")
- 1440px **copy-actions**: the main action "Record a check-in" does not read word for word the same in the nav or hero
- 1440px **nav-family**: the nav's links come in 2 sizes (14, 12px)
- 1440px **copy-length**: 1 section over 90 words a screen outside the UI mocks ("Welcome aboard, Commande" 143); 81 words a screen across the page (178 words in 2.2 screens): a tech page says it in about 80 or fewer
- 1440px **moment-none**: a software page (--type) deals no moment: every kind carries one, two on a long page (moments.md)
- 1440px **share-meta**: the head lacks og:image, twitter:card: a shared link shows no picture or title of its own
- 390px **tap-size**: a 165x42px tap target: under the 44px a phone needs

These warnings were retained because this is a dashboard with grouped navigation, status labels, compact functional cards, and multiple available actions. The app does not claim to satisfy the skill’s marketing-layout finish gate.
