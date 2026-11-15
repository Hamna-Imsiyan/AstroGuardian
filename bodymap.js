
// ======================================
// ASTROGUARDIAN - STAGE 5
// Interactive Human Body Map
// ======================================

// 1. GET HTML ELEMENTS

const bodyMap = document.getElementById("bodyMap");

const bodyInfoTitle = document.getElementById(
    "bodyInfoTitle"
);

const bodyInfoDescription = document.getElementById(
    "bodyInfoDescription"
);

const bodyInfoMeasurement = document.getElementById(
    "bodyInfoMeasurement"
);

const bodyInfoGuidance = document.getElementById(
    "bodyInfoGuidance"
);

const bodyInfoSource = document.getElementById(
    "bodyInfoSource"
);


// 2. STORE EDUCATIONAL INFORMATION
//
// This is research-based educational content.
// It does not diagnose medical conditions.

const bodySystems = {

    brain: {
        title: "Brain, Mood & Sleep",

        description:
            "Long-duration missions can disrupt sleep " +
            "and affect behavioral health and performance. " +
            "Isolation, confinement, workload and changes " +
            "in sleep schedules are important considerations.",

        guidance:
            "Review your recorded sleep duration and mood. " +
            "Follow the crew's approved sleep and behavioral " +
            "health procedures, and report persistent concerns " +
            "to the designated medical professional.",

        source:
            "https://www.nasa.gov/hrp/hazards/"
    },

    eyes: {
        title: "Eyes & Vision",

        description:
            "Some astronauts experience changes in eye " +
            "structure or vision during long-duration " +
            "spaceflight. NASA studies Spaceflight-Associated " +
            "Neuro-ocular Syndrome, also called SANS.",

        guidance:
            "Vision changes require an appropriate assessment. " +
            "Use mission-approved vision examinations and " +
            "report concerns to the crew medical professional. " +
            "Daily vital signs cannot diagnose SANS.",

        source:
            "https://www.nasa.gov/glenn/glenn-expertise-" +
            "space-exploration/human-health-performance/" +
            "computational-modeling/" +
            "spaceflight-associated-neuro-ocular-syndrome/"
    },

    heart: {
        title: "Heart & Circulation",

        description:
            "Changes in gravity affect body-fluid " +
            "distribution and cardiovascular adaptation. " +
            "NASA studies how cardiovascular changes " +
            "may affect astronaut health and performance.",

        guidance:
            "Review recorded heart-rate trends and " +
            "follow mission-approved monitoring procedures. " +
            "A heart-rate reading alone cannot establish " +
            "cardiovascular health or diagnose a condition.",

        source:
            "https://www.nasa.gov/hrp/risks/"
    },

    muscles: {
        title: "Muscles & Physical Activity",

        description:
            "Reduced mechanical loading during spaceflight " +
            "can contribute to changes in muscle size, " +
            "strength and endurance. Exercise is an " +
            "important part of spaceflight countermeasures.",

        guidance:
            "Review logged exercise duration and follow " +
            "the crew's prescribed exercise program. " +
            "Exercise minutes do not directly measure " +
            "muscle size, strength or endurance.",

        source:
            "https://www.nasa.gov/hrp/risks/"
    },

    bones: {
        title: "Bones & Skeletal Health",

        description:
            "Reduced loading during spaceflight can " +
            "contribute to bone loss and changes in " +
            "skeletal health, potentially increasing " +
            "fracture risk.",

        guidance:
            "Follow approved exercise and nutrition " +
            "countermeasures. Bone changes require " +
            "appropriate clinical or research measurements; " +
            "they cannot be determined from daily exercise " +
            "minutes alone.",

        source:
            "https://www.nasa.gov/hrp/risks/"
    },

    radiation: {
        title: "Whole-Body Radiation Exposure",

        description:
            "Space radiation is one of NASA's five " +
            "major human spaceflight hazards. Exposure " +
            "may create long-term health risks and " +
            "requires dedicated monitoring and protection.",

        guidance:
            "Follow approved radiation monitoring, " +
            "shielding and shelter procedures. " +
            "Radiation exposure cannot be determined " +
            "from heart rate, mood or sleep measurements.",

        source:
            "https://www.nasa.gov/hrp/hazards/"
    }

};


