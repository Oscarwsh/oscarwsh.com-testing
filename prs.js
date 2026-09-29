/**
 * js/prs.js
 * Automatically populates Oscar's Personal Records table using the Unofficial WCA API.
 */

// Your WCA ID 
const WCA_ID = "2025CEDE03"; 

// FIX: Make sure the subdomain 'wca-rest-api.' is right at the beginning
const API_URL = "https://robiningelbrecht.be/" + WCA_ID + ".json";

// Dictionary to translate raw WCA Event IDs into clean display names
const EVENT_NAMES = {
    "333": "3x3x3 Cube",
    "222": "2x2x2 Cube",
    "444": "4x4x4 Cube",
    "555": "5x5x5 Cube",
    "666": "6x6x6 Cube",
    "777": "7x7x7 Cube",
    "333bf": "3x3x3 Blindfolded",
    "333fm": "3x3x3 Fewest Moves",
    "333oh": "3x3x3 One-Handed",
    "clock": "Rubik's Clock",
    "minx": "Megaminx",
    "pyram": "Pyraminx",
    "skewb": "Skewb",
    "sq1": "Square-1",
    "444bf": "4x4x4 Blindfolded",
    "555bf": "5x5x5 Blindfolded",
    "333mbf": "3x3x3 Multi-Blind"
};

/**
 * Converts WCA centiseconds format into a standard readable cubing time string.
 */
function formatWcaTime(centiseconds) {
    if (centiseconds === undefined || centiseconds === null || centiseconds <= 0) {
        if (centiseconds === -1) return "DNF";
        if (centiseconds === -2) return "DNS";
        return "—";
    }
    
    let totalSeconds = centiseconds / 100;
    
    // If the time is 1 minute or longer
    if (totalSeconds >= 60) {
        const minutes = Math.floor(totalSeconds / 60);
        const remainderSeconds = (totalSeconds % 60).toFixed(2);
        const paddedSeconds = remainderSeconds < 10 ? '0' + remainderSeconds : remainderSeconds;
        return minutes + ":" + paddedSeconds;
    }
    
    // For times under a minute
    return totalSeconds.toFixed(2);
}

// Fetch data as soon as the HTML document is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("personal-records-body");

    if (!tableBody) {
        console.error("Could not find an HTML element with id='personal-records-body'");
        return;
    }

    fetch(API_URL)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP Error! Status: " + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            // Clear out the "Loading..." row from HTML
            tableBody.innerHTML = "";

            let singles = [];
            let averages = [];

            if (data.ranks) {
                singles = data.ranks.singles || [];
                averages = data.ranks.averages || [];
            } else {
                singles = data.singles || [];
                averages = data.averages || [];
            }

            // Map container to merge single and average data objects together by eventId
            const combinedRecords = {};

            // 1. Process Singles
            singles.forEach(function(item) {
                if (!item.eventId) return;
                combinedRecords[item.eventId] = {
                    eventId: item.eventId,
                    eventName: EVENT_NAMES[item.eventId] || item.eventId,
                    singleBest: formatWcaTime(item.best),
                    singleComp: item.competitionId || "—",
                    averageBest: "—",
                    averageComp: "—"
                };
            });

            // 2. Process Averages
            averages.forEach(function(item) {
                if (!item.eventId) return;
                if (!combinedRecords[item.eventId]) {
                    combinedRecords[item.eventId] = {
                        eventId: item.eventId,
                        eventName: EVENT_NAMES[item.eventId] || item.eventId,
                        singleBest: "—",
                        singleComp: "—",
                    };
                }
                combinedRecords[item.eventId].averageBest = formatWcaTime(item.best);
                combinedRecords[item.eventId].averageComp = item.competitionId || "—";
            });

            // 3. Convert object map back to an array
            const finalRecordsArray = Object.values(combinedRecords);

            if (finalRecordsArray.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>No official personal records found yet!</td></tr>";
                return;
            }

            // 4. Sort arrays according to standard official WCA event display list
            const eventOrder = Object.keys(EVENT_NAMES);
            finalRecordsArray.sort(function(a, b) {
                let indexA = eventOrder.indexOf(a.eventId);
                let indexB = eventOrder.indexOf(b.eventId);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });

            // 5. Build individual row blocks inside the HTML template matches Oscar's layout:
            // Competition | Date | Single | Event | Average | Date | Competition
            finalRecordsArray.forEach(function(record) {
                const row = document.createElement("tr");

                row.innerHTML = "<td>" + record.singleComp + "</td>" +
                                "<td>—</td>" +
                                "<td><strong>" + record.singleBest + "</strong></td>" +
                                "<td><strong>" + record.eventName + "</strong></td>" +
                                "<td><strong>" + record.averageBest + "</strong></td>" +
                                "<td>—</td>" +
                                "<td>" + record.averageComp + "</td>";

                tableBody.appendChild(row);
            });
        })
        .catch(function(error) {
            console.error("Detailed Fetch Error:", error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="color: #ff4d4d; text-align: center; padding: 20px; font-weight: bold;">
                        No official WCA records found yet. Profile data updates daily.
                    </td>
                </tr>`;
        });
});
