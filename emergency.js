
// ======================================
// ASTROGUARDIAN - STAGE 7
// Emergency Support Simulation
// ======================================

// 1. GET HTML ELEMENTS

const emergencyOpen = document.getElementById(
    "emergencyOpen"
);

const emergencyPanel = document.getElementById(
    "emergencyPanel"
);

const emergencyScenario = document.getElementById(
    "emergencyScenario"
);

const emergencyChecklistButton = document.getElementById(
    "emergencyChecklistButton"
);

const emergencySpeakButton = document.getElementById(
    "emergencySpeakButton"
);

const emergencyClose = document.getElementById(
    "emergencyClose"
);

const emergencyTitle = document.getElementById(
    "emergencyTitle"
);

const emergencySteps = document.getElementById(
    "emergencySteps"
);

const emergencyStatus = document.getElementById(
    "emergencyStatus"
);


// 2. DEFINE SIMULATED INCIDENT CHECKLISTS
//
// These are generic training prompts.
// They are NOT approved medical protocols.

const emergencyScenarios = {

    medical: {
        title: "Astronaut Medical Emergency",

        steps: [
            "Alert the designated crew medical officer immediately.",

            "Access the mission-approved medical emergency checklist.",

            "Follow instructions from trained medical personnel and the onboard procedure.",

            "Use the mission's established communication procedure to request medical support.",

            "Document the incident when it is safe and appropriate to do so."
        ]
    },

    radiation: {
        title: "Radiation Warning",

        steps: [
            "Notify the crew through the mission's established warning procedure.",

            "Access the approved radiation response checklist.",

            "Follow mission-specific radiation protection and shelter instructions.",

            "Consult designated radiation safety and medical personnel using approved communication procedures.",

            "Review incident information using authorized monitoring equipment."
        ]
    },

    communications: {
        title: "Medical Communications Unavailable",

        steps: [
            "Notify the onboard crew medical officer.",

            "Access the approved onboard medical contingency procedures.",

            "Follow mission-specific backup communication instructions.",

            "Use only approved onboard medical resources under trained crew direction.",

            "Document relevant information for authorized medical review when communication becomes available."
        ]
    }

};


// 3. DISPLAY THE SELECTED CHECKLIST

function renderEmergencyChecklist() {

    const selected = emergencyScenario.value;

    const scenario = emergencyScenarios[selected];

    if (!scenario) {
        return;
    }

    emergencyTitle.textContent = scenario.title;

    emergencySteps.replaceChildren();

    scenario.steps.forEach(function (step) {

        const item = document.createElement("li");

        item.textContent = step;

        emergencySteps.appendChild(item);
    });

    emergencyStatus.textContent =
        "Incident checklist ready.";
}


// 4. OPEN THE EMERGENCY PANEL

function openEmergencySupport() {

    openAstroPage("emergency");

    emergencyPanel.hidden = false;

    renderEmergencyChecklist();

    emergencyScenario.focus({ preventScroll: true });
}

emergencyOpen?.addEventListener(
    "click",
    openEmergencySupport
);


// 5. CHANGE THE INCIDENT TYPE

emergencyChecklistButton.addEventListener(
    "click",
    renderEmergencyChecklist
);

emergencyScenario.addEventListener(
    "change",
    renderEmergencyChecklist
);


// 6. READ GUIDANCE USING SPEECH SYNTHESIS

emergencySpeakButton.addEventListener(
    "click",
    function () {

        if (!("speechSynthesis" in window)) {

            emergencyStatus.textContent =
                "Voice output is unavailable. " +
                "Please read the on-screen guidance.";

            return;
        }

        const scenario =
            emergencyScenarios[emergencyScenario.value];

        if (!scenario) {
            return;
        }

        const message =
            "Emergency support. " +
            scenario.title + ". " +
            scenario.steps.join(". ");

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(message);

        speech.lang = "en-US";
        speech.rate = 0.95;

        window.speechSynthesis.speak(speech);

        emergencyStatus.textContent =
            "Reading the incident checklist aloud.";
    }
);


// 7. CLOSE THE EMERGENCY PANEL

emergencyClose.addEventListener(
    "click",
    function () {

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        openAstroPage("overview");
    }
);

window.addEventListener("astroguardian:page-changed", function (event) {
    if (event.detail?.page === "emergency") renderEmergencyChecklist();
    else if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});


// 8. ALLOW ASTRA TO OPEN EMERGENCY SUPPORT

window.addEventListener(
    "astroguardian:emergency-request",
    function () {

        emergencyScenario.value = "medical";

        openEmergencySupport();
    }
);
