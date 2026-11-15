
// ======================================
// ASTROGUARDIAN - STAGE 3
// Interactive Health Dashboard
// ======================================

// 1. GET DASHBOARD ELEMENTS

const metricSelect = document.getElementById("metricSelect");
const rangeSelect = document.getElementById("rangeSelect");

const chartBox = document.getElementById("dashboardChartBox");
const chartMessage = document.getElementById("dashboardChartMessage");
const chartCanvas = document.getElementById("healthTrendChart");

// Keep track of our current chart
let healthChart = null;


// 2. DEFINE AVAILABLE HEALTH METRICS

const metricSettings = {

    heartRate: {
        label: "Heart Rate",
        unit: "bpm",
        color: "#63d8ff"
    },

    temperature: {
        label: "Body Temperature",
        unit: "°C",
        color: "#ffb16b"
    },

    sleepHours: {
        label: "Sleep Duration",
        unit: "hours",
        color: "#a9cfff"
    },

    exerciseMinutes: {
        label: "Exercise Duration",
        unit: "minutes",
        color: "#76e5a7"
    },

    mood: {
        label: "Mood",
        unit: "/ 5",
        color: "#ffc777"
    }

};


// 3. DISPLAY THE DASHBOARD

function renderHealthDashboard() {

    // Read the healthRecords array from Stage 2.
    // Sort by date, oldest first.

    const records = healthRecords
        .filter(record =>
            record && typeof record.date === "string"
        )
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date));


    // Find the latest saved record
    const latest = records[records.length - 1];


    // Update the five summary cards

    document.getElementById("dashHeartRate").textContent =
        latest ? latest.heartRate : "—";

    document.getElementById("dashTemperature").textContent =
        latest ? latest.temperature : "—";

    document.getElementById("dashSleep").textContent =
        latest ? latest.sleepHours : "—";

    document.getElementById("dashExercise").textContent =
        latest ? latest.exerciseMinutes : "—";

    document.getElementById("dashMood").textContent =
        latest ? latest.mood : "—";


    // Display the latest check-in date

    const latestDate = document.getElementById(
        "dashboardLastDate"
    );

    if (latest) {
        latestDate.textContent =
            "Latest check-in: " + latest.date +
            " | Total records: " + records.length;
    } else {
        latestDate.textContent =
            "No health check-ins saved yet.";
    }


    // Remove the previous chart before drawing another

    if (healthChart) {
        healthChart.destroy();
        healthChart = null;
    }


    // Handle an empty dataset

    if (records.length === 0) {
        chartBox.hidden = true;
        chartMessage.textContent =
            "Save your first health record to see a chart.";
        return;
    }


    // Check whether Chart.js loaded successfully

    if (typeof Chart === "undefined") {
        chartBox.hidden = true;
        chartMessage.textContent =
            "The local chart library could not load. Reload the application.";
        return;
    }


    // 4. READ THE USER'S FILTER CHOICES

    const selectedMetric = metricSelect.value;

    const selectedRange = rangeSelect.value;

    const metric = metricSettings[selectedMetric];

    // Number of records to display
    const limit = selectedRange === "all"
        ? records.length
        : Number(selectedRange);


    // Select the most recent records
    const filteredRecords = records.slice(-limit);


    // 5. PREPARE CHART DATA

    // Dates appear along the horizontal axis
    const labels = filteredRecords.map(record => record.date);

    // Health measurements appear along the vertical axis
    const values = filteredRecords.map(
        record => Number(record[selectedMetric])
    );


    // 6. DISPLAY THE CHART

    chartBox.hidden = false;

    chartMessage.textContent =
        "Showing " + filteredRecords.length +
        " of " + records.length + " saved check-ins.";


    // Create a new interactive line chart

    healthChart = new Chart(chartCanvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: metric.label + " (" + metric.unit + ")",

                data: values,

                borderColor: metric.color,

                backgroundColor: metric.color,

                borderWidth: 3,

                tension: 0.25,

                pointRadius: 5,

                pointHoverRadius: 8,

                fill: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {
                    enabled: true
                }

            },

            scales: {

                x: {

                    ticks: {
                        color: "#b6c9dc",
                        maxRotation: 45
                    },

                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }

                },

                y: {

                    ticks: {
                        color: "#b6c9dc"
                    },

                    grid: {
                        color: "rgba(255,255,255,0.10)"
                    }

                }

            }

        }

    });

}


// 7. LISTEN FOR FILTER CHANGES

metricSelect.addEventListener(
    "change",
    renderHealthDashboard
);

rangeSelect.addEventListener(
    "change",
    renderHealthDashboard
);


// 8. LOAD DASHBOARD WHEN MISSION STARTS

window.addEventListener("astroguardian:page-changed", function (event) {
    if (event.detail.page === "trends") renderHealthDashboard();
});
renderHealthDashboard();


// 9. UPDATE DASHBOARD AFTER RECORD CHANGES

window.addEventListener(
    "astroguardian:records-updated",
    renderHealthDashboard
);