// 3. REMEMBER THE SELECTED TOPIC

let selectedBodySystem = "heart";


// 4. FIND THE LATEST HEALTH RECORD

function getLatestBodyMapRecord() {

    // healthRecords comes from Stage 2

    if (!Array.isArray(healthRecords)) {
        return null;
    }

    const validRecords = healthRecords
        .filter(record =>
            record && typeof record.date === "string"
        )
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date));

    return validRecords.length > 0
        ? validRecords[validRecords.length - 1]
        : null;
}


// 5. FORMAT A SAVED MEASUREMENT

function formatBodyMeasurement(value, unit) {

    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return "Not recorded";
    }

    return value + " " + unit;
}


// 6. CONNECT TOPICS TO SAVED DATA

function getBodyMeasurement(system, record) {

    if (system === "eyes") {
        return "Vision measurements are not collected " +
            "by the current daily check-in form.";
    }

    if (system === "radiation") {
        return "Radiation exposure is not measured by " +
            "this application. Dedicated dosimetry " +
            "would be required.";
    }

    if (system === "bones") {
        return "Bone density is not measured by the " +
            "current daily check-in form.";
    }

    if (!record) {
        return "No health check-in has been saved yet.";
    }

    if (system === "brain") {

        return "Latest check-in (" + record.date + "): " +
            "Sleep: " +
            formatBodyMeasurement(
                record.sleepHours, "hours"
            ) +
            "; Mood: " +
            formatBodyMeasurement(
                record.mood, "/5"
            ) +
            ". These are self-reported indicators.";
    }

    if (system === "heart") {

        return "Latest check-in (" + record.date + "): " +
            "Heart rate: " +
            formatBodyMeasurement(
                record.heartRate, "bpm"
            ) +
            ". This is a recorded measurement, " +
            "not a medical assessment.";
    }

    if (system === "muscles") {

        return "Latest check-in (" + record.date + "): " +
            "Exercise duration: " +
            formatBodyMeasurement(
                record.exerciseMinutes, "minutes"
            ) +
            ". This records activity duration, " +
            "not muscle strength.";
    }

    return "No corresponding measurement is available.";
}


// 7. UPDATE THE BODY MAP INFORMATION

function renderBodyMap() {

    const system = bodySystems[selectedBodySystem];

    if (!system) {
        return;
    }

    // Display educational information
    bodyInfoTitle.textContent = system.title;

    bodyInfoDescription.textContent =
        system.description;

    bodyInfoGuidance.textContent =
        system.guidance;

    // Link to the relevant NASA source
    bodyInfoSource.href = system.source;

    // Read the latest saved record
    const latestRecord = getLatestBodyMapRecord();

    bodyInfoMeasurement.textContent =
        getBodyMeasurement(
            selectedBodySystem,
            latestRecord
        );

    // Highlight the selected buttons
    const buttons = bodyMap.querySelectorAll(
        "button[data-system]"
    );

    buttons.forEach(function (button) {

        const isSelected =
            button.dataset.system === selectedBodySystem;

        button.setAttribute(
            "aria-pressed",
            String(isSelected)
        );

    });

}


// 8. DETECT WHICH TOPIC THE USER CLICKS

bodyMap.addEventListener("click", function (event) {

    const button = event.target.closest(
        "button[data-system]"
    );

    if (!button || !bodyMap.contains(button)) {
        return;
    }

    const selected = button.dataset.system;

    // Check that the topic exists
    if (!Object.hasOwn(bodySystems, selected)) {
        return;
    }

    selectedBodySystem = selected;

    renderBodyMap();

});


// 9. REFRESH WHEN HEALTH RECORDS CHANGE

window.addEventListener(
    "astroguardian:records-updated",
    renderBodyMap
);


// 10. DISPLAY THE DEFAULT TOPIC

renderBodyMap();
