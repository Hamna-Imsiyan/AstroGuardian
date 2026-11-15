/* ASTRA's optional station companion. Chat stays closed until requested. */
(function () {
    "use strict";
    const assistant = document.getElementById("astraAssistant");
    if (!assistant || document.getElementById("astraCompanionLauncher")) return;

    const PREFERENCES_KEY = "astroguardian_companion_preferences_v1";
    let preferences = { nudges: true, motion: true };
    try {
        const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY));
        if (saved && typeof saved === "object") {
            preferences.nudges = saved.nudges !== false;
            preferences.motion = saved.motion !== false;
        }
    } catch (_) { /* Browser storage is optional. */ }

    const home = document.createComment("ASTRA returns here when the support dialog closes");
    assistant.before(home);
    const dock = document.createElement("aside");
    dock.className = "companion-dock";
    dock.setAttribute("aria-label", "ASTRA companion");
    dock.innerHTML = `
        <div id="astraCompanionNudge" class="companion-nudge" hidden>
            <button type="button" class="companion-nudge-dismiss" aria-label="Dismiss ASTRA's message">×</button>
            <span class="companion-eyebrow">A MOMENT WITH ASTRA</span>
            <p id="astraCompanionNudgeText" role="status"></p>
            <div class="companion-nudge-actions">
                <button type="button" data-companion-chat>Let's chat</button>
                <button type="button" data-companion-disable>Turn off check-ins</button>
            </div>
        </div>
        <button id="astraCompanionLauncher" class="companion-launcher" type="button"
                aria-label="Talk to ASTRA"
                aria-haspopup="dialog" aria-controls="astraCompanionDialog" aria-expanded="false">
            <span class="companion-launcher-art companion-character" aria-hidden="true">
                <img class="companion-character-body" src="assets/astra-companion-3d.png" alt="" width="1024" height="1024">
            </span>
            <span class="companion-launcher-label">Talk to ASTRA</span>
        </button>`;
    document.body.appendChild(dock);

    const dialog = document.createElement("dialog");
    dialog.id = "astraCompanionDialog";
    dialog.className = "companion-dialog";
    dialog.setAttribute("aria-labelledby", "astraCompanionDialogTitle");
    dialog.innerHTML = `
        <div class="companion-dialog-bar">
            <div><span class="companion-online-dot" aria-hidden="true"></span><strong id="astraCompanionDialogTitle">Your station companion</strong></div>
            <button type="button" class="companion-close" aria-label="Close ASTRA support">×</button>
        </div>
        <div class="companion-dialog-content"></div>`;
    document.body.appendChild(dialog);

    // The character moves automatically; the user only needs to start a conversation.
    const companionIntro = document.createElement("div");
    companionIntro.className = "companion-intro";
    companionIntro.innerHTML = `
        <div class="companion-portrait companion-character" aria-hidden="true">
            <img class="companion-character-body" src="assets/astra-companion-3d.png" alt="" width="1024" height="1024">
        </div>
        <div class="companion-intro-copy">
            <span class="companion-eyebrow">A LITTLE COMPANY, ANYTIME</span>
            <p>Share a story. Take a joke break. Say hello.</p>
        </div>`;
    const chat = document.getElementById("astraChat");
    chat.before(companionIntro);
    const suggestions = document.createElement("div");
    suggestions.className = "astra-suggestions companion-conversation-prompts";
    suggestions.innerHTML = `
        <button type="button" data-astra-prompt="Tell me a joke">Tell me a joke</button>
        <button type="button" data-astra-prompt="Ask me about myself">Ask about my day</button>
        <button type="button" data-astra-prompt="Keep me company">Keep me company</button>`;
    companionIntro.after(suggestions);

    const settings = document.createElement("div");
    settings.className = "companion-preferences";
    settings.innerHTML = `
        <label><input id="astraCompanionNudges" type="checkbox"> Occasional friendly check-ins</label>
        <label><input id="astraCompanionMotion" type="checkbox"> Animate ASTRA and interface effects</label>
        <p>Friendly check-ins are optional. Voice listens only when you choose Speak.</p>`;
    assistant.appendChild(settings);
    const nudgePreference = settings.querySelector("#astraCompanionNudges");
    const motionPreference = settings.querySelector("#astraCompanionMotion");
    nudgePreference.checked = preferences.nudges;
    motionPreference.checked = preferences.motion;
    const subtitle = assistant.querySelector(".astra-heading .muted");
    if (subtitle) subtitle.textContent = "A friendly chat, a space joke, or help with your saved records.";
    const eyebrow = assistant.querySelector(":scope > .eyebrow");
    if (eyebrow) eyebrow.textContent = "ASTROGUARDIAN / STATION COMPANION";
    const input = document.getElementById("astraQuestion");
    if (input) input.placeholder = "Ask for a joke, or tell me about your day…";

    // Keep the conversation composer in view; advanced support remains one click away.
    const supportOptions = document.createElement("details");
    supportOptions.className = "companion-support-options";
    const supportSummary = document.createElement("summary");
    supportSummary.textContent = "Voice, health topics & preferences";
    supportOptions.appendChild(supportSummary);
    const healthTopicsTitle = assistant.querySelector(":scope > h3");
    const healthTopics = assistant.querySelector(".astra-suggestions:not(.companion-conversation-prompts)");
    const voiceControls = assistant.querySelector(".astra-voice-controls");
    const voiceStatus = document.getElementById("astraVoiceStatus");
    [healthTopicsTitle, healthTopics, voiceControls, voiceStatus, settings].forEach(element => {
        if (element) supportOptions.appendChild(element);
    });
    document.getElementById("astraForm").after(supportOptions);

    const launcher = dock.querySelector(".companion-launcher");
    const nudge = dock.querySelector(".companion-nudge");
    const nudgeText = dock.querySelector("#astraCompanionNudgeText");
    const dialogContent = dialog.querySelector(".companion-dialog-content");
    let returnFocus = null;
    let motionTimer = null;
    let autoMotionTimer = null;
    let autoMotionIndex = 0;
    let lastActionAt = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let nudgeTimer = null;
    let dismissTimer = null;
    let activeAt = Date.now();
    let nudgeIndex = 0;
    let nudgePrompt = "Hello ASTRA";
    const nudges = [
        { text: "A tiny break? What song would you put on for the journey home?", prompt: "Let's talk about music" },
        { text: "My Moon party had no atmosphere. Want another very small space joke?", prompt: "Tell me a joke" },
        { text: "Beyond the mission checklist: what has made you smile today?", prompt: "Ask me about myself" },
        { text: "If you had a free afternoon back on Earth, where would you go?", prompt: "Keep me company" }
    ];

    function savePreferences() {
        try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch (_) { /* Session-only fallback. */ }
        nudgePreference.checked = preferences.nudges;
        motionPreference.checked = preferences.motion;
        document.documentElement.classList.toggle("companion-motion-paused", !preferences.motion);
        syncMotion();
    }

    function resetMotion() {
        clearTimeout(motionTimer);
        document.querySelectorAll(".companion-character").forEach(character => {
            character.classList.remove("is-waving", "is-jumping", "is-floating");
        });
    }

    function act(action) {
        if (!["wave", "jump", "float"].includes(action)) return;
        resetMotion();
        if (!motionAllowed()) return;
        lastActionAt = Date.now();
        const className = { wave: "is-waving", jump: "is-jumping", float: "is-floating" }[action];
        document.querySelectorAll(".companion-character").forEach(character => {
            // Reflow lets the same action play again after a second deliberate click.
            void character.offsetWidth;
            character.classList.add(className);
        });
        motionTimer = setTimeout(resetMotion, action === "float" ? 4400 : 2400);
    }

    function motionAllowed() {
        return preferences.motion && !document.hidden && !motionQuery.matches;
    }

    function scheduleAutoMotion(delay) {
        clearTimeout(autoMotionTimer);
        if (!motionAllowed()) return;
        autoMotionTimer = setTimeout(() => {
            const sequence = ["wave", "float", "jump", "float"];
            act(sequence[autoMotionIndex % sequence.length]);
            autoMotionIndex += 1;
            scheduleAutoMotion(18000);
        }, delay);
    }

    function stopMotion() {
        clearTimeout(autoMotionTimer);
        resetMotion();
        document.documentElement.classList.remove("companion-auto-motion");
    }

    function syncMotion() {
        if (!motionAllowed()) { stopMotion(); return; }
        document.documentElement.classList.add("companion-auto-motion");
        scheduleAutoMotion(14000);
    }

    function hideNudge() {
        nudge.hidden = true;
        clearTimeout(dismissTimer);
    }

    function open(options) {
        hideNudge();
        if (dialog.open) {
            if (input) input.focus();
            return;
        }
        returnFocus = document.activeElement;
        dialogContent.appendChild(assistant);
        dialog.showModal();
        launcher.setAttribute("aria-expanded", "true");
        document.body.classList.add("companion-dialog-open");
        dialog.querySelector(".companion-close").focus();
        syncMotion();
        if (!(options && options.quiet)) act("wave");
    }

    function close() {
        if (!dialog.open) return;
        dialog.close();
        home.after(assistant);
        document.body.classList.remove("companion-dialog-open");
        launcher.setAttribute("aria-expanded", "false");
        window.dispatchEvent(new Event("astroguardian:assistant-closed"));
        resetMotion();
        // Return focus only to visible controls. Navigation may have changed pages.
        const focusTarget = returnFocus && returnFocus.isConnected && returnFocus.getClientRects().length ? returnFocus : launcher;
        focusTarget.focus();
        scheduleNudge(300000);
    }

    function scheduleNudge(delay) {
        clearTimeout(nudgeTimer);
        if (!preferences.nudges || document.hidden) return;
        nudgeTimer = setTimeout(maybeNudge, delay);
    }

    function maybeNudge() {
        if (!preferences.nudges) return;
        const focused = document.activeElement;
        const enteringData = focused && (focused.matches("input, textarea, select") || focused.isContentEditable);
        const assistantVisible = assistant.getClientRects().length > 0;
        const focusedPage = ["check-in", "emergency"].includes(document.body.dataset.currentPage);
        if (document.hidden || dialog.open || enteringData || focusedPage || assistantVisible || Date.now() - activeAt > 60000) {
            scheduleNudge(30000);
            return;
        }
        const message = nudges[nudgeIndex % nudges.length];
        nudgeIndex += 1;
        nudgeText.textContent = message.text;
        nudgePrompt = message.prompt;
        nudge.hidden = false;
        act("wave");
        dismissTimer = setTimeout(hideNudge, 20000);
        scheduleNudge(300000);
    }

    launcher.addEventListener("click", () => open());
    dialog.querySelector(".companion-close").addEventListener("click", close);
    dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
    dialog.addEventListener("click", event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    });
    dock.querySelector(".companion-nudge-dismiss").addEventListener("click", hideNudge);
    dock.querySelector("[data-companion-chat]").addEventListener("click", () => {
        open();
        if (window.AstraSupport) window.AstraSupport.ask(nudgePrompt);
    });
    dock.querySelector("[data-companion-disable]").addEventListener("click", () => {
        preferences.nudges = false;
        savePreferences();
        clearTimeout(nudgeTimer);
        hideNudge();
    });
    nudgePreference.addEventListener("change", () => {
        preferences.nudges = nudgePreference.checked;
        savePreferences();
        hideNudge();
        scheduleNudge(120000);
    });
    motionPreference.addEventListener("change", () => {
        preferences.motion = motionPreference.checked;
        savePreferences();
    });
    document.addEventListener("click", event => {
        const opener = event.target.closest("[data-open-assistant]");
        // The app shell may already dispatch the open event for this same click.
        // Avoid a second open focusing the input and jumping past the character.
        if (opener) { event.preventDefault(); if (!dialog.open) open(); }
    });
    window.addEventListener("astroguardian:open-assistant", () => open());
    window.addEventListener("astroguardian:companion-motion", event => act(event.detail && event.detail.action));
    window.addEventListener("astroguardian:emergency-request", close);
    document.addEventListener("pointerdown", () => { activeAt = Date.now(); }, { passive: true });
    document.addEventListener("keydown", () => { activeAt = Date.now(); }, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) { clearTimeout(nudgeTimer); hideNudge(); stopMotion(); }
        else { activeAt = Date.now(); syncMotion(); scheduleNudge(120000); }
    });
    window.addEventListener("pagehide", () => {
        clearTimeout(nudgeTimer);
        clearTimeout(dismissTimer);
        stopMotion();
    });
    window.addEventListener("pageshow", () => { syncMotion(); scheduleNudge(120000); });
    motionQuery.addEventListener("change", syncMotion);
    new MutationObserver(mutations => {
        const replyAdded = mutations.some(mutation => [...mutation.addedNodes].some(node => node.nodeType === 1 && node.classList.contains("astra-bot")));
        if (replyAdded && Date.now() - lastActionAt > 600) act("float");
    }).observe(chat, { childList: true });
    savePreferences();
    scheduleNudge(120000);
    window.AstraCompanion = { open, close, act };
})();
