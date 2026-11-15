
/*
  AstroGuardian Enhancements
  Educational prototype — not medical software
*/

// 1. STORAGE HELPERS

function enhRead(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        return null;
    }
}

function enhSave(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Unable to save:", error);
        return false;
    }
}

function enhToday() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

function enhSortedRecords() {
    return healthRecords
        .filter(record =>
            record && typeof record.date === "string"
        )
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date));
}


// =======================================
// 2. EMERGENCY NAVIGATOR
// =======================================

const enhResponsive = document.getElementById("enhResponsive");
const enhBreathing = document.getElementById("enhBreathing");

const enhBreathingGroup = document.getElementById(
    "enhBreathingGroup"
);

const enhEmergencyResult = document.getElementById(
    "enhEmergencyResult"
);

function enhUpdateBreathingQuestion() {
    enhBreathingGroup.hidden =
        enhResponsive.value === "yes" ||
        enhResponsive.value === "";

    enhBreathing.value = "";
    enhEmergencyResult.replaceChildren();
}

enhResponsive.addEventListener(
    "change",
    enhUpdateBreathingQuestion
);

enhBreathing.addEventListener("change", () => {
    enhEmergencyResult.replaceChildren();
});

document.getElementById("enhShowEmergency")
    .addEventListener("click", () => {

    const responsive = enhResponsive.value;
    const breathing = enhBreathing.value;

    enhEmergencyResult.replaceChildren();

    if (!responsive) {
        enhEmergencyResult.textContent =
            "Select responsiveness. In a real emergency, " +
            "activate the onboard response immediately.";
        return;
    }

    const steps = [
        "Activate the onboard emergency response " +
        "and alert the crew medical officer immediately.",

        "Follow the mission-approved emergency checklist " +
        "and obtain assistance from trained crew members."
    ];

    if (responsive === "yes") {

        steps.push(
            "If the astronaut reports chest pain, " +
            "treat it as urgent and follow the crew " +
            "medical officer's assessment instructions.",

            "Do not assume a diagnosis or provide " +
            "medication outside approved procedures."
        );

    } else if (
        responsive === "no" &&
        breathing === "no"
    ) {

        steps.push(
            "An unresponsive person who is not breathing " +
            "normally may be in cardiac arrest. " +
            "The trained crew should immediately follow " +
            "their approved resuscitation procedure, " +
            "including CPR and an AED when available " +
            "and indicated.",

            "Breathing assessment and emergency care " +
            "require trained crew and approved procedures."
        );

    } else if (
        responsive === "no" &&
        breathing === "yes"
    ) {

        steps.push(
            "An unresponsive astronaut needs urgent care " +
            "even if breathing appears normal. Follow " +
            "approved assessment and monitoring procedures."
        );

    } else {

        steps.push(
            "Responsiveness or breathing is uncertain. " +
            "Treat this as urgent and have trained crew " +
            "assess the astronaut under the approved protocol."
        );
    }

    const heading = document.createElement("strong");
    heading.textContent = "Response guidance";

    const list = document.createElement("ol");

    steps.forEach(text => {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
    });

    enhEmergencyResult.append(heading, list);
});


// 3. EMERGENCY VOICE PLAYBACK

const enhSpeakNavigator = document.getElementById(
    "enhSpeakNavigator"
);

if (enhSpeakNavigator) {

    enhSpeakNavigator.addEventListener("click", () => {

        const text = enhEmergencyResult.textContent.trim();

        if (!text) {
            enhEmergencyResult.textContent =
                "Select observations and display " +
                "the response guidance first.";
            return;
        }

        if (!("speechSynthesis" in window)) {
            return;
        }

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 0.9;

        window.speechSynthesis.speak(speech);
    });
}


// =======================================
// 4. MISSION ENVIRONMENTS
// =======================================

const enhMission = document.getElementById("enhMission");
const ENH_MISSION_KEY = "astroguardian_mission_v1";

