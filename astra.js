
// ==========================================
// ASTROGUARDIAN - STAGE 6
// ASTRA Interactive Voice Assistant
// ==========================================

// 1. GET HTML ELEMENTS

const astraChat = document.getElementById("astraChat");
const astraForm = document.getElementById("astraForm");
const astraQuestion = document.getElementById("astraQuestion");

const astraMic = document.getElementById("astraMic");
const astraStopSpeaking = document.getElementById(
    "astraStopSpeaking"
);

const astraSpeakReplies = document.getElementById(
    "astraSpeakReplies"
);

const astraVoiceStatus = document.getElementById(
    "astraVoiceStatus"
);

const astraEmergency = document.getElementById(
    "astraEmergency"
);

const astraAssistant = document.getElementById(
    "astraAssistant"
);


// 2. DEFINE SUPPORTED HEALTH MEASUREMENTS

const astraMetrics = [
    {
        key: "heartRate",
        label: "heart rate",
        unit: "bpm",
        keywords: ["heart rate", "heart", "pulse"]
    },
    {
        key: "temperature",
        label: "body temperature",
        unit: "°C",
        keywords: ["temperature"]
    },
    {
        key: "sleepHours",
        label: "sleep duration",
        unit: "hours",
        keywords: ["sleep"]
    },
    {
        key: "exerciseMinutes",
        label: "exercise duration",
        unit: "minutes",
        keywords: ["exercise", "activity", "workout"]
    },
    {
        key: "mood",
        label: "mood score",
        unit: "/5",
        keywords: ["mood"]
    }
];


// 3. CREATE CHAT MESSAGES SAFELY

function addAstraMessage(sender, message) {

    const bubble = document.createElement("div");

    bubble.className = sender === "user"
        ? "astra-message astra-user"
        : "astra-message astra-bot";

    const title = document.createElement("strong");

    title.textContent = sender === "user"
        ? "ASTRONAUT"
        : "ASTRA";

    const paragraph = document.createElement("p");

    // textContent avoids interpreting user input as HTML
    paragraph.textContent = message;

    bubble.appendChild(title);
    bubble.appendChild(paragraph);

    astraChat.appendChild(bubble);

    // Scroll to the newest message
    astraChat.scrollTop = astraChat.scrollHeight;
}


// 4. GET SAVED HEALTH RECORDS

function astraGetRecords() {

    // healthRecords was created in Stage 2

    if (!Array.isArray(healthRecords)) {
        return [];
    }

    return healthRecords
        .filter(record =>
            record && typeof record.date === "string"
        )
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date));
}


// 5. IDENTIFY WHICH MEASUREMENT IS REQUESTED

function astraFindMetric(question) {

    return astraMetrics.find(metric =>
        metric.keywords.some(keyword =>
            question.includes(keyword)
        )
    );
}


// 6. ANSWER QUESTIONS ABOUT LATEST MEASUREMENTS

function astraLatestMeasurement(metric, records) {

    if (records.length === 0) {
        return "No health records are saved yet. " +
            "Please complete your daily health check-in first.";
    }

    const latest = records[records.length - 1];

    const value = Number(latest[metric.key]);

    if (!Number.isFinite(value)) {
        return "This measurement is not available " +
            "in your latest saved record.";
    }

    return "Your latest recorded " + metric.label +
        " was " + value + " " + metric.unit +
        " on " + latest.date +
        ". This is a recorded measurement, " +
        "not a medical assessment.";
}


// 7. EXPLAIN A PERSONALIZED TREND

function astraExplainTrend(metric, records) {

    if (records.length < 4) {
        return "I need at least four dated check-ins " +
            "to compare your latest " + metric.label +
            " with the previous three records.";
    }

    const latest = records[records.length - 1];

    const previous = records.slice(-4, -1);

    const previousValues = previous.map(
        record => Number(record[metric.key])
    );

    const latestValue = Number(latest[metric.key]);

    if (
        !Number.isFinite(latestValue) ||
        !previousValues.every(Number.isFinite)
    ) {
        return "There is not enough valid data " +
            "for this comparison.";
    }

    const total = previousValues.reduce(
        (sum, value) => sum + value,
        0
    );

    const average = total / previousValues.length;

    const difference = latestValue - average;

    const direction = difference > 0
        ? "above"
        : difference < 0
            ? "below"
            : "equal to";

    return "Your latest " + metric.label +
        " was " + latestValue + " " + metric.unit +
        ". The previous three-check-in average was " +
        average.toFixed(1) + " " + metric.unit +
        ". Your latest value is " +
        Math.abs(difference).toFixed(1) + " " +
        metric.unit + " " + direction +
        " that average. This comparison is " +
        "informational and cannot diagnose a condition.";
}


