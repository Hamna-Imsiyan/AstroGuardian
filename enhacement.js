
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
        "and alert the crew medical officer immediately. " +
        "AstroGuardian has not contacted anyone.",

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

            "This demonstration cannot verify breathing " +
            "or replace hands-on emergency training."
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
    heading.textContent = "Training response — not a diagnosis";

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
                "the training guidance first.";
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

const enhEnvironments = {

    station: {
        title: "International Space Station",
        description:
            "Microgravity makes cardiovascular adaptation, " +
            "muscle and bone changes, and sleep important " +
            "research topics.",
        focus:
            "Learning focus: health check-ins, exercise " +
            "and sleep records. Follow the approved " +
            "crew medical procedures."
    },

    transit: {
        title: "Deep-Space Spacecraft",
        description:
            "Distance from Earth can introduce " +
            "communication delays and increase the " +
            "need for onboard medical autonomy.",
        focus:
            "Learning focus: locally available guidance " +
            "and radiation awareness. Clinical thresholds " +
            "do not change automatically."
    },

    moon: {
        title: "Lunar Base Camp",
        description:
            "The Moon has partial gravity. Lunar dust, " +
            "surface activities, radiation, and habitat " +
            "conditions present important challenges.",
        focus:
            "Learning focus: activity, symptoms and " +
            "habitat safety. This application cannot " +
            "measure dust or radiation exposure."
    }
};

const savedMission = enhRead("astroguardian_mission_v1");

if (
    typeof savedMission === "string" &&
    Object.hasOwn(enhEnvironments, savedMission)
) {
    enhMission.value = savedMission;
}

function enhRenderMission() {

    const info = enhEnvironments[enhMission.value];

    document.getElementById("enhMissionTitle").textContent =
        info.title;

    document.getElementById("enhMissionInfo").textContent =
        info.description;

    document.getElementById("enhMissionFocus").textContent =
        info.focus;
}

enhMission.addEventListener("change", () => {

    enhSave("astroguardian_mission_v1", enhMission.value);

    enhRenderMission();
});

enhRenderMission();


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
        guide.how;

    document.getElementById("enhNext").textContent =
        guide.next;

    enhRenderInterpretation();
}

enhMetric.addEventListener("change", enhRenderGuide);

document.getElementById("enhGoToForm")
    .addEventListener("click", () => {

    document.getElementById("healthForm").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    document.getElementById(enhMetric.value).focus({
        preventScroll: true
    });
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

const ENH_REMINDER_KEY =
    "astroguardian_reminder_v1";

const savedReminder = enhRead(ENH_REMINDER_KEY);

let enhReminderState = {

    time:
        savedReminder &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(
            savedReminder.time
        )
        ? savedReminder.time
        : "09:00",

    dismissedDate:
        savedReminder &&
        typeof savedReminder.dismissedDate === "string"
        ? savedReminder.dismissedDate
        : ""
};

const enhReminderTime = document.getElementById(
    "enhReminderTime"
);

const enhReminderBanner = document.getElementById(
    "enhReminderBanner"
);

const enhReminderStatus = document.getElementById(
    "enhReminderStatus"
);

enhReminderTime.value = enhReminderState.time;


// 8. CHECK IF A REMINDER IS DUE

function enhRenderReminder() {

    const today = enhToday();

    const savedToday = enhSortedRecords().some(
        record => record.date === today
    );

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const parts = enhReminderState.time
        .split(":")
        .map(Number);

    const reminderMinutes =
        parts[0] * 60 + parts[1];

    if (savedToday) {

        enhReminderBanner.hidden = true;

        enhReminderStatus.textContent =
            "Today's check-in is complete.";

    } else if (
        enhReminderState.dismissedDate === today
    ) {

        enhReminderBanner.hidden = true;

        enhReminderStatus.textContent =
            "Reminder dismissed for today.";

    } else if (
        currentMinutes >= reminderMinutes
    ) {

        enhReminderBanner.hidden = false;

        enhReminderStatus.textContent =
            "Reminder due since " +
            enhReminderState.time + ".";

    } else {

        enhReminderBanner.hidden = true;

        enhReminderStatus.textContent =
            "Next reminder: " + enhReminderState.time;
    }
}


// 9. SAVE THE REMINDER TIME

document.getElementById("enhSaveReminder")
    .addEventListener("click", () => {

    if (!enhReminderTime.value) {

        enhReminderStatus.textContent =
            "Select a valid reminder time.";

        return;
    }

    enhReminderState.time = enhReminderTime.value;
    enhReminderState.dismissedDate = "";

    if (!enhSave(ENH_REMINDER_KEY, enhReminderState)) {

        enhReminderStatus.textContent =
            "Could not save reminder preference.";

        return;
    }

    enhRenderReminder();
});


// 10. DISMISS THE REMINDER

document.getElementById("enhDismissReminder")
    .addEventListener("click", () => {

    enhReminderState.dismissedDate = enhToday();

    enhSave(ENH_REMINDER_KEY, enhReminderState);

    enhRenderReminder();
});


// 11. OPEN THE HEALTH FORM

document.getElementById("enhOpenCheckIn")
    .addEventListener("click", () => {

    document.getElementById("healthForm").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("recordDate").focus({
        preventScroll: true
    });
});


// 12. UPDATE AFTER HEALTH RECORD CHANGES

window.addEventListener(
    "astroguardian:records-updated",
    () => {

        enhRenderInterpretation();
        enhRenderReminder();
    }
);


// 13. UPDATE REMINDERS WHEN THE TAB IS ACTIVE

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {
        enhRenderReminder();
    }
});

window.addEventListener("focus", enhRenderReminder);

// Check once per minute while the page is running
setInterval(enhRenderReminder, 60000);


// 14. INITIALIZE ENHANCEMENTS

enhRenderGuide();
enhRenderReminder();