const enhEnvironments = {
    station: {
        title: "Space station",
        description:
            "Keep your station check-ins consistent by noting the onboard " +
            "schedule and whether you have just rested, exercised, or " +
            "finished a work period.",
        focus:
            "Use approved onboard instruments and record measurement " +
            "conditions. Your mission location does not change clinical thresholds.",
        context:
            "Station check-in: use approved onboard instruments and note " +
            "rest, exercise, and the station schedule alongside your measurements.",
        reminder:
            "Your station check-in is due. When your duties allow, record " +
            "your measurements with approved onboard instruments and note recent activity."
    },
    space: {
        title: "Open space / EVA",
        description:
            "During an EVA, keep your attention on your crew's approved " +
            "tasks and suit procedures. A routine manual check-in can wait " +
            "until you are safely back in a pressurized habitat.",
        focus:
            "Do not remove your suit or equipment to take a reading. " +
            "This workspace has no connection to suit telemetry and " +
            "does not change clinical thresholds.",
        context:
            "EVA check-in: record routine measurements only when safely " +
            "back in a pressurized habitat. Do not remove your suit or " +
            "equipment to take a reading. Note the EVA and measurement timing.",
        reminder:
            "Your check-in is due. Record it when safely back in a " +
            "pressurized habitat. Do not remove your suit or equipment " +
            "to take a reading during EVA."
    },
    moon: {
        title: "Moon base camp",
        description:
            "Keep habitat and surface-activity context with your lunar " +
            "check-ins so you can distinguish measurements recorded " +
            "before and after a surface task.",
        focus:
            "Use approved instruments in the habitat and follow your " +
            "crew's surface-return procedures. Location selection does " +
            "not measure dust or radiation exposure or change clinical thresholds.",
        context:
            "Moon check-in: record in the habitat with approved instruments. " +
            "Note recent surface activity and whether the reading was " +
            "taken before or after it.",
        reminder:
            "Your Moon base check-in is due. When safely in the habitat " +
            "and your duties allow, record your measurements and note " +
            "recent surface activity."
    }
};

function enhNormalizeMission(value) {
    if (value === "transit") return "space";
    return typeof value === "string" && Object.hasOwn(enhEnvironments, value)
        ? value : "station";
}

const savedMission = enhRead(ENH_MISSION_KEY);
let enhMissionLocation = enhNormalizeMission(savedMission);
if (savedMission === "transit") enhSave(ENH_MISSION_KEY, "space");

const enhMissionSelectors = [...new Set([
    enhMission,
    ...document.querySelectorAll("select[data-mission-select]")
].filter(Boolean))];

function enhSetText(element, text) {
    if (element && element.textContent !== text) element.textContent = text;
}

function enhMissionMessage(message) {
    const outputs = new Set([
        document.getElementById("missionLocationStatus"),
        ...document.querySelectorAll("[data-mission-status]")
    ]);
    outputs.forEach(output => enhSetText(output, message));
}

function enhRenderMission() {
    const info = enhEnvironments[enhMissionLocation];
    enhMissionSelectors.forEach(selector => { selector.value = enhMissionLocation; });
    enhSetText(document.getElementById("enhMissionTitle"), info.title);
    enhSetText(document.getElementById("enhMissionInfo"), info.description);
    enhSetText(document.getElementById("enhMissionFocus"), info.focus);
    document.querySelectorAll("[data-mission-name]").forEach(output => enhSetText(output, info.title));
    document.querySelectorAll("[data-mission-context]").forEach(output => enhSetText(output, info.context));
    enhRenderGuide();
}

function enhAnnounceMission() {
    window.dispatchEvent(new CustomEvent("astroguardian:mission-changed", {
        detail: { location: enhMissionLocation, title: enhEnvironments[enhMissionLocation].title }
    }));
}

function enhSetMission(location) {
    if (!Object.hasOwn(enhEnvironments, location)) {
        enhRenderMission();
        return false;
    }
    if (location === enhMissionLocation) {
        enhRenderMission();
        return true;
    }
    if (!enhSave(ENH_MISSION_KEY, location)) {
        enhRenderMission();
        enhMissionMessage("Could not save your mission location. Your previous setting is unchanged.");
        return false;
    }
    enhMissionLocation = location;
    enhRenderMission();
    enhMissionMessage("Mission location set to " + enhEnvironments[location].title + ".");
    enhAnnounceMission();
    return true;
}

enhMissionSelectors.forEach(selector => {
    selector.addEventListener("change", () => enhSetMission(selector.value));
});

window.AstroMission = {
    getLocation: () => enhMissionLocation,
    getEnvironment: () => ({ location: enhMissionLocation, ...enhEnvironments[enhMissionLocation] }),
    setLocation: enhSetMission
};


// =======================================
// 5. GUIDED HEALTH MEASUREMENTS
// =======================================

