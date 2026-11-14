
// ======================================
// ASTROGUARDIAN - STAGE 2
// Daily Health Check-In System
// ======================================

// 1. GET HTML ELEMENTS

const startButton = document.getElementById("startButton");
const welcomeScreen = document.getElementById("welcome");
const appSection = document.getElementById("appSection");

const healthForm = document.getElementById("healthForm");
const dateInput = document.getElementById("recordDate");
const statusMessage = document.getElementById("statusMessage");

const recordsList = document.getElementById("recordsList");
const recordCount = document.getElementById("recordCount");
const emptyState = document.getElementById("emptyState");

// Storage key for our application
const STORAGE_KEY = "astroguardian_health_records_v1";

// 2. GET TODAY'S LOCAL DATE

function getToday() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setDefaultDate() {
    const today = getToday();

    dateInput.value = today;
    dateInput.max = today;
}

setDefaultDate();

// 3. LOAD PREVIOUSLY SAVED RECORDS

function loadRecords() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData) ? parsedData : [];

    } catch (error) {
        console.error("Could not load records:", error);
        return [];
    }
}

let healthRecords = loadRecords();

// 4. DISPLAY MESSAGES

function showStatus(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = "status " + type;
}

// 5. START THE APPLICATION

startButton.addEventListener("click", function () {

    welcomeScreen.classList.add("hidden");
    appSection.classList.remove("hidden");

    // Keep the voice greeting from Stage 1
    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

        const greeting = new SpeechSynthesisUtterance(
            "Welcome, Commander. AstroGuardian is ready."
        );

        greeting.lang = "en-US";

        window.speechSynthesis.speak(greeting);
    }
});

// 6. SAVE DAILY HEALTH INFORMATION

healthForm.addEventListener("submit", function (event) {

    // Prevent the browser from reloading the page
    event.preventDefault();

    // Check required fields and input ranges
    if (!healthForm.reportValidity()) {
        return;
    }

    // Read the values from the form
    const newRecord = {

        date: dateInput.value,

        heartRate: Number(
            document.getElementById("heartRate").value
        ),

        temperature: Number(
            document.getElementById("temperature").value
        ),

        sleepHours: Number(
            document.getElementById("sleepHours").value
        ),

        exerciseMinutes: Number(
            document.getElementById("exerciseMinutes").value
        ),

        mood: Number(
            document.getElementById("mood").value
        ),

        notes: document.getElementById("notes").value.trim()

    };

    // Extra validation
    const measurements = [
        newRecord.heartRate,
        newRecord.temperature,
        newRecord.sleepHours,
        newRecord.exerciseMinutes,
        newRecord.mood
    ];

    if (!measurements.every(Number.isFinite)) {
        showStatus("Please enter valid numbers.", "error");
        return;
    }

    if (!newRecord.date || newRecord.date > getToday()) {
        showStatus("Please select a valid date.", "error");
        return;
    }

    // Prevent accidental duplicate records
    const recordExists = healthRecords.some(function (record) {
        return record.date === newRecord.date;
    });

    if (recordExists) {
        showStatus(
            "A record already exists for this date. Delete it before replacing it.",
            "error"
        );
        return;
    }

    // Add the new record and sort by date
    const updatedRecords = [...healthRecords, newRecord];

    updatedRecords.sort(function (a, b) {
        return b.date.localeCompare(a.date);
    });

    // Save to localStorage
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedRecords)
        );

        healthRecords = updatedRecords;

    } catch (error) {
        console.error("Save failed:", error);

        showStatus(
            "Unable to save. Check browser storage permissions.",
            "error"
        );

        return;
    }

    // Update the history section
    displayRecords();

    // Clear the form
    healthForm.reset();
    setDefaultDate();

    showStatus(
        "Health record saved successfully!",
        "success"
    );

});

// 7. DISPLAY SAVED HEALTH RECORDS

function displayRecords() {

    // Remove previous list items
    recordsList.replaceChildren();

    // Update total record count
    recordCount.textContent =
        healthRecords.length + " saved records";

    // Show an empty message if needed
    emptyState.hidden = healthRecords.length > 0;

    healthRecords.forEach(function (record) {

        // Create a list item
        const card = document.createElement("li");
        card.className = "record-card";

        // Display the date
        const dateTitle = document.createElement("strong");
        dateTitle.textContent = "Date: " + record.date;

        // Display measurements
        const details = document.createElement("p");

        details.textContent =
            "Heart Rate: " + record.heartRate + " bpm | " +
            "Temperature: " + record.temperature + " °C | " +
            "Sleep: " + record.sleepHours + " hours | " +
            "Exercise: " + record.exerciseMinutes + " min | " +
            "Mood: " + record.mood + "/5";

        // Create the Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.date = record.date;

        deleteButton.setAttribute(
            "aria-label",
            "Delete record for " + record.date
        );

        card.appendChild(dateTitle);
        card.appendChild(details);

        // Display notes only when provided
        if (record.notes) {
            const notesText = document.createElement("p");
            notesText.textContent = "Notes: " + record.notes;
            card.appendChild(notesText);
        }

        card.appendChild(deleteButton);

        // Add the card to the list
        recordsList.appendChild(card);

    });
}

// 8. DELETE A RECORD

recordsList.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-date]");

    if (!button) {
        return;
    }

    const dateToDelete = button.dataset.date;

    const confirmed = window.confirm(
        "Delete the health record for " + dateToDelete + "?"
    );

    if (!confirmed) {
        return;
    }

    // Keep all records except the selected date
    const updatedRecords = healthRecords.filter(
        record => record.date !== dateToDelete
    );

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedRecords)
        );

        healthRecords = updatedRecords;

    } catch (error) {
        console.error("Delete failed:", error);

        showStatus(
            "Unable to delete the record.",
            "error"
        );

        return;
    }

    displayRecords();

    showStatus(
        "Health record deleted successfully.",
        "success"
    );

});

// 9. DISPLAY EXISTING RECORDS ON LOAD

displayRecords();