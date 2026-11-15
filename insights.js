
// ======================================
// ASTROGUARDIAN - STAGE 4
// Personalized Health Insights
// ======================================

// 1. GET HTML ELEMENTS

const insightsSummary = document.getElementById(
    "insightsSummary"
);

const insightsComparison = document.getElementById(
    "insightsComparison"
);


// 2. DEFINE OUR DEMONSTRATION RULES
//
// These values are invented for testing.
// They are NOT medical safety thresholds.

const insightMetrics = [

    {
        key: "heartRate",
        label: "Heart Rate",
        unit: "bpm",
        method: "percent",
        threshold: 15
    },

    {
        key: "temperature",
        label: "Body Temperature",
        unit: "°C",
        method: "absolute",
        threshold: 0.5
    },

    {
        key: "sleepHours",
        label: "Sleep Duration",
        unit: "hours",
        method: "absolute",
        threshold: 1.5
    },

    {
        key: "exerciseMinutes",
        label: "Exercise Duration",
        unit: "minutes",
        method: "absolute",
        threshold: 30
    },

    {
        key: "mood",
        label: "Mood",
        unit: "/5",
        method: "absolute",
        threshold: 1.5
    }

];


// 3. FORMAT A NUMBER FOR DISPLAY

function formatInsightNumber(value) {
    return Number(value).toFixed(1);
}


// 4. BUILD THE PERSONALIZED INSIGHTS

function renderPersonalizedInsights() {

    // Use the existing healthRecords array
    // created in Stage 2.

    const records = healthRecords
        .filter(record =>
            record && typeof record.date === "string"
        )
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date));

    // Clear old insight cards
    insightsComparison.replaceChildren();


    // We need at least four records:
    // three previous check-ins and one latest check-in.

    if (records.length < 4) {

        insightsSummary.textContent =
            "You have " + records.length +
            " saved check-in(s). Add " +
            (4 - records.length) +
            " more to enable personalized comparisons.";

        return;
    }


    // 5. FIND THE LATEST RECORD AND PREVIOUS THREE

    const latestRecord = records[records.length - 1];

    const previousRecords = records.slice(-4, -1);

    let noticeableChanges = 0;


    // 6. ANALYZE EACH HEALTH INDICATOR

    insightMetrics.forEach(function (metric) {

        const previousValues = previousRecords.map(
            record => Number(record[metric.key])
        );

        const latestValue = Number(
            latestRecord[metric.key]
        );

        // Skip missing or invalid values
        if (
            previousValues.some(value => !Number.isFinite(value)) ||
            !Number.isFinite(latestValue)
        ) {
            return;
        }


        // Calculate the average of the previous 3 records

        const total = previousValues.reduce(
            (sum, value) => sum + value,
            0
        );

        const baseline = total / previousValues.length;


        // Find the difference from the baseline

        const difference = latestValue - baseline;

        const absoluteDifference = Math.abs(difference);


        // Determine if the difference is large enough
        // to meet our demonstration comparison rule.

        let hasNoticeableChange = false;

        if (metric.method === "percent") {

            if (baseline !== 0) {

                const percentageChange =
                    (absoluteDifference / Math.abs(baseline)) * 100;

                hasNoticeableChange =
                    percentageChange >= metric.threshold;
            }

        } else {

            hasNoticeableChange =
                absoluteDifference >= metric.threshold;

        }


        if (hasNoticeableChange) {
            noticeableChanges++;
        }


        // 7. CREATE A NEW INSIGHT CARD

        const card = document.createElement("article");

        card.className = hasNoticeableChange
            ? "insight-metric insight-change"
            : "insight-metric insight-stable";


        const title = document.createElement("h3");
        title.textContent = metric.label;


        const baselineText = document.createElement("p");

        baselineText.textContent =
            "Previous 3-check-in average: " +
            formatInsightNumber(baseline) +
            " " + metric.unit;


        const latestText = document.createElement("p");

        latestText.textContent =
            "Latest measurement: " +
            formatInsightNumber(latestValue) +
            " " + metric.unit;


        const differenceText = document.createElement("p");

        const direction = difference > 0
            ? "above"
            : difference < 0
                ? "below"
                : "equal to";

        differenceText.textContent =
            "Difference: " +
            formatInsightNumber(absoluteDifference) +
            " " + metric.unit +
            " " + direction + " the recent average.";


        // Show the comparison result

        const resultLabel = document.createElement("span");

        resultLabel.className = "insight-label";

        resultLabel.textContent = hasNoticeableChange
            ? "Above comparison marker"
            : "Below comparison marker";


        // Add all elements to the card

        card.appendChild(title);
        card.appendChild(baselineText);
        card.appendChild(latestText);
        card.appendChild(differenceText);
        card.appendChild(resultLabel);

        insightsComparison.appendChild(card);

    });


    // 8. CREATE THE OVERALL SUMMARY

    if (noticeableChanges > 0) {

        insightsSummary.textContent =
            noticeableChanges +
            " indicator(s) meet the comparison markers " +
            "relative to the previous three check-ins. " +
            "Review the recorded changes and measurement conditions.";

    } else {

        insightsSummary.textContent =
            "All recorded differences are below the " +
            "current comparison markers. Review each " +
            "measurement alongside your recent records.";

    }

}


// 9. UPDATE AFTER HEALTH RECORD CHANGES

window.addEventListener(
    "astroguardian:records-updated",
    renderPersonalizedInsights
);


// 10. DISPLAY INSIGHTS WHEN THE APP STARTS

renderPersonalizedInsights();
