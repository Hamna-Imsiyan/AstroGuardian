
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

    if (typeof healthRecords === "undefined" || !Array.isArray(healthRecords)) {
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
        " on " + latest.date + ".";
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
        " that average.";
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
        " out of five.";
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

// A small, local conversation library. ASTRA does not send typed chat to an AI
// service, pretend to understand unrestricted questions, or store conversations.
const astraJokes = [
    "Why did the astronaut bring a pencil? To draw their own conclusions in space. What is your best terrible joke?",
    "I tried to organize a party on the Moon. Great view, very little atmosphere. What would be on your party playlist?",
    "My space sandwich floated away. I guess lunch has left the station. What meal are you looking forward to back on Earth?",
    "Why did the robot take a holiday? Too many working orbits. If you had a free afternoon anywhere, where would you go?",
    "I asked the stars for a joke, but they were all a little distant. Your turn: puns, dad jokes, or no jokes at all?"
];
let astraJokeIndex = 0;
let astraConversationTopic = "";

function astraCompanionAnswer(question) {
    if (/\b(joke|jokes|pun|puns|make me laugh|something funny)\b/.test(question)) {
        const joke = astraJokes[astraJokeIndex % astraJokes.length];
        astraJokeIndex += 1;
        astraConversationTopic = "jokes";
        window.dispatchEvent(new CustomEvent("astroguardian:companion-motion", { detail: { action: "jump" } }));
        return joke;
    }
    if (/\b(wave|waving|jump|jumping|float|floating)\b/.test(question) &&
        !/\b(blood|pressure|heart|temperature|symptom|dizzy|pain)\b/.test(question)) {
        const action = /\b(jump|jumping)\b/.test(question) ? "jump" : /\b(float|floating)\b/.test(question) ? "float" : "wave";
        window.dispatchEvent(new CustomEvent("astroguardian:companion-motion", { detail: { action } }));
        return action === "wave" ? "A little wave from your station companion! What has been the highlight of your day?" :
            action === "jump" ? "One small hop for ASTRA! What would you like to chat about?" :
                "Taking a little float around my corner of the station. If you could float past any place on Earth, where would it be?";
    }
    if (/\b(who are you|about yourself|are you real|are you human|are you ai|your name)\b/.test(question)) {
        return "I'm ASTRA, a virtual station companion with local scripted replies. I can share jokes, ask about your day, and help you explore your saved records. What do you enjoy doing in your downtime?";
    }
    if (/\b(lonely|loneliness|miss home|homesick|miss my family|alone|someone to talk|keep me company)\b/.test(question)) {
        astraConversationTopic = "home";
        return "Being far from familiar people and places can feel lonely. We can chat for a bit. What is one small thing from home you would like to tell me about: a person, a place, or a favourite routine? A message to someone you trust or a chat with a crewmate can help you feel connected, too.";
    }
    if (/\b(how are you|how is your day|how's your day)\b/.test(question)) {
        return "My systems are ready for a chat! I don't experience days the way you do, but I can ask about yours. What was a small good moment today?";
    }
    if (/\b(ask me|ask about me|get to know me|myself|about my day)\b/.test(question)) {
        astraConversationTopic = "day";
        return "Let's talk about you beyond the mission checklist. If you had an entirely free afternoon, what would you choose to do?";
    }
    if (/\b(bored|boring|chat|talk|conversation|hang out)\b/.test(question)) {
        astraConversationTopic = "day";
        return "Let's take a small conversation break. Would you rather see a sunrise from a mountain, listen to rain by a window, or spend an afternoon by the sea? Tell me which one and why.";
    }
    if (/\b(music|song|playlist|sing|band)\b/.test(question)) {
        astraConversationTopic = "music";
        return "Music can carry so many memories. What song would you put first on a playlist for the journey home, and what does it remind you of?";
    }
    if (/\b(movie|film|book|read|hobby|hobbies|game|games)\b/.test(question)) {
        astraConversationTopic = "hobbies";
        return "A good story or a favourite hobby sounds like a nice break. What do you keep coming back to, and what do you enjoy most about it?";
    }
    if (/\b(favourite|favorite|enjoy|i like|i love|i prefer)\b/.test(question)) {
        astraConversationTopic = "interests";
        return "Thanks for sharing a little of what you enjoy. What is a favourite memory connected with that?";
    }
    if (/\b(thank you|thanks|that was nice|that was funny)\b/.test(question)) {
        return "You're welcome. I'm here whenever you want a joke, a quick conversation, or help finding your way around AstroGuardian.";
    }
    if (/\b(hello|hey|hi|good morning|good evening)\b/.test(question)) {
        astraConversationTopic = "day";
        window.dispatchEvent(new CustomEvent("astroguardian:companion-motion", { detail: { action: "wave" } }));
        return "Hello, Commander! Good to have you here. What has been the most interesting part of your day? You can also ask for a joke or ask me to wave, jump, or float.";
    }
    if (/\b(great|happy|excited|good day|doing well|i am fine|i'm fine)\b/.test(question)) {
        astraConversationTopic = "day";
        return "That sounds like a moment worth keeping. What made the day feel that way?";
    }
    if (/\b(hard day|rough day|sad|frustrated|tough day|bad day)\b/.test(question)) {
        astraConversationTopic = "day";
        return "That sounds like a difficult day. If you feel like talking, what happened? You could also take a quiet break, share a moment with a crewmate, or ask me for a very silly space joke.";
    }
    // Give one general follow-up rather than claiming to understand arbitrary text.
    if (astraConversationTopic && !/\b(heart|pulse|temperature|sleep|exercise|activity|workout|mood|health|record|summary|trend|change|compare|bone|radiation|vision|muscle|spaceflight|space mission|help|what can you do)\b/.test(question)) {
        const topic = astraConversationTopic;
        astraConversationTopic = "";
        const followUps = {
            home: "Thank you for telling me about home. What is a little routine from there that you could bring into your day on the station?",
            music: "That sounds like a personal choice. What memory does that music bring to mind?",
            hobbies: "What first got you interested in it?",
            interests: "If you could share that experience with someone back home, who would you choose?",
            jokes: "A sense of humour belongs in the mission kit. Want another joke, or shall we talk about something you enjoy?",
            day: "Thanks for sharing. What are you looking forward to when you have some time to yourself?"
        };
        return followUps[topic] || null;
    }
    return null;
}

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

        // Open the Stage 7 emergency support panel
    window.dispatchEvent(
        new Event("astroguardian:emergency-request")
    );

        return "Emergency support is open. " +
            "Alert your designated crew medical officer " +
            "and follow approved onboard emergency " +
            "procedures immediately.";
    }

    // Hide the emergency demonstration panel
    // when another kind of question is asked.
    astraEmergency.hidden = true;

    const companionAnswer = astraCompanionAnswer(question);
    if (companionAnswer) {
        return companionAnswer;
    }


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
        return "I can share a space joke, ask about your day or hobbies, wave, jump, and float. I can also explain your saved measurements, compare recorded trends, or open emergency support. Try 'Tell me a joke', 'Ask me about myself', or 'What is my latest heart rate?'";
    }


    // Unknown question
    return "I'm not sure how to answer that yet. You can ask for a joke, tell me about your favourite music or hobby, or ask about your saved health records. What would you like to try?";
}


// 11. READ ANSWERS ALOUD

function astraSpeak(text) {

    // Only speak when the user enabled voice replies
    if (!astraSpeakReplies.checked || document.hidden || !astraAssistant.getClientRects().length) {
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
    "Hello, Commander. Ready for a little company? Tell me about your day, or ask for a space joke."
);

// Closing support or leaving the tab always ends voice activity.
function astraStopVoice() {
    if (astraRecognition && astraListening) astraRecognition.abort();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
window.addEventListener("astroguardian:assistant-closed", astraStopVoice);
document.addEventListener("visibilitychange", function () {
    if (document.hidden) astraStopVoice();
});
astraSpeakReplies.addEventListener("change", function () {
    if (!astraSpeakReplies.checked && "speechSynthesis" in window) window.speechSynthesis.cancel();
});
window.AstraSupport = { ask: askAstra, stopVoice: astraStopVoice };