const enhGuides = {

    heartRate: {
        unit: "bpm",

        why:
            "Heart rate is a cardiovascular measurement. " +
            "One reading alone cannot diagnose a problem.",

        how:
            "Use the approved onboard pulse monitor. " +
            "Record whether the measurement was taken " +
            "at rest or after activity, and note symptoms.",

        next:
            "If unexpected, verify the measurement " +
            "using the approved procedure. Report " +
            "persistent concerns or symptoms to the " +
            "crew medical officer. Chest pain or collapse " +
            "requires an immediate emergency response."
    },

    temperature: {
        unit: "°C",

        why:
            "Temperature may provide useful information " +
            "about physical condition. Interpretation " +
            "depends on the measurement method and context.",

        how:
            "Use the designated thermometer according " +
            "to its instructions. Record the measurement " +
            "site and use a consistent method.",

        next:
            "Check the measurement technique if the " +
            "reading is unexpected. Follow approved " +
            "medical procedures for repeated unusual " +
            "readings or associated symptoms."
    },

    sleepHours: {
        unit: "hours",

        why:
            "Sleep affects concentration, performance " +
            "and well-being during long missions.",

        how:
            "Record your sleeping and waking times. " +
            "Estimate total time asleep and note " +
            "interruptions or disturbances.",

        next:
            "Review your sleep history and schedule. " +
            "Report persistent sleep difficulties " +
            "through approved crew medical procedures."
    },

    exerciseMinutes: {
        unit: "minutes",

        why:
            "Exercise helps maintain physical conditioning " +
            "during spaceflight. Minutes alone do not " +
            "measure muscle strength or bone health.",

        how:
            "Log the actual time spent exercising " +
            "according to the approved crew exercise plan.",

        next:
            "Review unusual changes and report " +
            "unexpected physical limitations to the " +
            "designated crew professional. Do not exercise " +
            "through a medical emergency."
    },

    mood: {
        unit: "/5",

        why:
            "Self-reported mood can help monitor " +
            "well-being during isolation and confinement.",

        how:
            "Choose a score from 1 to 5 using a " +
            "consistent interpretation each day. " +
            "Include a brief note when useful.",

        next:
            "If emotional distress is severe, sudden " +
            "or ongoing, contact the designated medical " +
            "or behavioral-health professional " +
            "according to mission guidance."
    }
};

const enhMetric = document.getElementById("enhMetric");

function enhRenderGuide() {

    const guide = enhGuides[enhMetric.value];

    document.getElementById("enhWhy").textContent =
        guide.why;

    document.getElementById("enhHow").textContent =
        guide.how + " " + enhEnvironments[enhMissionLocation].context;

    document.getElementById("enhNext").textContent =
        guide.next;

    enhRenderInterpretation();
}

enhMetric.addEventListener("change", enhRenderGuide);

document.getElementById("enhGoToForm")
    .addEventListener("click", () => {

    openAstroPage("check-in", enhMetric.value);
});


// =======================================
// 6. PERSONALIZED DATA INTERPRETATION
// =======================================

function enhRenderInterpretation() {

    const output = document.getElementById(
        "enhInterpretation"
    );

    const records = enhSortedRecords();

    const key = enhMetric.value;
    const guide = enhGuides[key];

    if (records.length < 4) {

        output.textContent =
            "You have " + records.length +
            " check-ins. Save at least four to " +
            "compare the latest measurement with " +
            "three earlier check-ins.";

        return;
    }

    const latest = records[records.length - 1];

    const earlier = records.slice(-4, -1);

    const values = earlier.map(record =>
        Number(record[key])
    );

    const current = Number(latest[key]);

    if (
        !Number.isFinite(current) ||
        !values.every(Number.isFinite)
    ) {

        output.textContent =
            "Not enough valid measurements are available.";

        return;
    }

    const average = values.reduce(
        (sum, value) => sum + value,
        0
    ) / 3;

    const difference = current - average;

    const direction = difference > 0
        ? "above"
        : difference < 0
            ? "below"
            : "equal to";

    const unit = guide.unit;

    output.textContent =
        "Latest value (" + latest.date + "): " +
        current.toFixed(1) + " " + unit + ". " +

        "Previous three-check-in average: " +
        average.toFixed(1) + " " + unit + ". " +

        "Difference: " +
        Math.abs(difference).toFixed(1) + " " +
        unit + " " + direction + " the average. " +

        "This shows a personal trend, not whether " +
        "a measurement is medically normal. " +
        "Review symptoms and measurement conditions, " +
        "and follow approved crew medical guidance.";
}


