// Initialize your Supabase Client with your verified endpoints
const SUPABASE_URL = "https://guxghpkgpodczxhlehei.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_FrGs6uzjHojBwjIdk_3k5A_VL0uhRTW";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    "333mbf": "3x3x3 Multi-Blindfolded"
};

function formatWcaTime(cents, eventId) {
    if (!cents || cents === -1) return "DNF";
    if (cents === -2) return "DNS";
    if (eventId === "333fm") return cents.toString();

    const seconds = cents / 100;
    if (seconds < 60) return seconds.toFixed(2);
    
    const mins = Math.floor(seconds / 60);
    const remainingSecs = (seconds % 60).toFixed(2);
    return `${mins}:${remainingSecs.padStart(5, '0')}`;
}

function createRecordCell(value, url) {
    const cell = document.createElement("td");

    if (url && value && value !== "—" && value !== "N/A") {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = value;
        cell.appendChild(link);
    } else {
        cell.textContent = value || "—";
    }

    return cell;
}

function renderPersonalRecords(groupedRecords) {
    const body = document.querySelector("#personal-records-body");
    if (!body) return;

    body.replaceChildren();

    Object.values(groupedRecords).forEach((record, index) => {
        const row = document.createElement("tr");
        row.className = "fade-row";
        row.style.animationDelay = `${index * 40}ms`;

        row.append(
            createRecordCell(record.singleCompetition, record.singleUrl),
            createRecordCell(record.singleDate),
            createRecordCell(record.single),
            createRecordCell(record.event),
            createRecordCell(record.average),
            createRecordCell(record.averageDate),
            createRecordCell(record.averageCompetition, record.averageUrl)
        );

        body.appendChild(row);
    });
}

async function loadPersonalRecords() {
    try {
        const { data: rows, error } = await supabase
            .from('personal_records')
            .select('*');

        if (error) throw error;
        if (!rows || rows.length === 0) {
            document.querySelector("#personal-records-body").innerHTML = `<tr><td colspan="7">No records found. Trigger your GitHub Action to load data!</td></tr>`;
            return;
        }

        const recordsGroupedByEvent = {};

        rows.forEach(row => {
            const id = row.event_id;
            if (!recordsGroupedByEvent[id]) {
                recordsGroupedByEvent[id] = {
                    event: EVENT_NAMES[id] || id,
                    single: "—", singleDate: "—", singleCompetition: "—", singleUrl: null,
                    average: "—", averageDate: "—", averageCompetition: "—", averageUrl: null
                };
            }

            const formattedTime = formatWcaTime(row.best_time, id);
            const compUrl = row.competition_id ? `https://worldcubeassociation.org{row.competition_id}` : null;
            
            let displayDate = row.competition_date || "—";

            if (row.type === 'single') {
                const target = recordsGroupedByEvent[id];
                target.single = formattedTime;
                target.singleCompetition = row.competition_name || "Official Competition";
                target.singleUrl = compUrl;
                target.singleDate = displayDate;
            } else if (row.type === 'average') {
                const target = recordsGroupedByEvent[id];
                target.average = formattedTime;
                target.averageCompetition = row.competition_name || "Official Competition";
                target.averageUrl = compUrl;
                target.averageDate = displayDate;
            }
        });

        renderPersonalRecords(recordsGroupedByEvent);

    } catch (error) {
        console.error("Could not load WCA records from Supabase:", error);
        document.querySelector("#personal-records-body").innerHTML = `<tr><td colspan="7" style="color:red;">Error connecting to database. Check console logs.</td></tr>`;
    }
}

loadPersonalRecords();
