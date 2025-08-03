const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = 8;

// Google Apps Script Web App URL (replace with your own deployment URL)
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwJNS0eLQyNNPpYUgiSqLqg7-w3wykhr7nft5RU7mwZLroPY4J51etaCxCaV9BHwdjKYw/exec";

function createInputTable() {
    const tbody = document.querySelector("#input-table tbody");
    tbody.innerHTML = "";
    weekdays.forEach(day => {
        const tr = document.createElement("tr");
        const dayCell = document.createElement("td");
        dayCell.textContent = day;
        tr.appendChild(dayCell);
        for (let i = 0; i < periods; i++) {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "text";
            input.className = "period-input";
            input.dataset.day = day;
            input.dataset.period = i;
            td.appendChild(input);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

function getTimetableFromInputs() {
    const timetable = {};
    weekdays.forEach(day => {
        timetable[day] = [];
        for (let i = 0; i < periods; i++) {
            const input = document.querySelector(`input[data-day='${day}'][data-period='${i}']`);
            timetable[day][i] = input.value;
        }
    });
    return timetable;
}

function setInputsFromTimetable(timetable) {
    weekdays.forEach(day => {
        for (let i = 0; i < periods; i++) {
            const input = document.querySelector(`input[data-day='${day}'][data-period='${i}']`);
            input.value = timetable[day] ? timetable[day][i] || "" : "";
        }
    });
}

function saveTimetable() {
    const timetable = getTimetableFromInputs();
    localStorage.setItem("schoolTimetable", JSON.stringify(timetable));
    renderFullTimetable(timetable);
    renderDaySchedule(document.getElementById("day-dropdown").value, timetable);
}

function loadTimetable() {
    const data = localStorage.getItem("schoolTimetable");
    if (data) {
        const timetable = JSON.parse(data);
        setInputsFromTimetable(timetable);
        renderFullTimetable(timetable);
        renderDaySchedule(document.getElementById("day-dropdown").value, timetable);
    }
}

function renderFullTimetable(timetable) {
    const container = document.getElementById("full-timetable");
    let html = '<table class="display-table"><thead><tr><th>Day</th>';
    for (let i = 1; i <= periods; i++) html += `<th>Period ${i}</th>`;
    html += '</tr></thead><tbody>';
    weekdays.forEach(day => {
        html += `<tr><td>${day}</td>`;
        for (let i = 0; i < periods; i++) {
            html += `<td>${(timetable[day] && timetable[day][i]) || ""}</td>`;
        }
        html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderDaySchedule(day, timetable) {
    const container = document.getElementById("day-schedule");
    let html = `<div class="day-view"><h3>${day}</h3><table class="day-table"><thead><tr><th>Period</th><th>Subject</th></tr></thead><tbody>`;
    for (let i = 0; i < periods; i++) {
        html += `<tr><td>Period ${i + 1}</td><td>${(timetable[day] && timetable[day][i]) || ""}</td></tr>`;
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function saveToGoogleSheets() {
    const timetable = getTimetableFromInputs();
    fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: "POST",
        body: JSON.stringify(timetable),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.text())
    .then(data => {
        alert("Timetable saved to Google Sheets!");
    })
    .catch(error => {
        alert("Error saving to Google Sheets: " + error);
    });
}

document.getElementById("save-btn").addEventListener("click", saveTimetable);
document.getElementById("day-dropdown").addEventListener("change", function() {
    const timetable = JSON.parse(localStorage.getItem("schoolTimetable") || '{}');
    renderDaySchedule(this.value, timetable);
});
document.getElementById("save-google-btn").addEventListener("click", saveToGoogleSheets);

createInputTable();
loadTimetable();