// 8. CREATE AN OVERALL HEALTH RECORD SUMMARY

function astraHealthSummary(records) {

    if (records.length === 0) {
        return "You have no saved health records. " +
            "Complete a daily check-in to begin monitoring.";
    }

    const latest = records[records.length - 1];

    return "Your latest check-in was on " + latest.date +
        ". Recorded heart rate: " + latest.heartRate +
        " bpm. Temperature: " + latest.temperature +
        " degrees Celsius. Sleep: " + latest.sleepHours +
        " hours. Exercise: " + latest.exerciseMinutes +
        " minutes. Mood: " + latest.mood +
        " out of five. These are recorded measurements, " +
        "not a health diagnosis.";
}


// 9. EDUCATIONAL SPACEFLIGHT RESPONSES

function astraSpaceEducation(question) {

    if (question.includes("bone")) {
        return "Reduced mechanical loading in space " +
            "can contribute to bone loss. NASA studies " +
            "exercise and other countermeasures to " +
            "help protect astronaut skeletal health. " +
            "See the Bones section of the Body Explorer.";
    }

    if (question.includes("radiation")) {
        return "Space radiation is one of NASA's " +
            "five major human spaceflight hazards. " +
            "Monitoring radiation requires dedicated " +
            "equipment. Follow mission-approved " +
            "radiation protection procedures.";
    }

    if (
        question.includes("eye") ||
        question.includes("vision")
    ) {
        return "Long-duration spaceflight can be " +
            "associated with changes in eye structure " +
            "and vision. NASA studies Spaceflight-" +
            "Associated Neuro-ocular Syndrome. " +
            "Vision concerns require appropriate " +
            "medical assessment.";
    }

    if (question.includes("muscle")) {
        return "Muscles can change during spaceflight " +
            "because of reduced mechanical loading. " +
            "Crew exercise programs help address " +
            "physical deconditioning. Exercise " +
            "duration alone does not measure strength.";
    }

    if (
        question.includes("spaceflight") ||
        question.includes("space mission")
    ) {
        return "NASA identifies five major hazards: " +
            "space radiation, isolation and confinement, " +
            "distance from Earth, altered gravity, " +
            "and hostile or closed environments. " +
            "Use the Body Explorer to learn more.";
    }

    return null;
}


// 10. RECOGNIZE USER QUESTIONS

function astraGenerateAnswer(userQuestion) {

    const question = userQuestion
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    const records = astraGetRecords();

    // Emergency requests take priority
    const emergencyWords =
        /\b(emergency|urgent|chest pain|can't breathe|cannot breathe|difficulty breathing|unconscious|fainting)\b/;

    if (emergencyWords.test(question)) {

        astraEmergency.hidden = false;

        return "Emergency support requested. " +
            "Alert your designated crew medical officer " +
            "and follow approved onboard emergency " +
            "procedures immediately. The emergency " +
            "information panel is now visible. " +
            "This prototype has not contacted anyone.";
    }

    // Hide the emergency demonstration panel
    // when another kind of question is asked.
    astraEmergency.hidden = true;


    // Questions about spaceflight science
    const educationQuestion =
        question.includes("spaceflight") ||
        question.includes("space mission") ||
        question.includes("bones") ||
        question.includes("radiation") ||
        question.includes("vision") ||
        question.includes("muscles");

    if (educationQuestion) {

        const answer = astraSpaceEducation(question);

        if (answer) {
            return answer;
        }
    }


    // Determine the requested health indicator
    const metric = astraFindMetric(question);

    // Questions about changes or comparisons
    const wantsTrend =
        question.includes("change") ||
        question.includes("trend") ||
        question.includes("average") ||
        question.includes("compare") ||
        question.includes("baseline");

    if (metric && wantsTrend) {
        return astraExplainTrend(metric, records);
    }

    if (metric) {
        return astraLatestMeasurement(metric, records);
    }


    // Overall recorded health summary
    if (
        question.includes("summary") ||
        question.includes("overview") ||
        question.includes("my health") ||
        question.includes("check-in")
    ) {
        return astraHealthSummary(records);
    }


    // General trend questions
    if (wantsTrend) {
        return "I can compare heart rate, temperature, " +
            "sleep, exercise or mood with the previous " +
            "three check-ins. Please name the measurement.";
    }


    // Help and capabilities
    if (
        question.includes("help") ||
        question.includes("what can you do") ||
        question.includes("hello") ||
        question.includes("hi astra")
    ) {
        return "Hello, Commander! You can ask me " +
            "about your latest measurements, " +
            "sleep or heart-rate trends, " +
            "or selected spaceflight health topics. " +
            "I can also display emergency support " +
            "information when requested.";
    }


    // Unknown question
    return "I haven't learned how to answer " +
        "that question yet. Try asking about " +
        "your latest heart rate, sleep trend, " +
        "health summary or spaceflight hazards.";
}


// 11. READ ANSWERS ALOUD

function astraSpeak(text) {

    // Only speak when the user enabled voice replies
    if (!astraSpeakReplies.checked) {
        return;
    }

    if (!("speechSynthesis" in window)) {
        astraVoiceStatus.textContent =
            "Voice output is not supported in this browser.";
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}


// 12. PROCESS A QUESTION

function askAstra(question) {

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
        return;
    }

    // Show the astronaut's question
    addAstraMessage("user", cleanQuestion);

    // Generate a response using the saved records
    const answer = astraGenerateAnswer(cleanQuestion);

    // Show ASTRA's answer
    addAstraMessage("bot", answer);

    // Optionally speak the answer
    astraSpeak(answer);
}


// 13. HANDLE TYPED QUESTIONS

astraForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const question = astraQuestion.value;

    askAstra(question);

    astraQuestion.value = "";
    astraQuestion.focus();
});


