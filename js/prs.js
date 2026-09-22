function createRecordCell(value, url) {
    const cell = document.createElement("td");

    if (url && value !== "N/A") {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = value;
        cell.appendChild(link);
    } else {
        cell.textContent = value;
    }

    return cell;
}

function renderPersonalRecords(records) {
    const body = document.querySelector("#personal-records-body");
    if (!body) return;

    body.replaceChildren();

    records.forEach((record, index) => {
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
        const response = await fetch("php/prs.php");
        if (!response.ok) throw new Error("WCA records request failed");

        const data = await response.json();
        if (!Array.isArray(data.records)) throw new Error("Invalid WCA records response");

        renderPersonalRecords(data.records);
    } catch (error) {
        console.error("Could not load WCA personal records:", error);
    }
}

loadPersonalRecords();
