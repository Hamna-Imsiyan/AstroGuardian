
// ======================================
// ASTROGUARDIAN - STAGE 8
// Daily Wellness Missions
// ======================================

const WELLNESS_STORAGE_KEY =
    "astroguardian_wellness_v1";

const wellnessProgressText = document.getElementById(
    "wellnessProgressText"
);

const wellnessProgressBar = document.getElementById(
    "wellnessProgressBar"
);

const wellnessRecordStatus = document.getElementById(
    "wellnessRecordStatus"
);

const wellnessTrendStatus = document.getElementById(
    "wellnessTrendStatus"
);

const wellnessBodyStatus = document.getElementById(
    "wellnessBodyStatus"
);

const wellnessBadge = document.getElementById(
    "wellnessBadge"
);

const wellnessStatus = document.getElementById(
    "wellnessStatus"
);


// 1. GET TODAY'S DATE

function wellnessToday() {

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


// 2. CREATE AN EMPTY DAILY PROGRESS OBJECT

function newWellnessProgress() {

    return {
        date: wellnessToday(),
        trendReviewed: false,
        bodyExplored: false
    };
}


// 3. LOAD PROGRESS FROM LOCAL STORAGE

function loadWellnessProgress() {

    try {

        const saved = localStorage.getItem(
            WELLNESS_STORAGE_KEY
        );

        if (saved) {

            const progress = JSON.parse(saved);

            if (
                progress &&
                progress.date === wellnessToday()
            ) {
                return {
                    date: progress.date,
                    trendReviewed: progress.trendReviewed === true,
                    bodyExplored: progress.bodyExplored === true
                };
            }
        }

    } catch (error) {
        console.error("Wellness loading error:", error);
    }

    return newWellnessProgress();
}


let wellnessProgress = loadWellnessProgress();


// 4. SAVE WELLNESS PROGRESS

function saveWellnessProgress() {

    try {

        localStorage.setItem(
            WELLNESS_STORAGE_KEY,
            JSON.stringify(wellnessProgress)
        );
        return true;

    } catch (error) {

        console.error("Wellness save error:", error);

        wellnessStatus.textContent =
            "Progress could not be saved in this browser.";
        return false;
    }
}


// 5. CHECK WHETHER TODAY HAS A HEALTH RECORD

function hasTodayCheckIn() {

    if (!Array.isArray(healthRecords)) {
        return false;
    }

    return healthRecords.some(function (record) {
        return record.date === wellnessToday();
    });
}


// 6. UPDATE THE WELLNESS DISPLAY

function renderWellness() {

    // Reset learning activities on a new day

    if (wellnessProgress.date !== wellnessToday()) {
        wellnessProgress = newWellnessProgress();
        saveWellnessProgress();
    }

    const recorded = hasTodayCheckIn();

    const completed =
        Number(recorded) +
        Number(wellnessProgress.trendReviewed) +
        Number(wellnessProgress.bodyExplored);

    const percentage = (completed / 3) * 100;

    wellnessProgressText.textContent =
        completed + " of 3 missions completed";

    wellnessProgressBar.style.width =
        percentage + "%";

    wellnessRecordStatus.textContent =
        recorded ? "Completed" : "Not completed";

    wellnessTrendStatus.textContent =
        wellnessProgress.trendReviewed
            ? "Completed"
            : "Not completed";

    wellnessBodyStatus.textContent =
        wellnessProgress.bodyExplored
            ? "Completed"
            : "Not completed";


    if (completed === 3) {

        wellnessBadge.textContent =
            "Achievement unlocked! " +
            "Mission Health Explorer.";

    } else {

        wellnessBadge.textContent =
            "Complete all three learning activities " +
            "to unlock Mission Health Explorer.";
    }
}


// 7. REVIEW THE HEALTH TREND CHART

document.getElementById(
    "wellnessReviewTrend"
).addEventListener("click", function () {

    if (!Array.isArray(healthRecords) ||
        healthRecords.length < 2) {

        wellnessStatus.textContent =
            "Save at least two check-ins " +
            "before reviewing a trend.";

        return;
    }

    wellnessProgress.trendReviewed = true;

    const saved = saveWellnessProgress();
    renderWellness();

    wellnessStatus.textContent =
        saved ? "Trend review activity completed." :
            "Trend reviewed for this session. Browser storage could not save progress.";

    openAstroPage("trends");
});


// 8. OPEN THE INTERACTIVE BODY EXPLORER

document.getElementById(
    "wellnessExploreBody"
).addEventListener("click", function () {

    openAstroPage("body");

    wellnessStatus.textContent =
        "Select a body topic to complete this activity.";
});


// 9. COMPLETE THE BODY EXPLORATION ACTIVITY

document.getElementById(
    "bodyMap"
).addEventListener("click", function (event) {

    const topicButton = event.target.closest(
        "button[data-system]"
    );

    if (!topicButton) {
        return;
    }

    wellnessProgress.bodyExplored = true;

    saveWellnessProgress();
    renderWellness();
});


// 10. UPDATE WHEN HEALTH RECORDS CHANGE

window.addEventListener(
    "astroguardian:records-updated",
    renderWellness
);


// 11. LOAD INITIAL WELLNESS PROGRESS

renderWellness();


// ======================================
// OFFLINE SUPPORT REGISTRATION
// ======================================

const offlineStatus = document.getElementById(
    "offlineStatus"
);

function updateOfflineStatus() {
    if (!offlineStatus) return;

    if (!navigator.onLine) {

        offlineStatus.textContent =
            "Browser reports offline. " +
            "Cached features may remain available.";

        return;
    }

    if (
        "serviceWorker" in navigator &&
        navigator.serviceWorker.controller
    ) {

        offlineStatus.textContent =
            "Application cache active. " +
            "Ready for offline testing.";

    } else {

        offlineStatus.textContent =
            "Online. Offline cache is not active yet.";
    }
}


// Register the service worker

window.addEventListener("load", function () {
    if (!offlineStatus) return;

    if (window.location.protocol === "file:") {
        offlineStatus.textContent =
            "Local file preview. Serve this app on localhost or HTTPS to enable offline caching.";
        return;
    }

    if (!("serviceWorker" in navigator)) {

        offlineStatus.textContent =
            "Service workers are not supported " +
            "in this browser.";

        return;
    }

    navigator.serviceWorker.register(
        "./service-worker.js"
    )
    .then(function () {

        return navigator.serviceWorker.ready;

    })
    .then(function () {

        updateOfflineStatus();

    })
    .catch(function (error) {

        console.error("Offline setup failed:", error);

        offlineStatus.textContent =
            "Offline setup failed. " +
            "Check the browser console.";
    });

});


// Update status if service worker starts controlling the page

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.addEventListener(
        "controllerchange",
        updateOfflineStatus
    );
}


// Listen for connection changes

window.addEventListener(
    "online",
    updateOfflineStatus
);

window.addEventListener(
    "offline",
    updateOfflineStatus
);

window.addEventListener("astroguardian:page-changed", renderWellness);
updateOfflineStatus();