// 14. HANDLE EXAMPLE QUESTION BUTTONS

astraAssistant.addEventListener("click", function (event) {

    const button = event.target.closest(
        "button[data-astra-prompt]"
    );

    if (!button) {
        return;
    }

    askAstra(button.dataset.astraPrompt);
});


// 15. SET UP SPEECH RECOGNITION

const SpeechRecognitionAPI =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let astraRecognition = null;
let astraListening = false;

if (SpeechRecognitionAPI) {

    astraRecognition = new SpeechRecognitionAPI();

    astraRecognition.lang = "en-US";

    // Stop after one spoken question
    astraRecognition.continuous = false;
    astraRecognition.interimResults = false;
    astraRecognition.maxAlternatives = 1;


    // Microphone is now listening
    astraRecognition.onstart = function () {

        astraListening = true;

        astraMic.textContent = "⏹ Stop Listening";

        astraVoiceStatus.textContent =
            "Listening... Speak your question.";
    };


    // Speech was recognized
    astraRecognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript.trim();

        astraQuestion.value = transcript;

        astraVoiceStatus.textContent =
            "Recognized: " + transcript;

        askAstra(transcript);
    };


    // Handle microphone or speech recognition errors
    astraRecognition.onerror = function (event) {

        astraVoiceStatus.textContent =
            "Voice recognition error: " +
            event.error +
            ". You can still type your question.";
    };


    // Recognition session finished
    astraRecognition.onend = function () {

        astraListening = false;

        astraMic.textContent = "🎤 Speak to ASTRA";
    };

} else {

    astraMic.disabled = true;

    astraVoiceStatus.textContent =
        "Voice input is unavailable in this browser. " +
        "Please type your question instead.";
}


// 16. MICROPHONE BUTTON

astraMic.addEventListener("click", function () {

    if (!astraRecognition) {
        return;
    }

    // Clicking again stops listening
    if (astraListening) {
        astraRecognition.stop();
        return;
    }

    try {

        // Prevent ASTRA's previous spoken answer
        // from being picked up by the microphone
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        astraRecognition.start();

    } catch (error) {

        astraVoiceStatus.textContent =
            "Unable to start microphone. " +
            "Check permissions and try again.";

        console.error(error);
    }
});


// 17. STOP VOICE OUTPUT

astraStopSpeaking.addEventListener("click", function () {

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        astraVoiceStatus.textContent =
            "Voice playback stopped.";
    }
});


// 18. INITIAL GREETING

addAstraMessage(
    "bot",
    "Welcome, Commander! I'm ASTRA, your " +
    "astronaut health-monitoring assistant. " +
    "Ask about your saved health records, " +
    "recent trends, or spaceflight health topics."
);
