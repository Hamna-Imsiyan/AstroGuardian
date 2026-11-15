# Interface effects

The two supplied component references are adapted to AstroGuardian's existing HTML, CSS, and JavaScript setup. Both implementations live in `components/ui/` and load locally for offline use.

| Effect | Placement | Behaviour |
| --- | --- | --- |
| Spotlight cards | Flight plan, feature destinations, latest measurement cards, wellness tasks | A blue/cyan light follows the pointer across the card, with illuminated edges. Keyboard focus receives a stable glow. |
| Liquid-metal actions | Record a check-in, save measurements, record reminder, save reminder preferences, talk to ASTRA, send a message | Reflective metal lighting, hover/press response, and a click ripple decorate the original native controls. |

Card sizes, page navigation, form submission, reminders, and accessible control names remain part of the existing application. The effects preserve touch scrolling and keyboard focus. The liquid-metal renderer shares one WebGL context and provides a CSS material fallback. Reduced motion and the animation preference in ASTRA's settings stop continuous effects; hidden pages suspend rendering.

The source components are `spotlight-card.js` / `.css` and `liquid-metal-button.js` / `.css`. Elements opt in through `data-spotlight` and `data-liquid-metal`. The offline cache includes all four files.
