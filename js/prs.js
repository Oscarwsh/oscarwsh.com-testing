// 💡 Linked to your official WCA ID
const WCA_ID = '2025CEDE03'; 

// Formats WCA centiseconds into readable speedcubing times
function formatWcaTime(timeInCentiseconds) {
    if (!timeInCentiseconds || timeInCentiseconds <= 0) return "-";
    
    // For Multi-Blind, return standard raw score representation
    if (timeInCentiseconds > 2000000000) return "Multi-Blind"; 
    
    let totalSeconds = timeInCentiseconds / 100;
    if (totalSeconds < 60) return totalSeconds.toFixed(2);
    
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Converts standard YYYY-MM-DD into a clean, localized date format
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function fetchWcaPRs() {
    const tbodyEl = document.getElementById('personal-records-body');
    if (!tbodyEl) return;

    try {
        // 1. Fetch your user personal record profile
        const userResponse = await fetch(`https://robiningelbrecht.be{WCA_ID}.json`);
        if (!userResponse.ok) throw new Error('WCA profile not found');
        const userData = await userResponse.json();

        // 2. Fetch the metadata index for all global competitions to grab correct dates and clean names
        const compResponse = await fetch(`https://robiningelbrecht.be`);
        if (!compResponse.ok) throw new Error('Failed to fetch competition database');
        const compsData = await compResponse.json();

        // Create a fast lookup map for competition metadata
        const compMap = {};
        compsData.forEach(c => {
            compMap[c.id] = { name: c.name, date: c.date.from };
        });

        // Map WCA shorthand shortcodes to human-readable names
        const eventNames = {
            '333': '3x3x3 Cube', '222': '2x2x2 Cube', '444': '4x4x4 Cube', '555': '5x5x5 Cube',
            '666': '6x6x6 Cube', '777': '7x7x7 Cube', '333bf': '3x3x3 Blindfolded',
            '333oh': '3x3x3 One-Handed', 'minx': 'Megaminx', 'pyram': 'Pyraminx', 
            'skewb': 'Skewb', 'sq1': 'Square-1', 'clock': 'Rubik\'s Clock',
            '444bf': '4x4x4 Blindfolded', '555bf': '5x5x5 Blindfolded', '333mbf': '3x3x3 Multi-Blind'
        };

        const events = Object.keys(userData.ranks.single);
        tbodyEl.innerHTML = ''; // Wipe out the "Loading personal records..." static markup

        if (events.length === 0) {
            tbodyEl.innerHTML = `<tr><td colspan="7" style="text-align:center;">No official records found yet.</td></tr>`;
            return;
        }

        events.forEach(eventId => {
            const single = userData.ranks.single[eventId];
            const average = userData.ranks.average[eventId] || null;

            // Gather Single PR details
            const singleComp = single ? (compMap[single.competitionId]?.name || single.competitionId) : '-';
            const singleDate = single ? formatDate(compMap[single.competitionId]?.date) : '-';

            // Gather Average PR details
            const avgComp = average ? (compMap[average.competitionId]?.name || average.competitionId) : '-';
            const avgDate = average ? formatDate(compMap[average.competitionId]?.date) : '-';

            // Generate row strictly following your existing HTML layout:
            // <th>Competition</th> <th>Date</th> <th>Single</th> <th>Event</th> <th>Average</th> <th>Date</th> <th>Competition</th>
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><small>${singleComp}</small></td>
                <td><small>${singleDate}</small></td>
                <td><strong>${single ? formatWcaTime(single.best) : '-'}</strong></td>
                <td><strong>${eventNames[eventId] || eventId}</strong></td>
                <td><strong>${average ? formatWcaTime(average.best) : '-'}</strong></td>
                <td><small>${avgDate}</small></td>
                <td><small>${avgComp}</small></td>
            `;
            tbodyEl.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        tbodyEl.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Failed to sync live data with the WCA database. Please check back later!</td></tr>`;
    }
}

// Automatically fire function logic as soon as the DOM structures load
window.addEventListener('DOMContentLoaded', fetchWcaPRs);
