
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

    if (typeof healthRecords === "undefined" || !Array.isArray(healthRecords)) {
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

// The supplied artwork is a flat silhouette. Turning the image gives a useful
// front/back viewing interaction without implying a three-dimensional scan.
function initializeBodyViewer() {
    const figure = bodyMap.querySelector(".body-figure");
    const visual = bodyMap.querySelector(".bodymap-visual");

    if (!figure || !visual || figure.dataset.viewerReady) return;
    figure.dataset.viewerReady = "true";
    visual.classList.add("body-viewer");

    const oldArtwork = figure.querySelector("svg");
    if (oldArtwork) oldArtwork.remove();
    const oldCaption = visual.querySelector(".bodymap-caption");
    if (oldCaption) oldCaption.remove();

    const header = document.createElement("div");
    header.className = "body-viewer-header";
    const label = document.createElement("span");
    label.textContent = "BODY EXPLORER";
    const orientation = document.createElement("span");
    orientation.id = "bodyOrientation";
    orientation.setAttribute("role", "status");
    orientation.setAttribute("aria-live", "polite");
    header.append(label, orientation);
    visual.prepend(header);

    const image = document.createElement("img");
    image.className = "body-reference-image";
    image.src = "assets/body-silhouette.png";
    image.alt = "Human silhouette supplied for the educational body explorer";
    image.draggable = false;
    image.width = 639;
    image.height = 360;
    figure.prepend(image);

    figure.tabIndex = 0;
    figure.setAttribute("role", "group");
    figure.setAttribute("aria-label", "Rotate the body silhouette");
    figure.setAttribute("aria-describedby", "bodyRotationHelp");

    const help = document.createElement("p");
    help.id = "bodyRotationHelp";
    help.className = "body-rotation-help";
    help.textContent = "Drag to turn · Arrow keys to rotate · Home to reset";

    const controls = document.createElement("div");
    controls.className = "body-rotation-controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Silhouette rotation controls");

    function makeControl(text, action, description) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.dataset.bodyRotation = action;
        button.setAttribute("aria-label", description || text);
        controls.appendChild(button);
        return button;
    }

    makeControl("↶", "left", "Rotate silhouette left by 45 degrees");
    const frontButton = makeControl("Front", "front", "Show front orientation");
    const backButton = makeControl("Back", "back", "Show back orientation");
    makeControl("↷", "right", "Rotate silhouette right by 45 degrees");
    makeControl("Reset", "reset", "Reset silhouette to front orientation");

    const note = document.createElement("p");
    note.className = "body-viewer-disclaimer";
    note.textContent = "2D silhouette rotation · Educational illustration, not a body scan.";
    visual.append(help, controls, note);

    const pointPositions = {
        // Keep head controls at least 56px apart in the 400px mobile viewer,
        // including while horizontal positions converge during rotation.
        brain: { x: 50, y: 7 },
        eyes: { x: 46, y: 21 },
        heart: { x: 54, y: 35 },
        muscles: { x: 36, y: 48 },
        bones: { x: 47, y: 75 },
        radiation: { x: 67, y: 61 }
    };
    const points = Array.from(figure.querySelectorAll("button[data-system]"));
    const pointLabels = new Map(points.map(point => [point, point.getAttribute("aria-label")]));
    let angle = 0;
    let drag = null;

    function normalizedAngle() {
        return ((angle % 360) + 360) % 360;
    }

    function updateRotation(announce = true) {
        const degrees = normalizedAngle();
        const cosine = Math.cos(degrees * Math.PI / 180);
        const isBack = cosine < 0;
        const isEdge = Math.abs(cosine) < 0.36;
        figure.style.setProperty("--body-angle", angle + "deg");
        figure.dataset.orientation = isBack ? "back" : "front";
        figure.classList.toggle("body-edge-on", isEdge);
        points.forEach(point => {
            const position = pointPositions[point.dataset.system];
            if (!position) return;
            point.style.left = (50 + (position.x - 50) * cosine) + "%";
            point.style.top = position.y + "%";
            // Screen-facing labels stay legible while the silhouette turns.
            // At side angles the accessible topic buttons below remain available.
            point.hidden = isEdge;
            point.setAttribute("aria-label", pointLabels.get(point) + (isBack ? " (back orientation)" : " (front orientation)"));
        });
        frontButton.setAttribute("aria-pressed", String(degrees === 0));
        backButton.setAttribute("aria-pressed", String(degrees === 180));
        if (announce) {
            orientation.textContent = (isEdge ? "Side" : isBack ? "Back" : "Front") + " · " + Math.round(degrees) + "°";
        }
    }

    controls.addEventListener("click", event => {
        const button = event.target.closest("button[data-body-rotation]");
        if (!button) return;
        const action = button.dataset.bodyRotation;
        if (action === "left") angle -= 45;
        if (action === "right") angle += 45;
        if (action === "front" || action === "reset") angle = 0;
        if (action === "back") angle = 180;
        updateRotation();
    });

    figure.addEventListener("keydown", event => {
        if (event.target !== figure) return;
        if (event.key === "ArrowLeft") angle -= 15;
        else if (event.key === "ArrowRight") angle += 15;
        else if (event.key === "Home") angle = 0;
        else if (event.key === "End") angle = 180;
        else return;
        event.preventDefault();
        updateRotation();
    });

    figure.addEventListener("pointerdown", event => {
        if (drag || event.isPrimary === false) return;
        if (event.button !== 0 || event.target.closest("button")) return;
        drag = { pointerId: event.pointerId, startX: event.clientX, angle };
        figure.setPointerCapture(event.pointerId);
        figure.classList.add("is-dragging");
    });
    figure.addEventListener("pointermove", event => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        angle = drag.angle + (event.clientX - drag.startX) * 0.8;
        updateRotation(false);
    });
    function finishDrag(event) {
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (event.type === "pointercancel") angle = drag.angle;
        drag = null;
        figure.classList.remove("is-dragging");
        if (figure.hasPointerCapture(event.pointerId)) figure.releasePointerCapture(event.pointerId);
        updateRotation();
    }
    figure.addEventListener("pointerup", finishDrag);
    figure.addEventListener("pointercancel", finishDrag);
    figure.addEventListener("lostpointercapture", finishDrag);
    updateRotation();
}

initializeBodyViewer();
renderBodyMap();