// =======================================
// 7. DAILY MEASUREMENT REMINDERS
// =======================================

const ENH_REMINDER_KEY = "astroguardian_reminder_v1";
const ENH_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const ENH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function enhNormalizeReminder(value) {
    const valid = value && typeof value === "object" && ENH_TIME_PATTERN.test(value.time);
    return {
        // A previously saved time was an enabled reminder in the older app.
        enabled: Boolean(valid && (typeof value.enabled === "boolean" ? value.enabled : true)),
        time: valid ? value.time : "09:00",
        dismissedDate: valid && typeof value.dismissedDate === "string" && ENH_DATE_PATTERN.test(value.dismissedDate)
            ? value.dismissedDate : "",
        snoozedUntil: valid && Number.isFinite(value.snoozedUntil) && value.snoozedUntil > 0
            ? value.snoozedUntil : 0
    };
}

let enhReminderState = enhNormalizeReminder(enhRead(ENH_REMINDER_KEY));
const enhReminderTime = document.getElementById("enhReminderTime");
const enhReminderEnabled = document.getElementById("enhReminderEnabled");
const enhReminderBanner = document.getElementById("enhReminderBanner");
const enhReminderMessage = document.getElementById("enhReminderMessage");
const enhReminderStatus = document.getElementById("enhReminderStatus");
let enhReminderFeedback = "";
let enhReminderError = false;
let enhReminderTimer = null;

function enhSyncReminderControls() {
    if (enhReminderTime) enhReminderTime.value = enhReminderState.time;
    if (enhReminderEnabled) enhReminderEnabled.checked = enhReminderState.enabled;
}

function enhClockTime(timestamp) {
    const date = new Date(timestamp);
    return String(date.getHours()).padStart(2, "0") + ":" +
        String(date.getMinutes()).padStart(2, "0");
}

function enhReminderDueTime(now) {
    const [hours, minutes] = enhReminderState.time.split(":").map(Number);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0).getTime();
}

function enhScheduleReminderCheck(now, dueAt) {
    clearTimeout(enhReminderTimer);
    enhReminderTimer = null;
    if (document.hidden) return;
    const untilDue = dueAt - now.getTime();
    const untilSnooze = enhReminderState.snoozedUntil - now.getTime();
    const delays = [60000];
    if (enhReminderState.enabled && untilDue > 0) delays.push(untilDue);
    if (enhReminderState.enabled && untilSnooze > 0) delays.push(untilSnooze);
    enhReminderTimer = setTimeout(() => {
        enhReminderTimer = null;
        if (!document.hidden) enhRenderReminder();
    }, Math.max(1000, Math.min(...delays)));
}

function enhRenderReminder() {
    const now = new Date();
    const today = enhToday();
    const dueAt = enhReminderDueTime(now);
    const recorded = enhSortedRecords().some(record => record.date === today);
    const snoozed = enhReminderState.snoozedUntil > now.getTime();
    let summary;
    let compact;
    let visible = false;

    if (!enhReminderState.enabled) {
        summary = "Check-in reminders are off. In-app reminders work while this workspace is open.";
        compact = "Off";
    } else if (recorded) {
        summary = "Today's check-in is complete. Next reminder tomorrow at " + enhReminderState.time + ".";
        compact = "Done today";
    } else if (enhReminderState.dismissedDate === today) {
        summary = "Reminder dismissed for today. Next reminder tomorrow at " + enhReminderState.time + ".";
        compact = "Dismissed today";
    } else if (now.getTime() >= dueAt && snoozed) {
        summary = "Reminder snoozed until " + enhClockTime(enhReminderState.snoozedUntil) + ".";
        compact = "Snoozed until " + enhClockTime(enhReminderState.snoozedUntil);
    } else if (now.getTime() >= dueAt) {
        visible = true;
        summary = "Check-in due since " + enhReminderState.time + " · " + enhEnvironments[enhMissionLocation].title + ".";
        compact = "Due: " + enhReminderState.time;
    } else {
        summary = "Next check-in reminder today at " + enhReminderState.time + ". In-app while your workspace is open.";
        compact = "Next: " + enhReminderState.time;
    }

    if (enhReminderBanner) enhReminderBanner.hidden = !visible;
    enhSetText(enhReminderMessage, enhEnvironments[enhMissionLocation].reminder +
        (enhReminderError ? " " + enhReminderFeedback : ""));
    enhSetText(enhReminderStatus, enhReminderFeedback ? enhReminderFeedback + " " + summary : summary);
    document.querySelectorAll("[data-reminder-summary]").forEach(output =>
        enhSetText(output, compact));
    enhScheduleReminderCheck(now, dueAt);
}

