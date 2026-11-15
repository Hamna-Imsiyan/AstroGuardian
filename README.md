# AstroGuardian
An interactive astronaut health-monitoring and decision-support prototype developed for the 2026 NASA Space Apps Challenge.

Run `node tools/serve.mjs` from this folder and open [http://127.0.0.1:5173](http://127.0.0.1:5173). No dependencies or build step are required. Opening `index.html` directly supports the interface, but offline caching and browser voice controls require localhost or HTTPS.

Features have separate, bookmarkable hash routes: `#/overview`, `#/check-in`, `#/trends`, `#/body`, `#/history`, `#/wellness`, `#/mission`, `#/offline`, `#/emergency`, and `#/assistant`. This works on static hosting without rewrite rules. Existing health records stay in the same browser storage key.

The navigation adapts the supplied dropdown-menu reference to this app’s HTML/CSS/JavaScript stack. Headings use Bahnschrift/Aptos Display, with Segoe UI for reading and system fallbacks, so fonts work offline without third-party requests.

Feature cards use a blue/cyan pointer spotlight, and primary actions use a liquid-metal finish with press and ripple feedback. The components live in `components/ui/`, load locally, and respect reduced motion and the shared animation preference. See [interface effects](docs/interface-effects.md) for their placement and implementation.

Choose Space station, Open space (EVA), or Moon base camp from the location selector above every page. The selection updates measurement context and reminders, and each new record stores its own location. Older records remain unchanged. Use Set reminder to enable a daily reminder at your chosen device-local time. Due reminders appear across the workspace, can be snoozed for 10 minutes or dismissed for the day, and stop after today’s check-in is saved. Reminders work while the app is open or when you return; they do not send alerts after the browser is closed.

The supplied body image is a flat silhouette with an interactive 2D turn, keyboard controls, and educational hotspots. It is not a 3D anatomical model. ASTRA uses a newly rendered transparent 3D-style character with automatic waving, hopping, and floating. The entire workspace uses an orbital backdrop, dark panels, and high-contrast controls.

ASTRA opens when clicked or called using a support button. It provides local, scripted conversation, space jokes, and existing educational support. Its actions play automatically, and motion can be paused in preferences. Optional friendly prompts appear only during active use and can be disabled. Voice input and read-aloud require an explicit user action. Browser speech recognition may use an online service.

Use fictional health records only. This is an educational prototype, not medical care or a real emergency alert system.

Verification: 103 desktop checks and 101 phone/reduced-motion checks passed for the interface effects and existing workflows, including shader output, native controls, locations, reminders, record context, responsive layouts, and offline caching. See [the verification report](docs/verification.md) for the generic design-checker findings and test limits, and [artwork details](docs/generated-assets.md) for the generated asset prompts and saved paths.
