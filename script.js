
// ======================================
// ASTROGUARDIAN - STAGE 2
// Daily Health Check-In System
// ======================================

// 1. GET HTML ELEMENTS

const healthForm = document.getElementById("healthForm");
const dateInput = document.getElementById("recordDate");
const statusMessage = document.getElementById("statusMessage");

const recordsList = document.getElementById("recordsList");
const recordCount = document.getElementById("recordCount");
const emptyState = document.getElementById("emptyState");

// Storage key for our application
const STORAGE_KEY = "astroguardian_health_records_v1";

const RECORD_MISSION_LOCATION_LABELS = Object.freeze({
    station: "Space station",
    space: "Open space (EVA)",
    moon: "Moon base camp"
});

// Capture the environment at save time; changing the active mission later must
// not change the location attached to a historical check-in.
function getSelectedRecordMissionLocation() {
    let missionLocation;
    try {
        missionLocation = window.AstroMission?.getLocation?.();
    } catch {
        // A selector is still usable if the optional mission helper is unavailable.
    }

    return [
        missionLocation,
        document.getElementById("missionLocation")?.value,
        document.querySelector("[data-mission-select]")?.value
    ].find(location => Object.hasOwn(RECORD_MISSION_LOCATION_LABELS, location));
}

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
    if (!dateInput) return;
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

        if (!Array.isArray(parsedData)) return [];

        return parsedData.filter(record =>
            record &&
            typeof record.date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
            ["heartRate", "temperature", "sleepHours", "exerciseMinutes", "mood"]
                .every(key => typeof record[key] === "number" && Number.isFinite(record[key]))
        ).map(record => ({
            ...record,
            notes: typeof record.notes === "string" ? record.notes : "",
            ...(record.missionLocation === "transit" ? { missionLocation: "space" } : {})
        })).sort((a, b) => b.date.localeCompare(a.date));

    } catch (error) {
        console.error("Could not load records:", error);
        return [];
    }
}

let healthRecords = loadRecords();

// 4. DISPLAY MESSAGES

function showStatus(text, type) {
    [statusMessage, document.getElementById("historyStatus")].forEach(output => {
        if (!output) return;
        output.textContent = text;
        output.className = "status " + type;
    });
}

// 5. OPEN A FEATURE PAGE BEFORE FOCUSING ITS CONTENT

function openAstroPage(page, focusId) {
    const path = "/" + page.replace(/^\/+/, "");
    if (window.AstroGuardian && typeof window.AstroGuardian.navigate === "function") {
        window.AstroGuardian.navigate(path);
    } else {
        window.location.hash = path;
    }

    if (focusId) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.getElementById(focusId)?.focus({ preventScroll: true });
        }));
    }
}

// 6. SAVE DAILY HEALTH INFORMATION

healthForm?.addEventListener("submit", function (event) {

    // Prevent the browser from reloading the page
    event.preventDefault();

    // Check required fields and input ranges
    if (!healthForm.reportValidity()) {
        return;
    }

    // Read the values from the form
    const missionLocation = getSelectedRecordMissionLocation();
    const newRecord = {

        date: dateInput.value,

        ...(missionLocation ? { missionLocation } : {}),

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
    if (!recordsList) return;

    // Remove previous list items
    recordsList.replaceChildren();

    // Update total record count
    if (recordCount) recordCount.textContent =
        healthRecords.length + (healthRecords.length === 1 ? " saved record" : " saved records");

    // Show an empty message if needed
    if (emptyState) emptyState.hidden = healthRecords.length > 0;

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

        const location = document.createElement("p");
        location.className = "record-mission-location";
        location.textContent = Object.hasOwn(RECORD_MISSION_LOCATION_LABELS, record.missionLocation)
            ? "Mission: " + RECORD_MISSION_LOCATION_LABELS[record.missionLocation]
            : "Location not recorded";
        card.appendChild(location);
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


    // Tell the dashboard that records have changed
    window.dispatchEvent(
        new Event("astroguardian:records-updated")
    );

}

// 8. DELETE A RECORD

recordsList?.addEventListener("click", function (event) {

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

// Keep tabs on the same device consistent after a record is saved or deleted.
window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY || event.key === null) {
        healthRecords = loadRecords();
        displayRecords();
    }
});