function enhCommitReminder(next, confirmation) {
    // Apply state only after durable storage accepts the entire preference.
    if (!enhSave(ENH_REMINDER_KEY, next)) {
        enhSyncReminderControls();
        enhReminderFeedback = "Could not save reminder settings. Your previous setting is unchanged.";
        enhReminderError = true;
        enhRenderReminder();
        return false;
    }
    enhReminderState = next;
    enhReminderFeedback = confirmation;
    enhReminderError = false;
    enhSyncReminderControls();
    enhRenderReminder();
    window.dispatchEvent(new CustomEvent("astroguardian:reminder-changed", {
        detail: { enabled: next.enabled, time: next.time }
    }));
    return true;
}

function enhSaveReminderSettings(allowDisableWithoutTime = false) {
    const enabled = Boolean(enhReminderEnabled?.checked);
    const proposedTime = enhReminderTime?.value || "";
    if ((!allowDisableWithoutTime || enabled) && !ENH_TIME_PATTERN.test(proposedTime)) {
        if (enhReminderEnabled) enhReminderEnabled.checked = enhReminderState.enabled;
        enhReminderFeedback = "Choose a valid reminder time from 00:00 to 23:59.";
        enhReminderError = true;
        enhRenderReminder();
        return false;
    }
    return enhCommitReminder({
        enabled,
        time: ENH_TIME_PATTERN.test(proposedTime) ? proposedTime : enhReminderState.time,
        dismissedDate: "",
        snoozedUntil: 0
    }, enabled ? "Reminder saved for " + proposedTime + "." : "Check-in reminders turned off.");
}

document.getElementById("enhSaveReminder")?.addEventListener("click", () => enhSaveReminderSettings());
enhReminderEnabled?.addEventListener("change", () => enhSaveReminderSettings(true));

document.getElementById("enhDismissReminder")?.addEventListener("click", () => {
    if (!enhReminderState.enabled) return;
    enhCommitReminder({ ...enhReminderState, dismissedDate: enhToday(), snoozedUntil: 0 },
        "Reminder dismissed for today.");
});

document.getElementById("enhSnoozeReminder")?.addEventListener("click", () => {
    if (!enhReminderState.enabled) return;
    enhCommitReminder({ ...enhReminderState, dismissedDate: "", snoozedUntil: Date.now() + 10 * 60 * 1000 },
        "Reminder snoozed for 10 minutes.");
});

document.getElementById("enhOpenCheckIn")?.addEventListener("click", () => {
    openAstroPage("check-in", "recordDate");
});

window.addEventListener("astroguardian:records-updated", () => {
    enhRenderInterpretation();
    enhRenderReminder();
});
window.addEventListener("astroguardian:mission-changed", enhRenderReminder);
window.addEventListener("astroguardian:page-changed", enhRenderReminder);
window.addEventListener("focus", enhRenderReminder);
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        clearTimeout(enhReminderTimer);
        enhReminderTimer = null;
    } else enhRenderReminder();
});
window.addEventListener("pagehide", () => {
    clearTimeout(enhReminderTimer);
    enhReminderTimer = null;
});
window.addEventListener("pageshow", enhRenderReminder);

window.addEventListener("storage", event => {
    if (event.key === ENH_MISSION_KEY || event.key === null) {
        const location = enhNormalizeMission(enhRead(ENH_MISSION_KEY));
        if (location !== enhMissionLocation) {
            enhMissionLocation = location;
            enhRenderMission();
            enhMissionMessage("Mission location updated from another open workspace.");
            enhAnnounceMission();
        }
    }
    if (event.key === ENH_REMINDER_KEY || event.key === null) {
        enhReminderState = enhNormalizeReminder(enhRead(ENH_REMINDER_KEY));
        enhReminderFeedback = "";
        enhReminderError = false;
        enhSyncReminderControls();
        enhRenderReminder();
    }
});

// Initialize after all guides, controls, and event handlers are ready.
enhSyncReminderControls();
enhRenderMission();
enhRenderReminder();
enhAnnounceMission();
